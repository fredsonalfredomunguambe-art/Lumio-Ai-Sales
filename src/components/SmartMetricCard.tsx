"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  Lightbulb,
  Target,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface SmartMetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  trend?: number[];
  format?: "number" | "percentage" | "currency";
  explanation?: string;
  marvinTip?: string;
  industryAverage?: number;
  target?: number;
  status?: "excellent" | "good" | "warning" | "critical";
  actionable?: boolean;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function SmartMetricCard({
  title,
  value,
  change = 0,
  changeType = "neutral",
  icon: Icon,
  trend = [],
  format = "number",
  explanation,
  marvinTip,
  industryAverage,
  target,
  status = "good",
  actionable = false,
  onAction,
  actionLabel = "Take Action",
  className = "",
}: SmartMetricCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showMarvinTip, setShowMarvinTip] = useState(false);
  const toast = useToast();

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800 border-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "good":
        return <Info className="w-4 h-4 text-blue-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      switch (format) {
        case "currency":
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(val);
        case "percentage":
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString();
      }
    }
    return val;
  };

  const getPerformanceMessage = () => {
    if (industryAverage && typeof value === "number") {
      const numericValue =
        typeof value === "string" ? parseFloat(value) : value;
      const diff = ((numericValue - industryAverage) / industryAverage) * 100;

      if (diff > 20)
        return "Excellent! You're significantly above industry average";
      if (diff > 10) return "Great! You're above industry average";
      if (diff > -10) return "Good! You're close to industry average";
      if (diff > -20) return "Below average. Consider optimization";
      return "Needs improvement. Well below industry average";
    }
    return null;
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
      toast.success("Action Taken", `Executed action for ${title}`);
    }
  };

  return (
    <div
      className={`metric-card group relative hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">{title}</p>
          </div>
        </div>
        {change !== 0 && (
          <div
            className={`flex items-center px-1.5 py-0.5 rounded text-xxs font-semibold ${
              changeType === "increase"
                ? "bg-green-50 text-green-700"
                : changeType === "decrease"
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            {getChangeIcon()}
            <span className="ml-0.5">{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
      </div>

      {/* Compact Trend Chart */}
      {trend.length > 0 && (
        <div className="h-6 flex items-end space-x-0.5">
          {trend.map((value, i) => {
            const height = (value / Math.max(...trend)) * 100;
            return (
              <div
                key={i}
                className="bg-blue-200 rounded-sm flex-1 transition-all duration-200 hover:bg-blue-300"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      )}

      {/* Tooltip on Hover */}
      {(explanation || marvinTip) && (
        <div className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-3 shadow-lg border border-gray-200 z-10">
          <div className="text-xs space-y-2">
            {explanation && <p className="text-gray-700">{explanation}</p>}
            {marvinTip && (
              <div className="flex items-start space-x-1 text-blue-700 bg-blue-50 rounded p-2">
                <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <p className="text-xxs leading-tight">{marvinTip}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
