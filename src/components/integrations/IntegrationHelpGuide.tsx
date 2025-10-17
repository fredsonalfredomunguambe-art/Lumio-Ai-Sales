"use client";

import React from "react";
import {
  ExternalLink,
  Copy,
  CheckCircle,
  Info,
  AlertCircle,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface IntegrationHelpGuideProps {
  integrationId: string;
  onClose: () => void;
}

export default function IntegrationHelpGuide({
  integrationId,
  onClose,
}: IntegrationHelpGuideProps) {
  const toast = useToast();

  const integrationGuides = {
    sendgrid: {
      name: "SendGrid",
      icon: "📧",
      description: "High-volume transactional email delivery",
      setupUrl: "https://sendgrid.com",
      benefits: [
        "Send emails automatically to leads",
        "Track email performance and delivery rates",
        "Improve email deliverability",
        "Use professional email templates",
        "Scale email campaigns without limits",
      ],
      steps: [
        {
          title: "Create SendGrid Account",
          description: "Go to SendGrid and sign up for a free account",
          action: "Visit SendGrid",
          url: "https://sendgrid.com",
          details: "You get 100 emails per day for free",
        },
        {
          title: "Generate API Key",
          description: "Create a new API key with full access permissions",
          action: "Go to Settings → API Keys → Create API Key",
          details: "Name it 'Lumio Integration' and select 'Full Access'",
        },
        {
          title: "Copy API Key",
          description: "Copy the generated API key (starts with 'SG.')",
          action: "Copy to clipboard",
          details: "Keep this key secure - you'll need it for Lumio",
        },
        {
          title: "Connect to Lumio",
          description: "Paste your API key in the Lumio integration form",
          action: "Paste and test connection",
          details: "Lumio will automatically test the connection",
        },
      ],
      credentials: [
        {
          id: "apiKey",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "SG.your_actual_api_key_here",
          description: "Your SendGrid API key (starts with 'SG.')",
          helpText: "Found in Settings → API Keys → Your API Key",
        },
      ],
      tips: [
        "Start with the free tier (100 emails/day)",
        "Verify your sender domain for better deliverability",
        "Use SendGrid's templates for professional emails",
        "Monitor your sending reputation regularly",
      ],
    },
    mailchimp: {
      name: "Mailchimp",
      icon: "🐵",
      description: "Marketing automation and email campaigns",
      setupUrl: "https://mailchimp.com",
      benefits: [
        "Create automated email campaigns",
        "Segment your audience intelligently",
        "Track campaign performance",
        "Build professional newsletters",
        "Automate customer journeys",
      ],
      steps: [
        {
          title: "Create Mailchimp Account",
          description: "Sign up for a free Mailchimp account",
          action: "Visit Mailchimp",
          url: "https://mailchimp.com",
          details: "Free for up to 2,000 contacts",
        },
        {
          title: "Get API Key",
          description: "Generate an API key from your account settings",
          action: "Account → Extras → API Keys → Create A Key",
          details: "Copy the API key and note your server prefix",
        },
        {
          title: "Find Server Prefix",
          description:
            "Your API key format: 'key-us1' - the 'us1' is your server prefix",
          action: "Note the server prefix",
          details: "Common prefixes: us1, us2, us3, eu1, etc.",
        },
        {
          title: "Connect to Lumio",
          description: "Enter both API key and server prefix in Lumio",
          action: "Paste credentials and test",
          details: "Both fields are required for the connection",
        },
      ],
      credentials: [
        {
          id: "apiKey",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "your_api_key_here",
          description: "Your Mailchimp API key",
          helpText: "Found in Account → Extras → API Keys",
        },
        {
          id: "serverPrefix",
          label: "Server Prefix",
          type: "text",
          required: true,
          placeholder: "us1",
          description: "Your Mailchimp server prefix (e.g., us1, us2, eu1)",
          helpText: "Usually 'us1' for US accounts, found in your API key",
        },
      ],
      tips: [
        "Start with the free plan (2,000 contacts)",
        "Create audience segments for better targeting",
        "Use Mailchimp's automation features",
        "A/B test your email subject lines",
      ],
    },
    whatsapp: {
      name: "WhatsApp Business",
      icon: "💬",
      description: "WhatsApp Business API for messaging",
      setupUrl: "https://business.facebook.com",
      benefits: [
        "Send WhatsApp messages automatically",
        "Share images and documents",
        "Track message delivery status",
        "Use professional message templates",
        "Reach customers on their preferred channel",
      ],
      steps: [
        {
          title: "Create Meta Business Account",
          description: "Set up a Meta Business account for WhatsApp Business",
          action: "Visit Meta Business",
          url: "https://business.facebook.com",
          details: "You'll need a Facebook account to get started",
        },
        {
          title: "Set Up WhatsApp Business",
          description: "Add WhatsApp Business to your Meta Business account",
          action: "Business Manager → WhatsApp Business → Get Started",
          details: "Verify your phone number via SMS",
        },
        {
          title: "Get API Credentials",
          description:
            "Find your Phone Number ID, Access Token, and Business Account ID",
          action: "WhatsApp Business → API Setup",
          details: "Copy all three credentials - you'll need them all",
        },
        {
          title: "Connect to Lumio",
          description: "Enter all three credentials in the Lumio form",
          action: "Paste credentials and test connection",
          details: "Lumio will verify the connection is working",
        },
      ],
      credentials: [
        {
          id: "accessToken",
          label: "Access Token",
          type: "password",
          required: true,
          placeholder: "EAA...",
          description: "Your WhatsApp Business access token",
          helpText: "Found in WhatsApp Business → API Setup",
        },
        {
          id: "phoneNumberId",
          label: "Phone Number ID",
          type: "text",
          required: true,
          placeholder: "123456789012345",
          description: "Your WhatsApp Business phone number ID",
          helpText: "Numeric ID for your verified phone number",
        },
        {
          id: "businessAccountId",
          label: "Business Account ID",
          type: "text",
          required: true,
          placeholder: "1234567890123456",
          description: "Your WhatsApp Business account ID",
          helpText: "Found in your Meta Business account settings",
        },
      ],
      tips: [
        "Start with the sandbox for testing",
        "Use approved message templates for marketing",
        "Respect WhatsApp's messaging policies",
        "Monitor your message quality rating",
      ],
    },
    linkedin: {
      name: "LinkedIn",
      icon: "💼",
      description: "Professional networking and lead generation",
      setupUrl: "https://linkedin.com/developers",
      benefits: [
        "Find and connect with prospects",
        "Import LinkedIn contact information",
        "Track LinkedIn engagement",
        "Automate LinkedIn outreach",
        "Build professional relationships",
      ],
      steps: [
        {
          title: "Create LinkedIn App",
          description: "Create a LinkedIn Developer application",
          action: "Visit LinkedIn Developers",
          url: "https://linkedin.com/developers",
          details: "You'll need a LinkedIn account with a company page",
        },
        {
          title: "Configure App Settings",
          description: "Set up your LinkedIn app with proper permissions",
          action: "Create new app → Configure settings",
          details: "Connect your company page and set privacy policy URL",
        },
        {
          title: "Request Permissions",
          description:
            "Request access to LinkedIn Marketing Developer Platform",
          action: "Products → Request Access",
          details:
            "Request Marketing Developer Platform and Sign In with LinkedIn",
        },
        {
          title: "Get Credentials",
          description: "Copy your Client ID and Client Secret",
          action: "Auth → OAuth 2.0 settings",
          details: "You'll need both Client ID and Client Secret",
        },
      ],
      credentials: [
        {
          id: "clientId",
          label: "Client ID",
          type: "text",
          required: true,
          placeholder: "86...",
          description: "Your LinkedIn app Client ID",
          helpText: "Found in Auth → OAuth 2.0 settings",
        },
        {
          id: "clientSecret",
          label: "Client Secret",
          type: "password",
          required: true,
          placeholder: "your_client_secret_here",
          description: "Your LinkedIn app Client Secret",
          helpText: "Generate new secret in Auth → OAuth 2.0 settings",
        },
      ],
      tips: [
        "Connect your company LinkedIn page",
        "Request appropriate API permissions",
        "Respect LinkedIn's rate limits",
        "Use professional messaging templates",
      ],
    },
    hubspot: {
      name: "HubSpot",
      icon: "🟠",
      description: "All-in-one CRM and marketing platform",
      setupUrl: "https://hubspot.com",
      benefits: [
        "Sync contacts automatically",
        "Track deal progress and pipeline",
        "Automate marketing workflows",
        "Get comprehensive analytics",
        "Manage all customer interactions",
      ],
      steps: [
        {
          title: "Create HubSpot Account",
          description: "Sign up for a free HubSpot account",
          action: "Visit HubSpot",
          url: "https://hubspot.com",
          details: "Free CRM with unlimited contacts",
        },
        {
          title: "Create Private App",
          description: "Generate a private app for API access",
          action: "Settings → Integrations → Private Apps → Create",
          details: "Give it a name like 'Lumio Integration'",
        },
        {
          title: "Set Permissions",
          description: "Configure the private app permissions",
          action: "Select required scopes",
          details: "Enable contacts, deals, and companies access",
        },
        {
          title: "Get API Key",
          description: "Copy your private app token",
          action: "Copy the access token",
          details: "This is your API key for Lumio",
        },
      ],
      credentials: [
        {
          id: "privateAppToken",
          label: "Private App Token",
          type: "password",
          required: true,
          placeholder: "pat-...",
          description: "Your HubSpot private app access token",
          helpText: "Found in Settings → Integrations → Private Apps",
        },
      ],
      tips: [
        "Start with the free CRM plan",
        "Set up proper contact properties",
        "Use HubSpot's automation features",
        "Regularly sync data for best results",
      ],
    },
  };

  const guide =
    integrationGuides[integrationId as keyof typeof integrationGuides];

  if (!guide) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Integration Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The integration guide you're looking for doesn't exist.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", `${label} copied to clipboard`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{guide.icon}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {guide.name} Integration Guide
                </h2>
                <p className="text-blue-100">{guide.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-8">
          {/* Benefits */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              What you'll achieve:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guide.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Setup Steps */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ArrowRight className="w-5 h-5 mr-2 text-blue-600" />
              Step-by-step setup:
            </h3>
            <div className="space-y-4">
              {guide.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 mb-2">{step.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 font-medium">
                        {step.action}
                      </span>
                      {step.url && (
                        <button
                          onClick={() => window.open(step.url, "_blank")}
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Required credentials:
            </h3>
            <div className="space-y-3">
              {guide.credentials.map((credential, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {credential.label}
                    </h4>
                    {credential.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{credential.description}</p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-sm text-gray-800">
                      {credential.placeholder}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          credential.placeholder,
                          credential.label
                        )
                      }
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {credential.helpText}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Pro tips:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {guide.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                >
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Your credentials are encrypted and stored securely</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open(guide.setupUrl, "_blank")}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open {guide.name}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
