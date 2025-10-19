"use client";

import React, { useState } from "react";
import {
  Building2,
  Bot,
  Link,
  Users,
  CreditCard,
  Shield,
  Save,
  Upload,
  Plus,
  CheckCircle,
  Sun,
  Moon,
  MessageSquare,
  Settings,
  Zap,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/components/NotificationSystem";
import MarvinConfigModal from "@/components/MarvinConfigModal";
import MarvinChatInterface from "@/components/marvin/MarvinChatInterface";
import WorldClassIntegrationManager from "@/components/integrations/WorldClassIntegrationManager";

interface Tab {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: "company",
    name: "Company",
    icon: Building2,
    description: "Company profile and settings",
  },
  {
    id: "marvin",
    name: "Marvin Training",
    icon: Bot,
    description: "AI voice and behavior settings",
  },
  {
    id: "integrations",
    name: "Integrations",
    icon: Link,
    description: "Connect external services",
  },
  {
    id: "users",
    name: "Users & Roles",
    icon: Users,
    description: "Team management and permissions",
  },
  {
    id: "billing",
    name: "Billing",
    icon: CreditCard,
    description: "Subscription and payment",
  },
  {
    id: "security",
    name: "Security",
    icon: Shield,
    description: "Security and compliance",
  },
];

export default function SettingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMarvinConfigOpen, setIsMarvinConfigOpen] = useState(false);
  const [isMarvinChatOpen, setIsMarvinChatOpen] = useState(false);
  const [marvinConfig] = useState<{
    companyName?: string;
    industry?: string;
    tone?: string;
    pricing?: Array<{ name: string; price: string; features: string[] }>;
  } | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "Lumio Inc.",
    website: "https://lumio.com",
    industry: "Technology",
    size: "11-50 employees",
    logo: "",
  });
  const [integrations] = useState([
    // Core Integrations - Essential for all business types
    {
      name: "HubSpot",
      category: "CRM",
      connected: false,
      status: "Not Connected",
      description: "Sync leads, contacts, and deals",
      icon: "CRM",
      features: ["Lead sync", "Deal tracking", "Contact management"],
    },
    {
      name: "Shopify",
      category: "E-commerce",
      connected: false,
      status: "Not Connected",
      description: "E-commerce store integration",
      icon: "Store",
      features: ["Product sync", "Order tracking", "Customer data"],
    },
    {
      name: "WhatsApp Business",
      category: "Communication",
      connected: false,
      status: "Not Connected",
      description: "WhatsApp Business API integration",
      icon: "Message",
      features: ["Automated messages", "Media sharing", "Template messages"],
    },
    {
      name: "SendGrid",
      category: "Email",
      connected: false,
      status: "Not Connected",
      description: "Email delivery service",
      icon: "Mail",
      features: ["Transactional emails", "Email templates", "Analytics"],
    },
  ]);
  const [users] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john@lumio.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@lumio.com",
      role: "User",
      status: "Active",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@lumio.com",
      role: "User",
      status: "Pending",
    },
  ]);
  const [billingData] = useState({
    plan: "Pro",
    price: "$299/month",
    nextBilling: "2024-02-15",
    usage: {
      leads: 1234,
      limit: 5000,
      campaigns: 12,
      limitCampaigns: 50,
    },
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: 24,
    ipWhitelist: [],
    auditLog: true,
  });

  // const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
  //   null
  // );

  // const handleConnect = (data: { service: string }) => {
  //   toast.success(
  //     "Integration Connected",
  //     `${data.service} connected successfully`
  //   );
  //   setSelectedIntegration(null);
  //   // TODO: Update integrations state
  // };

  const renderCompanyTab = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-50">
          Company Information
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Update your company details and branding
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name
          </label>
          <input
            type="text"
            value={companyData.name}
            onChange={(e) =>
              setCompanyData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={companyData.website}
            onChange={(e) =>
              setCompanyData((prev) => ({ ...prev, website: e.target.value }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            value={companyData.industry}
            onChange={(e) =>
              setCompanyData((prev) => ({ ...prev, industry: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Size
          </label>
          <select
            value={companyData.size}
            onChange={(e) =>
              setCompanyData((prev) => ({ ...prev, size: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1-10 employees">1-10 employees</option>
            <option value="11-50 employees">11-50 employees</option>
            <option value="51-200 employees">51-200 employees</option>
            <option value="201-1000 employees">201-1000 employees</option>
            <option value="1000+ employees">1000+ employees</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Company Logo
        </label>
        <div className="mt-1 flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            {companyData.logo ? (
              <Image
                src={companyData.logo}
                alt="Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Building2 className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2 inline" />
            Upload Logo
          </button>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50">
              Appearance
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Customize your dashboard appearance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Sun
              className={`w-5 h-5 ${
                !isDarkMode ? "text-blue-600" : "text-gray-400"
              }`}
            />
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                toast.info(
                  "Theme Changed",
                  `Switched to ${!isDarkMode ? "dark" : "light"} mode`
                );
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isDarkMode ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <Moon
              className={`w-5 h-5 ${
                isDarkMode ? "text-blue-600" : "text-gray-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarvinTab = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-50 flex items-center">
            Marvin SDR Agent
            <div className="w-2 h-2 bg-green-500 rounded-full ml-3 animate-pulse"></div>
          </h3>
          <p className="text-gray-600 dark:text-zinc-400 mt-1">
            Configure your intelligent sales assistant
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-700 font-medium">Active</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => setIsMarvinConfigOpen(true)}
          className="group relative overflow-hidden flex items-center justify-center p-8 border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div className="relative text-left">
            <div className="font-bold text-lg text-gray-900 dark:text-zinc-50 mb-1">
              Configure Marvin
            </div>
            <div className="text-sm text-gray-500 dark:text-zinc-400 mb-2">
              Complete setup with company profile, pricing, Q&A, and advanced
              settings
            </div>
            <div className="flex items-center text-blue-600 font-medium text-sm">
              <span>World-class configuration</span>
              <Star className="w-4 h-4 ml-1" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setIsMarvinChatOpen(true)}
          className="group flex items-center justify-center p-6 border border-gray-200 rounded-2xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all hover:shadow-lg"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-gray-900 dark:text-zinc-50">
              Test Chat
            </div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">
              Simulate conversations
            </div>
          </div>
        </button>
      </div>

      {/* Status */}
      {marvinConfig && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 dark:text-zinc-50 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Current Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">
                Company:
              </span>
              <span className="text-gray-900 dark:text-zinc-50 font-semibold">
                {marvinConfig.companyName || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">
                Industry:
              </span>
              <span className="text-gray-900 dark:text-zinc-50 font-semibold">
                {marvinConfig.industry || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">
                Tone:
              </span>
              <span className="text-gray-900 dark:text-zinc-50 font-semibold">
                {marvinConfig.tone || "Not configured"}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-xl">
              <span className="text-gray-600 dark:text-zinc-400 font-medium">
                Pricing Plans:
              </span>
              <span className="text-gray-900 dark:text-zinc-50 font-semibold">
                {marvinConfig.pricing?.length || 0} plans
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Response Time
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                1.2s
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Satisfaction
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                4.8/5
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Conversations
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-50">
                247
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationsTab = () => {
    return <WorldClassIntegrationManager />;
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 dashboard-outline">
            Team Members
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Manage user access and permissions
          </p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-zinc-50">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 dashboard-outline">
          Billing & Usage
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Manage your subscription and view usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-4">
            Current Plan
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-zinc-400">Plan</span>
              <span className="font-medium">{billingData.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-zinc-400">Price</span>
              <span className="font-medium">{billingData.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-zinc-400">
                Next Billing
              </span>
              <span className="font-medium">{billingData.nextBilling}</span>
            </div>
          </div>
          <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Change Plan
          </button>
        </div>

        <div className="p-6 border border-gray-200 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-4">
            Usage This Month
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Leads</span>
                <span className="font-medium">
                  {billingData.usage.leads.toLocaleString()} /{" "}
                  {billingData.usage.limit.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (billingData.usage.leads / billingData.usage.limit) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">
                  Campaigns
                </span>
                <span className="font-medium">
                  {billingData.usage.campaigns} /{" "}
                  {billingData.usage.limitCampaigns}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (billingData.usage.campaigns /
                        billingData.usage.limitCampaigns) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 dashboard-outline">
          Security Settings
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Configure security and compliance settings
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-zinc-50">
              Two-Factor Authentication
            </h4>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            className={`px-4 py-2 rounded-lg ${
              securitySettings.twoFactor
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {securitySettings.twoFactor ? "Enabled" : "Enable"}
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-zinc-50 mb-2">
            Session Timeout
          </h4>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
            Automatically log out after inactivity
          </p>
          <select
            value={securitySettings.sessionTimeout}
            onChange={(e) =>
              setSecuritySettings((prev) => ({
                ...prev,
                sessionTimeout: parseInt(e.target.value),
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>1 hour</option>
            <option value={4}>4 hours</option>
            <option value={8}>8 hours</option>
            <option value={24}>24 hours</option>
            <option value={168}>7 days</option>
          </select>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-zinc-50 mb-2">
            Audit Log
          </h4>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">
            Track all user actions and changes
          </p>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={securitySettings.auditLog}
              onChange={(e) =>
                setSecuritySettings((prev) => ({
                  ...prev,
                  auditLog: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Enable audit logging
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return renderCompanyTab();
      case "marvin":
        return renderMarvinTab();
      case "integrations":
        return renderIntegrationsTab();
      case "users":
        return renderUsersTab();
      case "billing":
        return renderBillingTab();
      case "security":
        return renderSecurityTab();
      default:
        return renderCompanyTab();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50 font-outfit">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-zinc-400 mt-1 font-outfit">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  toast.info("Tab Changed", `Switched to ${tab.name} settings`);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all font-outfit ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-50 to-white text-blue-700 border border-blue-200 shadow-sm"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 hover:text-gray-900 dark:text-zinc-50"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold font-outfit">{tab.name}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 font-outfit">
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            <div className="p-6">
              {renderTabContent()}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    className="btn-primary"
                    onClick={() =>
                      toast.success(
                        "Settings Saved",
                        "Your changes have been saved successfully"
                      )
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <MarvinConfigModal
        isOpen={isMarvinConfigOpen}
        onClose={() => setIsMarvinConfigOpen(false)}
      />
      <MarvinChatInterface
        isOpen={isMarvinChatOpen}
        onClose={() => setIsMarvinChatOpen(false)}
        marvinConfig={marvinConfig}
      />
    </div>
  );
}
