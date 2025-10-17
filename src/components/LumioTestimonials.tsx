"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

/**
 * Carousel Testimonials Section for Lumio - Auto-scrolling with Loop
 */
const LumioTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Luke Harrison",
      role: "Sales Director",
      company: "TechFlow Digital",
      image: "/perfil/perfil1.png",
      quote:
        "Lumio turned our sales process around completely. We went from struggling to track leads to closing deals consistently. The AI scoring system never misses a hot prospect.",
    },
    {
      name: "Jason Carter",
      role: "Founder",
      company: "StartupLab",
      image: "/perfil/perfil2.png",
      quote:
        "We were spending money on leads without knowing if they were qualified. Lumio showed us exactly which prospects were ready to buy. Game changer for our conversion rates.",
    },
    {
      name: "Karen Davis",
      role: "Digital Marketing Specialist",
      company: "E-commerce Plus",
      image: "/perfil/perfil3.png",
      quote:
        "I was skeptical at first, but the analytics are incredibly useful. We can see which campaigns are performing and adjust quickly. It's saved me hours of manual tracking.",
    },
    {
      name: "Megan Wilson",
      role: "Growth Manager",
      company: "ScaleUp Solutions",
      image: "/perfil/perfil4.png",
      quote:
        "We discovered customer segments we never knew existed. Lumio helped us grow our business in ways we didn't expect. The segmentation features are incredible.",
    },
    {
      name: "David Kim",
      role: "Marketing Coordinator",
      company: "Digital Agency Pro",
      image: "/perfil/perfil5.png",
      quote:
        "Managing multiple campaigns used to be a nightmare. Now everything is in one place and works seamlessly together. The automation saves us 20+ hours per week.",
    },
    {
      name: "Malik Johnson",
      role: "Business Development",
      company: "Innovation Hub",
      image: "/perfil/perfil6.png",
      quote:
        "Lumio changed how we think about sales. It's not just a tool, it's like having an intelligent sales partner that works 24/7 to grow our pipeline.",
    },
    {
      name: "Ryan Mitchell",
      role: "Marketing Assistant",
      company: "Growth Ventures",
      image: "/perfil/perfil7.png",
      quote:
        "As a young professional, Lumio helped me understand sales in a way that actually makes sense. Our campaigns are now much more effective and data-driven.",
    },
    {
      name: "Robert Anderson",
      role: "Senior Marketing Director",
      company: "Legacy Solutions",
      image: "/perfil/perfil8.png",
      quote:
        "After trying dozens of sales tools, most are just fancy dashboards without real insights. Lumio actually helps us understand our audience better. It's refreshing to find something that works.",
    },
    {
      name: "Emma Thompson",
      role: "Digital Marketing Lead",
      company: "Modern Brands",
      image: "/perfil/perfil9.png",
      quote:
        "Marvin is absolutely brilliant! It's like having a sales genius that never sleeps. He identifies trends I completely miss and gives me insights that actually work. My team thinks I'm a genius now, but it's all Marvin!",
    },
  ];

  // Auto-scroll with loop - much slower
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 12000); // Change every 12 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  // Get visible testimonials (1 at a time) - ensure no repetition
  const getVisibleTestimonials = () => {
    return [testimonials[currentIndex]];
  };

  return (
    <section className="relative py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-outfit">
            Businesses That <span className="text-blue-600">Scale</span> with
            Lumio
          </h2>
          <p className="text-gray-600 font-outfit">
            See how real companies are transforming their sales process
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative mb-12">
          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <svg
              className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <svg
              className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Single Testimonial - Centered */}
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {getVisibleTestimonials().map((testimonial, index) => (
                <motion.div
                  key={`${currentIndex}-${index}`}
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-100"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-700 italic mb-8 font-outfit text-lg leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    <div className="flex items-center justify-center space-x-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <CheckBadgeIcon className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 font-outfit text-lg">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-500 font-outfit text-base">
                          {testimonial.role} na {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "bg-blue-600 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-blue-600 text-white rounded-xl p-8">
            <h3 className="text-xl font-bold font-outfit mb-4">
              Ready to Transform Your Sales Process?
            </h3>
            <p className="text-blue-100 mb-6 font-outfit">
              Join hundreds of businesses already scaling with Lumio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors font-outfit">
                Start Free Trial
              </button>
              <button className="px-8 py-3 bg-transparent text-white font-semibold rounded-lg border-2 border-white/30 hover:bg-white/10 transition-colors font-outfit">
                Schedule Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LumioTestimonials;
