"use client";

import React, { useState } from "react";
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface CredentialField {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "email";
  placeholder: string;
  required: boolean;
  description?: string;
}

interface IntegrationCredentialsFormProps {
  integrationId: string;
  integrationName: string;
  fields: CredentialField[];
  onConnect: (credentials: Record<string, string>) => void;
  onCancel: () => void;
  isConnecting?: boolean;
}

export default function IntegrationCredentialsForm({
  integrationId,
  integrationName,
  fields,
  onConnect,
  onCancel,
  isConnecting = false,
}: IntegrationCredentialsFormProps) {
  const toast = useToast();
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (key: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !credentials[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }

      if (field.type === "email" && credentials[field.key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials[field.key])) {
          newErrors[field.key] = "Please enter a valid email address";
        }
      }

      if (field.type === "url" && credentials[field.key]) {
        try {
          new URL(credentials[field.key]);
        } catch {
          newErrors[field.key] = "Please enter a valid URL";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(
        "Validation Error",
        "Please fill in all required fields correctly"
      );
      return;
    }

    onConnect(credentials);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Connect {integrationName}
        </h3>
        <p className="text-gray-600">
          Enter your {integrationName} credentials to connect this integration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <div className="relative">
              <input
                type={
                  field.type === "password"
                    ? showPasswords[field.key]
                      ? "text"
                      : "password"
                    : field.type
                }
                value={credentials[field.key] || ""}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[field.key]
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                disabled={isConnecting}
              />

              {field.type === "password" && (
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field.key)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isConnecting}
                >
                  {showPasswords[field.key] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {field.description && (
              <p className="text-xs text-gray-500 mt-1">{field.description}</p>
            )}

            {errors[field.key] && (
              <p className="text-xs text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isConnecting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isConnecting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Connect
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
