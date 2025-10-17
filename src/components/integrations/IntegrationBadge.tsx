import React from "react";
import {
  Users,
  MessageSquare,
  ShoppingCart,
  Mail,
  Bell,
  Briefcase,
} from "lucide-react";

interface IntegrationBadgeProps {
  source: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const integrationConfig: Record<
  string,
  {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  lumio: {
    name: "Lumio",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  hubspot: {
    name: "HubSpot",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  salesforce: {
    name: "Salesforce",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  shopify: {
    name: "Shopify",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  whatsapp: {
    name: "WhatsApp",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  mailchimp: {
    name: "Mailchimp",
    icon: Mail,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  slack: {
    name: "Slack",
    icon: Bell,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  pipedrive: {
    name: "Pipedrive",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
};

export default function IntegrationBadge({
  source,
  size = "sm",
  showIcon = true,
  showLabel = true,
  className = "",
}: IntegrationBadgeProps) {
  const config =
    integrationConfig[source.toLowerCase()] || integrationConfig.lumio;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.bgColor} ${config.color} ${sizeClasses[size]} rounded-md font-medium ${className}`}
      title={`Source: ${config.name}`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {showLabel && <span>{config.name}</span>}
    </span>
  );
}
