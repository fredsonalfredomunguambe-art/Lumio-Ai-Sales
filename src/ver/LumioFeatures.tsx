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
      title: "AI Marketing Consultant",
      description:
        "Built-in intelligent marketing consultant that provides actionable strategies and personalized recommendations.",
      color: "blue",
    },
    {
      icon: CogIcon,
      title: "All-in-One Automation",
      description:
        "Schedule and publish content automatically across Instagram and Email with intelligent lead segmentation.",
      color: "indigo",
    },
    {
      icon: ChartBarIcon,
      title: "Smart Analytics",
      description:
        "AI-optimized reports with actionable insights and performance tracking across all channels.",
      color: "purple",
    },
    {
      icon: UserGroupIcon,
      title: "Lead Management",
      description:
        "Automatic lead and customer segmentation with intelligent nurturing workflows.",
      color: "green",
    },
  ];

  const benefits = [
    "Automated content scheduling and publishing",
    "AI-optimized text generation for campaigns",
    "Intelligent lead segmentation and nurturing",
    "Real-time performance analytics and insights",
    "Multi-channel integration (Instagram + Email)",
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
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Scale Your Marketing
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
            Our AI-powered platform combines automation, intelligence, and
            insights to help you generate more leads and optimize your
            campaigns.
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
            { number: "1", label: "Platform for All", icon: StarIcon },
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

        {/* Premium Image Section with Copywriting */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Premium Copywriting */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <SparklesIcon className="w-4 h-4" />
                <span className="font-outfit font-semibold tracking-wide">
                  Premium Marketing Intelligence
                </span>
              </motion.div>

              <motion.h3
                className="text-3xl sm:text-4xl font-bold text-gray-900 font-outfit tracking-tight"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Transform Your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Marketing Strategy
                </span>{" "}
                with AI
              </motion.h3>

              <motion.p
                className="text-base text-gray-600 leading-relaxed font-outfit"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                Our AI-powered platform doesn&apos;t just automate your
                marketing—it transforms it. Get intelligent insights, predictive
                analytics, and automated optimization that drives real results.
              </motion.p>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
              >
                {[
                  "AI-driven content optimization",
                  "Predictive lead scoring",
                  "Real-time performance insights",
                  "Automated A/B testing",
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium font-inter text-sm">
                      {benefit}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Premium Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="/fotos/trabalho.png"
                  alt="Premium Marketing Intelligence Platform"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent"></div>

                {/* Compact Premium Badge */}
                <motion.div
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-gray-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 font-outfit mb-1">
                      AI-Powered
                    </div>
                    <div className="text-xs text-gray-600 font-medium font-outfit">
                      Sales AI
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
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

