"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import {
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  CogIcon,
  ChartBarIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BoltIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/**
 * Premium Features Section with Clean GSAP Text Animations
 */
const LumioFeatures: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);

  // GSAP Refs - only for text animations
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Auto-play video when component mounts
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  // GSAP Text Animations Setup - only for text elements
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Title Animation - Split text reveal
      const headerText = titleRef.current;
      if (headerText) {
        const chars = headerText.textContent?.split("") || [];
        headerText.innerHTML = chars
          .map((char) =>
            char === " " ? " " : `<span class="char">${char}</span>`
          )
          .join("");

        gsap.fromTo(
          ".char",
          { y: 50, opacity: 0, rotationX: -45 },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.02,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Subtitle fade in animation
      if (subtitleRef.current) {
        gsap.fromTo(
          subtitleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 75%",
              end: "bottom 25%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Page transition effect - smooth reveal for the entire section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const features = [
    {
      icon: SparklesIcon,
      title: "Marvin AI Intelligence",
      description:
        "Advanced AI assistant that provides strategic business insights, automates complex workflows, and optimizes operations across your entire organization.",
      color: "blue",
    },
    {
      icon: CogIcon,
      title: "Enterprise Automation",
      description:
        "Sophisticated automation engine that handles multi-channel operations, intelligent routing, and adaptive workflows that scale with your business.",
      color: "indigo",
    },
    {
      icon: ChartBarIcon,
      title: "Predictive Analytics",
      description:
        "Deep business intelligence with predictive modeling, real-time performance metrics, and actionable insights that drive strategic decisions.",
      color: "purple",
    },
    {
      icon: UserGroupIcon,
      title: "Intelligent Operations",
      description:
        "Smart business process management with AI-powered optimization, automated decision-making, and seamless integration across all systems.",
      color: "green",
    },
  ];

  const benefits = [
    "AI-powered business intelligence and optimization",
    "Enterprise-grade automation and workflow management",
    "Predictive analytics and strategic insights",
    "Real-time performance monitoring and optimization",
    "Seamless integration with existing business systems",
  ];

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Premium background elements - clean and minimal */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 via-white to-blue-50/20"></div>
        <div className="absolute top-32 right-32 w-80 h-80 bg-gradient-to-br from-blue-100/15 to-indigo-100/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-32 w-72 h-72 bg-gradient-to-br from-indigo-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Subtle geometric accent */}
      <div className="absolute top-0 right-0 w-48 h-48">
        <div className="w-full h-full bg-gradient-to-br from-blue-600/3 to-indigo-600/3 transform rotate-12"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-3 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-medium border border-blue-200 shadow-sm mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="font-outfit font-semibold tracking-wide">
              Powerful Features
            </span>
          </motion.div>

          <motion.h2
            ref={titleRef}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-outfit tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Enterprise-Grade{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Business Platform
            </span>
          </motion.h2>

          <motion.p
            ref={subtitleRef}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-outfit"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Advanced AI platform that revolutionizes business operations with
            intelligent automation, predictive analytics, and enterprise-grade
            security.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24">
          {/* Left Column - Features */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 ${
                      feature.color === "blue"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : feature.color === "indigo"
                        ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                        : feature.color === "purple"
                        ? "bg-gradient-to-br from-purple-500 to-purple-600"
                        : "bg-gradient-to-br from-green-500 to-green-600"
                    }`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 font-outfit group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-inter text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Video */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-white rounded-2xl p-2 shadow-xl border border-gray-200">
              <div className="relative overflow-hidden rounded-xl">
                <video
                  ref={videoRef}
                  className="w-full h-auto rounded-xl"
                  poster="/fotos/trabalho.png"
                  muted={isMuted}
                  loop
                  autoPlay
                  playsInline
                >
                  <source src="/video/social.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={handlePlayPause}
                      className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-7 h-7 text-gray-800" />
                      ) : (
                        <PlayIcon className="w-7 h-7 text-gray-800 ml-0.5" />
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleMuteToggle}
                      className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isMuted ? (
                        <SpeakerXMarkIcon className="w-5 h-5 text-gray-800" />
                      ) : (
                        <SpeakerWaveIcon className="w-5 h-5 text-gray-800" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Compact Stats Card */}
              <motion.div
                className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-xl rounded-xl p-4 shadow-xl border border-gray-200"
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600 font-outfit mb-1">
                    48h
                  </div>
                  <div className="text-xs text-gray-600 font-medium font-outfit">
                    Time to Active
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Benefits Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.h3
            className="text-2xl font-bold text-gray-900 mb-10 font-outfit"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Why Choose Lumio?
          </motion.h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
              >
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700 font-medium font-inter text-left text-sm">
                  {benefit}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section - Reduced size */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { number: "48h", label: "Time to Active", icon: BoltIcon },
            { number: "95%", label: "Automation Rate", icon: CpuChipIcon },
            {
              number: "3.2x",
              label: "Lead Generation",
              icon: ArrowTrendingUpIcon,
            },
            { number: "1", label: "All-in-One Platform", icon: StarIcon },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 group"
              whileHover={{
                scale: 1.02,
                y: -4,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 font-outfit">
                {stat.number}
              </div>
              <div className="text-xs text-gray-600 font-medium font-inter">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Analytics Section - Full Width Design */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="w-full h-80 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat",
                }}
              ></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex items-center">
              <div className="w-full px-12 py-8">
                <div className="grid grid-cols-12 gap-8 h-full items-center">
                  {/* Left Content - 7 columns */}
                  <div className="col-span-7 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-4xl font-bold text-white font-outfit tracking-tight leading-tight">
                        Turn Data Into{" "}
                        <span className="text-blue-100 font-outline">
                          Revenue Growth
                        </span>
                      </h3>

                      <p className="text-lg text-blue-100 leading-relaxed font-outfit max-w-2xl">
                        Advanced analytics and intelligent insights that
                        transform raw data into actionable strategies. Track
                        performance, predict trends, and optimize every aspect
                        of your sales funnel with precision.
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                      {[
                        {
                          text: "Real-time performance dashboards",
                          icon: BoltIcon,
                        },
                        {
                          text: "Predictive revenue forecasting",
                          icon: ArrowTrendingUpIcon,
                        },
                        { text: "Behavioral pattern analysis", icon: CogIcon },
                        {
                          text: "Conversion optimization insights",
                          icon: StarIcon,
                        },
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-3 group"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.7 + index * 0.1,
                          }}
                          viewport={{ once: true }}
                        >
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all duration-300">
                            <benefit.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white font-medium font-outfit text-sm group-hover:text-blue-100 transition-colors duration-300">
                            {benefit.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Right Visual - 5 columns */}
                  <div className="col-span-5 relative">
                    <div className="relative h-64 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                      {/* 3D Dashboard Mockup */}
                      <div className="absolute inset-4 bg-white/95 rounded-xl shadow-2xl">
                        <div className="h-full p-4">
                          {/* Header with Analytics Icon */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                                <ChartBarIcon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-bold text-gray-800 font-outfit">
                                Analytics Hub
                              </span>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>

                          {/* Multiple Chart Areas */}
                          <div className="space-y-3">
                            {/* Revenue Growth Chart */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-white/90 font-outfit">
                                  Revenue Growth
                                </span>
                                <span className="text-xs font-bold text-white">
                                  +24.5%
                                </span>
                              </div>
                              <div className="flex items-end space-x-1 h-8">
                                <div className="w-2 bg-white/80 rounded-t h-4"></div>
                                <div className="w-2 bg-white/80 rounded-t h-6"></div>
                                <div className="w-2 bg-white/80 rounded-t h-8"></div>
                                <div className="w-2 bg-white/80 rounded-t h-5"></div>
                                <div className="w-2 bg-white/80 rounded-t h-7"></div>
                                <div className="w-2 bg-white/80 rounded-t h-9"></div>
                              </div>
                            </div>

                            {/* Conversion Rate Chart */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-white/90 font-outfit">
                                  Conversion Rate
                                </span>
                                <span className="text-xs font-bold text-white">
                                  12.8%
                                </span>
                              </div>
                              <div className="flex items-end space-x-1 h-6">
                                <div className="w-2 bg-white/80 rounded-t h-3"></div>
                                <div className="w-2 bg-white/80 rounded-t h-4"></div>
                                <div className="w-2 bg-white/80 rounded-t h-5"></div>
                                <div className="w-2 bg-white/80 rounded-t h-6"></div>
                              </div>
                            </div>

                            {/* Performance Metrics Row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="flex items-center space-x-1 mb-1">
                                  <BoltIcon className="w-3 h-3 text-blue-600" />
                                  <span className="text-xs text-gray-600 font-outfit">
                                    Real-time
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-gray-800">
                                  Live Data
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="flex items-center space-x-1 mb-1">
                                  <ArrowTrendingUpIcon className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-gray-600 font-outfit">
                                    Predictive
                                  </span>
                                </div>
                                <div className="text-xs font-bold text-gray-800">
                                  AI Insights
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                          <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                          <StarIcon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 p-1 rounded-xl shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileHover={{
                scale: 1.03,
                y: -1,
              }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group font-outfit text-base border border-gray-100"
            >
              <motion.div
                className="w-5 h-5 mr-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                <RocketLaunchIcon className="w-2.5 h-2.5 text-white" />
              </motion.div>
              Start Free Trial - No Credit Card Required
              <motion.div
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowRightIcon className="w-5 h-5 ml-3" />
              </motion.div>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LumioFeatures;
