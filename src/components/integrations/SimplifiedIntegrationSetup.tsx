"use client";

import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import IntegrationCredentialsForm from "./IntegrationCredentialsForm";
import { INTEGRATION_TYPES } from "@/lib/integrations";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  setupSteps: string[];
  benefits: string[];
  icon: string;
  status: "not_connected" | "connecting" | "connected" | "error";
}

interface SimplifiedIntegrationSetupProps {
  integration: Integration;
  onComplete?: () => void;
}

export default function SimplifiedIntegrationSetup({
  integration,
  onComplete,
}: SimplifiedIntegrationSetupProps) {
  const toast = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<Integration["status"]>("not_connected");

  const handleConnect = async (credentials: Record<string, string>) => {
    setIsConnecting(true);
    setConnectionStatus("connecting");

    try {
      // Connect to the real API
      const response = await fetch(
        `/api/integrations/${integration.id}/connect`,
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
        setConnectionStatus("connected");
        toast.success(
          "Connected Successfully!",
          `${integration.name} is now connected and ready to use`
        );

        if (onComplete) {
          onComplete();
        }
      } else {
        setConnectionStatus("error");
        toast.error(
          "Connection Failed",
          data.error || "Please check your credentials and try again"
        );
      }
    } catch (error) {
      setConnectionStatus("error");
      toast.error(
        "Connection Failed",
        "Please check your credentials and try again"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  // Get integration configuration
  const integrationConfig =
    INTEGRATION_TYPES[integration.id as keyof typeof INTEGRATION_TYPES];

  // Convert required credentials to form fields
  const credentialFields =
    integrationConfig?.requiredCredentials?.map((cred) => {
      const fieldConfigs: Record<string, any> = {
        apiKey: {
          label: "API Key",
          type: "password",
          placeholder: "Enter your API key",
        },
        apiToken: {
          label: "API Token",
          type: "password",
          placeholder: "Enter your API token",
        },
        privateAppToken: {
          label: "Private App Token",
          type: "password",
          placeholder: "Enter your private app token",
        },
        clientId: {
          label: "Client ID",
          type: "text",
          placeholder: "Enter your client ID",
        },
        clientSecret: {
          label: "Client Secret",
          type: "password",
          placeholder: "Enter your client secret",
        },
        botToken: {
          label: "Bot Token",
          type: "password",
          placeholder: "Enter your bot token",
        },
        accessToken: {
          label: "Access Token",
          type: "password",
          placeholder: "Enter your access token",
        },
        phoneNumberId: {
          label: "Phone Number ID",
          type: "text",
          placeholder: "Enter your phone number ID",
        },
        businessAccountId: {
          label: "Business Account ID",
          type: "text",
          placeholder: "Enter your business account ID",
        },
        serverPrefix: {
          label: "Server Prefix",
          type: "text",
          placeholder: "Enter your server prefix (e.g., us1)",
        },
        shopDomain: {
          label: "Shop Domain",
          type: "url",
          placeholder: "your-shop.myshopify.com",
        },
        storeUrl: {
          label: "Store URL",
          type: "url",
          placeholder: "https://yourstore.com",
        },
        consumerKey: {
          label: "Consumer Key",
          type: "text",
          placeholder: "Enter your consumer key",
        },
        consumerSecret: {
          label: "Consumer Secret",
          type: "password",
          placeholder: "Enter your consumer secret",
        },
        username: {
          label: "Username",
          type: "text",
          placeholder: "Enter your username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
        securityToken: {
          label: "Security Token",
          type: "password",
          placeholder: "Enter your security token",
        },
        refreshToken: {
          label: "Refresh Token",
          type: "password",
          placeholder: "Enter your refresh token",
        },
        propertyId: {
          label: "Property ID",
          type: "text",
          placeholder: "Enter your property ID",
        },
        projectToken: {
          label: "Project Token",
          type: "text",
          placeholder: "Enter your project token",
        },
        publishableKey: {
          label: "Publishable Key",
          type: "text",
          placeholder: "Enter your publishable key",
        },
        secretKey: {
          label: "Secret Key",
          type: "password",
          placeholder: "Enter your secret key",
        },
        accessKeyId: {
          label: "Access Key ID",
          type: "text",
          placeholder: "Enter your access key ID",
        },
        secretAccessKey: {
          label: "Secret Access Key",
          type: "password",
          placeholder: "Enter your secret access key",
        },
        bucketName: {
          label: "Bucket Name",
          type: "text",
          placeholder: "Enter your bucket name",
        },
        region: {
          label: "Region",
          type: "text",
          placeholder: "Enter your region (e.g., us-east-1)",
        },
        cloudName: {
          label: "Cloud Name",
          type: "text",
          placeholder: "Enter your cloud name",
        },
        apiSecret: {
          label: "API Secret",
          type: "password",
          placeholder: "Enter your API secret",
        },
      };

      const config = fieldConfigs[cred] || {
        label: cred,
        type: "text",
        placeholder: `Enter your ${cred}`,
      };

      return {
        key: cred,
        label: config.label,
        type: config.type as "text" | "password" | "url" | "email",
        placeholder: config.placeholder,
        required: true,
        description: config.description,
      };
    }) || [];

  if (connectionStatus === "connected") {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Connected Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          {integration.name} is now connected and ready to use
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <IntegrationCredentialsForm
      integrationId={integration.id}
      integrationName={integration.name}
      fields={credentialFields}
      onConnect={handleConnect}
      onCancel={onComplete}
      isConnecting={isConnecting}
    />
  );
}
