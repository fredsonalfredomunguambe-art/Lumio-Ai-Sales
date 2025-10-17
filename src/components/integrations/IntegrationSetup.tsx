"use client";

import React, { useState } from "react";
import {
  Mail,
  MessageSquare,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  TestTube,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface IntegrationSetupProps {
  type: "email" | "whatsapp";
  onConnect: (data: any) => void;
}

export default function IntegrationSetup({
  type,
  onConnect,
}: IntegrationSetupProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Email form state
  const [emailForm, setEmailForm] = useState({
    service: "sendgrid",
    apiKey: "",
    fromEmail: "",
    fromName: "",
  });

  // WhatsApp form state
  const [whatsappForm, setWhatsappForm] = useState({
    service: "whatsapp-business",
    accessToken: "",
    phoneNumberId: "",
    businessAccountId: "",
    webhookVerifyToken: "",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/integrations/email/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Email Connected", data.message);
        onConnect(data.data);
        setEmailForm({
          service: "sendgrid",
          apiKey: "",
          fromEmail: "",
          fromName: "",
        });
      } else {
        toast.error("Connection Failed", data.error);
      }
    } catch (error) {
      console.error("Error connecting email:", error);
      toast.error("Error", "Failed to connect email service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/integrations/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(whatsappForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("WhatsApp Connected", data.message);
        onConnect(data.data);
        setWhatsappForm({
          service: "whatsapp-business",
          accessToken: "",
          phoneNumberId: "",
          businessAccountId: "",
          webhookVerifyToken: "",
        });
      } else {
        toast.error("Connection Failed", data.error);
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast.error("Error", "Failed to connect WhatsApp service");
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        type === "email"
          ? "/api/integrations/email/connect"
          : "/api/integrations/whatsapp/connect";
      const formData = type === "email" ? emailForm : whatsappForm;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Test Successful", "Connection test passed!");
      } else {
        toast.error("Test Failed", data.error);
      }
    } catch (error) {
      toast.error("Test Error", "Failed to test connection");
    } finally {
      setIsLoading(false);
    }
  };

  if (type === "email") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Email Service Setup</h3>
            <p className="text-sm text-gray-600">
              Connect your email service for automated outreach
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Service
            </label>
            <select
              value={emailForm.service}
              onChange={(e) =>
                setEmailForm({ ...emailForm, service: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailchimp">Mailchimp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={emailForm.apiKey}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, apiKey: e.target.value })
                }
                placeholder={`Enter your ${emailForm.service} API key`}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecrets ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email
              </label>
              <input
                type="email"
                value={emailForm.fromEmail}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, fromEmail: e.target.value })
                }
                placeholder="noreply@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Name
              </label>
              <input
                type="text"
                value={emailForm.fromName}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, fromName: e.target.value })
                }
                placeholder="Your Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Connect Email Service
            </button>

            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading || !emailForm.apiKey}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </button>
          </div>
        </form>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Setup Instructions:
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>SendGrid:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create account at sendgrid.com</li>
              <li>Generate API key in Settings → API Keys</li>
              <li>Verify your sender email address</li>
              <li>Copy the API key and paste it above</li>
            </ol>
            <p>
              <strong>Mailchimp:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create account at mailchimp.com</li>
              <li>Go to Account → Extras → API Keys</li>
              <li>Generate new API key</li>
              <li>Copy the key and paste it above</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (type === "whatsapp") {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              WhatsApp Business Setup
            </h3>
            <p className="text-sm text-gray-600">
              Connect your WhatsApp Business account for messaging
            </p>
          </div>
        </div>

        <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Service
            </label>
            <select
              value={whatsappForm.service}
              onChange={(e) =>
                setWhatsappForm({ ...whatsappForm, service: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="whatsapp-business">WhatsApp Business API</option>
              <option value="twilio">Twilio WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <div className="relative">
              <input
                type={showSecrets ? "text" : "password"}
                value={whatsappForm.accessToken}
                onChange={(e) =>
                  setWhatsappForm({
                    ...whatsappForm,
                    accessToken: e.target.value,
                  })
                }
                placeholder="Enter your access token"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecrets ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number ID
              </label>
              <input
                type="text"
                value={whatsappForm.phoneNumberId}
                onChange={(e) =>
                  setWhatsappForm({
                    ...whatsappForm,
                    phoneNumberId: e.target.value,
                  })
                }
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Account ID
              </label>
              <input
                type="text"
                value={whatsappForm.businessAccountId}
                onChange={(e) =>
                  setWhatsappForm({
                    ...whatsappForm,
                    businessAccountId: e.target.value,
                  })
                }
                placeholder="123456789012345"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Verify Token (Optional)
            </label>
            <input
              type="text"
              value={whatsappForm.webhookVerifyToken}
              onChange={(e) =>
                setWhatsappForm({
                  ...whatsappForm,
                  webhookVerifyToken: e.target.value,
                })
              }
              placeholder="Your webhook verification token"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Connect WhatsApp
            </button>

            <button
              type="button"
              onClick={testConnection}
              disabled={isLoading || !whatsappForm.accessToken}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </button>
          </div>
        </form>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">
            Setup Instructions:
          </h4>
          <div className="text-sm text-green-800 space-y-2">
            <p>
              <strong>WhatsApp Business API:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create Facebook Developer account</li>
              <li>Create WhatsApp Business app</li>
              <li>Get access token from App Dashboard</li>
              <li>Find Phone Number ID and Business Account ID</li>
              <li>Copy the values and paste them above</li>
            </ol>
            <p>
              <strong>Twilio WhatsApp:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Create Twilio account</li>
              <li>Enable WhatsApp in Console</li>
              <li>Get Account SID and Auth Token</li>
              <li>Format: ACxxxxx:auth_token</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
