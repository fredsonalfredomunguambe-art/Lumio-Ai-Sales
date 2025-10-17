"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Heart,
  Share2,
  Download,
  Filter,
  Lightbulb,
} from "lucide-react";
import Image from "next/image";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [platform, setPlatform] = useState("all");

  const timeRanges = [
    { id: "7d", name: "7 Days" },
    { id: "30d", name: "30 Days" },
    { id: "90d", name: "90 Days" },
    { id: "1y", name: "1 Year" },
  ];

  const platforms = [
    { id: "all", name: "All Platforms" },
    { id: "instagram", name: "Instagram" },
    { id: "facebook", name: "Facebook" },
    { id: "google", name: "Google" },
    { id: "email", name: "Email" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <motion.div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit mb-1">
                Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm">
                Track your marketing performance and insights
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-gray-50 dark:bg-gray-900 transition-all duration-200 text-sm">
                <Download className="w-4 h-4" />
                <span className="font-inter">Export Report</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 font-outfit">
                  Time Range:
                </span>
              </div>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {timeRanges.map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 font-outfit ${
                      timeRange === range.id
                        ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    }`}
                  >
                    {range.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200 font-outfit">
                  Platform:
                </span>
              </div>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-inter"
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              name: "Total Reach",
              value: "0",
              change: "+0%",
              changeType: "positive",
              icon: Eye,
              color: "blue",
            },
            {
              name: "Engagement Rate",
              value: "0%",
              change: "+0%",
              changeType: "positive",
              icon: Heart,
              color: "green",
            },
            {
              name: "Total Clicks",
              value: "0",
              change: "+0%",
              changeType: "positive",
              icon: TrendingUp,
              color: "purple",
            },
            {
              name: "Conversion Rate",
              value: "0%",
              change: "+0%",
              changeType: "positive",
              icon: Users,
              color: "orange",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.name}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-${metric.color}-500 to-${metric.color}-600`}
                >
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    metric.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit mb-1">
                {metric.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm">
                {metric.name}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance Chart */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit">
                Performance Over Time
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium font-outfit">
                View Details →
              </button>
            </div>
            <div className="h-64 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm">
                  Chart will be displayed here
                </p>
              </div>
            </div>
          </motion.div>

          {/* Platform Breakdown */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit">
                Platform Breakdown
              </h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium font-outfit">
                View Details →
              </button>
            </div>
            <div className="space-y-3">
              {[
                { platform: "Instagram", percentage: 0, color: "bg-pink-500" },
                { platform: "Facebook", percentage: 0, color: "bg-blue-500" },
                { platform: "Google", percentage: 0, color: "bg-green-500" },
                { platform: "Email", percentage: 0, color: "bg-purple-500" },
              ].map((item, index) => (
                <div
                  key={item.platform}
                  className="flex items-center space-x-3"
                >
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit flex-1">
                    {item.platform}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Marvin AI Insights */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200">
              <Image
                src="/fotos/marvin.png"
                alt="Marvin AI"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-2 font-outfit">
                Marvin AI Analytics Insights
              </h4>
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 dark:text-gray-300 transition-colors duration-200 font-medium font-outfit text-sm mb-1">
                    Getting Started with Analytics
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter mb-2">
                    Connect your marketing platforms to start tracking
                    performance. I&apos;ll help you analyze trends and optimize
                    your campaigns for better results.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium font-outfit">
                    Learn more about analytics optimization →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
