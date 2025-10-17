import React, { useState, useEffect } from "react";
import {
  Filter,
  Check,
  Users,
  MessageSquare,
  ShoppingCart,
  Mail,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SourceFilterProps {
  selectedSource: string;
  onSourceChange: (source: string) => void;
  connectedIntegrations?: string[];
}

const sourceConfig: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  all: {
    name: "All Sources",
    icon: Filter,
    color: "text-gray-600",
  },
  lumio: {
    name: "Lumio",
    icon: Users,
    color: "text-blue-600",
  },
  hubspot: {
    name: "HubSpot",
    icon: Users,
    color: "text-orange-600",
  },
  salesforce: {
    name: "Salesforce",
    icon: Users,
    color: "text-blue-600",
  },
  shopify: {
    name: "Shopify",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageSquare,
    color: "text-green-600",
  },
  mailchimp: {
    name: "Mailchimp",
    icon: Mail,
    color: "text-yellow-600",
  },
  slack: {
    name: "Slack",
    icon: Mail,
    color: "text-purple-600",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Users,
    color: "text-blue-600",
  },
  pipedrive: {
    name: "Pipedrive",
    icon: Users,
    color: "text-blue-600",
  },
};

export default function SourceFilter({
  selectedSource,
  onSourceChange,
  connectedIntegrations = [],
}: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [availableSources, setAvailableSources] = useState<string[]>([
    "all",
    "lumio",
  ]);

  useEffect(() => {
    // Build available sources list
    const sources = ["all", "lumio", ...connectedIntegrations];
    setAvailableSources(sources);
  }, [connectedIntegrations]);

  const selectedConfig = sourceConfig[selectedSource] || sourceConfig.all;
  const SelectedIcon = selectedConfig.icon;

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
      >
        <SelectedIcon className={`w-4 h-4 ${selectedConfig.color}`} />
        <span>{selectedConfig.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
            >
              {availableSources.map((source) => {
                const config = sourceConfig[source] || sourceConfig.all;
                const Icon = config.icon;
                const isSelected = selectedSource === source;

                return (
                  <button
                    key={source}
                    onClick={() => {
                      onSourceChange(source);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {config.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}

              {availableSources.length === 2 && (
                <div className="px-4 py-3 border-t border-gray-200 mt-1">
                  <p className="text-xs text-gray-500 text-center">
                    Connect integrations to filter by source
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
