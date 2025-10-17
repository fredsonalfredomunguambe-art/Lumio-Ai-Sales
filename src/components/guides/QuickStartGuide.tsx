"use client";

import React, { useState } from "react";
import { CheckCircle, Circle, ChevronRight, X, Play } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface Step {
  id: string;
  titleKey: string;
  descriptionKey: string;
  actionKey?: string;
  actionUrl?: string;
  completed: boolean;
}

export default function QuickStartGuide() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "connect-integration",
      titleKey: "guide.step1.title",
      descriptionKey: "guide.step1.description",
      actionKey: "guide.step1.action",
      actionUrl: "/dashboard/settings?tab=integrations",
      completed: false,
    },
    {
      id: "import-leads",
      titleKey: "guide.step2.title",
      descriptionKey: "guide.step2.description",
      actionKey: "guide.step2.action",
      actionUrl: "/dashboard/leads",
      completed: false,
    },
    {
      id: "create-campaign",
      titleKey: "guide.step3.title",
      descriptionKey: "guide.step3.description",
      actionKey: "guide.step3.action",
      actionUrl: "/dashboard/campaigns",
      completed: false,
    },
    {
      id: "setup-marvin",
      titleKey: "guide.step4.title",
      descriptionKey: "guide.step4.description",
      actionKey: "guide.step4.action",
      actionUrl: "/dashboard/settings?tab=marvin",
      completed: false,
    },
  ]);

  const progress = (steps.filter((s) => s.completed).length / steps.length) * 100;

  const toggleStep = (id: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)));
  };

  return (
    <>
      {/* Floating Quick Start Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 z-40"
      >
        <Play className="w-4 h-4" />
        <span className="font-semibold text-sm">Quick Start</span>
      </button>

      {/* Guide Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 animate-slide-left">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Start Guide
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Get up and running in minutes
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`border rounded-lg p-4 transition-all ${
                    step.completed
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleStep(step.id)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 ${
                          step.completed
                            ? "text-green-900 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {index + 1}. {t(step.titleKey)}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {t(step.descriptionKey)}
                      </p>
                      {!step.completed && step.actionKey && step.actionUrl && (
                        <a
                          href={step.actionUrl}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t(step.actionKey)}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


