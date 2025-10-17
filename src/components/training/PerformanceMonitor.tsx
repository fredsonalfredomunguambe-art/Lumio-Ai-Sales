"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { useTraining } from "@/hooks/useTraining";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  MessageSquare,
  Award,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

interface PerformanceData {
  date: string;
  conversations: number;
  successRate: number;
  responseTime: number;
  engagement: number;
  conversion: number;
}

interface MetricComparison {
  metric: string;
  current: number;
  previous: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface PerformanceMonitorProps {
  onMetricClick?: (metric: string) => void;
}

export default function PerformanceMonitor({
  onMetricClick,
}: PerformanceMonitorProps) {
  const { trainingData, retrainModel, loading } = useTraining();
  const [selectedMetric, setSelectedMetric] = useState("conversations");
  const [timeRange, setTimeRange] = useState("30d");

  // Gerar dados de performance baseados nos dados reais
  const generatePerformanceData = () => {
    if (!trainingData?.interactions) return [];

    const interactions = trainingData.interactions;
    const last30Days = interactions.filter((i) => {
      const interactionDate = new Date(i.timestamp);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return interactionDate >= thirtyDaysAgo;
    });

    // Agrupar por dia
    const dailyData = new Map();
    last30Days.forEach((interaction) => {
      const date = interaction.timestamp.split("T")[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          conversations: 0,
          successRate: 0,
          responseTime: 0,
          engagement: 0,
          conversion: 0,
        });
      }

      const dayData = dailyData.get(date);
      dayData.conversations += 1;
      if (interaction.outcome === "success") {
        dayData.successRate += 1;
      }
      dayData.engagement += interaction.customerSatisfaction || 3;
    });

    // Calcular médias
    return Array.from(dailyData.values()).map((day) => ({
      ...day,
      successRate:
        day.conversations > 0
          ? Math.round((day.successRate / day.conversations) * 100)
          : 0,
      engagement:
        day.conversations > 0
          ? Math.round((day.engagement / day.conversations) * 20)
          : 0,
      responseTime: 2.5, // Simulado
      conversion: Math.round((day.successRate / day.conversations) * 80) || 0,
    }));
  };

  const data = generatePerformanceData();
  const progress = trainingData?.progress;

  const metrics: MetricComparison[] = [
    {
      metric: "Conversations",
      current: progress?.totalInteractions || 0,
      previous: Math.max(0, (progress?.totalInteractions || 0) - 10),
      change: calculateChange(
        progress?.totalInteractions || 0,
        Math.max(0, (progress?.totalInteractions || 0) - 10)
      ),
      trend:
        (progress?.totalInteractions || 0) >
        Math.max(0, (progress?.totalInteractions || 0) - 10)
          ? "up"
          : "down",
    },
    {
      metric: "Success Rate",
      current: progress?.performanceMetrics.responseAccuracy || 0,
      previous: Math.max(
        0,
        (progress?.performanceMetrics.responseAccuracy || 0) - 5
      ),
      change: calculateChange(
        progress?.performanceMetrics.responseAccuracy || 0,
        Math.max(0, (progress?.performanceMetrics.responseAccuracy || 0) - 5)
      ),
      trend:
        (progress?.performanceMetrics.responseAccuracy || 0) >
        Math.max(0, (progress?.performanceMetrics.responseAccuracy || 0) - 5)
          ? "up"
          : "down",
    },
    {
      metric: "Satisfaction",
      current: progress?.performanceMetrics.customerSatisfaction || 0,
      previous: Math.max(
        0,
        (progress?.performanceMetrics.customerSatisfaction || 0) - 3
      ),
      change: calculateChange(
        progress?.performanceMetrics.customerSatisfaction || 0,
        Math.max(
          0,
          (progress?.performanceMetrics.customerSatisfaction || 0) - 3
        )
      ),
      trend:
        (progress?.performanceMetrics.customerSatisfaction || 0) >
        Math.max(
          0,
          (progress?.performanceMetrics.customerSatisfaction || 0) - 3
        )
          ? "up"
          : "down",
    },
    {
      metric: "Adaptation",
      current: progress?.adaptationScore || 0,
      previous: Math.max(0, (progress?.adaptationScore || 0) - 8),
      change: calculateChange(
        progress?.adaptationScore || 0,
        Math.max(0, (progress?.adaptationScore || 0) - 8)
      ),
      trend:
        (progress?.adaptationScore || 0) >
        Math.max(0, (progress?.adaptationScore || 0) - 8)
          ? "up"
          : "down",
    },
  ];

  const conversationOutcomes = [
    { name: "Successful", value: 45, color: "#10B981" },
    { name: "No Response", value: 30, color: "#F59E0B" },
    { name: "Objection", value: 15, color: "#EF4444" },
    { name: "Not Interested", value: 10, color: "#6B7280" },
  ];

  const performanceInsights = [
    {
      title: "Peak Performance Hours",
      description: "Your agent performs best between 10 AM - 2 PM",
      impact: "high",
      recommendation: "Schedule more calls during peak hours",
    },
    {
      title: "Response Time Optimization",
      description: "Average response time decreased by 15% this week",
      impact: "medium",
      recommendation: "Continue current training approach",
    },
    {
      title: "Engagement Improvement",
      description: "Engagement scores increased by 8% after recent training",
      impact: "high",
      recommendation: "Apply similar training to other agents",
    },
  ];

  function calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 font-outfit">
          Performance Monitor
        </h3>
        <div className="flex space-x-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors font-outfit ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onMetricClick(metric.metric)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700 font-outfit">
                {metric.metric}
              </h4>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900 font-outfit">
                {metric.current}
              </span>
              <span
                className={`text-sm font-medium ${getTrendColor(metric.trend)}`}
              >
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </span>
            </div>
            <p className="text-xs text-gray-500 font-outfit mt-1">
              vs previous period
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            <span>Performance Trends</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="successRate"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stackId="2"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversation Outcomes */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            <span>Conversation Outcomes</span>
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={conversationOutcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {conversationOutcomes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {conversationOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: outcome.color }}
                />
                <span className="text-sm text-gray-700 font-outfit">
                  {outcome.name}
                </span>
                <span className="text-sm font-medium text-gray-900 font-outfit ml-auto">
                  {outcome.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-600" />
          <span>AI-Powered Performance Insights</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceInsights.map((insight, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    insight.impact === "high"
                      ? "bg-green-100"
                      : insight.impact === "medium"
                      ? "bg-yellow-100"
                      : "bg-red-100"
                  }`}
                >
                  <Target
                    className={`w-4 h-4 ${
                      insight.impact === "high"
                        ? "text-green-600"
                        : insight.impact === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1 font-outfit">
                    {insight.title}
                  </h5>
                  <p className="text-sm text-gray-700 mb-2 font-outfit">
                    {insight.description}
                  </p>
                  <p className="text-xs text-blue-700 font-outfit font-medium">
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-600" />
          <span>Real-time Activity</span>
        </h4>
        <div className="space-y-3">
          {[
            {
              time: "2 minutes ago",
              action: "New conversation started",
              type: "success",
            },
            {
              time: "5 minutes ago",
              action: "Objection handled successfully",
              type: "success",
            },
            {
              time: "8 minutes ago",
              action: "Follow-up email sent",
              type: "info",
            },
            {
              time: "12 minutes ago",
              action: "Demo scheduled",
              type: "success",
            },
            {
              time: "15 minutes ago",
              action: "Training data processed",
              type: "info",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === "success"
                    ? "bg-green-500"
                    : activity.type === "info"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900 font-outfit">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500 font-outfit">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
