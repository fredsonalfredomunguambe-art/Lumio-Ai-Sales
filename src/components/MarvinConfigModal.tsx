"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  DollarSign,
  HelpCircle,
  Settings,
  Sparkles,
  ArrowRight,
  Loader2,
  Plus,
  Trash2,
  TestTube,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import AdvancedSettingsElite from "./AdvancedSettingsElite";

// Types
interface CompanyProfile {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  mission: string;
  uniqueValueProp: string;
  keyProducts: string[];
  brandVoice: string;
  conversionGoals?: string[];
  commonObjections?: string[];
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  priority: number;
}

interface TargetAudience {
  industry: string[];
  companySize: string[];
  jobTitles: string[];
  painPoints: string[];
  goals: string[];
  budgetRange: string;
  decisionProcess: string;
}

interface SalesStrategy {
  keyMessages: string[];
  commonObjections: Array<{ objection: string; response: string }>;
  callToActions: string[];
  followUpSteps: string[];
}

interface MarvinConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tab configuration
const tabs = [
  {
    id: "company",
    name: "Company",
    icon: Building2,
    description: "Basic information",
    color: "blue",
  },
  {
    id: "pricing",
    name: "Pricing",
    icon: DollarSign,
    description: "Plans & pricing",
    color: "blue",
  },
  {
    id: "qa",
    name: "Q&A",
    icon: HelpCircle,
    description: "Frequently asked questions",
    color: "blue",
  },
  {
    id: "advanced",
    name: "Advanced",
    icon: Settings,
    description: "Advanced settings",
    color: "blue",
  },
];

export default function MarvinConfigModal({
  isOpen,
  onClose,
}: MarvinConfigModalProps) {
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [isTestChatOpen, setIsTestChatOpen] = useState(false);

  // Form states
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: "",
    website: "",
    industry: "",
    companySize: "",
    mission: "",
    uniqueValueProp: "",
    keyProducts: [],
    brandVoice: "professional",
    conversionGoals: [],
    commonObjections: [],
  });

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>({
    industry: [],
    companySize: [],
    jobTitles: [],
    painPoints: [],
    goals: [],
    budgetRange: "",
    decisionProcess: "",
  });

  const [salesStrategy, setSalesStrategy] = useState<SalesStrategy>({
    keyMessages: [],
    commonObjections: [],
    callToActions: [],
    followUpSteps: [],
  });

  const toast = useToast();

  // Calculate completion score
  useEffect(() => {
    const calculateScore = () => {
      let score = 0;
      const totalFields = 16; // Total number of essential fields

      // Company profile (8 fields)
      if (companyProfile.name) score++;
      if (companyProfile.website) score++;
      if (companyProfile.industry) score++;
      if (companyProfile.companySize) score++;
      if (companyProfile.mission) score++;
      if (companyProfile.uniqueValueProp) score++;
      if (companyProfile.keyProducts.length > 0) score++;
      if (companyProfile.brandVoice) score++;

      // Pricing (3 fields)
      if (pricingPlans.length > 0) score++;
      if (pricingPlans.some((p) => p.features.length > 0)) score++;
      if (pricingPlans.some((p) => p.price > 0)) score++;

      // FAQ (2 fields)
      if (faqItems.length > 0) score++;
      if (faqItems.some((f) => f.answer.length > 10)) score++;

      // Target audience (4 fields)
      if (targetAudience.industry.length > 0) score++;
      if (targetAudience.jobTitles.length > 0) score++;
      if (targetAudience.painPoints.length > 0) score++;
      if (targetAudience.goals.length > 0) score++;

      // Sales strategy (3 fields)
      if (salesStrategy.keyMessages.length > 0) score++;
      if (salesStrategy.commonObjections.length > 0) score++;
      if (salesStrategy.callToActions.length > 0) score++;

      setCompletionScore(Math.round((score / totalFields) * 100));
    };

    calculateScore();
  }, [companyProfile, pricingPlans, faqItems, targetAudience, salesStrategy]);

  // Load existing data
  useEffect(() => {
    if (isOpen) {
      loadConfiguration();
    }
  }, [isOpen]);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Load existing configuration from API
      const [companyRes, pricingRes, faqRes] = await Promise.all([
        fetch("/api/company/profile"),
        fetch("/api/pricing/plans"),
        fetch("/api/faq/items"),
      ]);

      if (companyRes.ok) {
        const companyData = await companyRes.json();
        setCompanyProfile({
          name: companyData.name || "",
          website: companyData.website || "",
          industry: companyData.industry || "",
          companySize: companyData.settings?.companySize || "",
          mission: companyData.settings?.mission || "",
          uniqueValueProp: companyData.settings?.uniqueValueProp || "",
          keyProducts: companyData.settings?.keyProducts || [],
          brandVoice: companyData.settings?.brandVoice || "professional",
          conversionGoals: companyData.settings?.conversionGoals || [],
          commonObjections: companyData.settings?.commonObjections || [],
        });
      }

      if (pricingRes.ok) {
        const pricingData = await pricingRes.json();
        setPricingPlans(pricingData.plans || []);
      }

      if (faqRes.ok) {
        const faqData = await faqRes.json();
        setFaqItems(faqData.items || []);
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
      toast.error("Error", "Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all configuration data
      const [companyRes, pricingRes, faqRes] = await Promise.all([
        fetch("/api/company/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companyProfile),
        }),
        fetch("/api/pricing/plans", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plans: pricingPlans }),
        }),
        fetch("/api/faq/items", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: faqItems }),
        }),
      ]);

      // Check if all requests were successful
      if (!companyRes.ok || !pricingRes.ok || !faqRes.ok) {
        throw new Error("One or more save operations failed");
      }

      toast.success(
        "Configuration Saved!",
        "Your Marvin configuration has been saved successfully"
      );
      onClose();
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast.error(
        "Save Failed",
        "Failed to save configuration. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const addPricingPlan = () => {
    setPricingPlans([
      ...pricingPlans,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        billingPeriod: "monthly",
        features: [],
        isPopular: false,
      },
    ]);
  };

  const updatePricingPlan = (
    id: string,
    field: keyof PricingPlan,
    value: string | number | boolean | string[]
  ) => {
    setPricingPlans(
      pricingPlans.map((plan) =>
        plan.id === id ? { ...plan, [field]: value } : plan
      )
    );
  };

  const removePricingPlan = (id: string) => {
    setPricingPlans(pricingPlans.filter((plan) => plan.id !== id));
  };

  const addFAQItem = () => {
    setFaqItems([
      ...faqItems,
      {
        id: Date.now().toString(),
        category: "",
        question: "",
        answer: "",
        tags: [],
        priority: 1,
      },
    ]);
  };

  const updateFAQItem = (
    id: string,
    field: keyof FAQItem,
    value: string | number
  ) => {
    setFaqItems(
      faqItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeFAQItem = (id: string) => {
    setFaqItems(faqItems.filter((item) => item.id !== id));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-100"
        >
          {/* Header */}
          <div className="relative bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight">
                    Configure Marvin
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Set up your intelligent sales assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsTestChatOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <TestTube className="w-3 h-3 text-gray-300" />
                  <span className="text-sm font-medium">Test Chat</span>
                </button>

                {/* Completion Score */}
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Completion
                  </div>
                  <div className="text-xl font-bold text-black">
                    {completionScore}%
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all duration-200 hover:shadow-sm"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${completionScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-white border-b-2 border-blue-600 text-blue-600 shadow-sm`
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-3 h-3 mr-2 text-gray-500" />
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-500">
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">
                  Loading configuration...
                </span>
              </div>
            ) : (
              <TabContent
                activeTab={activeTab}
                companyProfile={companyProfile}
                setCompanyProfile={setCompanyProfile}
                pricingPlans={pricingPlans}
                addPricingPlan={addPricingPlan}
                updatePricingPlan={updatePricingPlan}
                removePricingPlan={removePricingPlan}
                faqItems={faqItems}
                addFAQItem={addFAQItem}
                updateFAQItem={updateFAQItem}
                removeFAQItem={removeFAQItem}
                targetAudience={targetAudience}
                setTargetAudience={setTargetAudience}
                salesStrategy={salesStrategy}
                setSalesStrategy={setSalesStrategy}
                isTestChatOpen={isTestChatOpen}
                setIsTestChatOpen={setIsTestChatOpen}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="text-sm text-gray-600">
              Marvin will use this information to personalize conversations
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-black transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || completionScore < 50}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md font-medium"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Configuration</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Tab Content Component
interface TabContentProps {
  activeTab: string;
  companyProfile: CompanyProfile;
  setCompanyProfile: (profile: CompanyProfile) => void;
  pricingPlans: PricingPlan[];
  addPricingPlan: () => void;
  updatePricingPlan: (
    id: string,
    field: keyof PricingPlan,
    value: string | number | boolean | string[]
  ) => void;
  removePricingPlan: (id: string) => void;
  faqItems: FAQItem[];
  addFAQItem: () => void;
  updateFAQItem: (
    id: string,
    field: keyof FAQItem,
    value: string | number
  ) => void;
  removeFAQItem: (id: string) => void;
  targetAudience: TargetAudience;
  setTargetAudience: (audience: TargetAudience) => void;
  salesStrategy: SalesStrategy;
  setSalesStrategy: (strategy: SalesStrategy) => void;
  isTestChatOpen: boolean;
  setIsTestChatOpen: (open: boolean) => void;
}

function TabContent({
  activeTab,
  companyProfile,
  setCompanyProfile,
  pricingPlans,
  addPricingPlan,
  updatePricingPlan,
  removePricingPlan,
  faqItems,
  addFAQItem,
  updateFAQItem,
  removeFAQItem,
  targetAudience,
  setTargetAudience,
  salesStrategy,
  setSalesStrategy,
  isTestChatOpen,
  setIsTestChatOpen,
}: TabContentProps) {
  switch (activeTab) {
    case "company":
      return (
        <CompanyTab profile={companyProfile} setProfile={setCompanyProfile} />
      );
    case "pricing":
      return (
        <PricingTab
          plans={pricingPlans}
          addPlan={addPricingPlan}
          updatePlan={updatePricingPlan}
          removePlan={removePricingPlan}
        />
      );
    case "qa":
      return (
        <QATab
          items={faqItems}
          addItem={addFAQItem}
          updateItem={updateFAQItem}
          removeItem={removeFAQItem}
        />
      );
    case "advanced":
      return (
        <AdvancedSettingsElite
          targetAudience={targetAudience}
          setTargetAudience={setTargetAudience}
          salesStrategy={salesStrategy}
          setSalesStrategy={setSalesStrategy}
          isTestChatOpen={isTestChatOpen}
          setIsTestChatOpen={setIsTestChatOpen}
          companyProfile={companyProfile}
        />
      );
    default:
      return null;
  }
}

// Individual Tab Components
interface CompanyTabProps {
  profile: CompanyProfile;
  setProfile: (profile: CompanyProfile) => void;
}

function CompanyTab({ profile, setProfile }: CompanyTabProps) {
  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Manufacturing",
    "Consulting",
    "Real Estate",
    "Other",
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-1000 employees",
    "1000+ employees",
  ];

  const brandVoices = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "friendly", label: "Friendly" },
    { value: "technical", label: "Technical" },
  ];

  const addProduct = () => {
    setProfile({
      ...profile,
      keyProducts: [...profile.keyProducts, ""],
    });
  };

  const updateProduct = (index: number, value: string) => {
    const newProducts = [...profile.keyProducts];
    newProducts[index] = value;
    setProfile({ ...profile, keyProducts: newProducts });
  };

  const removeProduct = (index: number) => {
    setProfile({
      ...profile,
      keyProducts: profile.keyProducts.filter((_, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="e.g., TechCorp Solutions"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Website
          </label>
          <input
            type="url"
            value={profile.website}
            onChange={(e) =>
              setProfile({ ...profile, website: e.target.value })
            }
            placeholder="https://yourcompany.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Industry *
          </label>
          <select
            value={profile.industry}
            onChange={(e) =>
              setProfile({ ...profile, industry: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
          >
            <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Company Size
          </label>
          <select
            value={profile.companySize}
            onChange={(e) =>
              setProfile({ ...profile, companySize: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
          >
            <option value="">Select company size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Mission Statement
        </label>
        <textarea
          value={profile.mission}
          onChange={(e) => setProfile({ ...profile, mission: e.target.value })}
          placeholder="Describe your company's mission and purpose..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Unique Value Proposition *
        </label>
        <textarea
          value={profile.uniqueValueProp}
          onChange={(e) =>
            setProfile({ ...profile, uniqueValueProp: e.target.value })
          }
          placeholder="What makes your company unique? How do you solve customer problems differently?"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Key Products/Services
        </label>
        <div className="space-y-2">
          {profile.keyProducts.map((product: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={product}
                onChange={(e) => updateProduct(index, e.target.value)}
                placeholder="Product or service name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
              />
              <button
                onClick={() => removeProduct(index)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            onClick={addProduct}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <Plus className="w-3 h-3 text-gray-500" />
            <span>Add Product/Service</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Brand Voice
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {brandVoices.map((voice) => (
            <button
              key={voice.value}
              onClick={() =>
                setProfile({ ...profile, brandVoice: voice.value })
              }
              className={`p-3 rounded-lg border-2 transition-all ${
                profile.brandVoice === voice.value
                  ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="font-medium">{voice.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Conversion Goals
        </label>
        <div className="space-y-2">
          {(profile.conversionGoals || []).map(
            (goal: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => {
                    const newGoals = [...(profile.conversionGoals || [])];
                    newGoals[index] = e.target.value;
                    setProfile({ ...profile, conversionGoals: newGoals });
                  }}
                  placeholder="e.g., Convert trial users to paid, Recover abandoned carts"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
                <button
                  onClick={() => {
                    const newGoals = (profile.conversionGoals || []).filter(
                      (_, i: number) => i !== index
                    );
                    setProfile({ ...profile, conversionGoals: newGoals });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          )}
          <button
            onClick={() => {
              setProfile({
                ...profile,
                conversionGoals: [...(profile.conversionGoals || []), ""],
              });
            }}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <Plus className="w-3 h-3 text-gray-500" />
            <span>Add Conversion Goal</span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Common Objections
        </label>
        <div className="space-y-2">
          {(profile.commonObjections || []).map(
            (objection: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={objection}
                  onChange={(e) => {
                    const newObjections = [...(profile.commonObjections || [])];
                    newObjections[index] = e.target.value;
                    setProfile({ ...profile, commonObjections: newObjections });
                  }}
                  placeholder="e.g., Too expensive, Need to think about it, Already have a solution"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
                <button
                  onClick={() => {
                    const newObjections = (
                      profile.commonObjections || []
                    ).filter((_, i: number) => i !== index);
                    setProfile({ ...profile, commonObjections: newObjections });
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          )}
          <button
            onClick={() => {
              setProfile({
                ...profile,
                commonObjections: [...(profile.commonObjections || []), ""],
              });
            }}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            <Plus className="w-3 h-3 text-gray-500" />
            <span>Add Common Objection</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PricingTabProps {
  plans: PricingPlan[];
  addPlan: () => void;
  updatePlan: (
    id: string,
    field: keyof PricingPlan,
    value: string | number | boolean | string[]
  ) => void;
  removePlan: (id: string) => void;
}

function PricingTab({
  plans,
  addPlan,
  updatePlan,
  removePlan,
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pricing Plans</h3>
          <p className="text-sm text-gray-600">
            Define your pricing structure for Marvin to reference
          </p>
        </div>
        <button
          onClick={addPlan}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3 h-3 text-gray-300" />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="space-y-4">
        {plans.map((plan: PricingPlan, index: number) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Plan {index + 1}</h4>
              <button
                onClick={() => removePlan(plan.id)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => updatePlan(plan.id, "name", e.target.value)}
                  placeholder="e.g., Starter, Pro, Enterprise"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="flex space-x-2">
                  <select
                    value={plan.currency}
                    onChange={(e) =>
                      updatePlan(plan.id, "currency", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BRL">BRL</option>
                  </select>
                  <input
                    type="number"
                    value={plan.price}
                    onChange={(e) =>
                      updatePlan(
                        plan.id,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                  />
                  <select
                    value={plan.billingPeriod}
                    onChange={(e) =>
                      updatePlan(plan.id, "billingPeriod", e.target.value)
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="monthly">/month</option>
                    <option value="yearly">/year</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={plan.description}
                  onChange={(e) =>
                    updatePlan(plan.id, "description", e.target.value)
                  }
                  placeholder="Brief description of what this plan includes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Features
                </label>
                <textarea
                  value={plan.features.join("\n")}
                  onChange={(e) =>
                    updatePlan(
                      plan.id,
                      "features",
                      e.target.value.split("\n").filter((f) => f.trim())
                    )
                  }
                  placeholder="Enter each feature on a new line"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={plan.isPopular}
                    onChange={(e) =>
                      updatePlan(plan.id, "isPopular", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mark as popular plan
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        ))}

        {plans.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-8 h-8 mx-auto mb-4 text-gray-300" />
            <p>No pricing plans configured yet</p>
            <p className="text-sm">Add your first plan to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface QATabProps {
  items: FAQItem[];
  addItem: () => void;
  updateItem: (
    id: string,
    field: keyof FAQItem,
    value: string | number
  ) => void;
  removeItem: (id: string) => void;
}

function QATab({ items, addItem, updateItem, removeItem }: QATabProps) {
  const categories = [
    "General",
    "Pricing",
    "Features",
    "Support",
    "Integration",
    "Billing",
    "Security",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">FAQ Database</h3>
          <p className="text-sm text-gray-600">
            Common questions and answers for Marvin to reference
          </p>
        </div>
        <button
          onClick={addItem}
          className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3 h-3 text-gray-300" />
          <span>Add FAQ</span>
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item: FAQItem, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-xl p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">FAQ #{index + 1}</h4>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={item.category}
                    onChange={(e) =>
                      updateItem(item.id, "category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={item.priority}
                    onChange={(e) =>
                      updateItem(item.id, "priority", parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) =>
                    updateItem(item.id, "question", e.target.value)
                  }
                  placeholder="What is the most common question customers ask?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <textarea
                  value={item.answer}
                  onChange={(e) =>
                    updateItem(item.id, "answer", e.target.value)
                  }
                  placeholder="Provide a clear, helpful answer..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all bg-white"
                />
              </div>
            </div>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="w-8 h-8 mx-auto mb-4 text-gray-300" />
            <p>No FAQ items configured yet</p>
            <p className="text-sm">
              Add common questions to help Marvin assist customers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
