"use client";

import React from "react";
import {
  ArrowRightIcon,
  PlayIcon,
  ArrowTrendingUpIcon,
  CursorArrowRaysIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

/**
 * Premium Hero Section for Lumio - Clean and Elegant Design
 */
const LumioHero: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative bg-white dark:bg-gray-900 overflow-hidden pt-24 pb-16 transition-colors duration-300"
    >
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-blue-50/10 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/5"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Premium Header Section */}
          <div className="space-y-4 mb-12">
            {/* Premium Main Headline with Animations */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight font-outfit tracking-tight">
                <div className="opacity-0 transform translate-y-8 animate-[slideUp_1s_ease-out_0.2s_forwards] text-center">
                  <div className="mb-3">
                    <span className="text-black dark:text-white">
                      Engage Every Lead Like
                    </span>
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">
                    It&apos;s Your Only One
                  </div>
                </div>
              </h1>

              {/* Premium decorative line with animation */}
              <div className="flex items-center justify-center space-x-4 opacity-0 transform translate-y-4 animate-[slideUp_1s_ease-out_1s_forwards]">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-blue-300 transform scale-x-0 animate-[scaleX_0.8s_ease-out_1.2s_forwards]"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transform scale-0 animate-[scale_0.5s_ease-out_1.4s_forwards]"></div>
                <div className="w-12 h-px bg-gradient-to-r from-blue-300 to-transparent transform scale-x-0 animate-[scaleX_0.8s_ease-out_1.2s_forwards]"></div>
              </div>
            </div>

            {/* Enhanced Subtitle with creative design */}
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="opacity-0 transform translate-y-4 animate-[slideUp_1s_ease-out_1.6s_forwards]">
                {/* Creative subtitle container */}
                <div className="relative">
                  {/* Background accent */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl blur-xl"></div>

                  {/* Main subtitle content with premium animations */}
                  <div className="relative marvin-card-animated bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100/50 dark:border-blue-900/30 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                    <div className="flex items-start space-x-3">
                      {/* AI Badge with enhanced animation */}
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {/* Animated background shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse"></div>
                        <span className="text-white font-bold text-xs relative z-10">
                          AI
                        </span>
                      </div>

                      {/* Text content */}
                      <div className="flex-1">
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-inter">
                          <span className="font-semibold text-blue-600 dark:text-blue-400 relative">
                            Marvin
                            {/* Subtle text glow effect */}
                            <span className="absolute inset-0 text-blue-600 dark:text-blue-400 blur-sm opacity-30 animate-pulse">
                              Marvin
                            </span>
                          </span>
                          , your AI SDR agent, delivers personalized touch —
                          blending automation, intelligence, and your
                          brand&apos;s unique voice.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Buttons with animations */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 opacity-0 transform translate-y-6 animate-[slideUp_1s_ease-out_2.6s_forwards]">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 font-outfit flex items-center justify-center space-x-2 group hover:scale-105">
              <span>Start Free Trial</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-3.5 rounded-xl font-semibold text-base border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 font-outfit flex items-center justify-center space-x-2 group hover:scale-105">
              <PlayIcon className="w-5 h-5" />
              <span>See How It Works</span>
            </button>
          </div>

          {/* Compact Marketing Dashboard Mockup with animation */}
          <div className="relative max-w-2xl mx-auto opacity-0 transform translate-y-8 animate-[slideUp_1s_ease-out_3s_forwards]">
            {/* Main dashboard container */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
                {/* Dashboard Header with Lumio Logo */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {/* Lumio Logo instead of blue icon */}
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
                      <span className="text-white font-bold text-xs font-outfit">
                        L
                      </span>
                    </div>
                    <span className="font-outfit font-semibold text-gray-900 dark:text-white text-sm">
                      Sales Dashboard
                    </span>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Marketing Analytics Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Campaign Performance Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                        Active Leads
                      </span>
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
                        <ArrowTrendingUpIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                      1,234
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-inter">
                      Qualified
                    </div>
                  </div>

                  {/* Conversions Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                        Conversions
                      </span>
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center justify-center">
                        <CursorArrowRaysIcon className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                      89
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-inter">
                      +8%
                    </div>
                  </div>

                  {/* ROI Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-inter">
                        Revenue
                      </span>
                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 rounded-md flex items-center justify-center">
                        <ChartBarIcon className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white font-outfit">
                      $12.4K
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-inter">
                      +15%
                    </div>
                  </div>
                </div>

                {/* Marketing Analytics Chart Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2 font-outfit">
                      Lead Score
                    </h3>
                    <div className="flex items-end space-x-1 h-12">
                      <div className="bg-blue-500 w-2 h-4 rounded-sm"></div>
                      <div className="bg-blue-400 w-2 h-6 rounded-sm"></div>
                      <div className="bg-blue-500 w-2 h-8 rounded-sm"></div>
                      <div className="bg-blue-600 w-2 h-10 rounded-sm"></div>
                      <div className="bg-blue-400 w-2 h-5 rounded-sm"></div>
                      <div className="bg-blue-500 w-2 h-7 rounded-sm"></div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <UsersIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white font-outfit">
                        Pipeline
                      </h3>
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white font-outfit">
                      2.4K
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-inter">
                      +12.5%
                    </div>
                    <div className="mt-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LumioHero;
