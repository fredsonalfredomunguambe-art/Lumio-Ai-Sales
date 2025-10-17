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
  Zap,
  Users,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface IntegrationGuideProps {
  integration: {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: string;
    features: string[];
    benefits: string[];
    setupSteps: string[];
    credentialFields: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      placeholder?: string;
      description?: string;
      helpUrl?: string;
    }>;
  };
  onClose: () => void;
  onConnect: (credentials: Record<string, string>) => void;
  isConnecting?: boolean;
}

export default function IntegrationOnboardingGuide({
  integration,
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
  const [copiedText, setCopiedText] = useState<string>("");

  const steps = [
    {
      title: "Why connect this integration?",
      content: "benefits",
    },
    {
      title: "How does it work?",
      content: "howItWorks",
    },
    {
      title: "Step-by-step setup",
      content: "setup",
    },
    {
      title: "Connect now",
      content: "connect",
    },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success("Copied!", `${label} copied to clipboard`);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords((prev) => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const handleCredentialChange = (fieldId: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleConnect = () => {
    // Validate required fields
    const requiredFields = integration.credentialFields.filter(
      (field) => field.required
    );
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
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">{integration.icon}</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Connect {integration.name} to Lumio
        </h3>
        <p className="text-gray-600 text-lg">{integration.description}</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          What you'll achieve:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integration.benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h5 className="font-semibold text-gray-900 mb-1">Full Automation</h5>
          <p className="text-sm text-gray-600">Work 24/7 without stopping</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h5 className="font-semibold text-gray-900 mb-1">More Sales</h5>
          <p className="text-sm text-gray-600">Increase conversions by 300%</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h5 className="font-semibold text-gray-900 mb-1">Save Time</h5>
          <p className="text-sm text-gray-600">Gain 20h per week</p>
        </div>
      </div>
    </div>
  );

  const renderHowItWorks = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          How does the integration work?
        </h3>
        <p className="text-gray-600 text-lg">It's simpler than you think!</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              We connect your account
            </h4>
            <p className="text-gray-600">
              You provide your credentials (access keys) securely. It's like
              giving a trusted friend a copy of your house key.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
            2
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              We sync your data
            </h4>
            <p className="text-gray-600">
              Lumio automatically syncs your information. Your contacts,
              campaigns and data are always up to date.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
            3
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-2">
              We automate everything
            </h4>
            <p className="text-gray-600">
              From there, Lumio works alone! Sends emails, messages, updates
              your CRM and much more.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-blue-900 mb-1">100% Secure</h5>
            <p className="text-blue-800 text-sm">
              Your credentials are encrypted and stored with bank-level
              security. You can disconnect at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Step-by-step setup
        </h3>
        <p className="text-gray-600">
          Follow these simple steps to connect your account
        </p>
      </div>

      <div className="space-y-4">
        {integration.setupSteps.map((step, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-gray-900">{step}</p>
              {index === 0 && (
                <button
                  onClick={() => window.open("https://sendgrid.com", "_blank")}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open {integration.name}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-yellow-900 mb-1">
              Important Tip
            </h5>
            <p className="text-yellow-800 text-sm">
              Don't worry if you don't know where to find the credentials. We
              will guide you through each step!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConnect = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Connect {integration.name}
        </h3>
        <p className="text-gray-600">
          Paste your credentials below. Don't worry, everything is secure!
        </p>
      </div>

      <div className="space-y-4">
        {integration.credentialFields.map((field) => (
          <div key={field.id} className="space-y-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            {field.helpUrl && (
              <button
                onClick={() => window.open(field.helpUrl, "_blank")}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Info className="w-3 h-3 mr-1" />
                How to find this information
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h5 className="font-semibold text-green-900 mb-1">
              Automatic Test
            </h5>
            <p className="text-green-800 text-sm">
              As soon as you click "Connect", we'll automatically test if
              everything is working perfectly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (steps[currentStep].content) {
      case "benefits":
        return renderBenefits();
      case "howItWorks":
        return renderHowItWorks();
      case "setup":
        return renderSetup();
      case "connect":
        return renderConnect();
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
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
              <p className="text-blue-100 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full ${
                    index <= currentStep ? "bg-white" : "bg-white bg-opacity-30"
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
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep === steps.length - 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
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
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center"
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
