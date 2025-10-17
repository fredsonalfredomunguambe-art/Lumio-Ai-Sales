"use client";

import React, { useState, useEffect } from "react";
import {
  Loader2,
  Users,
  MessageSquare,
  ShoppingCart,
  Mail,
  Bell,
  Search,
  Shield,
  X,
  Check,
  Star,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/NotificationSystem";
import IntegrationSyncModal from "./IntegrationSyncModal";

interface Integration {
  id: string;
  name: string;
  status: "connected" | "error" | "disconnected";
  lastSync?: string;
  errorMessage?: string;
  syncInProgress?: boolean;
}

interface WorldClassIntegrationManagerProps {
  onIntegrationChange?: (integration: Integration) => void;
}

const integrationConfigs = {
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "Sync contacts and deals automatically",
    icon: Users,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    popular: false,
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    category: "communication",
    description: "Connect with leads and automate outreach",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    popular: false,
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    description: "Sync products and orders in real-time",
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-50",
    popular: true,
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Enterprise CRM integration",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    popular: false,
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "communication",
    description: "Send automated messages to customers",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
    popular: true,
  },
  mailchimp: {
    id: "mailchimp",
    name: "Mailchimp",
    category: "marketing",
    description: "Email marketing and automation",
    icon: Mail,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    popular: true,
  },
  slack: {
    id: "slack",
    name: "Slack",
    category: "notifications",
    description: "Real-time team notifications",
    icon: Bell,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    popular: false,
  },
  pipedrive: {
    id: "pipedrive",
    name: "Pipedrive",
    category: "crm",
    description: "Sales pipeline management",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    popular: false,
  },
  googlecalendar: {
    id: "google-calendar",
    name: "Google Calendar",
    category: "calendar",
    description: "Bi-directional calendar sync with Google",
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    popular: true,
    oauthBased: true,
  },
};

export default function WorldClassIntegrationManager({}: WorldClassIntegrationManagerProps) {
  const toast = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/integrations");
      const data = await response.json();

      if (data.success) {
        setIntegrations(data.data.integrations || []);
      } else {
        toast.error("Error", data.error || "Failed to load integrations");
      }
    } catch (error) {
      console.error("Error loading integrations:", error);
      toast.error("Error", "Failed to load integrations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async (integrationId: string) => {
    try {
      setConnecting(integrationId);

      // Handle Google Calendar OAuth differently
      if (integrationId === "google-calendar") {
        const response = await fetch("/api/integrations/google-calendar/oauth");
        const data = await response.json();

        if (data.success && data.data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.data.authUrl;
          return;
        } else {
          throw new Error("Failed to generate OAuth URL");
        }
      }

      // Get OAuth URL for other integrations
      const response = await fetch(`/api/integrations/${integrationId}/oauth`);
      const data = await response.json();

      if (data.success) {
        // Open OAuth flow in new window
        const oauthWindow = window.open(
          data.data.oauthUrl,
          "oauth",
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );

        // Listen for OAuth completion
        const checkClosed = setInterval(() => {
          if (oauthWindow?.closed) {
            clearInterval(checkClosed);
            setConnecting(null);
            // Refresh integrations to show new connection
            loadIntegrations().then(() => {
              // Show sync modal after successful connection
              const integration = integrations.find(
                (i) => i.id === integrationId
              );
              if (integration && integration.status === "connected") {
                setSelectedIntegration(integration);
                setShowSyncModal(true);
              }
            });
          }
        }, 1000);
      } else {
        toast.error(
          "Connection Failed",
          data.error || "Failed to start OAuth flow"
        );
        setConnecting(null);
      }
    } catch (error) {
      console.error("Error connecting integration:", error);
      toast.error("Connection Failed", "Failed to connect integration");
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // Handle Google Calendar disconnect differently
      if (integrationId === "google-calendar") {
        const response = await fetch(
          "/api/integrations/google-calendar/disconnect",
          {
            method: "POST",
          }
        );
        const data = await response.json();

        if (data.success) {
          setIntegrations((prev) =>
            prev.map((integration) =>
              integration.id === integrationId
                ? {
                    ...integration,
                    status: "disconnected",
                    lastSync: undefined,
                  }
                : integration
            )
          );
          toast.success(
            "Disconnected",
            "Google Calendar disconnected successfully"
          );
        } else {
          toast.error(
            "Disconnect Failed",
            data.error || "Failed to disconnect Google Calendar"
          );
        }
        return;
      }

      // Handle other integrations
      const response = await fetch(
        `/api/integrations/${integrationId}/disconnect`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === integrationId
              ? { ...integration, status: "disconnected", lastSync: undefined }
              : integration
          )
        );
        toast.success("Disconnected", "Integration disconnected successfully");
      } else {
        toast.error(
          "Disconnect Failed",
          data.error || "Failed to disconnect integration"
        );
      }
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      toast.error("Disconnect Failed", "Failed to disconnect integration");
    }
  };

  const handleStartSync = async (integrationId: string) => {
    const integration = integrations.find((i) => i.id === integrationId);
    if (integration) {
      setSelectedIntegration(integration);
      setShowSyncModal(true);
    }
  };

  const handleSyncConfirm = async (syncOptions: Record<string, boolean>) => {
    if (!selectedIntegration) return;

    try {
      const response = await fetch(
        `/api/integrations/${selectedIntegration.id}/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncOptions,
            mode: "initial",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Sync Started",
          `Syncing ${selectedIntegration.name} data in background`
        );

        // Update integration status
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === selectedIntegration.id
              ? { ...integration, syncInProgress: true }
              : integration
          )
        );

        // Refresh after estimated time
        setTimeout(() => {
          loadIntegrations();
        }, (data.data.estimatedTime || 60) * 1000);
      } else {
        throw new Error(data.error || "Failed to start sync");
      }
    } catch (error: any) {
      console.error("Error starting sync:", error);
      throw error;
    }
  };

  const handleManualSync = async (integrationId: string) => {
    try {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, syncInProgress: true }
            : integration
        )
      );

      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncOptions: { contacts: true, deals: true }, // Default options
          mode: "incremental",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sync Started", "Refreshing data in background");

        setTimeout(() => {
          loadIntegrations();
        }, (data.data.estimatedTime || 30) * 1000);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error("Sync Failed", error.message || "Failed to sync data");
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, syncInProgress: false }
            : integration
        )
      );
    }
  };

  const availableIntegrations = Object.values(integrationConfigs).filter(
    (integration) => {
      const matchesSearch =
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || integration.category === activeCategory;
      return matchesSearch && matchesCategory;
    }
  );

  const categories = [
    { id: "all", label: "All" },
    { id: "crm", label: "CRM" },
    { id: "communication", label: "Communication" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "marketing", label: "Marketing" },
    { id: "notifications", label: "Notifications" },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-16">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse w-48"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse w-96"></div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"></div>
          </motion.div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-16"
      >
        <motion.h1
          className="text-3xl font-semibold text-gray-900 mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Integrations
        </motion.h1>
        <motion.p
          className="text-gray-600"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Connect your tools to automate workflows and sync data.
        </motion.p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <motion.div whileHover={{ scale: 1.01 }} className="relative group">
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            animate={{ rotate: [0, 10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
              repeatDelay: 3,
            }}
          >
            <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </motion.div>
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white shadow-sm focus:shadow-md transition-all"
          />
        </motion.div>
      </motion.div>

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeCategory === category.id
                  ? "bg-white text-gray-900 border-2 border-blue-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      {/* Integrations List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <AnimatePresence mode="wait">
          {availableIntegrations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
              >
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              </motion.div>
              <p className="text-gray-500 text-sm">No integrations found</p>
            </motion.div>
          ) : (
            availableIntegrations.map((integration, index) => {
              const connection = integrations.find(
                (i) => i.id === integration.id
              );
              const isConnected = connection?.status === "connected";
              const isConnecting = connecting === integration.id;
              const Icon = integration.icon;

              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.4,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  className="group relative bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Gradient Overlay on Hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  />

                  <div className="relative flex items-center justify-between p-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon with Animation */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={`w-10 h-10 rounded-lg ${integration.bgColor} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <Icon className={`w-5 h-5 ${integration.color}`} />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 text-sm">
                            {integration.name}
                          </h3>
                          {/* Popular Badge - Small & Golden */}
                          {integration.popular && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                delay: index * 0.05 + 0.2,
                                type: "spring",
                                stiffness: 200,
                                damping: 10,
                              }}
                              className="relative"
                            >
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5 shadow-sm"
                              >
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>POPULAR</span>
                              </motion.div>
                              {/* Shine Effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 3,
                                  ease: "linear",
                                  repeatDelay: 5,
                                }}
                              />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs">
                          {integration.description}
                        </p>
                      </div>
                    </div>

                    {isConnected ? (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                      >
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-md"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{
                              repeat: Infinity,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </motion.div>
                          Connected
                        </motion.span>
                        {connection?.lastSync && (
                          <span className="text-xs text-gray-500">
                            {new Date(connection.lastSync).toLocaleDateString()}
                          </span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartSync(integration.id)}
                          disabled={connection?.syncInProgress}
                          className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Configure sync"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              connection?.syncInProgress ? "animate-spin" : ""
                            }`}
                          />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDisconnect(integration.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Disconnect"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ) : (
                      <motion.button
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-xl flex items-center gap-2 overflow-hidden group/btn"
                      >
                        {/* Button Shine Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Connecting
                            </>
                          ) : (
                            <>
                              Connect
                              <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.5,
                                  ease: "easeInOut",
                                }}
                              >
                                →
                              </motion.span>
                            </>
                          )}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-12"
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="flex items-center justify-center gap-2 text-xs text-gray-500"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
          >
            <Shield className="w-3.5 h-3.5" />
          </motion.div>
          <span>All connections are encrypted and secure</span>
        </motion.div>
      </motion.div>

      {/* Sync Modal */}
      {selectedIntegration && (
        <IntegrationSyncModal
          integration={selectedIntegration}
          isOpen={showSyncModal}
          onClose={() => {
            setShowSyncModal(false);
            setSelectedIntegration(null);
          }}
          onStartSync={handleSyncConfirm}
        />
      )}
    </div>
  );
}
