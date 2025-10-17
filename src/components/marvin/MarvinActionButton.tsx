"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface MarvinActionButtonProps {
  action: "generate_email" | "create_campaign" | "qualify_lead" | "analyze_segment" | "follow_up";
  label: string;
  data?: any;
  language?: "en" | "es" | "pt" | "fr";
  onSuccess?: (result: string) => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export default function MarvinActionButton({
  action,
  label,
  data = {},
  language = "en",
  onSuccess,
  variant = "primary",
  size = "md",
}: MarvinActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");

  const executeAction = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/marvin/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          data,
          language,
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setResult(responseData.result);
        setShowResult(true);
        if (onSuccess) {
          onSuccess(responseData.result);
        }
      } else {
        throw new Error(responseData.error);
      }
    } catch (error) {
      console.error("Marvin action failed:", error);
      setResult("Failed to execute action. Please try again.");
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "btn-ghost",
  };

  const sizeClasses = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  return (
    <>
      <button
        onClick={executeAction}
        disabled={isLoading}
        className={`${variantClasses[variant]} ${sizeClasses[size]} ${
          isLoading ? "opacity-70 cursor-wait" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2" />
        )}
        {label}
      </button>

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Marvin's Result</h3>
              </div>
              <button
                onClick={() => setShowResult(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {result}
              </pre>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResult(false)}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result);
                }}
                className="btn-primary btn-sm"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


