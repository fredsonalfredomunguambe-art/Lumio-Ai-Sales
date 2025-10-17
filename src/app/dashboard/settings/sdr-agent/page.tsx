"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Plus,
  Trash2,
  Save,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Zap,
  AlertCircle,
  CheckCircle,
  Target,
  ShoppingCart,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { HelpButton } from "@/components/HelpCenter/HelpButton";

interface SDRRule {
  id: string;
  category: string;
  enabled: boolean;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  strategy: string;
  channels: string[];
  timing: {
    delay?: number;
    maxPerWeek?: number;
  };
  template?: string;
  discountPercent?: number;
}

interface SDRConfig {
  active: boolean;
  mode: "AUTOPILOT" | "COPILOT" | "HYBRID";
  scoreThreshold: number;
  maxTouchpointsPerWeek: number;
  channels: string[];
}

export default function SDRAgentPage() {
  const [config, setConfig] = useState<SDRConfig>({
    active: false,
    mode: "COPILOT",
    scoreThreshold: 70,
    maxTouchpointsPerWeek: 3,
    channels: ["email"],
  });

  const [rules, setRules] = useState<SDRRule[]>([
    {
      id: "rule_vip",
      category: "VIP Customers",
      enabled: true,
      conditions: [
        { field: "totalSpent", operator: ">=", value: 1000 },
        { field: "ordersCount", operator: ">=", value: 5 },
      ],
      strategy: "personal_outreach",
      channels: ["email", "whatsapp"],
      timing: { delay: 24 },
      template: "vip_welcome",
    },
    {
      id: "rule_abandoned",
      category: "Abandoned Cart",
      enabled: true,
      conditions: [
        { field: "cartValue", operator: ">=", value: 50 },
        { field: "abandonedHours", operator: ">=", value: 1 },
      ],
      strategy: "cart_recovery",
      channels: ["email", "whatsapp"],
      timing: { delay: 1 },
      discountPercent: 10,
      template: "abandoned_cart",
    },
    {
      id: "rule_high_value",
      category: "New High-Value Customers",
      enabled: true,
      conditions: [{ field: "firstOrderValue", operator: ">=", value: 200 }],
      strategy: "upsell",
      channels: ["email"],
      timing: { delay: 72 },
      template: "thank_you_upsell",
    },
    {
      id: "rule_hot_leads",
      category: "Hot Leads",
      enabled: true,
      conditions: [
        { field: "score", operator: ">=", value: 70 },
        { field: "status", operator: "==", value: "NEW" },
      ],
      strategy: "fast_track",
      channels: ["email", "linkedin"],
      timing: { delay: 0, maxPerWeek: 5 },
      template: "hot_lead_intro",
    },
    {
      id: "rule_reengagement",
      category: "Re-engagement",
      enabled: false,
      conditions: [
        { field: "daysSinceLastPurchase", operator: ">=", value: 90 },
        { field: "totalSpent", operator: ">=", value: 100 },
      ],
      strategy: "win_back",
      channels: ["email"],
      timing: { delay: 0 },
      discountPercent: 15,
      template: "win_back",
    },
    {
      id: "rule_at_risk",
      category: "At-Risk Deals",
      enabled: true,
      conditions: [
        { field: "dealStage", operator: "==", value: "proposal" },
        { field: "daysSinceLastContact", operator: ">=", value: 7 },
        { field: "dealValue", operator: ">=", value: 5000 },
      ],
      strategy: "save_deal",
      channels: ["email", "linkedin"],
      timing: { delay: 0 },
      template: "at_risk_follow_up",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("rules");

  const handleToggleActive = () => {
    setConfig({ ...config, active: !config.active });
  };

  const handleToggleRule = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<SDRRule>) => {
    setRules(
      rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/sdr-agent/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config, rules }),
      });

      if (response.ok) {
        alert("SDR Agent configuration saved successfully!");
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const enabledRulesCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            SDR Agent Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 mt-1">
            Configure Marvin's automated outreach rules and strategies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={config.active ? "success" : "default"}
            icon={
              config.active ? <CheckCircle className="w-3 h-3" /> : undefined
            }
          >
            {config.active ? "Active" : "Inactive"}
          </Badge>
          <ActionButton
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveConfig}
            loading={saving}
          >
            Save Configuration
          </ActionButton>
        </div>
      </div>

      {/* Master Toggle */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                SDR Agent Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                {config.active
                  ? `Active with ${enabledRulesCount} rules enabled`
                  : "Inactive - Toggle to activate automated outreach"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleActive}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              config.active ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                config.active ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Segmentation Rules</TabsTrigger>
          <TabsTrigger value="integrations">Integration Config</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Segmentation Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <strong>Customize Your Rules:</strong> All threshold values,
              delays, and strategies below are customizable. Adjust them to
              match your business needs. Default values are suggestions based on
              best practices.
            </div>
          </div>

          {rules.map((rule) => (
            <Card key={rule.id} className={rule.enabled ? "" : "opacity-60"}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      rule.enabled ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {rule.category === "VIP Customers" && (
                      <Users className="w-5 h-5 text-blue-600" />
                    )}
                    {rule.category === "Abandoned Cart" && (
                      <ShoppingCart className="w-5 h-5 text-orange-600" />
                    )}
                    {rule.category === "Hot Leads" && (
                      <Target className="w-5 h-5 text-green-600" />
                    )}
                    {rule.category === "At-Risk Deals" && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    {![
                      "VIP Customers",
                      "Abandoned Cart",
                      "Hot Leads",
                      "At-Risk Deals",
                    ].includes(rule.category) && (
                      <Zap className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      {rule.category}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      Strategy: {rule.strategy.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    rule.enabled ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      rule.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {rule.enabled && (
                <div className="space-y-4">
                  {/* Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions (Customize Thresholds)
                    </label>
                    <div className="space-y-2">
                      {rule.conditions.map((condition, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg"
                        >
                          <span className="text-sm text-gray-700 capitalize">
                            {condition.field.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <select
                            value={condition.operator}
                            onChange={(e) => {
                              const newConditions = [...rule.conditions];
                              newConditions[index].operator = e.target.value;
                              handleUpdateRule(rule.id, {
                                conditions: newConditions,
                              });
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                            <option value="==">=</option>
                            <option value="!==">!=</option>
                          </select>
                          <input
                            type={
                              typeof condition.value === "number"
                                ? "number"
                                : "text"
                            }
                            value={condition.value}
                            onChange={(e) => {
                              const newConditions = [...rule.conditions];
                              newConditions[index].value =
                                typeof condition.value === "number"
                                  ? parseFloat(e.target.value)
                                  : e.target.value;
                              handleUpdateRule(rule.id, {
                                conditions: newConditions,
                              });
                            }}
                            className="px-3 py-1 border border-gray-300 rounded text-sm w-32"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Outreach Channels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["email", "linkedin", "whatsapp", "sms"].map(
                        (channel) => (
                          <button
                            key={channel}
                            onClick={() => {
                              const newChannels = rule.channels.includes(
                                channel
                              )
                                ? rule.channels.filter((c) => c !== channel)
                                : [...rule.channels, channel];
                              handleUpdateRule(rule.id, {
                                channels: newChannels,
                              });
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              rule.channels.includes(channel)
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay (hours)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.timing.delay || 0}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            timing: {
                              ...rule.timing,
                              delay: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Per Week
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rule.timing.maxPerWeek || 3}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            timing: {
                              ...rule.timing,
                              maxPerWeek: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Discount (if applicable) */}
                  {(rule.category === "Abandoned Cart" ||
                    rule.category === "Re-engagement") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Offer (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.discountPercent || 0}
                        onChange={(e) =>
                          handleUpdateRule(rule.id, {
                            discountPercent: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}

          <ActionButton
            variant="outline"
            icon={<Plus className="w-4 h-4" />}
            className="w-full"
            onClick={() => {
              const newRule: SDRRule = {
                id: `rule_${Date.now()}`,
                category: "Custom Rule",
                enabled: true,
                conditions: [{ field: "score", operator: ">=", value: 50 }],
                strategy: "custom",
                channels: ["email"],
                timing: { delay: 0, maxPerWeek: 3 },
              };
              setRules([...rules, newRule]);
            }}
          >
            Add Custom Rule
          </ActionButton>
        </TabsContent>

        {/* Integration Config Tab */}
        <TabsContent value="integrations" className="space-y-4">
          {["shopify", "hubspot", "salesforce", "mailchimp"].map(
            (integration) => (
              <Card key={integration}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {integration === "shopify" && "🛍️"}
                      {integration === "hubspot" && "🟠"}
                      {integration === "salesforce" && "☁️"}
                      {integration === "mailchimp" && "🐵"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 capitalize">
                        {integration}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        Configure SDR behavior for {integration} leads
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600">
                    <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-apply Rules
                    </label>
                    <div className="space-y-2">
                      {integration === "shopify" && (
                        <>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              VIP Customers
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              Abandoned Cart
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              New High-Value
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700">
                              Re-engagement
                            </span>
                          </label>
                        </>
                      )}
                      {integration === "hubspot" && (
                        <>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              Hot Leads
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded"
                            />
                            <span className="text-sm text-gray-700">
                              At-Risk Deals
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700">
                              Re-engagement
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  {integration === "hubspot" && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Sync SDR actions back to HubSpot
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </Card>
            )
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
            Message templates that SDR Agent uses for outreach. Customize with
            your brand voice.
          </p>

          {[
            {
              name: "VIP Welcome",
              variables: ["firstName", "totalSpent", "ordersCount"],
            },
            {
              name: "Abandoned Cart",
              variables: ["firstName", "cartValue", "cartItems"],
            },
            {
              name: "Hot Lead Intro",
              variables: ["firstName", "company", "score"],
            },
            {
              name: "Win Back",
              variables: ["firstName", "lastPurchaseDate", "discount"],
            },
          ].map((template) => (
            <Card key={template.name}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {template.name}
                </h4>
                <Badge variant="ghost">
                  {template.variables.length} variables
                </Badge>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-2">
                  Available Variables:
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((v) => (
                    <code
                      key={v}
                      className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    >
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>
              <textarea
                rows={4}
                placeholder={`Hi {{firstName}},\n\nYour personalized message here...\n\nBest regards,\nYour Team`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex items-center gap-2">
                <ActionButton variant="secondary" size="sm">
                  Test Preview
                </ActionButton>
                <ActionButton variant="primary" size="sm">
                  Save Template
                </ActionButton>
              </div>
            </Card>
          ))}

          <ActionButton
            variant="outline"
            icon={<Plus className="w-4 h-4" />}
            className="w-full"
          >
            Create Custom Template
          </ActionButton>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-1">
                Total Sequences
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                127
              </div>
              <div className="text-xs text-green-600 mt-1">+23 this week</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-1">
                Response Rate
              </div>
              <div className="text-2xl font-bold text-green-600">34.2%</div>
              <div className="text-xs text-green-600 mt-1">+8.5% vs manual</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-1">
                Conversion Rate
              </div>
              <div className="text-2xl font-bold text-blue-600">12.1%</div>
              <div className="text-xs text-green-600 mt-1">
                +4.3% vs baseline
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-4">
              Performance by Rule
            </h3>
            <div className="space-y-3">
              {rules
                .filter((r) => r.enabled)
                .map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">
                        {rule.category}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        {Math.floor(Math.random() * 50 + 20)} sequences • ROI:{" "}
                        {Math.floor(Math.random() * 200 + 100)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        {Math.floor(Math.random() * 20 + 15)}% conversion
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200">
                        {Math.floor(Math.random() * 30 + 20)}% response
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Center Button */}
      <HelpButton context="settings" />
    </div>
  );
}
