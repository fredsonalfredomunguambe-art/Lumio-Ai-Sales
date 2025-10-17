"use client";

import React, { useState, useEffect } from "react";
import {
  Link,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  X,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import LinkedInIntegration from "./LinkedInIntegration";
import WhatsAppIntegration from "./WhatsAppIntegration";
import SimplifiedIntegrationSetup from "./SimplifiedIntegrationSetup";
import IntegrationOnboardingGuide from "./IntegrationOnboardingGuide";
import IntegrationHelpGuide from "./IntegrationHelpGuide";
import { INTEGRATION_TYPES } from "@/lib/integrations";

interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  connectedAt?: string;
  lastSync?: string;
  icon: string;
  features: string[];
  setupUrl?: string;
  docsUrl?: string;
  setupSteps?: string[];
  benefits?: string[];
}

interface IntegrationManagerProps {
  onIntegrationChange?: (integration: Integration) => void;
}

export default function IntegrationManager({
  onIntegrationChange,
}: IntegrationManagerProps) {
  const toast = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null
  );
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSimplifiedSetup, setShowSimplifiedSetup] = useState(false);
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [selectedHelpIntegration, setSelectedHelpIntegration] = useState<
    string | null
  >(null);

  // Load integrations on mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  // Helper function to get credential fields for an integration
  const getCredentialFields = (integrationId: string) => {
    const integration = Object.values(INTEGRATION_TYPES).find(
      (i) => i.id === integrationId
    );

    if (!integration?.requiredCredentials) return [];

    return integration.requiredCredentials.map((cred) => {
      const fieldConfigs: Record<string, any> = {
        apiKey: {
          label: "API Key",
          type: "password",
          placeholder: "Enter your API key",
          description: "Your API key for authentication",
        },
        apiToken: {
          label: "API Token",
          type: "password",
          placeholder: "Enter your API token",
          description: "Your API token for authentication",
        },
        privateAppToken: {
          label: "Private App Token",
          type: "password",
          placeholder: "Enter your private app token",
          description: "Your private app access token",
        },
        clientId: {
          label: "Client ID",
          type: "text",
          placeholder: "Enter your client ID",
          description: "Your OAuth client ID",
        },
        clientSecret: {
          label: "Client Secret",
          type: "password",
          placeholder: "Enter your client secret",
          description: "Your OAuth client secret",
        },
        botToken: {
          label: "Bot Token",
          type: "password",
          placeholder: "Enter your bot token",
          description: "Your bot access token",
        },
        accessToken: {
          label: "Access Token",
          type: "password",
          placeholder: "Enter your access token",
          description: "Your access token for API authentication",
        },
        phoneNumberId: {
          label: "Phone Number ID",
          type: "text",
          placeholder: "Enter your phone number ID",
          description: "Your WhatsApp Business phone number ID",
        },
        businessAccountId: {
          label: "Business Account ID",
          type: "text",
          placeholder: "Enter your business account ID",
          description: "Your WhatsApp Business account ID",
        },
        serverPrefix: {
          label: "Server Prefix",
          type: "text",
          placeholder: "Enter your server prefix (e.g., us1)",
          description: "Your Mailchimp server prefix",
        },
        shopDomain: {
          label: "Shop Domain",
          type: "url",
          placeholder: "your-shop.myshopify.com",
          description: "Your Shopify store domain",
        },
        storeUrl: {
          label: "Store URL",
          type: "url",
          placeholder: "https://yourstore.com",
          description: "Your WooCommerce store URL",
        },
        consumerKey: {
          label: "Consumer Key",
          type: "text",
          placeholder: "Enter your consumer key",
          description: "Your WooCommerce consumer key",
        },
        consumerSecret: {
          label: "Consumer Secret",
          type: "password",
          placeholder: "Enter your consumer secret",
          description: "Your WooCommerce consumer secret",
        },
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
          description: "Your account username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
          description: "Your account password",
        },
        securityToken: {
          label: "Security Token",
          type: "password",
          placeholder: "Enter your security token",
          description: "Your security token for additional authentication",
        },
        refreshToken: {
          label: "Refresh Token",
          type: "password",
          placeholder: "Enter your refresh token",
          description: "Your OAuth refresh token",
        },
        propertyId: {
          label: "Property ID",
          type: "text",
          placeholder: "Enter your property ID",
          description: "Your Google Analytics property ID",
        },
        projectToken: {
          label: "Project Token",
          type: "text",
          placeholder: "Enter your project token",
          description: "Your Mixpanel project token",
        },
        publishableKey: {
          label: "Publishable Key",
          type: "text",
          placeholder: "Enter your publishable key",
          description: "Your Stripe publishable key",
        },
        secretKey: {
          label: "Secret Key",
          type: "password",
          placeholder: "Enter your secret key",
          description: "Your Stripe secret key",
        },
        accessKeyId: {
          label: "Access Key ID",
          type: "text",
          placeholder: "Enter your access key ID",
          description: "Your AWS access key ID",
        },
        secretAccessKey: {
          label: "Secret Access Key",
          type: "password",
          placeholder: "Enter your secret access key",
          description: "Your AWS secret access key",
        },
        bucketName: {
          label: "Bucket Name",
          type: "text",
          placeholder: "Enter your bucket name",
          description: "Your AWS S3 bucket name",
        },
        region: {
          label: "Region",
          type: "text",
          placeholder: "Enter your region (e.g., us-east-1)",
          description: "Your AWS region",
        },
        cloudName: {
          label: "Cloud Name",
          type: "text",
          placeholder: "Enter your cloud name",
          description: "Your Cloudinary cloud name",
        },
        apiSecret: {
          label: "API Secret",
          type: "password",
          placeholder: "Enter your API secret",
          description: "Your Cloudinary API secret",
        },
      };

      const config = fieldConfigs[cred] || {
        label: cred,
        type: "text",
        placeholder: `Enter your ${cred}`,
        description: `Your ${cred} for authentication`,
      };

      return {
        id: cred,
        label: config.label,
        type: config.type,
        required: true,
        placeholder: config.placeholder,
        description: config.description,
      };
    });
  };

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
    try {
      const integration = integrations.find((i) => i.id === integrationId);
      if (!integration) return;

      // Show onboarding guide for non-technical users
      setSelectedIntegration(integrationId);
      setShowOnboardingGuide(true);
    } catch (error) {
      console.error("Error connecting integration:", error);
      toast.error("Connection Failed", "Failed to connect integration");
    }
  };

  const handleShowHelp = (integrationId: string) => {
    setSelectedHelpIntegration(integrationId);
    setShowHelpGuide(true);
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
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
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

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations</h2>
          <p className="text-gray-600 mt-1">
            Connect your tools and services to maximize Lumio's capabilities
          </p>
        </div>
        <button
          onClick={loadIntegrations}
          className="btn-ghost flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(
        ([category, categoryIntegrations]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {category} Integrations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">
                            {integration.icon}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {integration.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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

                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Features:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {integration.connectedAt && (
                        <div className="text-xs text-gray-500">
                          Connected:{" "}
                          {new Date(
                            integration.connectedAt
                          ).toLocaleDateString()}
                        </div>
                      )}

                      {integration.lastSync && (
                        <div className="text-xs text-gray-500">
                          Last sync:{" "}
                          {new Date(integration.lastSync).toLocaleString()}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                        {integration.status === "connected" ? (
                          <>
                            <button
                              onClick={() => handleTest(integration.id)}
                              className="btn-ghost btn-sm flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Test</span>
                            </button>
                            <button
                              onClick={() => handleDisconnect(integration.id)}
                              className="btn-ghost btn-sm text-red-600 hover:bg-red-50 flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Disconnect</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleConnect(integration.id)}
                            className="btn-primary btn-sm flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Connect</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleShowHelp(integration.id)}
                          className="btn-ghost btn-sm flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Help</span>
                        </button>

                        {integration.docsUrl && (
                          <a
                            href={integration.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost btn-sm flex items-center space-x-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Docs</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Special Integration Components */}
      {selectedIntegration === "linkedin" && (
        <LinkedInIntegration
          onLeadsImported={(leads) => {
            toast.success(
              "Leads Imported",
              `Imported ${leads.length} leads from LinkedIn`
            );
            setShowSetupModal(false);
            setSelectedIntegration(null);
          }}
          onConnectionStatusChange={(connected) => {
            if (connected) {
              loadIntegrations();
            }
          }}
        />
      )}

      {selectedIntegration === "whatsapp" && (
        <WhatsAppIntegration
          onMessageSent={(message) => {
            toast.success("Message Sent", "WhatsApp message sent successfully");
          }}
          onConnectionStatusChange={(connected) => {
            if (connected) {
              loadIntegrations();
            }
          }}
        />
      )}

      {/* Onboarding Guide Modal */}
      {showOnboardingGuide && selectedIntegration && (
        <IntegrationOnboardingGuide
          integration={{
            id: selectedIntegration,
            name:
              integrations.find((i) => i.id === selectedIntegration)?.name ||
              "",
            category:
              integrations.find((i) => i.id === selectedIntegration)
                ?.category || "",
            description:
              integrations.find((i) => i.id === selectedIntegration)
                ?.description || "",
            icon:
              integrations.find((i) => i.id === selectedIntegration)?.icon ||
              "",
            features:
              integrations.find((i) => i.id === selectedIntegration)
                ?.features || [],
            benefits:
              integrations.find((i) => i.id === selectedIntegration)
                ?.benefits || [],
            setupSteps:
              integrations.find((i) => i.id === selectedIntegration)
                ?.setupSteps || [],
            credentialFields: getCredentialFields(selectedIntegration),
          }}
          onClose={() => {
            setShowOnboardingGuide(false);
            setSelectedIntegration(null);
          }}
          onConnect={async (credentials) => {
            try {
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
                toast.success(
                  "Connected Successfully!",
                  `${
                    integrations.find((i) => i.id === selectedIntegration)?.name
                  } is now connected`
                );
                setShowOnboardingGuide(false);
                setSelectedIntegration(null);
                loadIntegrations();
              } else {
                toast.error(
                  "Connection Failed",
                  data.error || "Please check your credentials and try again"
                );
              }
            } catch (error) {
              toast.error(
                "Connection Failed",
                "Please check your credentials and try again"
              );
            }
          }}
        />
      )}

      {/* Help Guide Modal */}
      {showHelpGuide && selectedHelpIntegration && (
        <IntegrationHelpGuide
          integrationId={selectedHelpIntegration}
          onClose={() => {
            setShowHelpGuide(false);
            setSelectedHelpIntegration(null);
          }}
        />
      )}

      {/* Simplified Setup Modal */}
      {showSimplifiedSetup && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Connect Integration
                </h3>
                <button
                  onClick={() => {
                    setShowSimplifiedSetup(false);
                    setSelectedIntegration(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {(() => {
                const integration = integrations.find(
                  (i) => i.id === selectedIntegration
                );
                if (!integration) return null;

                return (
                  <SimplifiedIntegrationSetup
                    integration={{
                      id: integration.id,
                      name: integration.name,
                      description: integration.description,
                      category: integration.category,
                      setupSteps: integration.setupSteps || [],
                      benefits: integration.benefits || [],
                      icon: integration.icon,
                      status: "not_connected",
                    }}
                    onComplete={() => {
                      setShowSimplifiedSetup(false);
                      setSelectedIntegration(null);
                      loadIntegrations(); // Refresh integrations
                    }}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetupModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Setup Integration
                </h3>
                <button
                  onClick={() => {
                    setShowSetupModal(false);
                    setSelectedIntegration(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Integration Setup
                </h4>
                <p className="text-gray-600 mb-6">
                  Follow the setup guide to connect your integration.
                </p>
                <a
                  href="/integration-setup-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Setup Guide</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
