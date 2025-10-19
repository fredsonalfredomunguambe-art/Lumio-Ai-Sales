"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  CheckCircle,
  XCircle,
  ExternalLink,
  Mail,
  ShoppingCart,
  BarChart3,
  Users,
  Calendar,
  MessageSquare,
  Zap,
  AlertCircle,
  Info,
  Activity,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { IntegrationHealthDashboard } from "@/components/integrations/IntegrationHealthDashboard";
import { HelpButton } from "@/components/HelpCenter/HelpButton";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([
    {
      id: "shopify",
      name: "Shopify",
      description:
        "Connect your Shopify store to sync products, orders, and customers",
      category: "E-commerce",
      status: "connected",
      icon: ShoppingCart,
      lastSync: "2024-01-15 10:30",
      setupRequired: false,
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      description: "Track website traffic and user behavior",
      category: "Analytics",
      status: "connected",
      icon: BarChart3,
      lastSync: "2024-01-15 10:25",
      setupRequired: false,
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Sync your email lists and campaigns",
      category: "Email Marketing",
      status: "not_connected",
      icon: Mail,
      lastSync: null,
      setupRequired: true,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Connect your CRM to sync leads and contacts",
      category: "CRM",
      status: "not_connected",
      icon: Users,
      lastSync: null,
      setupRequired: true,
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Bi-directional calendar sync with Google Calendar",
      category: "Calendar",
      status: "not_connected",
      icon: Calendar,
      lastSync: null,
      setupRequired: false,
      oauthBased: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Get notifications and updates in Slack",
      category: "Communication",
      status: "not_connected",
      icon: MessageSquare,
      lastSync: null,
      setupRequired: true,
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect with 5000+ apps through Zapier",
      category: "Automation",
      status: "not_connected",
      icon: Zap,
      lastSync: null,
      setupRequired: true,
    },
  ]);

  const categories = [
    { id: "all", label: "All Integrations", count: integrations.length },
    {
      id: "ecommerce",
      label: "E-commerce",
      count: integrations.filter((i) => i.category === "E-commerce").length,
    },
    {
      id: "analytics",
      label: "Analytics",
      count: integrations.filter((i) => i.category === "Analytics").length,
    },
    {
      id: "email",
      label: "Email Marketing",
      count: integrations.filter((i) => i.category === "Email Marketing")
        .length,
    },
    {
      id: "crm",
      label: "CRM",
      count: integrations.filter((i) => i.category === "CRM").length,
    },
    {
      id: "calendar",
      label: "Calendar",
      count: integrations.filter((i) => i.category === "Calendar").length,
    },
    {
      id: "communication",
      label: "Communication",
      count: integrations.filter((i) => i.category === "Communication").length,
    },
    {
      id: "automation",
      label: "Automation",
      count: integrations.filter((i) => i.category === "Automation").length,
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");

  // Load real integration status from database
  useEffect(() => {
    loadIntegrationStatus();

    // Check for OAuth callback success/error
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const error = params.get("error");

    if (success === "google_calendar") {
      alert("Google Calendar connected successfully!");
      window.history.replaceState({}, "", "/dashboard/settings/integrations");
      setTimeout(() => loadIntegrationStatus(), 500);
    }

    if (error) {
      alert(`Connection error: ${error}`);
      window.history.replaceState({}, "", "/dashboard/settings/integrations");
    }
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      const response = await fetch("/api/integrations/status");
      const data = await response.json();

      if (data.success) {
        setIntegrations((prev) =>
          prev.map((integration) => {
            const dbStatus = data.connections[integration.id];
            if (dbStatus) {
              return {
                ...integration,
                status: dbStatus.status,
                lastSync: dbStatus.lastSync
                  ? new Date(dbStatus.lastSync).toLocaleString()
                  : null,
              };
            }
            return integration;
          })
        );
      }
    } catch (error) {
      console.error("Error loading integration status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "not_connected":
        return "bg-gray-100 text-gray-800 dark:text-zinc-200";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800 dark:text-zinc-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4" />;
      case "not_connected":
        return <XCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const filteredIntegrations = integrations.filter((integration) => {
    if (selectedCategory === "all") return true;
    return (
      integration.category.toLowerCase().replace(" ", "") === selectedCategory
    );
  });

  const handleConnect = async (integrationId: string) => {
    // Special handling for OAuth integrations
    if (integrationId === "google-calendar") {
      try {
        const response = await fetch("/api/integrations/google-calendar/oauth");
        const data = await response.json();

        if (data.success && data.data.authUrl) {
          // Redirect to Google OAuth
          window.location.href = data.data.authUrl;
          return;
        }
      } catch (error) {
        console.error("Error initiating Google Calendar OAuth:", error);
        alert("Failed to connect Google Calendar. Please try again.");
        return;
      }
    }

    // Default connection logic for other integrations
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              status: "connected",
              lastSync: new Date().toLocaleString(),
            }
          : integration
      )
    );
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      // For Google Calendar, call disconnect API
      if (integrationId === "google-calendar") {
        const response = await fetch(
          "/api/integrations/google-calendar/disconnect",
          {
            method: "POST",
          }
        );

        if (response.ok) {
          alert("Google Calendar disconnected successfully");
          loadIntegrationStatus();
          return;
        }
      }

      // Default disconnect for other integrations
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, status: "not_connected", lastSync: null }
            : integration
        )
      );
    } catch (error) {
      console.error("Error disconnecting integration:", error);
      alert("Failed to disconnect integration");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Integrations</h1>
          <p className="text-blue-600">
            Connect your favorite tools and services
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span>Browse All</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Integrations</TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="w-4 h-4 mr-2" />
            Health Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Connected</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {
                      integrations.filter((i) => i.status === "connected")
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Available</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {
                      integrations.filter((i) => i.status === "not_connected")
                        .length
                    }
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Settings className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {integrations.length}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="bg-white border border-blue-100 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white border border-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <integration.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {integration.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      integration.status
                    )}`}
                  >
                    {getStatusIcon(integration.status)}
                    <span className="ml-1 capitalize">
                      {integration.status.replace("_", " ")}
                    </span>
                  </span>
                </div>

                <p className="text-sm text-blue-700 mb-4">
                  {integration.description}
                </p>

                {integration.status === "connected" && integration.lastSync && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Last sync</p>
                    <p className="text-sm text-green-800">
                      {integration.lastSync}
                    </p>
                  </div>
                )}

                {integration.setupRequired &&
                  integration.status === "not_connected" && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-start space-x-2">
                        <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          Setup required
                        </p>
                      </div>
                    </div>
                  )}

                <div className="flex items-center space-x-2">
                  {integration.status === "connected" ? (
                    <>
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Configure</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="flex items-center justify-center py-2 px-3 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                No integrations found
              </h3>
              <p className="text-blue-600 mb-4">
                Try selecting a different category or browse all available
                integrations
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Browse All Integrations
              </button>
            </div>
          )}

          {/* Setup Guide */}
          <div className="bg-white border border-blue-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Setup Guide
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">
                  Getting Started
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Connect your first integration to start syncing data and
                  automating your marketing workflows.
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>1. Choose an integration from the list above</p>
                  <p>2. Click "Connect" and follow the setup instructions</p>
                  <p>3. Configure your preferences and sync settings</p>
                  <p>4. Start using your connected data in campaigns</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">Need Help?</h3>
                <p className="text-sm text-green-800">
                  Our support team is here to help you set up integrations and
                  troubleshoot any issues.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Health Dashboard Tab */}
        <TabsContent value="health">
          <IntegrationHealthDashboard />
        </TabsContent>
      </Tabs>

      {/* Help Center Button */}
      <HelpButton context="settings" />
    </div>
  );
}
