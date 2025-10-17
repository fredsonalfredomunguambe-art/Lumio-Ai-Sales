import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  leadId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  meetingUrl?: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  type:
    | "SALES_CALL"
    | "DEMO"
    | "DISCOVERY"
    | "FOLLOW_UP"
    | "NEGOTIATION"
    | "CLOSING";
  outcome?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  leadId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  meetingUrl?: string;
  type?: Meeting["type"];
  notes?: string;
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  status?: Meeting["status"];
  outcome?: string;
}

export function useMeetings() {
  const { user, isLoaded } = useUser();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/meetings");

      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }

      const data = await response.json();
      setMeetings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch meetings");
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (
    meetingData: CreateMeetingData
  ): Promise<Meeting> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create meeting");
    }

    const newMeeting = await response.json();
    setMeetings((prev) => [newMeeting, ...prev]);
    return newMeeting;
  };

  const updateMeeting = async (
    id: string,
    meetingData: UpdateMeetingData
  ): Promise<Meeting> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(`/api/meetings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update meeting");
    }

    const updatedMeeting = await response.json();
    setMeetings((prev) =>
      prev.map((meeting) => (meeting.id === id ? updatedMeeting : meeting))
    );
    return updatedMeeting;
  };

  const deleteMeeting = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(`/api/meetings/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete meeting");
    }

    setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
  };

  const getMeetingById = (id: string): Meeting | undefined => {
    return meetings.find((meeting) => meeting.id === id);
  };

  const getMeetingsByStatus = (status: Meeting["status"]): Meeting[] => {
    return meetings.filter((meeting) => meeting.status === status);
  };

  const getUpcomingMeetings = (): Meeting[] => {
    const now = new Date();
    return meetings.filter(
      (meeting) =>
        new Date(meeting.startDate) >= now && meeting.status !== "CANCELLED"
    );
  };

  const getTodaysMeetings = (): Meeting[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startDate);
      return meetingDate >= today && meetingDate < tomorrow;
    });
  };

  const getMeetingsForDate = (date: Date): Meeting[] => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.startDate);
      return meetingDate >= targetDate && meetingDate < nextDay;
    });
  };

  const getMeetingsByType = (type: Meeting["type"]): Meeting[] => {
    return meetings.filter((meeting) => meeting.type === type);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchMeetings();
    }
  }, [isLoaded, user]);

  return {
    meetings,
    isLoading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingById,
    getMeetingsByStatus,
    getUpcomingMeetings,
    getTodaysMeetings,
    getMeetingsForDate,
    getMeetingsByType,
  };
}
