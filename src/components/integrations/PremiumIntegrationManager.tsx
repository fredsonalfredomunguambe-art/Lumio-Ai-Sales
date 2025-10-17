"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  X,
  Clock,
  Users,
  TrendingUp,
  MessageSquare,
  ShoppingCart,
  Mail,
  Bell,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import {
  getPremiumIntegrationsForUser,
  PREMIUM_INTEGRATIONS,
} from "@/lib/premium-integrations";
import IntegrationGuide from "./IntegrationGuide";

interface PremiumIntegrationManagerProps {
  onIntegrationChange?: (integration: any) => void;
}

const categoryIcons = {
  crm: Users,
  communication: MessageSquare,
  ecommerce: ShoppingCart,
  marketing: Mail,
  notifications: Bell,
};

const categoryColors = {
  crm: "bg-blue-50 border-blue-200 text-blue-700",
  communication: "bg-green-50 border-green-200 text-green-700",
  ecommerce: "bg-purple-50 border-purple-200 text-purple-700",
  marketing: "bg-orange-50 border-orange-200 text-orange-700",
  notifications: "bg-gray-50 border-gray-200 text-gray-700",
};

export default function PremiumIntegrationManager({
  onIntegrationChange,
}: PremiumIntegrationManagerProps) {
  const toast = useToast();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

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

  const handleConnect = async (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setShowSetupModal(true);
  };

  const handleConnectWithCredentials = async (
    credentials: Record<string, string>
  ) => {
    if (!selectedIntegration) return;

    try {
      setIsConnecting(true);
      const response = await fetch(
        `/api/integrations/${selectedIntegration}/connect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ credentials }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIntegrations((prev) =>
          prev.map((integration) =>
            integration.id === selectedIntegration
              ? { ...integration, status: "connected" }
              : integration
          )
        );
        toast.success("Connected!", "Integration connected successfully");
        setShowSetupModal(false);
        setSelectedIntegration(null);
      } else {
        toast.error(
          "Connection Failed",
          data.error || "Failed to connect integration"
        );
      }
    } catch (error) {
      console.error("Error connecting integration:", error);
      toast.error("Connection Failed", "Failed to connect integration");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
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
              ? { ...integration, status: "disconnected" }
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

  const handleTest = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test Successful", "Integration is working properly");
      } else {
        toast.error("Test Failed", data.error || "Integration test failed");
      }
    } catch (error) {
      console.error("Error testing integration:", error);
      toast.error("Test Failed", "Failed to test integration");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    if (activeTab === "all") return true;
    if (activeTab === "popular") return integration.popular;
    return integration.category === activeTab;
  });

  const groupedIntegrations = filteredIntegrations.reduce(
    (acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    },
    {} as Record<string, any[]>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Connect your tools and services to maximize Lumio's capabilities
          </p>
        </div>
        <button
          onClick={loadIntegrations}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "all", label: "All", count: integrations.length },
          {
            id: "popular",
            label: "Popular",
            count: integrations.filter((i) => i.popular).length,
          },
          {
            id: "crm",
            label: "CRM",
            count: integrations.filter((i) => i.category === "crm").length,
          },
          {
            id: "communication",
            label: "Communication",
            count: integrations.filter((i) => i.category === "communication")
              .length,
          },
          {
            id: "ecommerce",
            label: "E-commerce",
            count: integrations.filter((i) => i.category === "ecommerce")
              .length,
          },
          {
            id: "marketing",
            label: "Marketing",
            count: integrations.filter((i) => i.category === "marketing")
              .length,
          },
          {
            id: "notifications",
            label: "Notifications",
            count: integrations.filter((i) => i.category === "notifications")
              .length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="space-y-6">
        {Object.entries(groupedIntegrations).map(
          ([category, categoryIntegrations]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center space-x-2">
                {React.createElement(
                  categoryIcons[category as keyof typeof categoryIcons],
                  {
                    className: "w-4 h-4 text-gray-600",
                  }
                )}
                <h3 className="text-sm font-medium text-gray-900 capitalize">
                  {category} Integrations
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {integration.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {integration.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {integration.setupTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(integration.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            integration.status
                          )}`}
                        >
                          {integration.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {integration.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{integration.setupTime}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        {integration.status === "connected" ? (
                          <>
                            <button
                              onClick={() => handleTest(integration.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Test connection"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Disconnect"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(integration.id)}
                            className="px-3 py-1 bg-gray-900 text-white text-xs rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Connect</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Integration Guide Modal */}
      {showSetupModal && selectedIntegration && (
        <IntegrationGuide
          integrationId={selectedIntegration}
          onClose={() => {
            setShowSetupModal(false);
            setSelectedIntegration(null);
          }}
          onConnect={handleConnectWithCredentials}
          isConnecting={isConnecting}
        />
      )}
    </div>
  );
}
