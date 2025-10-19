"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  CheckCircle,
  AlertCircle,
  Info,
  X,
  TrendingUp,
  Users,
  Mail,
  Target,
  BarChart3,
  Clock,
  Lightbulb,
  Zap,
  ArrowRight,
  Bell,
} from "lucide-react";

interface SmartNotification {
  id: string;
  type: "success" | "warning" | "error" | "info" | "insight" | "achievement";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "ghost";
  };
  marvinInsight?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: "leads" | "campaigns" | "insights" | "system" | "achievement";
  autoClose?: boolean;
  duration?: number;
  persistent?: boolean;
  data?: any;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: SmartNotification[];
  addNotification: (
    notification: Omit<SmartNotification, "id" | "timestamp">
  ) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  getUnreadCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useSmartNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useSmartNotifications must be used within a SmartNotificationProvider"
    );
  }
  return context;
};

export const SmartNotificationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set()
  );

  const addNotification = useCallback(
    (notification: Omit<SmartNotification, "id" | "timestamp">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: SmartNotification = {
        ...notification,
        id,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-close non-persistent notifications
      if (notification.autoClose !== false && !notification.persistent) {
        setTimeout(() => {
          removeNotification(id);
        }, notification.duration || 5000);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setReadNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setReadNotifications(new Set());
  }, []);

  const markAsRead = useCallback((id: string) => {
    setReadNotifications((prev) => new Set(prev).add(id));
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter((n) => !readNotifications.has(n.id)).length;
  }, [notifications, readNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAll,
        markAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

interface NotificationItemProps {
  notification: SmartNotification;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  isRead: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  onMarkAsRead,
  isRead,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "insight":
        return <Lightbulb className="w-5 h-5 text-purple-500" />;
      case "achievement":
        return <Zap className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = () => {
    switch (notification.category) {
      case "leads":
        return <Users className="w-4 h-4" />;
      case "campaigns":
        return <Mail className="w-4 h-4" />;
      case "insights":
        return <BarChart3 className="w-4 h-4" />;
      case "system":
        return <Target className="w-4 h-4" />;
      case "achievement":
        return <Zap className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-blue-500 bg-blue-50";
      case "low":
        return "border-l-gray-500 bg-gray-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const getActionVariant = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "secondary":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      case "ghost":
        return "text-blue-600 hover:bg-blue-50";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-l-4 shadow-lg hover:shadow-xl transition-all ${getPriorityColor()} ${
        isRead ? "opacity-75" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-1">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {notification.title}
                </h4>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {getCategoryIcon()}
                  <span className="ml-1">{notification.category}</span>
                </span>
                {notification.priority === "urgent" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
                    URGENT
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>

              {/* Marvin Insight */}
              {notification.marvinInsight && (
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900">
                        Marvin's Insight
                      </p>
                      <p className="text-xs text-blue-700">
                        {notification.marvinInsight}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {notification.action && (
                <div className="mt-3">
                  <button
                    onClick={() => {
                      notification.action?.onClick();
                      onMarkAsRead(notification.id);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getActionVariant(
                      notification.action.variant
                    )}`}
                  >
                    {notification.action.label}
                    <ArrowRight className="w-3 h-3 ml-1 inline" />
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(notification.timestamp)}</span>
                </span>
                {!isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SmartNotificationContainer: React.FC = () => {
  const { notifications, removeNotification, markAsRead, getUnreadCount } =
    useSmartNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = getUnreadCount();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all mb-4"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
              </h3>
              <span className="text-sm text-gray-500">
                {notifications.length} total
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRemove={removeNotification}
                  onMarkAsRead={markAsRead}
                  isRead={false} // You might want to track this in state
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for common notification types
export const createNotificationHelpers = (
  addNotification: (notification: any) => void
) => ({
  // Lead notifications
  newLeadDetected: (leadName: string, score: number) => {
    addNotification({
      type: "insight",
      title: "High-Value Lead Detected",
      message: `${leadName} has a score of ${score}. High conversion probability!`,
      priority: "high",
      category: "leads",
      action: {
        label: "Contact Now",
        onClick: () => console.log("Contact lead"),
      },
      marvinInsight:
        "This lead matches your ideal customer profile. Reach out within 24 hours for best results.",
    });
  },

  // Campaign notifications
  campaignPerformanceAlert: (campaignName: string, openRate: number) => {
    addNotification({
      type: "warning",
      title: "Campaign Performance Alert",
      message: `${campaignName} has ${openRate}% open rate (industry avg: 21%)`,
      priority: "medium",
      category: "campaigns",
      action: {
        label: "Optimize Campaign",
        onClick: () => console.log("Optimize campaign"),
      },
      marvinInsight:
        "Try A/B testing subject lines or sending at different times to improve open rates.",
    });
  },

  // Achievement notifications
  achievementUnlocked: (achievementName: string, description: string) => {
    addNotification({
      type: "achievement",
      title: "Achievement Unlocked!",
      message: `${achievementName}: ${description}`,
      priority: "low",
      category: "achievement",
      persistent: true,
      marvinInsight:
        "Great job! You're making excellent progress. Keep up the momentum!",
    });
  },

  // System notifications
  systemUpdate: (message: string) => {
    addNotification({
      type: "info",
      title: "System Update",
      message,
      priority: "low",
      category: "system",
      autoClose: true,
    });
  },
});
