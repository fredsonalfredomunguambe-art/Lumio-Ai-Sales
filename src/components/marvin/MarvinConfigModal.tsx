"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Building2,
  DollarSign,
  HelpCircle,
  Loader2,
  Settings,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import Image from "next/image";

interface MarvinConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MarvinConfig) => void;
}

interface MarvinConfig {
  // Company Basic Information - EXPANDIDO
  companyName: string;
  industry: string;
  website: string;
  foundedYear: string;
  employeeCount: string;
  headquarters: string;
  companyDescription: string;
  valueProposition: string;
  missionStatement: string;
  visionStatement: string;
  competitors: string[];
  marketPosition: string;

  // Business Details - NOVO
  businessType: string;
  targetMarket: string;
  keyProducts: string[];
  keyServices: string[];
  uniqueSellingPoints: string[];
  businessModel: string;
  revenueStreams: string[];
  keyPartners: string[];
  keyResources: string[];
  keyActivities: string[];
  customerSegments: string[];
  channels: string[];
  costStructure: string[];
  keyMetrics: string[];

  // Market & Competition - NOVO
  marketSize: string;
  marketGrowth: string;
  competitiveAdvantages: string[];
  marketChallenges: string[];
  industryTrends: string[];
  regulatoryEnvironment: string;

  // Financial Information - NOVO
  annualRevenue: string;
  fundingStage: string;
  investors: string[];
  financialGoals: string[];

  // Contact & Support
  supportEmail: string;
  supportPhone: string;
  salesEmail: string;
  salesPhone: string;
  businessHours: string;
  timezone: string;

  // Social Media
  linkedinUrl: string;
  twitterHandle: string;
  facebookUrl: string;
  instagramHandle: string;
  youtubeUrl: string;

  // Language Settings
  autoDetectLanguage: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];

  // Response Configuration
  tone: string;
  services: string[];
  pricing: PricingTier[];
  qa: QAPair[];
  targetAudience: string;
  goals: string[];
  personality: string;

  // Follow-up Settings
  enableFollowUp: boolean;
  followUpEmail: string;
  followUpThreshold: number;
  criticalKeywords: string[];
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  currency: string;
  billingPeriod: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  category: string;
  description: string;
  ctaText: string;
  trialDays?: number;
  setupFee?: string;
  cancellationPolicy: string;
}

interface QAPair {
  question: string;
  answer: string;
}

export default function MarvinConfigModal({
  isOpen,
  onClose,
  onSave,
}: MarvinConfigModalProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("company");

  const [config, setConfig] = useState<MarvinConfig>({
    // Company Basic Information - EXPANDIDO
    companyName: "",
    industry: "",
    website: "",
    foundedYear: "",
    employeeCount: "",
    headquarters: "",
    companyDescription: "",
    valueProposition: "",
    missionStatement: "",
    visionStatement: "",
    competitors: [],
    marketPosition: "",

    // Business Details - NOVO
    businessType: "",
    targetMarket: "",
    keyProducts: [],
    keyServices: [],
    uniqueSellingPoints: [],
    businessModel: "",
    revenueStreams: [],
    keyPartners: [],
    keyResources: [],
    keyActivities: [],
    customerSegments: [],
    channels: [],
    costStructure: [],
    keyMetrics: [],

    // Market & Competition - NOVO
    marketSize: "",
    marketGrowth: "",
    competitiveAdvantages: [],
    marketChallenges: [],
    industryTrends: [],
    regulatoryEnvironment: "",

    // Financial Information - NOVO
    annualRevenue: "",
    fundingStage: "",
    investors: [],
    financialGoals: [],

    // Contact & Support
    supportEmail: "",
    supportPhone: "",
    salesEmail: "",
    salesPhone: "",
    businessHours: "9 AM - 6 PM EST",
    timezone: "EST",

    // Social Media
    linkedinUrl: "",
    twitterHandle: "",
    facebookUrl: "",
    instagramHandle: "",
    youtubeUrl: "",

    // Language Settings
    autoDetectLanguage: true,
    defaultLanguage: "en",
    supportedLanguages: ["en", "pt", "es"],

    // Response Configuration
    tone: "",
    services: [],
    pricing: [
      {
        id: "starter",
        name: "Starter",
        price: "99",
        originalPrice: "149",
        currency: "USD",
        billingPeriod: "month",
        features: ["Up to 100 leads", "Email support", "Basic automation"],
        limitations: ["No phone support", "Limited integrations"],
        popular: false,
        category: "Basic",
        description: "Perfect for small businesses getting started",
        ctaText: "Start Free Trial",
        trialDays: 14,
        setupFee: "0",
        cancellationPolicy: "Cancel anytime",
      },
    ],
    qa: [
      {
        question: "What are your pricing plans?",
        answer:
          "Our plans start at $99/month with comprehensive lead management features.",
      },
    ],
    targetAudience: "",
    goals: [],
    personality: "professional",

    // Follow-up Settings
    enableFollowUp: true,
    followUpEmail: "",
    followUpThreshold: 0.6,
    criticalKeywords: ["urgent", "emergency", "asap", "critical"],
  });

  const [newService, setNewService] = useState("");
  const [newQA, setNewQA] = useState({ question: "", answer: "" });
  const [newGoal, setNewGoal] = useState("");

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
      },
    },
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSave(config);
      toast.success(
        "Configuration Saved",
        "Marvin has been configured successfully!"
      );
      onClose();
    } catch (error) {
      toast.error("Error", "Failed to save configuration");
    } finally {
      setIsLoading(false);
    }
  };

  const addService = () => {
    if (newService.trim()) {
      setConfig({
        ...config,
        services: [...config.services, newService.trim()],
      });
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    setConfig({
      ...config,
      services: config.services.filter((_, i) => i !== index),
    });
  };

  const addQA = () => {
    if (newQA.question.trim() && newQA.answer.trim()) {
      setConfig({
        ...config,
        qa: [...config.qa, { ...newQA }],
      });
      setNewQA({ question: "", answer: "" });
    }
  };

  const removeQA = (index: number) => {
    setConfig({
      ...config,
      qa: config.qa.filter((_, i) => i !== index),
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setConfig({
        ...config,
        goals: [...config.goals, newGoal.trim()],
      });
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    setConfig({
      ...config,
      goals: config.goals.filter((_, i) => i !== index),
    });
  };

  const addPricingTier = () => {
    setConfig({
      ...config,
      pricing: [
        ...config.pricing,
        {
          name: "New Plan",
          price: "$0/month",
          features: ["Feature 1"],
        },
      ],
    });
  };

  const updatePricingTier = (index: number, field: string, value: string) => {
    const newPricing = [...config.pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setConfig({ ...config, pricing: newPricing });
  };

  const updatePricingFeatures = (tierIndex: number, features: string[]) => {
    const newPricing = [...config.pricing];
    newPricing[tierIndex] = { ...newPricing[tierIndex], features };
    setConfig({ ...config, pricing: newPricing });
  };

  // Elite tabs configuration
  const tabs = [
    {
      id: "company",
      name: "Company",
      icon: Building2,
      description: "Basic information",
    },
    {
      id: "pricing",
      name: "Pricing",
      icon: DollarSign,
      description: "Plans and pricing",
    },
    {
      id: "qa",
      name: "Q&A",
      icon: HelpCircle,
      description: "Frequently asked questions",
    },
    {
      id: "advanced",
      name: "Advanced",
      icon: Settings,
      description: "Advanced settings",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop with subtle blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-5xl w-full max-h-[90vh] overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header Elite */}
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Image
                      src="/fotos/marvin.png"
                      alt="Marvin"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      Configure Marvin
                      <Sparkles className="w-5 h-5 text-yellow-500 ml-2" />
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Set up your intelligent sales assistant
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/80 rounded-xl transition-all duration-200 group"
                >
                  <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Tabs Elite */}
            <div className="px-8 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex space-x-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2 text-gray-500" />
                    <div className="text-left">
                      <div>{tab.name}</div>
                      <div className="text-xs text-gray-500">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {activeTab === "company" && (
                <div className="space-y-8">
                  {/* Company Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={config.companyName}
                        onChange={(e) =>
                          setConfig({ ...config, companyName: e.target.value })
                        }
                        placeholder="e.g., TechCorp Solutions"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Industry
                      </label>
                      <select
                        value={config.industry}
                        onChange={(e) =>
                          setConfig({ ...config, industry: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select an industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="ecommerce">E-commerce</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Expanded Company Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Website
                      </label>
                      <input
                        type="url"
                        value={config.website}
                        onChange={(e) =>
                          setConfig({ ...config, website: e.target.value })
                        }
                        placeholder="https://yourcompany.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={config.foundedYear}
                        onChange={(e) =>
                          setConfig({ ...config, foundedYear: e.target.value })
                        }
                        placeholder="2020"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Employee Count
                      </label>
                      <input
                        type="text"
                        value={config.employeeCount}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            employeeCount: e.target.value,
                          })
                        }
                        placeholder="11-50 employees"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Headquarters
                      </label>
                      <input
                        type="text"
                        value={config.headquarters}
                        onChange={(e) =>
                          setConfig({ ...config, headquarters: e.target.value })
                        }
                        placeholder="New York, NY"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Company Description
                    </label>
                    <textarea
                      value={config.companyDescription}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          companyDescription: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Brief description of your company and what you do..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Value Proposition
                    </label>
                    <textarea
                      value={config.valueProposition}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          valueProposition: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="What makes your company unique and valuable to customers?"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Contact & Support Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact & Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Support Email
                        </label>
                        <input
                          type="email"
                          value={config.supportEmail}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              supportEmail: e.target.value,
                            })
                          }
                          placeholder="support@yourcompany.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Support Phone
                        </label>
                        <input
                          type="tel"
                          value={config.supportPhone}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              supportPhone: e.target.value,
                            })
                          }
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Language Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Auto-detect Language
                          </h4>
                          <p className="text-sm text-gray-500">
                            Automatically detect and respond in customer&apos;s
                            language
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setConfig({
                              ...config,
                              autoDetectLanguage: !config.autoDetectLanguage,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config.autoDetectLanguage
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.autoDetectLanguage
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Default Language
                        </label>
                        <select
                          value={config.defaultLanguage}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              defaultLanguage: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="en">English</option>
                          <option value="pt">Portuguese</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up Settings */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Follow-up Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Enable Follow-up
                          </h4>
                          <p className="text-sm text-gray-500">
                            Send follow-up emails for critical cases
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setConfig({
                              ...config,
                              enableFollowUp: !config.enableFollowUp,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            config.enableFollowUp
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.enableFollowUp
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      {config.enableFollowUp && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Follow-up Email
                            </label>
                            <input
                              type="email"
                              value={config.followUpEmail}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  followUpEmail: e.target.value,
                                })
                              }
                              placeholder="followup@yourcompany.com"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Confidence Threshold: {config.followUpThreshold}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={config.followUpThreshold}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  followUpThreshold: parseFloat(e.target.value),
                                })
                              }
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <p className="text-sm text-gray-500">
                              Trigger follow-up when confidence is below this
                              threshold
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Business Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Business Type
                        </label>
                        <select
                          value={config.businessType}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              businessType: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select business type</option>
                          <option value="startup">Startup</option>
                          <option value="small-business">Small Business</option>
                          <option value="medium-business">
                            Medium Business
                          </option>
                          <option value="enterprise">Enterprise</option>
                          <option value="nonprofit">Non-profit</option>
                          <option value="agency">Agency</option>
                          <option value="consultancy">Consultancy</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Target Market
                        </label>
                        <input
                          type="text"
                          value={config.targetMarket}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              targetMarket: e.target.value,
                            })
                          }
                          placeholder="e.g., B2B SaaS, E-commerce, Healthcare"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <label className="block text-sm font-semibold text-gray-700">
                        Business Model
                      </label>
                      <textarea
                        value={config.businessModel}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            businessModel: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Describe how your business makes money (e.g., subscription, one-time sales, marketplace, etc.)"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      />
                    </div>
                  </div>

                  {/* Key Products & Services */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Key Products & Services
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Key Products
                        </label>
                        <div className="space-y-2">
                          {config.keyProducts.map((product, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={product}
                                onChange={(e) => {
                                  const newProducts = [...config.keyProducts];
                                  newProducts[index] = e.target.value;
                                  setConfig({
                                    ...config,
                                    keyProducts: newProducts,
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Product name"
                              />
                              <button
                                onClick={() => {
                                  const newProducts = config.keyProducts.filter(
                                    (_, i) => i !== index
                                  );
                                  setConfig({
                                    ...config,
                                    keyProducts: newProducts,
                                  });
                                }}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                keyProducts: [...config.keyProducts, ""],
                              })
                            }
                            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Product
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Key Services
                        </label>
                        <div className="space-y-2">
                          {config.keyServices.map((service, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={service}
                                onChange={(e) => {
                                  const newServices = [...config.keyServices];
                                  newServices[index] = e.target.value;
                                  setConfig({
                                    ...config,
                                    keyServices: newServices,
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Service name"
                              />
                              <button
                                onClick={() => {
                                  const newServices = config.keyServices.filter(
                                    (_, i) => i !== index
                                  );
                                  setConfig({
                                    ...config,
                                    keyServices: newServices,
                                  });
                                }}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              setConfig({
                                ...config,
                                keyServices: [...config.keyServices, ""],
                              })
                            }
                            className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Service
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unique Selling Points */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Unique Selling Points
                    </h3>
                    <div className="space-y-2">
                      {config.uniqueSellingPoints.map((usp, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={usp}
                            onChange={(e) => {
                              const newUSPs = [...config.uniqueSellingPoints];
                              newUSPs[index] = e.target.value;
                              setConfig({
                                ...config,
                                uniqueSellingPoints: newUSPs,
                              });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="What makes you unique?"
                          />
                          <button
                            onClick={() => {
                              const newUSPs = config.uniqueSellingPoints.filter(
                                (_, i) => i !== index
                              );
                              setConfig({
                                ...config,
                                uniqueSellingPoints: newUSPs,
                              });
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() =>
                          setConfig({
                            ...config,
                            uniqueSellingPoints: [
                              ...config.uniqueSellingPoints,
                              "",
                            ],
                          })
                        }
                        className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add USP
                      </button>
                    </div>
                  </div>

                  {/* Market Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Market Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Market Size
                        </label>
                        <input
                          type="text"
                          value={config.marketSize}
                          onChange={(e) =>
                            setConfig({ ...config, marketSize: e.target.value })
                          }
                          placeholder="e.g., $50B annually"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Market Growth Rate
                        </label>
                        <input
                          type="text"
                          value={config.marketGrowth}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              marketGrowth: e.target.value,
                            })
                          }
                          placeholder="e.g., 15% annually"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Financial Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Annual Revenue
                        </label>
                        <input
                          type="text"
                          value={config.annualRevenue}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              annualRevenue: e.target.value,
                            })
                          }
                          placeholder="e.g., $1M - $5M"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Funding Stage
                        </label>
                        <select
                          value={config.fundingStage}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              fundingStage: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">Select funding stage</option>
                          <option value="bootstrapped">Bootstrapped</option>
                          <option value="seed">Seed</option>
                          <option value="series-a">Series A</option>
                          <option value="series-b">Series B</option>
                          <option value="series-c">Series C</option>
                          <option value="ipo">IPO</option>
                          <option value="acquired">Acquired</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Target Audience
                    </label>
                    <textarea
                      value={config.targetAudience}
                      onChange={(e) =>
                        setConfig({ ...config, targetAudience: e.target.value })
                      }
                      placeholder="Describe your ideal customer profile..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Communication Tone */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Communication Tone
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        {
                          value: "professional",
                          label: "Professional",
                          icon: "👔",
                          desc: "Formal and business-focused",
                        },
                        {
                          value: "friendly",
                          label: "Friendly",
                          icon: "😊",
                          desc: "Warm and approachable",
                        },
                        {
                          value: "casual",
                          label: "Casual",
                          icon: "👕",
                          desc: "Relaxed and informal",
                        },
                        {
                          value: "expert",
                          label: "Expert",
                          icon: "🎓",
                          desc: "Knowledgeable and authoritative",
                        },
                      ].map((tone) => (
                        <button
                          key={tone.value}
                          onClick={() =>
                            setConfig({ ...config, tone: tone.value })
                          }
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            config.tone === tone.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="text-2xl mb-2">{tone.icon}</div>
                          <div className="text-sm font-medium">
                            {tone.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tone.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Services & Products
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        placeholder="Add a service or product"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && addService()}
                      />
                      <button
                        onClick={addService}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {config.services.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl"
                        >
                          <span className="text-gray-700 font-medium">
                            {service}
                          </span>
                          <button
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Goals */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Business Goals
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add a business goal"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && addGoal()}
                      />
                      <button
                        onClick={addGoal}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                      >
                        Add Goal
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {config.goals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl"
                        >
                          <span className="text-green-700 font-medium">
                            {goal}
                          </span>
                          <button
                            onClick={() => removeGoal(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Pricing Plans
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Define your service tiers and pricing structure
                      </p>
                    </div>
                    <button
                      onClick={addPricingTier}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Add Plan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {config.pricing.map((tier, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50"
                      >
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plan Name
                              </label>
                              <input
                                type="text"
                                value={tier.name}
                                onChange={(e) =>
                                  updatePricingTier(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Professional"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price
                              </label>
                              <input
                                type="text"
                                value={tier.price}
                                onChange={(e) =>
                                  updatePricingTier(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., $299/month"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Features & Benefits
                            </label>
                            <textarea
                              value={tier.features.join("\n")}
                              onChange={(e) =>
                                updatePricingFeatures(
                                  index,
                                  e.target.value
                                    .split("\n")
                                    .filter((f) => f.trim())
                                )
                              }
                              rows={4}
                              placeholder="One feature per line..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "qa" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Frequently Asked Questions
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Train Marvin to answer common customer questions
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Question
                        </label>
                        <input
                          type="text"
                          value={newQA.question}
                          onChange={(e) =>
                            setNewQA({ ...newQA, question: e.target.value })
                          }
                          placeholder="e.g., What are your pricing plans?"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Answer
                        </label>
                        <input
                          type="text"
                          value={newQA.answer}
                          onChange={(e) =>
                            setNewQA({ ...newQA, answer: e.target.value })
                          }
                          placeholder="e.g., Our plans start at $99/month..."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    </div>
                    <button
                      onClick={addQA}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Add Q&A
                    </button>
                  </div>

                  <div className="space-y-4">
                    {config.qa.map((qa, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <HelpCircle className="w-4 h-4 text-blue-500 mr-2" />
                              <p className="font-semibold text-gray-900">
                                {qa.question}
                              </p>
                            </div>
                            <p className="text-gray-700 ml-6">{qa.answer}</p>
                          </div>
                          <button
                            onClick={() => removeQA(index)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "advanced" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Advanced Settings
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Fine-tune Marvin's behavior and capabilities
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Personality Traits
                      </h4>
                      <div className="space-y-3">
                        {[
                          {
                            key: "confidence",
                            label: "Confidence Level",
                            desc: "How assertive should Marvin be?",
                          },
                          {
                            key: "empathy",
                            label: "Empathy Level",
                            desc: "How understanding should Marvin be?",
                          },
                          {
                            key: "persistence",
                            label: "Persistence",
                            desc: "How persistent should Marvin be?",
                          },
                        ].map((trait) => (
                          <div
                            key={trait.key}
                            className="p-4 border border-gray-200 rounded-xl"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-700">
                                {trait.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                Medium
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {trait.desc}
                            </p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">
                        Response Settings
                      </h4>
                      <div className="space-y-3">
                        {[
                          {
                            key: "length",
                            label: "Response Length",
                            desc: "Short, Medium, or Long responses",
                          },
                          {
                            key: "formality",
                            label: "Formality",
                            desc: "Casual to Formal communication",
                          },
                          {
                            key: "speed",
                            label: "Response Speed",
                            desc: "How quickly should Marvin respond?",
                          },
                        ].map((setting) => (
                          <div
                            key={setting.key}
                            className="p-4 border border-gray-200 rounded-xl"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-700">
                                {setting.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                Medium
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {setting.desc}
                            </p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-green-600 h-2 rounded-full w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Elite */}
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {config.companyName && (
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Configuration valid
                    </div>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 hover:bg-white rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
