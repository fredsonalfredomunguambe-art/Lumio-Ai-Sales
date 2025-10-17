"use client";

import React from "react";
import { Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface DayViewProps {
  selectedDate: Date;
  events: any[];
  onEventClick: (event: any) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

export function DayView({
  selectedDate,
  events,
  onEventClick,
  onSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MEETING: "bg-blue-500 border-blue-600",
      SALES_CALL: "bg-green-500 border-green-600",
      DEMO: "bg-purple-500 border-purple-600",
      FOLLOW_UP: "bg-yellow-500 border-yellow-600",
      PLANNING: "bg-gray-500 border-gray-600",
    };
    return colors[category] || "bg-blue-500 border-blue-600";
  };

  // Filter events for selected day
  const dayEvents = events.filter(
    (event) =>
      new Date(event.startDate).toDateString() === selectedDate.toDateString()
  );

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter((event) => {
      const eventHour = new Date(event.startDate).getHours();
      return eventHour === hour;
    });
  };

  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return (
      now.toDateString() === selectedDate.toDateString() &&
      now.getHours() === hour
    );
  };

  const isFocusTime = (hour: number) => {
    // Example: 9-11 AM is focus time
    return hour >= 9 && hour < 11;
  };

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors duration-200">
        <div className="text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 transition-colors duration-200">
            {selectedDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="mt-3 flex items-center justify-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Events:{" "}
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 transition-colors duration-200">
                {dayEvents.length}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Duration:{" "}
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400 transition-colors duration-200">
                {dayEvents
                  .reduce((sum, e) => {
                    const duration =
                      (new Date(e.endDate).getTime() -
                        new Date(e.startDate).getTime()) /
                      (1000 * 60 * 60);
                    return sum + duration;
                  }, 0)
                  .toFixed(1)}
                h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Schedule */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-200">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          const hasFocus = isFocusTime(hour);

          return (
            <div
              key={hour}
              className={`relative border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-200 ${
                isCurrentHour(hour) ? "bg-blue-50 dark:bg-blue-900/30" : ""
              } ${
                hasFocus ? "bg-green-50 dark:bg-green-900/20 bg-opacity-30" : ""
              }`}
            >
              <div className="flex">
                {/* Time label */}
                <div className="w-20 flex-shrink-0 p-4 border-r border-gray-200 dark:border-gray-700 text-right">
                  <div
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isCurrentHour(hour)
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                      ? "12 PM"
                      : `${hour - 12} PM`}
                  </div>
                  {isCurrentHour(hour) && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold transition-colors duration-200">
                      Now
                    </div>
                  )}
                </div>

                {/* Event area */}
                <div
                  className="flex-1 p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 relative"
                  onClick={() => onSlotClick(selectedDate, hour)}
                >
                  {hasFocus && hourEvents.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-50">
                      <Badge variant="success" size="sm">
                        Focus Time
                      </Badge>
                    </div>
                  )}

                  {hourEvents.length === 0 && !hasFocus && (
                    <div className="flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity">
                      <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200">
                        <Plus className="w-3 h-3" />
                        Add event
                      </button>
                    </div>
                  )}

                  {/* Events */}
                  <div className="space-y-2">
                    {hourEvents.map((event) => {
                      const duration =
                        (new Date(event.endDate).getTime() -
                          new Date(event.startDate).getTime()) /
                        (1000 * 60);

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className={`${getCategoryColor(
                            event.category
                          )} border-l-4 text-white rounded-lg p-3 cursor-pointer hover:shadow-md transition-all`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm mb-1">
                                {event.title}
                              </div>
                              <div className="text-xs opacity-90 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {new Date(event.startDate).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                                {" - "}
                                {new Date(event.endDate).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                                <span className="ml-1">({duration} min)</span>
                              </div>
                              {event.lead && (
                                <div className="text-xs opacity-90 mt-1">
                                  With: {event.lead.firstName}{" "}
                                  {event.lead.lastName}
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={
                                event.priority === "HIGH" ? "danger" : "ghost"
                              }
                              size="sm"
                              className="flex-shrink-0 bg-white bg-opacity-20 text-white border-white border-opacity-30"
                            >
                              {event.priority}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
