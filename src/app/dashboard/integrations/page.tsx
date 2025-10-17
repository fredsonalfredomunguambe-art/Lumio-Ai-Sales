"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Target,
  BarChart3,
  Zap,
  Lightbulb,
  Instagram,
  Facebook,
  Search as SearchIcon,
  Mail,
  Video,
  Globe,
  MessageCircle,
  Smartphone,
} from "lucide-react";
import Image from "next/image";

export default function IntegrationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [
    { id: "all", name: "All Platforms", count: 0 },
    { id: "connected", name: "Connected", count: 0 },
    { id: "available", name: "Available", count: 0 },
    { id: "coming_soon", name: "Coming Soon", count: 0 },
  ];

  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      status: "available",
      color: "pink",
      description: "Connect Instagram to manage posts, stories, and insights",
      features: [
        "Post Scheduling",
        "Analytics",
        "Auto-Reply",
        "Hashtag Research",
      ],
      benefits: [
        "Increase brand visibility",
        "Engage with followers",
        "Track performance",
      ],
      setupSteps: [
        "Connect Instagram account",
        "Authorize permissions",
        "Configure settings",
      ],
    },
    {
      name: "WhatsApp Business",
      icon: MessageCircle,
      status: "available",
      color: "green",
      description:
        "Connect WhatsApp Business for customer engagement and automation",
      features: [
        "Chat Automation",
        "Broadcast Messages",
        "Analytics",
        "Quick Replies",
      ],
      benefits: [
        "Improve customer service",
        "Increase conversions",
        "Automate responses",
      ],
      setupSteps: [
        "Verify business phone",
        "Connect WhatsApp Business API",
        "Set up automation",
      ],
    },
    {
      name: "Google SEO",
      icon: SearchIcon,
      status: "available",
      color: "blue",
      description: "Connect Google for SEO optimization and search performance",
      features: [
        "Keyword Tracking",
        "Ranking Analysis",
        "Competitor Research",
        "Site Audit",
      ],
      benefits: [
        "Improve search rankings",
        "Increase organic traffic",
        "Monitor competitors",
      ],
      setupSteps: [
        "Connect Google Search Console",
        "Set up tracking",
        "Configure alerts",
      ],
    },
    {
      name: "TikTok",
      icon: Video,
      status: "coming_soon",
      color: "black",
      description: "TikTok integration for short-form video marketing",
      features: [
        "Video Analytics",
        "Trend Tracking",
        "Content Scheduling",
        "Audience Insights",
      ],
      benefits: [
        "Reach younger audiences",
        "Viral content potential",
        "Creative marketing",
      ],
      setupSteps: ["Coming soon", "Stay tuned for updates", "Join waitlist"],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "available":
        return "bg-blue-100 text-blue-800";
      case "coming_soon":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4" />;
      case "available":
        return <Plus className="w-4 h-4" />;
      case "coming_soon":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                Integrations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm">
                Connect your marketing platforms and tools
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-900 dark:text-gray-100 transition-colors duration-200 hover:bg-gray-50 transition-all duration-200 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="font-inter">View Analytics</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 font-outfit shadow-md text-sm">
                <Plus className="w-4 h-4" />
                <span>Add Integration</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters and Search */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-inter"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 font-outfit ${
                      activeFilter === filter.id
                        ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 transition-colors duration-200 hover:text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    }`}
                  >
                    {filter.name}
                    {filter.count > 0 && (
                      <span className="ml-1 text-xs bg-gray-200 text-gray-600 dark:text-gray-400 transition-colors duration-200 px-1.5 py-0.5 rounded-full">
                        {filter.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Integration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              name: "Total Platforms",
              value: platforms.length.toString(),
              icon: Globe,
              color: "blue",
            },
            {
              name: "Connected",
              value: platforms
                .filter((p) => p.status === "connected")
                .length.toString(),
              icon: CheckCircle,
              color: "green",
            },
            {
              name: "Available",
              value: platforms
                .filter((p) => p.status === "available")
                .length.toString(),
              icon: Plus,
              color: "purple",
            },
            {
              name: "Coming Soon",
              value: platforms
                .filter((p) => p.status === "coming_soon")
                .length.toString(),
              icon: Clock,
              color: "orange",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600`}
                >
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit mb-1">
                {stat.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm">
                {stat.name}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${platform.color}-100`}
                  >
                    <platform.icon
                      className={`w-6 h-6 text-${platform.color}-600`}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 font-outfit">
                      {platform.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        platform.status
                      )}`}
                    >
                      {getStatusIcon(platform.status)}
                      <span className="ml-1">
                        {platform.status === "connected"
                          ? "Connected"
                          : platform.status === "available"
                          ? "Available"
                          : "Coming Soon"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter text-sm mb-3">
                {platform.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-2 font-outfit">
                    Key Features:
                  </h4>
                  <ul className="space-y-1">
                    {platform.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="font-inter">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-2 font-outfit">
                    Benefits:
                  </h4>
                  <ul className="space-y-1">
                    {platform.benefits.slice(0, 2).map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200"
                      >
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-inter">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {platform.status === "available" && (
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 text-sm">
                  Connect {platform.name}
                </button>
              )}

              {platform.status === "coming_soon" && (
                <button className="w-full bg-gray-100 text-gray-600 dark:text-gray-400 transition-colors duration-200 py-2 rounded-lg font-medium text-sm cursor-not-allowed">
                  Coming Soon
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Marvin AI Tips */}
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
                Marvin AI Integration Tips
              </h4>
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-medium font-outfit text-sm mb-1">
                    Optimize Your Marketing Stack
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 font-inter mb-2">
                    Start with the platforms your audience uses most. I&apos;ll
                    help you set up integrations and optimize workflows for
                    maximum efficiency.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-medium font-outfit">
                    Learn more about platform optimization →
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
