"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface IntegrationToastProps {
  type: "success" | "error" | "loading" | "info";
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const IntegrationToast: React.FC<IntegrationToastProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  action,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "loading":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "info":
        return <ExternalLink className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-800",
          title: "text-green-900",
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800",
          title: "text-red-900",
        };
      case "loading":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          title: "text-blue-900",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          title: "text-blue-900",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          title: "text-gray-900",
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full"
        >
          <div
            className={`${colors.bg} ${colors.border} border-2 rounded-2xl shadow-xl p-4 backdrop-blur-sm`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">{getIcon()}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${colors.title} mb-1`}>
                  {title}
                </h4>
                <p className={`text-sm ${colors.text} leading-relaxed`}>
                  {message}
                </p>
                {action && (
                  <button
                    onClick={action.onClick}
                    className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                  >
                    {action.label}
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntegrationToast;
