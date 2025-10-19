"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  Mail,
  BarChart3,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface MarvinSuggestion {
  id: string;
  type: "insight" | "action" | "warning" | "tip";
  title: string;
  description: string;
  confidence: number;
  action?: {
    label: string;
    onClick: () => void;
    priority: "high" | "medium" | "low";
  };
  category: "leads" | "campaigns" | "insights" | "general";
  estimatedImpact?: string;
}

interface MarvinAssistantProps {
  context: "leads" | "campaigns" | "insights" | "dashboard" | "settings";
  data?: any;
  className?: string;
}

const getContextualSuggestions = (
  context: string,
  data?: any
): MarvinSuggestion[] => {
  const suggestions: MarvinSuggestion[] = [];

  switch (context) {
    case "leads":
      suggestions.push(
        {
          id: "1",
          type: "insight",
          title: "High-Value Leads Detected",
          description:
            "5 leads with score >90 haven't been contacted in 24h. High conversion probability!",
          confidence: 0.92,
          action: {
            label: "Contact Now",
            onClick: () => console.log("Contact high-value leads"),
            priority: "high",
          },
          category: "leads",
          estimatedImpact: "Potential 40% conversion increase",
        },
        {
          id: "2",
          type: "tip",
          title: "Segment Optimization",
          description:
            "Create 'Hot Prospects' segment for leads with score >80 and recent activity",
          confidence: 0.78,
          action: {
            label: "Create Segment",
            onClick: () => console.log("Create hot prospects segment"),
            priority: "medium",
          },
          category: "leads",
          estimatedImpact: "Better campaign targeting",
        }
      );
      break;

    case "campaigns":
      suggestions.push(
        {
          id: "3",
          type: "warning",
          title: "Low Performance Alert",
          description:
            "Welcome Series campaign has 15% open rate (industry avg: 21%). Consider A/B testing subject lines.",
          confidence: 0.85,
          action: {
            label: "Optimize Campaign",
            onClick: () => console.log("Optimize campaign"),
            priority: "high",
          },
          category: "campaigns",
          estimatedImpact: "Potential 30% open rate improvement",
        },
        {
          id: "4",
          type: "action",
          title: "Best Time to Send",
          description:
            "Your audience is most active at 2-4 PM. Schedule next campaign for optimal engagement.",
          confidence: 0.88,
          action: {
            label: "Schedule Campaign",
            onClick: () => console.log("Schedule for optimal time"),
            priority: "medium",
          },
          category: "campaigns",
          estimatedImpact: "20% higher engagement",
        }
      );
      break;

    case "insights":
      suggestions.push(
        {
          id: "5",
          type: "insight",
          title: "Revenue Trend Analysis",
          description:
            "Revenue increased 23% this month. LinkedIn campaigns are driving 60% of conversions.",
          confidence: 0.94,
          action: {
            label: "View Details",
            onClick: () => console.log("View revenue details"),
            priority: "low",
          },
          category: "insights",
          estimatedImpact: "Data-driven decisions",
        },
        {
          id: "6",
          type: "tip",
          title: "Conversion Optimization",
          description:
            "Leads from 'Tech' industry convert 3x better. Focus your efforts on this segment.",
          confidence: 0.81,
          action: {
            label: "Focus on Tech",
            onClick: () => console.log("Focus on tech leads"),
            priority: "medium",
          },
          category: "insights",
          estimatedImpact: "3x conversion rate",
        }
      );
      break;

    case "dashboard":
      suggestions.push({
        id: "7",
        type: "insight",
        title: "Daily Performance Summary",
        description:
          "Great day! 12 new leads, 3 meetings scheduled, and 2 deals closed. You're 15% ahead of daily target.",
        confidence: 0.89,
        action: {
          label: "View Details",
          onClick: () => console.log("View daily details"),
          priority: "low",
        },
        category: "general",
        estimatedImpact: "Stay on track",
      });
      break;
  }

  return suggestions;
};

export default function MarvinAssistant({
  context,
  data,
  className = "",
}: MarvinAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<MarvinSuggestion[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [hasRequestedSuggestions, setHasRequestedSuggestions] = useState(false);
  const toast = useToast();

  // Only load suggestions when user expands the assistant
  useEffect(() => {
    if (isExpanded && !hasRequestedSuggestions) {
      setIsThinking(true);
      setHasRequestedSuggestions(true);
      // Simulate AI thinking time
      setTimeout(() => {
        setSuggestions(getContextualSuggestions(context, data));
        setIsThinking(false);
      }, 1000);
    }
  }, [isExpanded, context, data, hasRequestedSuggestions]);

  const getIcon = (type: string) => {
    switch (type) {
      case "insight":
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      case "action":
        return <Target className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "tip":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bot className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSuggestionAction = (suggestion: MarvinSuggestion) => {
    if (suggestion.action) {
      suggestion.action.onClick();
      toast.success(
        "Action Executed",
        `Marvin executed: ${suggestion.action.label}`
      );
    }
  };

  const highPrioritySuggestions = suggestions.filter(
    (s) => s.action?.priority === "high"
  );
  const otherSuggestions = suggestions.filter(
    (s) => s.action?.priority !== "high"
  );

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200 shadow-lg ${className}`}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-blue-100/50 transition-colors rounded-t-2xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2 font-outfit">
                <span>Marvin AI Assistant</span>
                {isThinking && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                )}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-outfit">
                {isThinking
                  ? "Analyzing your data..."
                  : `${suggestions.length} intelligent suggestions`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {highPrioritySuggestions.length > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                {highPrioritySuggestions.length} urgent
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && !isThinking && (
        <div className="px-4 pb-4 space-y-3">
          {/* High Priority Suggestions */}
          {highPrioritySuggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span>Urgent Actions</span>
              </h4>
              <div className="space-y-2">
                {highPrioritySuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-white rounded-xl p-4 border border-red-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getIcon(suggestion.type)}
                          <h5 className="font-semibold text-gray-900">
                            {suggestion.title}
                          </h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                              suggestion.action?.priority || "low"
                            )}`}
                          >
                            {suggestion.action?.priority?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {suggestion.description}
                        </p>
                        {suggestion.estimatedImpact && (
                          <p className="text-xs text-blue-600 font-medium">
                            💡 {suggestion.estimatedImpact}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">
                            Confidence:{" "}
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                              style={{
                                width: `${suggestion.confidence * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {suggestion.action && (
                        <button
                          onClick={() => handleSuggestionAction(suggestion)}
                          className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          {suggestion.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Suggestions */}
          {otherSuggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <span>Smart Suggestions</span>
              </h4>
              <div className="space-y-2">
                {otherSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getIcon(suggestion.type)}
                          <h5 className="font-semibold text-gray-900">
                            {suggestion.title}
                          </h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                              suggestion.action?.priority || "low"
                            )}`}
                          >
                            {suggestion.action?.priority?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        {suggestion.estimatedImpact && (
                          <p className="text-xs text-blue-600 font-medium">
                            💡 {suggestion.estimatedImpact}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            Confidence:{" "}
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                              style={{
                                width: `${suggestion.confidence * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {suggestion.action && (
                        <button
                          onClick={() => handleSuggestionAction(suggestion)}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          {suggestion.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Suggestions State */}
          {suggestions.length === 0 && !isThinking && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">All Good!</h4>
              <p className="text-sm text-gray-600">
                No immediate actions needed. Marvin is monitoring your data and
                will alert you when opportunities arise.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
