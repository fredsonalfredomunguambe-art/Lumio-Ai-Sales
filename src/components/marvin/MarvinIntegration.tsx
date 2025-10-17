"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Phone,
  Zap,
  Brain,
  ArrowRight,
  TrendingUp,
  Target,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import Image from "next/image";

interface MarvinInsight {
  type: "suggestion" | "warning" | "success" | "info";
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

interface MarvinMetrics {
  leadsGenerated: number;
  conversionRate: number;
  responseTime: number;
  satisfaction: number;
}

interface MarvinIntegrationProps {
  context: "leads" | "campaigns" | "insights" | "dashboard";
  data?: any;
  onAction?: (action: string, data?: any) => void;
}

export default function MarvinIntegration({
  context,
  data,
  onAction,
}: MarvinIntegrationProps) {
  const toast = useToast();
  const [isActive, setIsActive] = useState(true);
  const [insights, setInsights] = useState<MarvinInsight[]>([]);
  const [metrics, setMetrics] = useState<MarvinMetrics>({
    leadsGenerated: 0,
    conversionRate: 0,
    responseTime: 0,
    satisfaction: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMarvinData();
  }, [context, data]);

  const loadMarvinData = async () => {
    try {
      // Load insights based on context
      const insightsResponse = await fetch(
        `/api/marvin/insights?context=${context}`
      );
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        if (insightsData.success) {
          setInsights(insightsData.data);
        }
      }

      // Load metrics
      const metricsResponse = await fetch("/api/marvin/metrics");
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        if (metricsData.success) {
          setMetrics(metricsData.data);
        }
      }
    } catch (error) {
      console.error("Error loading Marvin data:", error);
    }
  };

  const handleInsightAction = async (
    action: string,
    insight: MarvinInsight
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/marvin/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          context,
          data,
          insight,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          "Action Executed",
          result.message || "Marvin action completed successfully"
        );
        onAction?.(action, result.data);
      } else {
        toast.error(
          "Action Failed",
          result.error || "Failed to execute Marvin action"
        );
      }
    } catch (error) {
      console.error("Error executing Marvin action:", error);
      toast.error("Error", "Failed to execute action");
    } finally {
      setIsLoading(false);
    }
  };

  const getContextualInsights = (): MarvinInsight[] => {
    switch (context) {
      case "leads":
        return [
          {
            type: "suggestion",
            title: "High-Value Lead Detected",
            description:
              'Lead "John Smith" has 87% conversion probability. Recommend immediate follow-up.',
            action: "Schedule Call",
            confidence: 0.87,
          },
          {
            type: "warning",
            title: "Low Engagement Segment",
            description:
              "B2B leads from LinkedIn have 15% lower response rates. Consider adjusting approach.",
            action: "Optimize Campaign",
            confidence: 0.73,
          },
          {
            type: "success",
            title: "Conversion Trend Up",
            description:
              "Your conversion rate increased 23% this week. Keep current strategy.",
            confidence: 0.95,
          },
        ];
      case "campaigns":
        return [
          {
            type: "suggestion",
            title: "Optimal Send Time",
            description:
              "Emails sent at 2:30 PM have 34% higher open rates for your audience.",
            action: "Optimize Schedule",
            confidence: 0.89,
          },
          {
            type: "info",
            title: "Subject Line Performance",
            description:
              "Questions in subject lines perform 28% better than statements.",
            action: "Update Templates",
            confidence: 0.82,
          },
        ];
      case "insights":
        return [
          {
            type: "suggestion",
            title: "Revenue Opportunity",
            description:
              "Implementing Marvin suggestions could increase revenue by 45%.",
            action: "View Details",
            confidence: 0.91,
          },
        ];
      case "dashboard":
        return [
          {
            type: "success",
            title: "Excellent Performance",
            description:
              "Your metrics are above industry average. Keep up the great work!",
            confidence: 0.98,
          },
        ];
      default:
        return [];
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
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
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

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Image
                src="/fotos/marvin.png"
                alt="Marvin"
                width={40}
                height={40}
                className="w-8 h-8 rounded-lg object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Marvin AI Assistant
              </h3>
              <p className="text-sm text-gray-600">
                Real-time insights and suggestions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <div className="w-2 h-2 rounded-full mr-1 bg-green-500"></div>
              Active
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.leadsGenerated}
            </div>
            <div className="text-xs text-gray-500">Leads Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.conversionRate}%
            </div>
            <div className="text-xs text-gray-500">Conversion</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.responseTime}s
            </div>
            <div className="text-xs text-gray-500">Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {metrics.satisfaction}
            </div>
            <div className="text-xs text-gray-500">Satisfaction</div>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-blue-600" />
            AI Insights
          </h4>

          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${getInsightColor(
                    insight.type
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {insight.title}
                        </h5>
                        <p className="text-sm text-gray-600 mb-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="w-3 h-3 mr-1" />
                            {Math.round(insight.confidence * 100)}% confidence
                          </div>
                          {insight.action && (
                            <button
                              onClick={() =>
                                handleInsightAction(insight.action!, insight)
                              }
                              disabled={isLoading}
                              className="flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {insight.action}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                No insights available at the moment
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleInsightAction("generate_leads", {})}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Generate Leads
            </button>
            <button
              onClick={() => handleInsightAction("optimize_campaigns", {})}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize
            </button>
            <button
              onClick={() => handleInsightAction("analyze_performance", {})}
              disabled={isLoading}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
