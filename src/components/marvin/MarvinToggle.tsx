"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarvinToggleProps {
  onClick: () => void;
  isOpen: boolean;
  insightCount?: number;
  context?: string;
  className?: string;
  showBadge?: boolean; // If false, shows pulse dot instead of count
}

export function MarvinToggle({
  onClick,
  isOpen,
  insightCount = 0,
  context = "dashboard",
  className = "",
  showBadge = true,
}: MarvinToggleProps) {
  const [pulse, setPulse] = useState(false);

  // Pulse animation when new insights are available
  useEffect(() => {
    if (insightCount > 0 && !isOpen) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [insightCount, isOpen]);

  return (
    <motion.button
      onClick={onClick}
      className={cn("fixed bottom-24 right-6 z-30 group", className)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {/* Main Button */}
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all duration-300",
            isOpen
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
            pulse && !isOpen && "animate-pulse"
          )}
        >
          <div className="relative">
            <Brain className="w-5 h-5" />
            {insightCount > 0 && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"
              />
            )}
          </div>
          <span className="font-medium text-sm hidden sm:inline">
            {isOpen ? "Close Insights" : "Marvin Insights"}
          </span>
        </div>

        {/* Insight Count Badge or Pulse Dot */}
        <AnimatePresence>
          {!isOpen &&
            (showBadge && insightCount > 0 ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-2 -right-2 min-w-[24px] h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-lg border-2 border-white"
              >
                {insightCount > 9 ? "9+" : insightCount}
              </motion.div>
            ) : !showBadge ? (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse"
              />
            ) : null)}
        </AnimatePresence>

        {/* Sparkle Effect */}
        <AnimatePresence>
          {pulse && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple Effect on Hover */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full -z-10",
            isOpen ? "bg-blue-400" : "bg-gray-300"
          )}
          initial={{ scale: 1, opacity: 0 }}
          whileHover={{ scale: 1.5, opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
          {isOpen
            ? "Close AI insights panel"
            : showBadge && insightCount > 0
            ? `${insightCount} new insight${
                insightCount > 1 ? "s" : ""
              } available`
            : "Get AI-powered insights"}
          <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45 -translate-y-1" />
        </div>
      </div>
    </motion.button>
  );
}
