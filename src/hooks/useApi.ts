import { useState, useEffect } from "react";

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string, options?: RequestInit): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip if URL is undefined, empty, or invalid
    if (
      !url ||
      url === "undefined" ||
      url.includes("undefined") ||
      url.trim() === ""
    ) {
      console.warn("useApi: Invalid URL detected:", url);
      setLoading(false);
      setError("Invalid URL");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        console.error("useApi error:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, options]);

  return { data, loading, error };
}

export function useApiMutation<T, R = unknown>(
  url: string,
  options?: RequestInit
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (data?: R): Promise<T | null> => {
    // Skip if URL is undefined, empty, or invalid
    if (
      !url ||
      url === "undefined" ||
      url.includes("undefined") ||
      url.trim() === ""
    ) {
      console.warn("useApiMutation: Invalid URL detected:", url);
      setError("Invalid URL");
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        ...options,
        method: options?.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      console.error("useApiMutation error:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
