"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  StarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

/**
 * Premium Footer Section for Lumio - Essential and Credible Design
 */
const LumioFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    product: [
      { name: "Lead Scoring", href: "#scoring" },
      { name: "Email Automation", href: "#automation" },
      { name: "Analytics", href: "#analytics" },
    ],
    company: [
      { name: "About", href: "#about" },
      { name: "Contact", href: "#contact" },
      { name: "Privacy", href: "#privacy" },
    ],
  };

  const socialLinks = [
    { name: "LinkedIn", icon: ChatBubbleLeftRightIcon, href: "#linkedin" },
    { name: "Twitter", icon: HeartIcon, href: "#twitter" },
    { name: "Facebook", icon: UserGroupIcon, href: "#facebook" },
  ];

  return (
    <footer className="relative bg-blue-50 text-gray-900 overflow-hidden">
      {/* Separation Line - Combines with page design */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

      {/* Premium Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50/60"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 right-20 w-64 h-64 border border-blue-300 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 border border-indigo-300 rounded-full"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Brand Section */}
            <motion.div
              className="md:col-span-1 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl font-outfit">
                    L
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900 font-outfit tracking-tight">
                  Lumio
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed max-w-md font-outfit text-sm">
                AI-powered sales automation platform that captures, engages, and
                converts leads while you focus on closing deals.
              </p>

              {/* Contact Info - Essential for Credibility */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-outfit text-sm">hello@lumio.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPinIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-outfit text-sm">San Francisco, CA</span>
                </div>
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-gray-900 font-outfit">
                Product
              </h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-outfit text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold text-gray-900 font-outfit">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-outfit text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Newsletter Section - Essential for Lead Generation */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="max-w-xl">
              <h3 className="text-lg font-semibold text-gray-900 font-outfit mb-2">
                Stay Updated
              </h3>
              <p className="text-gray-600 mb-4 font-outfit text-sm">
                Get the latest sales insights and platform updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-outfit text-sm"
                />
                <motion.button
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 font-outfit text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              {/* Copyright */}
              <motion.div
                className="text-gray-500 text-sm font-outfit"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                © 2024 Lumio. All rights reserved.
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex items-center space-x-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-blue-600 transition-colors duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUpIcon className="w-5 h-5" />
      </motion.button>
    </footer>
  );
};

export default LumioFooter;
