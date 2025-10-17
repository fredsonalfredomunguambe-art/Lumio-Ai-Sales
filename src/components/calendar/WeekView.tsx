"use client";

import React, { useMemo } from "react";
import { Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface WeekViewProps {
  currentDate: Date;
  events: any[];
  onEventClick: (event: any) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: WeekViewProps) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

  // Get start of week (Sunday)
  const weekStart = useMemo(() => {
    const date = new Date(currentDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  }, [currentDate]);

  // Generate array of 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      return day;
    });
  }, [weekStart]);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventHour = eventStart.getHours();

      return (
        eventStart.toDateString() === day.toDateString() && eventHour === hour
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour < 7 || currentHour >= 20) return null;

    const position = (currentHour - 7 + currentMinute / 60) * 64; // 64px per hour
    return position;
  };

  const currentTimePos = getCurrentTimePosition();
  const showCurrentTime = weekDays.some((day) => isToday(day));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MEETING: "bg-blue-500",
      SALES_CALL: "bg-green-500",
      DEMO: "bg-purple-500",
      FOLLOW_UP: "bg-yellow-500",
      PLANNING: "bg-gray-500",
    };
    return colors[category] || "bg-blue-500";
  };

  return (
    <div className="relative">
      {/* Header with day names */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div className="p-2 border-r border-gray-200 dark:border-gray-700"></div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-3 border-r border-gray-200 dark:border-gray-700 text-center transition-colors duration-200 ${
              isToday(day) ? "bg-blue-50 dark:bg-blue-900/30" : ""
            }`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div
              className={`text-lg font-bold transition-colors duration-200 ${
                isToday(day)
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-900 dark:text-gray-100"
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="relative overflow-auto max-h-[600px]">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700"
          >
            {/* Time label */}
            <div className="p-2 border-r border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 text-right pr-2 transition-colors duration-200">
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayEvents = getEventsForDayAndHour(day, hour);

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={`relative min-h-[64px] border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${
                    isToday(day)
                      ? "bg-blue-50 dark:bg-blue-900/20 bg-opacity-30"
                      : ""
                  }`}
                  onClick={() => onSlotClick(day, hour)}
                >
                  {/* Events in this slot */}
                  {dayEvents.map((event) => {
                    const duration =
                      (new Date(event.endDate).getTime() -
                        new Date(event.startDate).getTime()) /
                      (1000 * 60); // minutes
                    const height = Math.max((duration / 60) * 64, 24); // Min 24px

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`absolute left-1 right-1 ${getCategoryColor(
                          event.category
                        )} text-white rounded px-2 py-1 text-xs cursor-pointer hover:opacity-90 transition-opacity z-10`}
                        style={{
                          height: `${height}px`,
                          top: `${
                            (new Date(event.startDate).getMinutes() / 60) * 64
                          }px`,
                        }}
                      >
                        <div className="font-medium truncate">
                          {event.title}
                        </div>
                        <div className="text-xs opacity-90">
                          {new Date(event.startDate).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}

        {/* Current time indicator */}
        {showCurrentTime && currentTimePos !== null && (
          <div
            className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none"
            style={{ top: `${currentTimePos}px` }}
          >
            <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
