"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { tourProgress } from "@/lib/tour-progress";
import { type PersonalityType } from "@/lib/marvin-personality";

export interface TourStep {
  id: string;
  target: string | null;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  marvinPersonality: PersonalityType;
  highlight?: "pulse" | "glow" | "none";
  action?: {
    label: string;
    onClick: () => void;
  };
  celebration?: boolean;
}

interface CalendarGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
  tourId?: string;
}

export function CalendarGuide({
  isOpen,
  onClose,
  onComplete,
  steps,
  tourId = "calendar-tour",
}: CalendarGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];

  // Callbacks
  const handleComplete = useCallback(() => {
    tourProgress.markCompleted(tourId);
    onComplete();
    onClose();
  }, [tourId, onComplete, onClose]);

  const handleSkip = useCallback(() => {
    tourProgress.markDismissed(tourId);
    onClose();
  }, [tourId, onClose]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      tourProgress.saveProgress(tourId, currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length, tourId, handleComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      tourProgress.saveProgress(tourId, currentStep - 1);
    }
  }, [currentStep, tourId]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextStep();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevStep();
          break;
        case "Escape":
          e.preventDefault();
          handleSkip();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, nextStep, prevStep, handleSkip]);

  if (!isOpen || !step) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Simple Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Simple Modal - Always Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.4,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-[420px] max-w-[90vw]"
          >
            {/* Header */}
            <div className="px-6 py-5 bg-blue-600 border-b border-blue-700">
              <div className="flex items-center gap-4 mb-4">
                {/* Marvin Avatar */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative w-12 h-12 rounded-full bg-white shadow-sm overflow-hidden flex-shrink-0 ring-2 ring-white/30"
                >
                  <Image
                    src="/fotos/marvin.png"
                    alt="Marvin AI"
                    width={48}
                    height={48}
                    className="object-cover"
                    priority
                  />
                </motion.div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Marvin AI Guide</span>
                  </div>
                  <div className="text-blue-100 text-sm mt-0.5">
                    Your AI Sales Assistant
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                  aria-label="Close tour"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      idx === currentStep
                        ? "bg-white"
                        : idx < currentStep
                        ? "bg-white/60"
                        : "bg-white/25"
                    )}
                    initial={{ width: 32 }}
                    animate={{
                      width: idx === currentStep ? "100%" : 32,
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                      flex: idx === currentStep ? 1 : "0 0 32px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-gray-900 leading-snug"
              >
                {step.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]"
              >
                {step.description}
              </motion.p>

              {/* Action Button */}
              {step.action && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{
                    y: -1,
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={step.action.onClick}
                  className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-blue-200 hover:border-blue-300"
                >
                  {step.action.label}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              )}

              {/* Keyboard Shortcuts */}
              {step.id === "shortcuts" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200"
                >
                  {[
                    { key: "?", action: "Open help" },
                    { key: "N", action: "New event" },
                    { key: "← →", action: "Navigate months" },
                    { key: "T", action: "Today" },
                    { key: "M", action: "Marvin insights" },
                  ].map(({ key, action }, idx) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-gray-700 text-sm">{action}</span>
                      <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-mono text-gray-700 shadow-sm min-w-[50px] text-center">
                        {key}
                      </kbd>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Celebration */}
              {step.celebration && (
                <motion.div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      damping: 15,
                      stiffness: 200,
                      delay: 0.2,
                    }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-3"
                  >
                    <Check className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-gray-600"
                  >
                    You&apos;re ready to master your calendar!
                  </motion.p>
                </motion.div>
              )}
            </div>

            {/* Footer - Simplified */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                {/* Back Button */}
                <motion.button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  whileHover={currentStep > 0 ? { y: -1 } : {}}
                  whileTap={currentStep > 0 ? { scale: 0.98 } : {}}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all text-sm",
                    currentStep === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </motion.button>

                {/* Step Counter */}
                <div className="text-sm text-gray-500 font-medium px-3 py-1 bg-white rounded-lg border border-gray-200">
                  {currentStep + 1} / {steps.length}
                </div>

                {/* Next/Finish Button */}
                <motion.button
                  onClick={nextStep}
                  whileHover={{
                    y: -1,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-1.5 px-5 py-2 rounded-lg font-medium transition-all text-sm shadow-sm",
                    currentStep === steps.length - 1
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Finish <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
