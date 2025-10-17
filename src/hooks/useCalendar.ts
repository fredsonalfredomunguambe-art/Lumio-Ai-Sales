/**
 * Calendar Hook
 * Manages calendar events and sync
 */

import { useState, useEffect, useCallback } from "react";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  category: string;
  priority: string;
  linkedLeadId?: string;
  linkedCampaignId?: string;
  meetingUrl?: string;
  location?: string;
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate.toISOString());
      if (endDate) params.append("end", endDate.toISOString());

      const response = await fetch(`/api/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(
          data.data.map((e: any) => ({
            ...e,
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
          }))
        );
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = useCallback(async (eventData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        setEvents((prev) => [
          ...prev,
          {
            ...data.data,
            startDate: new Date(data.data.startDate),
            endDate: new Date(data.data.endDate),
          },
        ]);
        return data.data;
      } else {
        setError(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, updates: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/calendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId, ...updates }),
      });

      const data = await response.json();

      if (data.success) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...data.data,
                  startDate: new Date(data.data.startDate),
                  endDate: new Date(data.data.endDate),
                }
              : e
          )
        );
        return data.data;
      } else {
        setError(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/calendar?id=${eventId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        setError(data.error);
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

