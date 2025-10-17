"use client";

import React, { useRef, useEffect } from "react";
import { ArrowRightIcon, StarIcon } from "@heroicons/react/24/outline";

/**
 * Marvin AI Marketing Partner Section
 * Clean, premium design with Awwwards-worthy aesthetics
 */
const MarvinAI: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay restrictions gracefully
      });
    }
  }, []);

  return (
    <section className="py-12 bg-white relative overflow-hidden">
      {/* Simple Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-blue-50/20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Thin Card Overlay for entire section */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg">
          <div className="relative z-10 p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Simple Badge */}
              <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="font-outfit font-bold tracking-wider uppercase">
                  AI Marketing Intelligence
                </span>
              </div>

              {/* Title - Same size as other sections */}
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-outfit tracking-tight leading-tight">
                Meet <span className="text-blue-600">Marvin</span>
              </h2>

              {/* Subtitle - Same size as other sections */}
              <p className="text-base text-gray-600 font-outfit font-medium max-w-xl mx-auto leading-relaxed">
                Your AI marketing partner that works 24/7 to optimize campaigns
                and drive unprecedented growth
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Premium Copywriting */}
              <div className="space-y-6">
                {/* Premium Copywriting Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 font-outfit leading-tight">
                    Transform Your Marketing with{" "}
                    <span className="text-blue-600">AI Precision</span>
                  </h3>
                  <p className="text-base text-gray-600 font-outfit leading-relaxed">
                    While you focus on growing your business, Marvin works
                    tirelessly behind the scenes to revolutionize your marketing
                    approach.
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600 font-outfit">
                      <span className="font-semibold text-gray-800">
                        Intelligent Automation
                      </span>{" "}
                      - Learns and adapts in real-time
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600 font-outfit">
                      <span className="font-semibold text-gray-800">
                        Predictive Insights
                      </span>{" "}
                      - Stay ahead of competition
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600 font-outfit">
                      <span className="font-semibold text-gray-800">
                        24/7 Optimization
                      </span>{" "}
                      - Maximum ROI at all times
                    </span>
                  </div>
                </div>

                {/* Premium CTA with Animations */}
                <div className="pt-2">
                  <a href="/sign-up" className="group relative w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 font-outfit text-base overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center">
                      <StarIcon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      Experience Marvin AI
                      <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Right: Simple Circular Video */}
              <div className="flex justify-center">
                <div className="relative">
                  {/* Simple Circular Video Container */}
                  <div className="w-64 h-64 rounded-full overflow-hidden shadow-lg border-4 border-gray-200">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      style={{ objectPosition: "center center" }}
                    >
                      <source src="/video/marvinvideo.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  {/* Simple AI Badge */}
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full px-2 py-1 text-xs font-bold font-outfit">
                    AI
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

export default MarvinAI;
