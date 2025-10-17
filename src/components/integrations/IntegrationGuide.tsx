"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Clock,
  Users,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface IntegrationGuideProps {
  integrationId: string;
  onClose: () => void;
  onConnect: (credentials: Record<string, string>) => void;
  isConnecting?: boolean;
}

const integrationGuides = {
  hubspot: {
    name: "HubSpot",
    icon: "HubSpot",
    description: "All-in-one CRM and marketing platform",
    setupTime: "3 minutes",
    benefits: [
      "Sync all contacts automatically",
      "Track deal progress in real-time",
      "Automate marketing workflows",
      "Get comprehensive analytics",
    ],
    steps: [
      {
        title: "Go to HubSpot Settings",
        description: "Navigate to Settings → Integrations → Private Apps",
        action: "Open HubSpot",
        url: "https://app.hubspot.com/settings/private-apps",
        details: "You need admin access to create Private Apps",
      },
      {
        title: "Create Private App",
        description:
          "Click 'Create Private App' and name it 'Lumio Integration'",
        action: "Create App",
        details: "Give it a descriptive name for easy identification",
      },
      {
        title: "Enable Scopes",
        description:
          "Enable these scopes: contacts.read, contacts.write, deals.read, deals.write",
        action: "Select Scopes",
        details: "These permissions allow Lumio to sync your data",
      },
      {
        title: "Copy API Token",
        description: "Copy the generated API token (starts with 'pat-')",
        action: "Copy Token",
        details: "Keep this token secure - you'll need it for Lumio",
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
    whatHappensNext: [
      "All your contacts will be imported within 2-5 minutes",
      "New contacts will sync automatically in real-time",
      "Deal stages will update every 15 minutes",
      "Full data reconciliation happens daily at 2 AM",
    ],
    useCases: [
      "E-commerce: Track customer purchases as deals",
      "B2B SaaS: Monitor trial-to-paid conversions",
      "Services: Manage client projects and billing",
    ],
  },

  linkedin: {
    name: "LinkedIn",
    icon: "LinkedIn",
    description: "Professional networking and lead generation",
    setupTime: "5 minutes",
    benefits: [
      "Find leads on LinkedIn",
      "Import contact information",
      "Track LinkedIn interactions",
      "Automate LinkedIn outreach",
    ],
    steps: [
      {
        title: "Create LinkedIn Developer Account",
        description: "Go to LinkedIn Developers and create a new app",
        action: "Open LinkedIn Developers",
        url: "https://linkedin.com/developers",
        details: "You need a LinkedIn account with a company page",
      },
      {
        title: "Configure App Settings",
        description: "Set up your LinkedIn app with proper permissions",
        action: "Create App",
        details: "Connect your company page and set privacy policy URL",
      },
      {
        title: "Request Permissions",
        description: "Request access to LinkedIn Marketing Developer Platform",
        action: "Request Access",
        details:
          "Request Marketing Developer Platform and Sign In with LinkedIn",
      },
      {
        title: "Get Credentials",
        description: "Copy your Client ID and Client Secret",
        action: "Copy Credentials",
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
    whatHappensNext: [
      "Search functionality will be activated for target profiles",
      "Daily: 100 profile views (Premium limit)",
      "Weekly: 50 connection requests sent",
      "Real-time: Activity tracking and engagement metrics",
    ],
    useCases: [
      "B2B SaaS: Find CTOs and VPs of Engineering",
      "Consulting: Connect with C-level executives",
      "Recruiting: Source qualified candidates",
    ],
  },

  whatsapp: {
    name: "WhatsApp Business",
    icon: "WhatsApp",
    description: "WhatsApp Business API for messaging",
    setupTime: "10 minutes",
    benefits: [
      "Send WhatsApp messages automatically",
      "Share images and documents",
      "Track message status",
      "Professional messaging templates",
    ],
    steps: [
      {
        title: "Create Meta Business Account",
        description: "Set up a Meta Business account for WhatsApp Business",
        action: "Open Meta Business",
        url: "https://business.facebook.com",
        details: "You'll need a Facebook account to get started",
      },
      {
        title: "Set Up WhatsApp Business",
        description: "Add WhatsApp Business to your Meta Business account",
        action: "Get Started",
        details: "Verify your phone number via SMS",
      },
      {
        title: "Get API Credentials",
        description:
          "Find your Phone Number ID, Access Token, and Business Account ID",
        action: "Copy Credentials",
        details: "Copy all three credentials - you'll need them all",
      },
      {
        title: "Create Message Templates",
        description: "Create approved message templates for your use cases",
        action: "Create Templates",
        details: "Templates must be approved by WhatsApp before use",
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
    whatHappensNext: [
      "Template messages will be ready to send immediately",
      "24/7: Auto-responses to customer inquiries",
      "Real-time: Delivery status tracking",
      "Daily: Message analytics and performance reports",
    ],
    useCases: [
      "E-commerce: Order confirmations, shipping updates",
      "Services: Appointment reminders, confirmations",
      "Support: Automated FAQs, ticket routing",
    ],
  },
};

export default function IntegrationGuide({
  integrationId,
  onClose,
  onConnect,
  isConnecting = false,
}: IntegrationGuideProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const guide =
    integrationGuides[integrationId as keyof typeof integrationGuides];

  if (!guide) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Integration Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The integration guide you're looking for doesn't exist.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { title: "What you'll get", content: "benefits" },
    { title: "Setup steps", content: "setup" },
    { title: "Enter credentials", content: "credentials" },
    { title: "What happens next", content: "next" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!", `${label} copied to clipboard`);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleConnect = () => {
    // Validate required fields
    const requiredFields = guide.credentials.filter((field) => field.required);
    const missingFields = requiredFields.filter(
      (field) => !credentials[field.id]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(
        "Required fields",
        `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`
      );
      return;
    }

    onConnect(credentials);
  };

  const renderBenefits = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-gray-600">{guide.icon}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect {guide.name}
        </h3>
        <p className="text-gray-600 text-sm">{guide.description}</p>
        <div className="flex items-center justify-center space-x-1 mt-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">
            Setup time: {guide.setupTime}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-gray-600" />
          What you'll achieve:
        </h4>
        <div className="space-y-2">
          {guide.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Setup Steps
        </h3>
        <p className="text-gray-600 text-sm">
          Follow these simple steps to connect your account
        </p>
      </div>

      <div className="space-y-3">
        {guide.steps.map((step, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-xs">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-gray-600 mb-2">{step.description}</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{step.action}</span>
                {step.url && (
                  <button
                    onClick={() => window.open(step.url, "_blank")}
                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
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
  );

  const renderCredentials = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enter Your Credentials
        </h3>
        <p className="text-gray-600 text-sm">
          Paste your credentials below. Everything is secure!
        </p>
      </div>

      <div className="space-y-3">
        {guide.credentials.map((field) => (
          <div key={field.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
              <input
                type={
                  field.type === "password" && !showPasswords[field.id]
                    ? "password"
                    : "text"
                }
                value={credentials[field.id] || ""}
                onChange={(e) =>
                  handleCredentialChange(field.id, e.target.value)
                }
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                disabled={isConnecting}
              />

              {field.type === "password" && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.id)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isConnecting}
                >
                  {showPasswords[field.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}

            {field.helpText && (
              <button
                onClick={() => copyToClipboard(field.placeholder, field.label)}
                className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
              >
                <Info className="w-3 h-3 mr-1" />
                {field.helpText}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="text-sm font-medium text-green-900 mb-1">
              Automatic Test
            </h5>
            <p className="text-green-800 text-xs">
              We'll automatically test your connection when you click "Connect"!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNext = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          What Happens Next
        </h3>
        <p className="text-gray-600 text-sm">
          Here's what will happen after you connect
        </p>
      </div>

      <div className="space-y-3">
        {guide.whatHappensNext.map((item, index) => (
          <div key={index} className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-700">{item}</span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Use Cases</h4>
        <div className="space-y-1">
          {guide.useCases.map((useCase, index) => (
            <div key={index} className="text-xs text-blue-800">
              • {useCase}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case "benefits":
        return renderBenefits();
      case "setup":
        return renderSetup();
      case "credentials":
        return renderCredentials();
      case "next":
        return renderNext();
      default:
        return renderBenefits();
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-300 text-sm">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full ${
                    index <= currentStep ? "bg-white" : "bg-gray-600"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep === steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center text-sm"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Connect Now
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={nextStep}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center text-sm"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
