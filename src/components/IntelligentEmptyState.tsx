"use client";

import React, { useState } from "react";
import {
  Plus,
  Upload,
  Target,
  Users,
  Mail,
  BarChart3,
  Settings,
  Lightbulb,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface EmptyStateAction {
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  primary?: boolean;
  secondary?: boolean;
  estimatedTime?: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface MarvinSuggestion {
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: string;
}

interface IntelligentEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  context: "leads" | "campaigns" | "insights" | "settings" | "general";
  actions: EmptyStateAction[];
  marvinSuggestions?: MarvinSuggestion[];
  progress?: {
    current: number;
    total: number;
    steps: string[];
  };
  className?: string;
}

export default function IntelligentEmptyState({
  icon: Icon,
  title,
  description,
  context,
  actions,
  marvinSuggestions = [],
  progress,
  className = "",
}: IntelligentEmptyStateProps) {
  const [showMarvinSuggestions, setShowMarvinSuggestions] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const toast = useToast();

  const getContextualIcon = () => {
    switch (context) {
      case "leads":
        return <Users className="w-16 h-16 text-blue-500" />;
      case "campaigns":
        return <Mail className="w-16 h-16 text-green-500" />;
      case "insights":
        return <BarChart3 className="w-16 h-16 text-purple-500" />;
      case "settings":
        return <Settings className="w-16 h-16 text-gray-500" />;
      default:
        return <Icon className="w-16 h-16 text-blue-500" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const handleAction = (action: EmptyStateAction) => {
    action.onClick();
    setCompletedActions((prev) => [...prev, action.label]);
    toast.success("Action Started", `Starting: ${action.label}`);
  };

  const getContextualSuggestions = () => {
    const suggestions: MarvinSuggestion[] = [];

    switch (context) {
      case "leads":
        suggestions.push(
          {
            title: "Import from LinkedIn",
            description:
              "Connect your LinkedIn to automatically import contacts and their company information",
            confidence: 0.92,
            impact: "high",
            category: "Data Import",
          },
          {
            title: "Create Lead Scoring Rules",
            description:
              "Set up automatic scoring based on job title, company size, and engagement",
            confidence: 0.85,
            impact: "medium",
            category: "Automation",
          }
        );
        break;
      case "campaigns":
        suggestions.push(
          {
            title: "Start with Welcome Series",
            description:
              "Create a 3-email sequence for new leads to introduce your company",
            confidence: 0.88,
            impact: "high",
            category: "Campaign Setup",
          },
          {
            title: "Use AI-Generated Content",
            description:
              "Let Marvin create personalized email content based on your brand voice",
            confidence: 0.79,
            impact: "medium",
            category: "Content Creation",
          }
        );
        break;
      case "insights":
        suggestions.push(
          {
            title: "Enable Advanced Analytics",
            description:
              "Connect Google Analytics to get deeper insights into your marketing performance",
            confidence: 0.91,
            impact: "high",
            category: "Integration",
          },
          {
            title: "Set Up Custom Dashboards",
            description:
              "Create personalized views of your most important metrics",
            confidence: 0.76,
            impact: "medium",
            category: "Customization",
          }
        );
        break;
    }

    return [...suggestions, ...marvinSuggestions];
  };

  const contextualSuggestions = getContextualSuggestions();

  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {/* Main Icon */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        {getContextualIcon()}
      </div>

      {/* Title and Description */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>

      {/* Progress Indicator */}
      {progress && (
        <div className="mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Setup Progress
            </span>
            <span className="text-sm text-gray-500">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="text-left">
            {progress.steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {index < progress.current ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : index === progress.current ? (
                  <Clock className="w-4 h-4 text-blue-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                )}
                <span
                  className={
                    index < progress.current
                      ? "text-green-700"
                      : index === progress.current
                      ? "text-blue-700 font-medium"
                      : "text-gray-500"
                  }
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleAction(action)}
            disabled={completedActions.includes(action.label)}
            className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              action.primary
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                : action.secondary
                ? "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } ${
              completedActions.includes(action.label)
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105"
            }`}
          >
            <div className="flex items-center space-x-2">
              <action.icon className="w-5 h-5" />
              <span>{action.label}</span>
              {action.estimatedTime && (
                <span className="text-xs opacity-75">
                  ({action.estimatedTime})
                </span>
              )}
            </div>
            {action.description && (
              <p className="text-xs mt-1 opacity-75">{action.description}</p>
            )}
            {action.difficulty && (
              <span
                className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                  action.difficulty
                )}`}
              >
                {action.difficulty}
              </span>
            )}
            {completedActions.includes(action.label) && (
              <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Marvin Suggestions */}
      {contextualSuggestions.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowMarvinSuggestions(!showMarvinSuggestions)}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 mb-4"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="font-medium">Marvin's Smart Suggestions</span>
            <ArrowRight
              className={`w-4 h-4 transition-transform ${
                showMarvinSuggestions ? "rotate-90" : ""
              }`}
            />
          </button>

          {showMarvinSuggestions && (
            <div className="space-y-3 animate-fade-in">
              {contextualSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {suggestion.title}
                        </h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImpactColor(
                            suggestion.impact
                          )}`}
                        >
                          {suggestion.impact.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {suggestion.description}
                      </p>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {suggestion.category}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">5min</div>
          <div className="text-sm text-gray-600">Average setup time</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">95%</div>
          <div className="text-sm text-gray-600">Success rate</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">24/7</div>
          <div className="text-sm text-gray-600">Marvin support</div>
        </div>
      </div>
    </div>
  );
}
