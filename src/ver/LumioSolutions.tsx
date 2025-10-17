"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  ArrowRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

/**
 * Premium Solutions Section for Lumio - Innovative Layout Design
 * Featuring unique visual elements and premium user experience
 */
const LumioSolutions: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSolution, setActiveSolution] = useState(0);

  // Auto-play video when in view
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay restrictions gracefully
      });
    }
  }, []);

  // Auto-rotate solutions
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSolution((prev) => (prev + 1) % 4);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const solutions = [
    {
      title: "Analytics Dashboard",
      description:
        "Comprehensive insights into your marketing performance with real-time data visualization and customizable reports.",
      icon: ChartBarIcon,
      color: "from-blue-500 to-cyan-500",
      image: "/fotos/potato.png",
      stats: ["98.7%", "Accuracy Rate"],
      features: [
        "Real-time metrics",
        "Custom dashboards",
        "Export capabilities",
      ],
    },
    {
      title: "Customer Segmentation",
      description:
        "Advanced audience targeting with AI-powered segmentation for personalized marketing campaigns.",
      icon: UserGroupIcon,
      color: "from-indigo-500 to-purple-500",
      image: "/fotos/cliente.png",
      stats: ["3.2x", "Lead Generation"],
      features: ["AI segmentation", "Behavioral analysis", "Dynamic lists"],
    },
    {
      title: "Automation Workflows",
      description:
        "Streamline your marketing operations with intelligent automation that adapts to customer behavior.",
      icon: CogIcon,
      color: "from-purple-500 to-pink-500",
      image: "/fotos/work.png",
      stats: ["95%", "Automation Rate"],
      features: ["Smart triggers", "Multi-channel flows", "A/B testing"],
    },
    {
      title: "Compliance & Security",
      description:
        "Enterprise-grade security with built-in compliance for GDPR, CCPA, and other regulations.",
      icon: ShieldCheckIcon,
      color: "from-emerald-500 to-emerald-600",
      image: "/fotos/team.png",
      stats: ["99.9%", "Uptime"],
      features: ["GDPR compliance", "Data encryption", "Audit trails"],
    },
  ];

  return (
    <section
      id="solutions"
      ref={containerRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Premium Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/20"></div>

        {/* Geometric Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border border-blue-300 rounded-full"></div>
          <div className="absolute top-40 right-32 w-48 h-48 border border-indigo-300 rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-56 h-56 border border-purple-300 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 border border-blue-300 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Premium Header Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-medium border border-blue-200 shadow-sm mb-6">
            <SparklesIcon className="w-4 h-4 text-blue-600" />
            <span className="font-outfit font-semibold tracking-wide">
              Revolutionary Solutions
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-outfit tracking-tight">
            <span className="block">Solutions That</span>
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Transform
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-outfit">
            Experience the future of marketing with our cutting-edge solutions.
            Every feature is designed to revolutionize how you connect with your
            audience.
          </p>
        </div>

        {/* Innovative Layout: Video + Images Grid */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Left: Small Video Section */}
            <div className="lg:col-span-1">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-outfit">
                    See It In Action
                  </h3>
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    <video
                      ref={videoRef}
                      className="w-full h-48 object-cover"
                      muted
                      loop
                      playsInline
                    >
                      <source src="/video/pagina2.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 font-outfit text-center">
                    Watch our platform transform your marketing
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Premium Images Grid */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-6">
                {/* Vida Image */}
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src="/fotos/vida.png"
                      alt="Life & Growth"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <h4 className="text-lg font-bold text-gray-900 font-outfit mb-1">
                          Life & Growth
                        </h4>
                        <p className="text-sm text-gray-600 font-outfit">
                          Transform your business potential
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Online Image */}
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src="/fotos/online.png"
                      alt="Digital Presence"
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4">
                        <h4 className="text-lg font-bold font-outfit mb-1">
                          Digital Presence
                        </h4>
                        <p className="text-sm opacity-90 font-outfit">
                          Dominate the digital landscape
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Solutions Showcase */}
        <div className="mb-20">
          <div className="relative">
            {solutions.map((solution, index) => (
              <div key={index}>
                {activeSolution === index && (
                  <div className="relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                      {/* Left: Content with Premium Styling */}
                      <div className="space-y-8">
                        {/* Premium Icon Badge */}
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-20 h-20 flex items-center justify-center rounded-2xl bg-gradient-to-br ${solution.color} shadow-xl`}
                          >
                            <solution.icon className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                              <StarIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-blue-700 font-outfit">
                                Premium Feature
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-4xl font-bold text-gray-900 mb-6 font-outfit tracking-tight">
                            {solution.title}
                          </h3>
                          <p className="text-lg text-gray-600 leading-relaxed font-outfit mb-8">
                            {solution.description}
                          </p>

                          {/* Premium Stats Display */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 font-outfit mb-1">
                                  {solution.stats[0]}
                                </div>
                                <div className="text-sm text-gray-600 font-medium font-outfit">
                                  {solution.stats[1]}
                                </div>
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
                              <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600 font-outfit mb-1">
                                  {solution.features[0].split(" ")[0]}
                                </div>
                                <div className="text-sm text-gray-600 font-medium font-outfit">
                                  {solution.features[0]
                                    .split(" ")
                                    .slice(1)
                                    .join(" ")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Premium Image Layout */}
                      <div className="relative">
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                          <img
                            src={solution.image}
                            alt={solution.title}
                            className="w-full h-96 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                        </div>

                        {/* Floating Feature Cards */}
                        <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 font-outfit mb-1">
                              {solution.features[1].split(" ")[0]}
                            </div>
                            <div className="text-xs text-gray-600 font-medium font-outfit">
                              {solution.features[1]
                                .split(" ")
                                .slice(1)
                                .join(" ")}
                            </div>
                          </div>
                        </div>

                        <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 shadow-xl">
                          <div className="text-center">
                            <div className="text-2xl font-bold font-outfit mb-1">
                              {solution.features[2].split(" ")[0]}
                            </div>
                            <div className="text-xs opacity-90 font-medium font-outfit">
                              {solution.features[2]
                                .split(" ")
                                .slice(1)
                                .join(" ")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Premium Navigation Dots */}
            <div className="flex justify-center mt-16 space-x-4">
              {solutions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSolution(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    activeSolution === index
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 scale-125 shadow-lg"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Premium CTA Section */}
        <div className="relative text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-16 border border-blue-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border border-blue-300 rounded-full"></div>
              <div className="absolute top-20 right-20 w-24 h-24 border border-indigo-300 rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-40 h-40 border border-purple-300 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-28 h-28 border border-blue-300 rounded-full"></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-gray-900 mb-6 font-outfit tracking-tight">
                Ready to Revolutionize Your Marketing?
              </h3>
              <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto font-outfit">
                Join the elite companies using Lumio to drive unprecedented
                growth and create marketing campaigns that truly resonate with
                their audience.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-outfit text-lg group"
                >
                  <RocketLaunchIcon className="w-6 h-6 mr-3" />
                  Start Free Trial
                  <ArrowRightIcon className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </a>

                <a
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-10 py-5 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-200 hover:text-blue-600 transition-all duration-300 font-outfit text-lg shadow-lg hover:shadow-xl"
                >
                  Schedule Demo
                  <ArrowUpIcon className="w-6 h-6 ml-3 group-hover:-translate-y-1 transition-transform duration-300" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LumioSolutions;
