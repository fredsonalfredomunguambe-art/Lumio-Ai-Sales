"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Brain,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Calendar,
  Zap,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { LoadingState } from "@/components/ui/LoadingState";

interface MarvinInsight {
  id: string;
  type: "suggestion" | "warning" | "success" | "info";
  title: string;
  description: string;
  action?: string;
  confidence: number;
  impact?: string;
  category?: string;
  metadata?: any;
}

interface MarvinInsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: "leads" | "campaigns" | "insights" | "dashboard" | "calendar";
  data?: any;
  onAction?: (action: string, data?: any) => void;
  onInsightsLoad?: (count: number) => void;
}

type TabType = "overview" | "suggestions" | "optimization" | "actions";

export function MarvinInsightsPanel({
  isOpen,
  onClose,
  context,
  data,
  onAction,
  onInsightsLoad,
}: MarvinInsightsPanelProps) {
  const [insights, setInsights] = useState<MarvinInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (isOpen) {
      loadInsights();
      // Auto-select suggestions tab for calendar context
      if (context === "calendar") {
        setActiveTab("suggestions");
      } else {
        setActiveTab("overview");
      }
    }
  }, [isOpen, context]);

  const loadInsights = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `/api/marvin/insights?context=${context}&refresh=${refresh}`
      );
      const result = await response.json();

      if (result.success) {
        setInsights(result.data);
        // Notify parent component of insight count
        if (onInsightsLoad) {
          const schedulingInsights = result.data.filter(
            (i: any) =>
              i.category === "scheduling" ||
              i.category === "conversion" ||
              i.category === "acquisition" ||
              i.category === "retention"
          );
          onInsightsLoad(schedulingInsights.length);
        }
      }
    } catch (error) {
      console.error("Error loading insights:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInsightAction = async (insight: MarvinInsight) => {
    if (!insight.action) return;

    try {
      const response = await fetch("/api/marvin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: insight.action,
          context,
          insightId: insight.id,
          data,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onAction?.(insight.action, result.data);
        // Refresh insights after action
        loadInsights(true);
      }
    } catch (error) {
      console.error("Error executing action:", error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "info":
        return <Info className="w-5 h-5 text-purple-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "suggestion":
        return "border-blue-200 bg-blue-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "success":
        return "border-green-200 bg-green-50";
      case "info":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "success";
    if (confidence >= 0.7) return "primary";
    if (confidence >= 0.5) return "warning";
    return "default";
  };

  // Filter insights by active tab
  const getFilteredInsights = () => {
    if (activeTab === "overview") {
      return insights.filter((i) =>
        ["overview", "performance", "planning", "productivity"].includes(
          i.category || ""
        )
      );
    }
    if (activeTab === "suggestions") {
      return insights.filter((i) =>
        ["scheduling", "conversion", "acquisition", "retention"].includes(
          i.category || ""
        )
      );
    }
    if (activeTab === "optimization") {
      return insights.filter((i) =>
        ["optimization", "improvement", "timing", "strategy"].includes(
          i.category || ""
        )
      );
    }
    if (activeTab === "actions") {
      return insights.filter((i) => i.action);
    }
    return insights;
  };

  const filteredInsights = getFilteredInsights();

  const tabs = [
    {
      id: "overview" as TabType,
      label: "Overview",
      icon: Activity,
      color: "blue",
      count: insights.filter((i) =>
        ["overview", "performance", "planning", "productivity"].includes(
          i.category || ""
        )
      ).length,
    },
    {
      id: "suggestions" as TabType,
      label: "Suggestions",
      icon: Lightbulb,
      color: "purple",
      count: insights.filter((i) =>
        ["scheduling", "conversion", "acquisition", "retention"].includes(
          i.category || ""
        )
      ).length,
    },
    {
      id: "optimization" as TabType,
      label: "Optimize",
      icon: TrendingUp,
      color: "green",
      count: insights.filter((i) =>
        ["optimization", "improvement", "timing", "strategy"].includes(
          i.category || ""
        )
      ).length,
    },
    {
      id: "actions" as TabType,
      label: "Actions",
      icon: Zap,
      color: "orange",
      count: insights.filter((i) => i.action).length,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Marvin AI Insights
                    </h2>
                    <p className="text-xs text-gray-600">
                      {context.charAt(0).toUpperCase() + context.slice(1)}{" "}
                      Intelligence
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh Button */}
              <ActionButton
                variant="secondary"
                size="sm"
                icon={
                  <RefreshCw
                    className={cn("w-4 h-4", refreshing && "animate-spin")}
                  />
                }
                loading={refreshing}
                onClick={() => loadInsights(true)}
                fullWidth
              >
                Refresh Insights
              </ActionButton>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count > 0 && (
                        <Badge
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className={cn(
                            "ml-1",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-xl p-4 animate-pulse"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-5/6" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredInsights.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {tabs.find((t) => t.id === activeTab)?.label} Yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    {activeTab === "suggestions"
                      ? "Marvin is analyzing opportunities. Check back soon for AI-powered meeting suggestions."
                      : "Marvin is analyzing your data. Check back soon for AI-powered recommendations."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-xl border-2 p-4 transition-all hover:shadow-md",
                        getInsightColor(insight.type)
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {insight.title}
                            </h4>
                            <Badge
                              variant={getConfidenceColor(insight.confidence)}
                              size="sm"
                            >
                              {Math.round(insight.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {insight.description}
                          </p>
                          {insight.impact && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="font-medium">
                                Impact: {insight.impact}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {insight.action && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Target className="w-3.5 h-3.5" />
                            <span>Recommended Action</span>
                          </div>
                          <ActionButton
                            size="sm"
                            variant="primary"
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                            iconPosition="right"
                            onClick={() => handleInsightAction(insight)}
                          >
                            {insight.action}
                          </ActionButton>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Stats */}
            {!loading && filteredInsights.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredInsights.length}
                    </div>
                    <div className="text-xs text-gray-600">
                      {tabs.find((t) => t.id === activeTab)?.label}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        filteredInsights.filter((i) => i.type === "suggestion")
                          .length
                      }
                    </div>
                    <div className="text-xs text-gray-600">Actionable</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {filteredInsights.length > 0
                        ? Math.round(
                            (filteredInsights.reduce(
                              (acc, i) => acc + i.confidence,
                              0
                            ) /
                              filteredInsights.length) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-xs text-gray-600">Confidence</div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
