"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  TrendingUp,
  Target,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Brain,
  Zap,
  Award,
  Activity,
  RefreshCw,
  Download,
} from "lucide-react";
import { useTraining } from "@/hooks/useTraining";

interface ConversationMetrics {
  totalConversations: number;
  averageResponseTime: number;
  successRate: number;
  engagementScore: number;
  conversionRate: number;
  objectionHandlingScore: number;
  personalizationScore: number;
  followUpEffectiveness: number;
}

interface ConversationAnalysis {
  id: string;
  timestamp: string;
  duration: number;
  outcome: "success" | "no_response" | "objection" | "not_interested";
  metrics: {
    responseTime: number;
    engagement: number;
    personalization: number;
    objectionHandling: number;
  };
  insights: string[];
  improvements: string[];
}

interface ConversationAnalyzerProps {
  onInsightClick: (insight: string) => void;
}

export default function ConversationAnalyzer({
  onInsightClick,
}: ConversationAnalyzerProps) {
  const { trainingData, retrainModel, loading } = useTraining();
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    totalConversations: 0,
    averageResponseTime: 0,
    successRate: 0,
    engagementScore: 0,
    conversionRate: 0,
    objectionHandlingScore: 0,
    personalizationScore: 0,
    followUpEffectiveness: 0,
  });

  useEffect(() => {
    calculateMetrics();
  }, [trainingData, selectedTimeframe]);

  const calculateMetrics = () => {
    if (!trainingData) return;

    const interactions = trainingData.interactions || [];
    const filteredInteractions = filterInteractionsByTimeframe(
      interactions,
      selectedTimeframe
    );

    const totalConversations = filteredInteractions.length;
    const successfulInteractions = filteredInteractions.filter(
      (i) => i.outcome === "success"
    ).length;

    const avgSatisfaction =
      filteredInteractions
        .filter((i) => i.customerSatisfaction)
        .reduce((sum, i) => sum + (i.customerSatisfaction || 0), 0) /
        filteredInteractions.filter((i) => i.customerSatisfaction).length || 0;

    const successRate =
      totalConversations > 0
        ? Math.round((successfulInteractions / totalConversations) * 100)
        : 0;

    const engagementScore = Math.round(avgSatisfaction * 20); // Convert 1-5 to 0-100
    const personalizationScore =
      trainingData.progress?.performanceMetrics.contextUnderstanding || 0;
    const objectionHandlingScore =
      trainingData.progress?.performanceMetrics.responseAccuracy || 0;

    setMetrics({
      totalConversations,
      averageResponseTime: 2.5, // Simulated for now
      successRate,
      engagementScore,
      conversionRate: Math.round(engagementScore * 0.8),
      objectionHandlingScore,
      personalizationScore,
      followUpEffectiveness: Math.round(engagementScore * 0.9),
    });
  };

  const filterInteractionsByTimeframe = (
    interactions: any[],
    timeframe: string
  ) => {
    const now = new Date();
    const days =
      timeframe === "24h"
        ? 1
        : timeframe === "7d"
        ? 7
        : timeframe === "30d"
        ? 30
        : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return interactions.filter((i) => new Date(i.timestamp) >= cutoffDate);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const topInsights = trainingData?.progress?.improvements?.slice(0, 5) || [];
  const topImprovements =
    trainingData?.progress?.improvements?.slice(0, 5) || [];

  const handleRetrain = async () => {
    try {
      await retrainModel();
    } catch (error) {
      console.error("Error retraining model:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 font-outfit">
            Conversation Analysis
          </h3>
          <div className="flex space-x-2">
            {["24h", "7d", "30d", "90d"].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors font-outfit ${
                  selectedTimeframe === timeframe
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleRetrain}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-outfit"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Retrain Model</span>
          </button>

          <button
            onClick={() => {
              const data = {
                metrics,
                insights: topInsights,
                improvements: topImprovements,
                timestamp: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `conversation-analysis-${
                new Date().toISOString().split("T")[0]
              }.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-outfit"
          >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-outfit">
                Total Conversations
              </p>
              <p className="text-xl font-bold text-gray-900 font-outfit">
                {metrics.totalConversations}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-outfit">Success Rate</p>
              <p className="text-xl font-bold text-gray-900 font-outfit">
                {metrics.successRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-outfit">
                Avg Response Time
              </p>
              <p className="text-xl font-bold text-gray-900 font-outfit">
                {metrics.averageResponseTime}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-outfit">
                Conversion Rate
              </p>
              <p className="text-xl font-bold text-gray-900 font-outfit">
                {metrics.conversionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Performance Scores</span>
          </h4>
          <div className="space-y-4">
            {[
              {
                label: "Engagement Score",
                value: metrics.engagementScore,
                icon: <Activity className="w-4 h-4" />,
              },
              {
                label: "Personalization",
                value: metrics.personalizationScore,
                icon: <Users className="w-4 h-4" />,
              },
              {
                label: "Objection Handling",
                value: metrics.objectionHandlingScore,
                icon: <Brain className="w-4 h-4" />,
              },
              {
                label: "Follow-up Effectiveness",
                value: metrics.followUpEffectiveness,
                icon: <Zap className="w-4 h-4" />,
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${getPerformanceColor(
                      item.value
                    )}`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 font-outfit">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.value >= 80
                          ? "bg-green-500"
                          : item.value >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 font-outfit w-8">
                    {item.value}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span>Key Insights</span>
          </h4>
          <div className="space-y-3">
            {topInsights.map((insight, index) => (
              <div
                key={index}
                onClick={() => onInsightClick(insight)}
                className="p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              >
                <p className="text-sm text-blue-800 font-outfit">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 font-outfit flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI-Powered Improvement Suggestions</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topImprovements.map((improvement, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
            >
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                <p className="text-sm text-purple-800 font-outfit">
                  {improvement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
