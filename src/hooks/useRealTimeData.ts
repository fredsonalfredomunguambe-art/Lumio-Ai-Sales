import useSWR from "swr";

interface UseRealTimeDataOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useRealTimeData<T = any>(
  endpoint: string,
  options: UseRealTimeDataOptions = {}
) {
  const {
    refreshInterval = 30000, // 30 seconds
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const { data, error, isLoading, mutate, isValidating } = useSWR<T>(
    endpoint,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      dedupingInterval: 2000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T = any>(endpoint: string) {
  const { data, mutate } = useSWR<T>(endpoint, fetcher);

  const optimisticUpdate = async (
    updateFn: (current: T) => T,
    apiCall: () => Promise<any>
  ) => {
    // Optimistically update the local data
    await mutate(updateFn(data as T), false);

    try {
      // Make the actual API call
      await apiCall();

      // Revalidate to ensure sync
      await mutate();
    } catch (error) {
      // Rollback on error
      await mutate();
      throw error;
    }
  };

  return { data, optimisticUpdate };
}

