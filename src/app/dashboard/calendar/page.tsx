"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Link as LinkIcon,
  MoreVertical,
  Filter,
  Download,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { MarvinInsightsPanel } from "@/components/marvin/MarvinInsightsPanel";
import { MarvinToggle } from "@/components/marvin/MarvinToggle";
import { HelpButton } from "@/components/HelpCenter/HelpButton";
import { CreateEventModal } from "@/components/calendar/CreateEventModal";
import { EventDetailsModal } from "@/components/calendar/EventDetailsModal";
import { WeekView } from "@/components/calendar/WeekView";
import { DayView } from "@/components/calendar/DayView";
import { useToast } from "@/components/ui/Toast";

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  category:
    | "MEETING"
    | "SALES_CALL"
    | "DEMO"
    | "FOLLOW_UP"
    | "PLANNING"
    | "CAMPAIGN";
  priority: "LOW" | "MEDIUM" | "HIGH";
  linkedLeadId?: string;
  linkedCampaignId?: string;
  meetingUrl?: string;
  location?: string;
  attendees?: string[];
}

interface MeetingSuggestion {
  id: string;
  leadName: string;
  leadCompany: string;
  reason: string;
  suggestedTime: Date;
  priority: "high" | "medium" | "low";
}

export default function CalendarPage() {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "month"
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [suggestions, setSuggestions] = useState<MeetingSuggestion[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMarvinInsights, setShowMarvinInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [marvinOpened, setMarvinOpened] = useState(false);

  useEffect(() => {
    loadEvents();
    loadSuggestions();
    // Check if Marvin was opened before in this session
    const opened = sessionStorage.getItem("marvin-opened-calendar") === "true";
    setMarvinOpened(opened);
  }, [currentDate]);

  // Load insight count only when Marvin panel opens for the first time
  const handleMarvinOpen = () => {
    setShowMarvinInsights(true);
    if (!marvinOpened) {
      sessionStorage.setItem("marvin-opened-calendar", "true");
      setMarvinOpened(true);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          handleCreateEvent();
          break;
        case "t":
          setCurrentDate(new Date());
          break;
        case "m":
          handleMarvinOpen();
          break;
        case "arrowleft":
          navigateMonth("prev");
          break;
        case "arrowright":
          navigateMonth("next");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const response = await fetch(
        `/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      );
      const data = await response.json();

      if (data.success) {
        setEvents(
          data.data.map((e: any) => ({
            ...e,
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/calendar/suggestions");
      const data = await response.json();

      if (data.success) {
        setSuggestions(
          data.data.map((s: any) => ({
            ...s,
            suggestedTime: new Date(s.suggestedTime),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "MEETING":
        return "bg-blue-500";
      case "SALES_CALL":
        return "bg-green-500";
      case "DEMO":
        return "bg-purple-500";
      case "FOLLOW_UP":
        return "bg-yellow-500";
      case "PLANNING":
        return "bg-gray-500";
      case "CAMPAIGN":
        return "bg-pink-500";
      default:
        return "bg-blue-500";
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (event) => event.startDate.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const handleCreateEvent = () => {
    setEditMode(false);
    setSelectedEvent(null);
    setPrefilledData(null);
    setShowCreateModal(true);
  };

  const handleEditEvent = () => {
    setEditMode(true);
    setShowDetailsModal(false);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`/api/calendar?id=${selectedEvent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Event deleted successfully", "success");
        await loadEvents();
        setShowDetailsModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    }
  };

  const handleCompleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(
        `/api/calendar/${selectedEvent.id}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "complete" }),
        }
      );

      if (response.ok) {
        await loadEvents();
        showToast(
          "Event marked as complete! Follow-up tasks created.",
          "success"
        );
      }
    } catch (error) {
      console.error("Error completing event:", error);
      showToast("Failed to mark event complete", "error");
    }
  };

  const handleRescheduleEvent = async () => {
    // Open edit modal with reschedule focus
    setEditMode(true);
    setShowDetailsModal(false);
    setShowCreateModal(true);
  };

  const handleSlotClick = (date: Date, hour?: number) => {
    const suggestedTime = new Date(date);
    if (hour !== undefined) {
      suggestedTime.setHours(hour, 0, 0, 0);
    }

    setPrefilledData({ suggestedTime });
    setEditMode(false);
    setSelectedEvent(null);
    setShowCreateModal(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleAutoSchedule = async (suggestion: MeetingSuggestion) => {
    setPrefilledData({
      leadId: suggestion.id.replace("lead-", "").replace("stale-", ""),
      suggestedTime: suggestion.suggestedTime,
      category: "SALES_CALL",
    });
    setShowCreateModal(true);
  };

  const today = new Date();
  const isToday = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 calendar-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors duration-200">
            Schedule and manage your meetings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </ActionButton>
          <ActionButton
            variant="secondary"
            icon={<Settings className="w-4 h-4" />}
            onClick={async () => {
              try {
                const response = await fetch("/api/calendar/sync", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ direction: "both" }),
                });

                if (response.ok) {
                  await loadEvents();
                  showToast(
                    "Calendar synced with Google successfully!",
                    "success"
                  );
                } else {
                  throw new Error("Sync failed");
                }
              } catch (error) {
                console.error("Sync error:", error);
                showToast(
                  "Please connect Google Calendar in Settings first",
                  "warning"
                );
              }
            }}
          >
            Sync Google
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateEvent}
            aria-label="New Event"
          >
            New Event
          </ActionButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth("prev")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => navigateMonth("next")}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <ActionButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </ActionButton>
              </div>

              <Tabs value={view} onValueChange={(v: any) => setView(v)}>
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="agenda">Agenda</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Month View */}
            {view === "month" && (
              <div>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2 transition-colors duration-200"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 calendar-grid">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    const dayEvents = getEventsForDay(date);
                    return (
                      <div
                        key={index}
                        onClick={() => date && handleSlotClick(date)}
                        className={`min-h-[100px] p-2 border rounded-lg transition-colors duration-200 ${
                          date
                            ? "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                            : "bg-gray-50 dark:bg-gray-900"
                        } ${
                          isToday(date)
                            ? "border-blue-500 dark:border-blue-400 border-2"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {date && (
                          <>
                            <div
                              className={`text-sm font-medium mb-1 transition-colors duration-200 ${
                                isToday(date)
                                  ? "text-blue-600 dark:text-blue-400 font-bold"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  className={`text-xs px-2 py-1 rounded ${getCategoryColor(
                                    event.category
                                  )} text-white truncate hover:opacity-90`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 transition-colors duration-200">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {view === "week" && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onSlotClick={handleSlotClick}
              />
            )}

            {/* Day View */}
            {view === "day" && (
              <DayView
                selectedDate={selectedDate}
                events={events}
                onEventClick={handleEventClick}
                onSlotClick={handleSlotClick}
              />
            )}

            {/* Agenda View */}
            {view === "agenda" && (
              <div className="space-y-2">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                    No events scheduled
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventClick(event)}
                      className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex-shrink-0 text-center w-16">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                          {event.startDate.toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                          {event.startDate.getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                            {event.title}
                          </h4>
                          <Badge variant="ghost" size="sm">
                            {event.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.startDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          {event.meetingUrl && (
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              Video call
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
              Upcoming Events
            </h3>
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200"
                  onClick={() => handleEventClick(event)}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 ${getCategoryColor(
                      event.category
                    )}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-200">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                      {event.startDate.toLocaleDateString()} at{" "}
                      {event.startDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 transition-colors duration-200">
              This Month
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Total Events
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {events.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Meetings
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400 transition-colors duration-200">
                  {events.filter((e) => e.category === "MEETING").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Sales Calls
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                  {events.filter((e) => e.category === "SALES_CALL").length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditMode(false);
          setSelectedEvent(null);
          setPrefilledData(null);
        }}
        onSuccess={() => {
          loadEvents();
          loadSuggestions();
        }}
        editMode={editMode}
        existingEvent={selectedEvent}
        prefilledData={prefilledData}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onComplete={handleCompleteEvent}
        onReschedule={handleRescheduleEvent}
      />

      {/* Marvin Toggle */}
      <MarvinToggle
        onClick={handleMarvinOpen}
        isOpen={showMarvinInsights}
        insightCount={insightCount}
        context="calendar"
        showBadge={marvinOpened}
        className="marvin-toggle"
      />

      {/* Marvin Insights Panel */}
      <MarvinInsightsPanel
        isOpen={showMarvinInsights}
        onClose={() => setShowMarvinInsights(false)}
        context="calendar"
        data={{ events, suggestions }}
        onAction={(action, data) => {
          if (action === "Schedule Meeting" && data?.metadata) {
            // Auto-fill event creation modal with suggestion data
            setPrefilledData({
              leadId: data.metadata.leadId,
              suggestedTime: new Date(data.metadata.suggestedTime),
              category: "SALES_CALL",
            });
            setShowCreateModal(true);
            setShowMarvinInsights(false);
          }
          console.log("Marvin action:", action, data);
        }}
        onInsightsLoad={(count) => setInsightCount(count)}
      />

      {/* Help Center Button */}
      <HelpButton context="calendar" />
    </div>
  );
}
