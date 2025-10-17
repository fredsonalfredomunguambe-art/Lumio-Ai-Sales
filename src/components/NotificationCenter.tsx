"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
} from "lucide-react";
import { useMeetingStore } from "@/stores/meetingStore";

interface Notification {
  id: string;
  type:
    | "meeting_reminder"
    | "meeting_starting"
    | "meeting_completed"
    | "lead_assigned"
    | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { meetings } = useMeetingStore();

  // Generate notifications based on meetings
  useEffect(() => {
    const generateNotifications = () => {
      const now = new Date();
      const newNotifications: Notification[] = [];

      meetings.forEach((meeting) => {
        const meetingTime = new Date(meeting.startDate);
        const timeDiff = meetingTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));

        // Meeting starting soon (15 minutes)
        if (
          minutesDiff > 0 &&
          minutesDiff <= 15 &&
          meeting.status === "SCHEDULED"
        ) {
          newNotifications.push({
            id: `meeting-starting-${meeting.id}`,
            type: "meeting_starting",
            title: "Meeting Starting Soon",
            message: `${meeting.title} starts in ${minutesDiff} minutes`,
            timestamp: now,
            read: false,
            action: {
              label: "View Meeting",
              onClick: () => {
                // Handle view meeting
                console.log("View meeting:", meeting.id);
              },
            },
          });
        }

        // Meeting reminder (1 hour before)
        if (
          minutesDiff > 0 &&
          minutesDiff <= 60 &&
          minutesDiff > 15 &&
          meeting.status === "SCHEDULED"
        ) {
          newNotifications.push({
            id: `meeting-reminder-${meeting.id}`,
            type: "meeting_reminder",
            title: "Meeting Reminder",
            message: `${meeting.title} is in ${Math.floor(
              minutesDiff / 60
            )} hour${Math.floor(minutesDiff / 60) > 1 ? "s" : ""}`,
            timestamp: now,
            read: false,
            action: {
              label: "Prepare",
              onClick: () => {
                console.log("Prepare for meeting:", meeting.id);
              },
            },
          });
        }

        // Meeting completed
        if (meeting.status === "COMPLETED" && !meeting.outcome) {
          newNotifications.push({
            id: `meeting-completed-${meeting.id}`,
            type: "meeting_completed",
            title: "Meeting Completed",
            message: `${meeting.title} has ended. Add notes and outcome.`,
            timestamp: now,
            read: false,
            action: {
              label: "Add Notes",
              onClick: () => {
                console.log("Add notes for meeting:", meeting.id);
              },
            },
          });
        }
      });

      setNotifications((prev) => {
        // Remove old notifications and add new ones
        const existingIds = new Set(prev.map((n) => n.id));
        const newNotifs = newNotifications.filter(
          (n) => !existingIds.has(n.id)
        );
        return [...prev, ...newNotifs].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      });
    };

    // Generate notifications every minute
    const interval = setInterval(generateNotifications, 60000);
    generateNotifications(); // Initial generation

    return () => clearInterval(interval);
  }, [meetings]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "meeting_reminder":
        return Clock;
      case "meeting_starting":
        return AlertCircle;
      case "meeting_completed":
        return CheckCircle;
      case "lead_assigned":
        return User;
      case "system":
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "meeting_reminder":
        return "text-blue-600 bg-blue-100";
      case "meeting_starting":
        return "text-orange-600 bg-orange-100";
      case "meeting_completed":
        return "text-green-600 bg-green-100";
      case "lead_assigned":
        return "text-purple-600 bg-purple-100";
      case "system":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const isUnread = !notification.read;

                    return (
                      <motion.div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          isUnread ? "bg-blue-50/50" : ""
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationColor(
                              notification.type
                            )}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p
                                  className={`text-sm font-medium ${
                                    isUnread ? "text-gray-900" : "text-gray-700"
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatTimeAgo(notification.timestamp)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {isUnread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                                <button
                                  onClick={() =>
                                    removeNotification(notification.id)
                                  }
                                  className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            </div>
                            {notification.action && (
                              <button
                                onClick={() => {
                                  notification.action?.onClick();
                                  markAsRead(notification.id);
                                }}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {notification.action.label} →
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
