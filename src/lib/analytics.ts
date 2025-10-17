interface AnalyticsEvent {
  event: string;
  userId: string;
  timestamp: number;
  properties: Record<string, any>;
  sessionId?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private config: AnalyticsConfig;
  private sessionId: string;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === "production",
      batchSize: 50,
      flushInterval: 30 * 1000, // 30 seconds
      ...config,
    };

    this.sessionId = this.generateSessionId();

    // Auto-flush events periodically
    if (this.config.enabled) {
      setInterval(() => this.flush(), this.config.flushInterval);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  track(
    event: string,
    properties: Record<string, any> = {},
    userId?: string
  ): void {
    if (!this.config.enabled) {
      console.log(`📊 [Analytics] ${event}:`, properties);
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      userId: userId || "anonymous",
      timestamp: Date.now(),
      properties: {
        ...properties,
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "server",
        url: typeof window !== "undefined" ? window.location.href : undefined,
      },
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);

    // Auto-flush if batch size reached
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // In a real app, you'd send to your analytics service
      // For now, we'll just log to console and could extend to send to external service
      console.log(
        `📊 Flushing ${eventsToSend.length} analytics events:`,
        eventsToSend
      );

      // Example: Send to external analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToSend })
      // });
    } catch (error) {
      console.error("❌ Failed to flush analytics events:", error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  // Marvin-specific tracking methods
  trackMarvinInsightRequested(
    userId: string,
    properties: {
      boardSize: number;
      mode: "insights" | "chat" | "calendar_insights";
      cached?: boolean;
    }
  ): void {
    this.track("marvin_insight_requested", properties, userId);
  }

  trackMarvinInsightGenerated(
    userId: string,
    properties: {
      boardSize: number;
      mode: string;
      responseLength: number;
      processingTime: number;
      cached: boolean;
      tokensUsed?: number;
    }
  ): void {
    this.track("marvin_insight_generated", properties, userId);
  }

  trackMarvinInsightViewed(
    userId: string,
    properties: {
      insightId: string;
      viewDuration: number;
      scrollDepth: number;
    }
  ): void {
    this.track("marvin_insight_viewed", properties, userId);
  }

  trackMarvinChatMessage(
    userId: string,
    properties: {
      messageLength: number;
      boardSize: number;
      responseTime: number;
    }
  ): void {
    this.track("marvin_chat_message", properties, userId);
  }

  trackKanbanOptimization(
    userId: string,
    properties: {
      action: "task_moved" | "task_created" | "task_deleted" | "bulk_update";
      tasksAffected: number;
      fromStatus?: string;
      toStatus?: string;
    }
  ): void {
    this.track("kanban_optimization", properties, userId);
  }

  trackError(
    userId: string,
    error: {
      type: string;
      message: string;
      stack?: string;
      context: Record<string, any>;
    }
  ): void {
    this.track(
      "error",
      {
        errorType: error.type,
        errorMessage: error.message,
        errorStack: error.stack,
        ...error.context,
      },
      userId
    );
  }

  // Performance tracking
  trackPerformance(
    userId: string,
    properties: {
      metric: string;
      value: number;
      context: Record<string, any>;
    }
  ): void {
    this.track("performance", properties, userId);
  }

  // User behavior tracking
  trackUserBehavior(
    userId: string,
    properties: {
      action: string;
      feature: string;
      context: Record<string, any>;
    }
  ): void {
    this.track("user_behavior", properties, userId);
  }

  // Get analytics summary for admin dashboard
  getEventsSummary(): {
    totalEvents: number;
    uniqueUsers: Set<string>;
    topEvents: Array<{ event: string; count: number }>;
    timeRange: { start: number; end: number };
  } {
    const uniqueUsers = new Set(this.events.map((e) => e.userId));
    const eventCounts = this.events.reduce((acc, e) => {
      acc[e.event] = (acc[e.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const timestamps = this.events.map((e) => e.timestamp);

    return {
      totalEvents: this.events.length,
      uniqueUsers,
      topEvents,
      timeRange: {
        start: Math.min(...timestamps) || 0,
        end: Math.max(...timestamps) || 0,
      },
    };
  }
}

// Singleton instance
export const analytics = new Analytics();

// Browser-only tracking utilities
export const browserAnalytics = {
  trackPageView: (userId: string, page: string) => {
    analytics.track("page_view", { page }, userId);
  },

  trackButtonClick: (
    userId: string,
    buttonName: string,
    context: Record<string, any> = {}
  ) => {
    analytics.track("button_click", { buttonName, ...context }, userId);
  },

  trackModalOpen: (userId: string, modalName: string) => {
    analytics.track("modal_open", { modalName }, userId);
  },

  trackModalClose: (userId: string, modalName: string, duration: number) => {
    analytics.track("modal_close", { modalName, duration }, userId);
  },
};
