"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";

interface RecurrenceSelectorProps {
  value: any;
  onChange: (pattern: any) => void;
}

export function RecurrenceSelector({
  value,
  onChange,
}: RecurrenceSelectorProps) {
  const [frequency, setFrequency] = useState(value?.frequency || "weekly");
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(
    value?.daysOfWeek || []
  );
  const [endType, setEndType] = useState(value?.endType || "never");
  const [endDate, setEndDate] = useState(value?.endDate || "");
  const [occurrences, setOccurrences] = useState(value?.occurrences || 10);

  useEffect(() => {
    const pattern = {
      frequency,
      interval,
      daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
      endType,
      endDate: endType === "date" ? endDate : undefined,
      occurrences: endType === "after" ? occurrences : undefined,
    };
    onChange(pattern);
  }, [frequency, interval, daysOfWeek, endType, endDate, occurrences]);

  const toggleDayOfWeek = (day: string) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const weekDays = [
    { value: "sunday", label: "Sun" },
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Frequency */}
      <div className="grid grid-cols-3 gap-2">
        {["daily", "weekly", "monthly"].map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequency(freq)}
            className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              frequency === freq
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {freq}
          </button>
        ))}
      </div>

      {/* Interval */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Every</span>
        <input
          type="number"
          min="1"
          max="30"
          value={interval}
          onChange={(e) => setInterval(parseInt(e.target.value))}
          className="w-20 px-3 py-1 border border-gray-300 rounded text-sm"
        />
        <span className="text-sm text-gray-700">
          {frequency === "daily" && (interval === 1 ? "day" : "days")}
          {frequency === "weekly" && (interval === 1 ? "week" : "weeks")}
          {frequency === "monthly" && (interval === 1 ? "month" : "months")}
        </span>
      </div>

      {/* Days of Week (for weekly) */}
      {frequency === "weekly" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Repeat on
          </label>
          <div className="flex gap-2">
            {weekDays.map((day) => (
              <button
                key={day.value}
                onClick={() => toggleDayOfWeek(day.value)}
                className={`w-10 h-10 rounded-full text-xs font-medium transition-colors ${
                  daysOfWeek.includes(day.value)
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ends
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={endType === "never"}
              onChange={() => setEndType("never")}
              className="rounded-full"
            />
            <span className="text-sm text-gray-700">Never</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={endType === "date"}
              onChange={() => setEndType("date")}
              className="rounded-full"
            />
            <span className="text-sm text-gray-700">On</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setEndType("date");
              }}
              disabled={endType !== "date"}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={endType === "after"}
              onChange={() => setEndType("after")}
              className="rounded-full"
            />
            <span className="text-sm text-gray-700">After</span>
            <input
              type="number"
              min="1"
              max="100"
              value={occurrences}
              onChange={(e) => {
                setOccurrences(parseInt(e.target.value));
                setEndType("after");
              }}
              disabled={endType !== "after"}
              className="w-20 px-3 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
            />
            <span className="text-sm text-gray-700">occurrences</span>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-3 border-t border-gray-300">
        <div className="text-xs text-gray-600">
          Summary:{" "}
          <span className="font-medium text-gray-900">
            {interval > 1 ? `Every ${interval} ` : "Every "}
            {frequency === "daily" && (interval === 1 ? "day" : "days")}
            {frequency === "weekly" && (
              <>
                {interval === 1 ? "week" : "weeks"}
                {daysOfWeek.length > 0 &&
                  ` on ${daysOfWeek.map((d) => d.slice(0, 3)).join(", ")}`}
              </>
            )}
            {frequency === "monthly" && (interval === 1 ? "month" : "months")}
            {endType === "never" && ", forever"}
            {endType === "date" &&
              `, until ${new Date(endDate).toLocaleDateString()}`}
            {endType === "after" && `, ${occurrences} times`}
          </span>
        </div>
      </div>
    </div>
  );
}
