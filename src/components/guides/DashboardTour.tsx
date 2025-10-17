"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TourStep {
  target: string;
  titleKey: string;
  descriptionKey: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: ".dashboard-sidebar",
    titleKey: "tour.welcome.title",
    descriptionKey: "tour.welcome.description",
    position: "right",
  },
  {
    target: ".dashboard-search",
    titleKey: "tour.search.title",
    descriptionKey: "tour.search.description",
    position: "bottom",
  },
  {
    target: ".marvin-dock",
    titleKey: "tour.marvin.title",
    descriptionKey: "tour.marvin.description",
    position: "left",
  },
  {
    target: ".metrics-grid",
    titleKey: "tour.metrics.title",
    descriptionKey: "tour.metrics.description",
    position: "bottom",
  },
];

export default function DashboardTour() {
  const { t } = useTranslation();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen tour
    const hasSeenTour = localStorage.getItem("lumio-tour-completed");
    if (!hasSeenTour) {
      setIsActive(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem("lumio-tour-completed", "true");
    setIsActive(false);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isActive) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />

      {/* Tour Card */}
      <div className="fixed z-50 max-w-sm bg-white rounded-xl shadow-2xl p-6 animate-scale-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t(step.titleKey)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Step {currentStep + 1} of {tourSteps.length}
            </p>
          </div>
          <button
            onClick={completeTour}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-6">{t(step.descriptionKey)}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="btn-ghost btn-sm disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="flex space-x-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? "bg-blue-600 w-4" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button onClick={nextStep} className="btn-primary btn-sm">
            {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </>
  );
}

