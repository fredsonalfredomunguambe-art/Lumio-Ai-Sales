import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  category:
    | "MARKETING"
    | "MEETING"
    | "CAMPAIGN"
    | "CONTENT"
    | "SOCIAL"
    | "ANALYTICS"
    | "PLANNING";
  priority: "LOW" | "MEDIUM" | "HIGH";
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  category?: CalendarEvent["category"];
  priority?: CalendarEvent["priority"];
  color?: string;
}

interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export function useEvents() {
  const { user, isLoaded } = useUser();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar eventos
  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para criar evento
  const createEvent = useCallback(
    async (eventData: CreateEventData) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create event");
        }

        const newEvent = await response.json();
        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      } catch (err) {
        console.error("Error creating event:", err);
        setError(err instanceof Error ? err.message : "Failed to create event");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Função para atualizar evento
  const updateEvent = useCallback(
    async (eventData: UpdateEventData) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${eventData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update event");
        }

        const updatedEvent = await response.json();
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventData.id ? updatedEvent : event
          )
        );
        return updatedEvent;
      } catch (err) {
        console.error("Error updating event:", err);
        setError(err instanceof Error ? err.message : "Failed to update event");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Função para deletar evento
  const deleteEvent = useCallback(
    async (eventId: string) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/events/${eventId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete event");
        }

        setEvents((prev) => prev.filter((event) => event.id !== eventId));
      } catch (err) {
        console.error("Error deleting event:", err);
        setError(err instanceof Error ? err.message : "Failed to delete event");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Função para buscar eventos por data
  const getEventsForDate = useCallback(
    (date: Date) => {
      return events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === date.toDateString();
      });
    },
    [events]
  );

  // Função para buscar eventos por período
  const getEventsForPeriod = useCallback(
    (startDate: Date, endDate: Date) => {
      return events.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);

        // Verifica se há sobreposição entre os períodos
        return eventStart <= endDate && eventEnd >= startDate;
      });
    },
    [events]
  );

  // Função para buscar eventos por categoria
  const getEventsByCategory = useCallback(
    (category: CalendarEvent["category"]) => {
      return events.filter((event) => event.category === category);
    },
    [events]
  );

  // Função para buscar eventos por prioridade
  const getEventsByPriority = useCallback(
    (priority: CalendarEvent["priority"]) => {
      return events.filter((event) => event.priority === priority);
    },
    [events]
  );

  // Função para buscar eventos futuros
  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.startDate) >= now);
  }, [events]);

  // Função para buscar eventos passados
  const getPastEvents = useCallback(() => {
    const now = new Date();
    return events.filter((event) => new Date(event.endDate) < now);
  }, [events]);

  // Função para buscar eventos de hoje
  const getTodayEvents = useCallback(() => {
    const today = new Date();
    return getEventsForDate(today);
  }, [getEventsForDate]);

  // Função para buscar eventos desta semana
  const getThisWeekEvents = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

    return getEventsForPeriod(startOfWeek, endOfWeek);
  }, [getEventsForPeriod]);

  // Função para buscar eventos deste mês
  const getThisMonthEvents = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return getEventsForPeriod(startOfMonth, endOfMonth);
  }, [getEventsForPeriod]);

  // Carregar eventos quando o usuário estiver carregado
  useEffect(() => {
    if (isLoaded && user) {
      fetchEvents();
    }
  }, [isLoaded, user, fetchEvents]);

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForPeriod,
    getEventsByCategory,
    getEventsByPriority,
    getUpcomingEvents,
    getPastEvents,
    getTodayEvents,
    getThisWeekEvents,
    getThisMonthEvents,
  };
}
