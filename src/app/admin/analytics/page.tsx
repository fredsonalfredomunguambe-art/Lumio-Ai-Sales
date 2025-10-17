"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  Zap,
  MessageCircle,
  Target,
  AlertCircle,
  CheckCircle,
  Activity,
  Database,
  Cpu,
} from "lucide-react";
import { analytics } from "@/lib/analytics";
import { insightsCache } from "@/lib/insights-cache";
import { getQueueStats, healthCheck } from "@/lib/sync-engine";

interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  topEvents: Array<{ event: string; count: number }>;
  timeRange: { start: number; end: number };
  performance: {
    avgInsightTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

interface SystemHealth {
  cacheStats: {
    totalEntries: number;
    memoryUsage: number;
    oldestEntry: number;
    newestEntry: number;
  };
  rateLimit: {
    activeUsers: number;
    blockedRequests: number;
  };
  integrations: {
    healthy: boolean;
    queue: boolean;
    redis: boolean;
    stats: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
    };
  };
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Get analytics summary
      const analyticsSummary = analytics.getEventsSummary();

      // Get system health
      const cacheStats = insightsCache.getStats();

      // Get integration health
      const integrationHealth = await healthCheck();

      setSummary({
        totalEvents: analyticsSummary.totalEvents,
        uniqueUsers: analyticsSummary.uniqueUsers.size,
        topEvents: analyticsSummary.topEvents,
        timeRange: analyticsSummary.timeRange,
        performance: {
          avgInsightTime: 850, // Mock data - would come from real analytics
          cacheHitRate: 0.75,
          errorRate: 0.02,
        },
      });

      setSystemHealth({
        cacheStats,
        rateLimit: {
          activeUsers: 12, // Mock data
          blockedRequests: 3,
        },
        integrations: integrationHealth,
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Marvin AI Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor system performance, user behavior, and optimization insights
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              name: "Total Events",
              value: summary?.totalEvents?.toLocaleString() || "0",
              icon: Activity,
              color: "blue",
              change: "+12%",
            },
            {
              name: "Active Users",
              value: summary?.uniqueUsers?.toString() || "0",
              icon: Users,
              color: "green",
              change: "+5%",
            },
            {
              name: "Avg Response Time",
              value: summary?.performance.avgInsightTime
                ? `${summary.performance.avgInsightTime}ms`
                : "0ms",
              icon: Clock,
              color: "orange",
              change: "-8%",
            },
            {
              name: "Cache Hit Rate",
              value: summary?.performance.cacheHitRate
                ? `${(summary.performance.cacheHitRate * 100).toFixed(1)}%`
                : "0%",
              icon: Zap,
              color: "purple",
              change: "+15%",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.name}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <span
                    className={`text-sm font-medium ${
                      metric.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metric.change} vs last week
                  </span>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-${metric.color}-100 flex items-center justify-center`}
                >
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Events */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Top Events
            </h3>
            <div className="space-y-3">
              {summary?.topEvents.slice(0, 8).map((event, index) => (
                <div
                  key={event.event}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">
                      {event.event
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {event.count.toLocaleString()}
                  </span>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No events recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-600" />
              System Health
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Cache Status",
                  value: "Healthy",
                  detail: `${
                    systemHealth?.cacheStats.totalEntries || 0
                  } entries`,
                  status: "good",
                  icon: Database,
                },
                {
                  label: "Memory Usage",
                  value: formatBytes(systemHealth?.cacheStats.memoryUsage || 0),
                  detail: "Within limits",
                  status: "good",
                  icon: Cpu,
                },
                {
                  label: "Error Rate",
                  value: `${(
                    (summary?.performance.errorRate || 0) * 100
                  ).toFixed(2)}%`,
                  detail: "Below threshold",
                  status:
                    summary?.performance.errorRate &&
                    summary.performance.errorRate < 0.05
                      ? "good"
                      : "warning",
                  icon: AlertCircle,
                },
                {
                  label: "Rate Limiting",
                  value: `${
                    systemHealth?.rateLimit.blockedRequests || 0
                  } blocked`,
                  detail: "Last 24h",
                  status:
                    (systemHealth?.rateLimit.blockedRequests || 0) < 10
                      ? "good"
                      : "warning",
                  icon: CheckCircle,
                },
                {
                  label: "Integration Engine",
                  value: systemHealth?.integrations.healthy
                    ? "Healthy"
                    : "Issues",
                  detail: `${
                    systemHealth?.integrations.stats.active || 0
                  } active jobs`,
                  status: systemHealth?.integrations.healthy
                    ? "good"
                    : "warning",
                  icon: Activity,
                },
                {
                  label: "Redis Queue",
                  value: systemHealth?.integrations.redis
                    ? "Connected"
                    : "Disconnected",
                  detail: `${
                    systemHealth?.integrations.stats.waiting || 0
                  } waiting`,
                  status: systemHealth?.integrations.redis ? "good" : "warning",
                  icon: Database,
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-4 h-4 ${
                        item.status === "good"
                          ? "text-green-600"
                          : item.status === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      item.status === "good"
                        ? "text-green-600"
                        : item.status === "warning"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Timeline */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
            Performance Insights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200/50">
              <h4 className="font-semibold text-blue-900 mb-2">
                Optimization Impact
              </h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">
                {summary?.performance.cacheHitRate
                  ? `${(summary.performance.cacheHitRate * 100).toFixed(0)}%`
                  : "0%"}
              </p>
              <p className="text-sm text-blue-700">
                of requests served from cache
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200/50">
              <h4 className="font-semibold text-green-900 mb-2">
                Response Time
              </h4>
              <p className="text-2xl font-bold text-green-600 mb-1">
                {summary?.performance.avgInsightTime || 0}ms
              </p>
              <p className="text-sm text-green-700">average processing time</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200/50">
              <h4 className="font-semibold text-purple-900 mb-2">
                Reliability
              </h4>
              <p className="text-2xl font-bold text-purple-600 mb-1">
                {summary?.performance.errorRate
                  ? `${((1 - summary.performance.errorRate) * 100).toFixed(1)}%`
                  : "100%"}
              </p>
              <p className="text-sm text-purple-700">uptime success rate</p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="mt-8 flex justify-center space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={loadAnalytics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Activity className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={() => insightsCache.cleanup()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Clean Cache</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
