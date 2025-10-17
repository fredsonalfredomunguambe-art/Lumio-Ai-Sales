"use client";

import React from "react";
import {
  ShoppingCart,
  Mail,
  Users,
  MessageSquare,
  BarChart3,
  Zap,
  Globe,
} from "lucide-react";

interface IntegrationIconProps {
  source: string;
  className?: string;
  showEmoji?: boolean;
}

const INTEGRATION_ICONS: Record<
  string,
  { emoji: string; Icon: any; color: string }
> = {
  shopify: {
    emoji: "🛍️",
    Icon: ShoppingCart,
    color: "text-green-600",
  },
  hubspot: {
    emoji: "🟠",
    Icon: Users,
    color: "text-orange-600",
  },
  salesforce: {
    emoji: "☁️",
    Icon: Users,
    color: "text-blue-600",
  },
  mailchimp: {
    emoji: "🐵",
    Icon: Mail,
    color: "text-yellow-600",
  },
  linkedin: {
    emoji: "💼",
    Icon: Users,
    color: "text-blue-700",
  },
  slack: {
    emoji: "💬",
    Icon: MessageSquare,
    color: "text-purple-600",
  },
  whatsapp: {
    emoji: "💬",
    Icon: MessageSquare,
    color: "text-green-600",
  },
  "google-analytics": {
    emoji: "📊",
    Icon: BarChart3,
    color: "text-orange-500",
  },
  zapier: {
    emoji: "⚡",
    Icon: Zap,
    color: "text-orange-600",
  },
  lumio: {
    emoji: "📊",
    Icon: Globe,
    color: "text-blue-600",
  },
};

export function IntegrationIcon({
  source,
  className = "",
  showEmoji = false,
}: IntegrationIconProps) {
  const config =
    INTEGRATION_ICONS[source.toLowerCase()] || INTEGRATION_ICONS.lumio;

  if (showEmoji) {
    return <span className={`text-lg ${className}`}>{config.emoji}</span>;
  }

  const Icon = config.Icon;
  return <Icon className={`${config.color} ${className}`} />;
}

// Helper component for showing integration badge with icon
export function IntegrationBadge({ source }: { source: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
      <IntegrationIcon source={source} className="w-3 h-3" />
      <span className="text-xs font-medium text-gray-700 capitalize">
        {source}
      </span>
    </div>
  );
}
