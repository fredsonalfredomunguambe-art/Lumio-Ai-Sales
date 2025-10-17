"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: LucideIcon;
  trend?: number[];
  format?: "number" | "percentage" | "currency";
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  trend = [],
  format = "number",
  className = "",
  onClick,
}: StatCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      switch (format) {
        case "currency":
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        case "percentage":
          return `${val.toFixed(1)}%`;
        default:
          return val.toLocaleString();
      }
    }
    return val;
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="w-4 h-4" />;
      case "decrease":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const changeColor = {
    increase:
      "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
    decrease: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30",
    neutral: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md",
        onClick &&
          "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {formatValue(value)}
          </p>
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 transition-colors duration-200" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {change !== undefined && (
          <div
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              changeColor[changeType]
            )}
          >
            {getChangeIcon()}
            <span>{Math.abs(change)}%</span>
          </div>
        )}

        {trend.length > 0 && (
          <div className="flex items-end gap-0.5 h-8">
            {trend.map((value, i) => {
              const height = (value / Math.max(...trend)) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-sm transition-all",
                    changeType === "increase"
                      ? "bg-green-200 dark:bg-green-700"
                      : changeType === "decrease"
                      ? "bg-red-200 dark:bg-red-700"
                      : "bg-gray-200 dark:bg-gray-600"
                  )}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
