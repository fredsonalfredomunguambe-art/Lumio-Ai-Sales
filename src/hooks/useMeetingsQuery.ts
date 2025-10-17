import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeetingStore } from "@/stores/meetingStore";
import { Meeting, CreateMeetingData, UpdateMeetingData } from "@/types/meeting";

// Query keys
export const meetingKeys = {
  all: ["meetings"] as const,
  lists: () => [...meetingKeys.all, "list"] as const,
  list: (filters: any) => [...meetingKeys.lists(), { filters }] as const,
  details: () => [...meetingKeys.all, "detail"] as const,
  detail: (id: string) => [...meetingKeys.details(), id] as const,
  stats: () => [...meetingKeys.all, "stats"] as const,
};

// API functions
const fetchMeetings = async (): Promise<Meeting[]> => {
  const response = await fetch("/api/meetings");
  if (!response.ok) {
    throw new Error("Failed to fetch meetings");
  }
  return response.json();
};

const createMeeting = async (data: CreateMeetingData): Promise<Meeting> => {
  const response = await fetch("/api/meetings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create meeting");
  }

  return response.json();
};

const updateMeeting = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateMeetingData;
}): Promise<Meeting> => {
  const response = await fetch(`/api/meetings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update meeting");
  }

  return response.json();
};

const deleteMeeting = async (id: string): Promise<void> => {
  const response = await fetch(`/api/meetings/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete meeting");
  }
};

// Hooks
export const useMeetings = () => {
  const { setMeetings, setLoading, setError, setLastSyncTime } =
    useMeetingStore();

  return useQuery({
    queryKey: meetingKeys.lists(),
    queryFn: fetchMeetings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onSuccess: (data) => {
      setMeetings(data);
      setLastSyncTime(new Date().toLocaleTimeString());
    },
    onError: (error) => {
      setError(
        error instanceof Error ? error.message : "Failed to fetch meetings"
      );
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  const { addMeeting } = useMeetingStore();

  return useMutation({
    mutationFn: createMeeting,
    onSuccess: (newMeeting) => {
      // Update the cache
      queryClient.setQueryData(
        meetingKeys.lists(),
        (old: Meeting[] | undefined) =>
          old ? [newMeeting, ...old] : [newMeeting]
      );

      // Update Zustand store
      addMeeting(newMeeting);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
    onError: (error) => {
      console.error("Error creating meeting:", error);
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  const { updateMeeting: updateMeetingStore } = useMeetingStore();

  return useMutation({
    mutationFn: updateMeeting,
    onSuccess: (updatedMeeting) => {
      // Update the cache
      queryClient.setQueryData(
        meetingKeys.lists(),
        (old: Meeting[] | undefined) =>
          old
            ? old.map((meeting) =>
                meeting.id === updatedMeeting.id ? updatedMeeting : meeting
              )
            : [updatedMeeting]
      );

      // Update Zustand store
      updateMeetingStore(updatedMeeting.id, updatedMeeting);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
    onError: (error) => {
      console.error("Error updating meeting:", error);
    },
  });
};

export const useDeleteMeeting = () => {
  const queryClient = useQueryClient();
  const { deleteMeeting: deleteMeetingStore } = useMeetingStore();

  return useMutation({
    mutationFn: deleteMeeting,
    onSuccess: (_, deletedId) => {
      // Update the cache
      queryClient.setQueryData(
        meetingKeys.lists(),
        (old: Meeting[] | undefined) =>
          old ? old.filter((meeting) => meeting.id !== deletedId) : []
      );

      // Update Zustand store
      deleteMeetingStore(deletedId);

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: meetingKeys.lists() });
    },
    onError: (error) => {
      console.error("Error deleting meeting:", error);
    },
  });
};

export const useMeetingStats = () => {
  const { meetings } = useMeetingStore();

  return {
    total: meetings.length,
    scheduled: meetings.filter((m) => m.status === "SCHEDULED").length,
    completed: meetings.filter((m) => m.status === "COMPLETED").length,
    cancelled: meetings.filter((m) => m.status === "CANCELLED").length,
    inProgress: meetings.filter((m) => m.status === "IN_PROGRESS").length,
    todaysMeetings: meetings.filter((meeting) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const meetingDate = new Date(meeting.startDate);
      return meetingDate >= today && meetingDate < tomorrow;
    }).length,
    upcomingMeetings: meetings.filter((meeting) => {
      const now = new Date();
      return (
        new Date(meeting.startDate) > now && meeting.status !== "CANCELLED"
      );
    }).length,
  };
};
