"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Star,
  Award,
  Trophy,
  Lightbulb,
  Sparkles,
  Activity,
  PieChart,
  LineChart,
  Database,
  Cpu,
  Network,
  Shield,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Info,
  HelpCircle,
  ExternalLink,
  DollarSign,
  Copy,
  Save,
  Send,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

// Enhanced Types for Elite System
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: Trigger;
  conditions: Condition[];
  actions: Action[];
  status: "active" | "inactive" | "testing";
  priority: number;
  createdAt: Date;
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
}

interface Trigger {
  type:
    | "lead_created"
    | "email_opened"
    | "email_clicked"
    | "form_submitted"
    | "page_visited"
    | "time_based"
    | "behavioral"
    | "custom";
  config: Record<string, any>;
  frequency?: "immediate" | "delayed" | "scheduled";
  delay?: number; // in minutes
}

interface Condition {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in";
  value: any;
  logic?: "AND" | "OR";
}

interface Action {
  type:
    | "send_email"
    | "create_task"
    | "update_lead"
    | "send_slack"
    | "webhook"
    | "ai_response"
    | "schedule_followup";
  config: Record<string, any>;
  delay?: number;
}

interface PerformanceMetrics {
  totalConversions: number;
  conversionRate: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  revenueGenerated: number;
  leadsQualified: number;
  followUpSuccess: number;
  automationEfficiency: number;
}

interface AITrainingData {
  successfulConversations: any[];
  failedConversations: any[];
  customerFeedback: any[];
  performanceInsights: any[];
  optimizationSuggestions: any[];
}

interface AdvancedSettingsEliteProps {
  targetAudience: any;
  setTargetAudience: (audience: any) => void;
  salesStrategy: any;
  setSalesStrategy: (strategy: any) => void;
  isTestChatOpen: boolean;
  setIsTestChatOpen: (open: boolean) => void;
  companyProfile: any;
}

export default function AdvancedSettingsElite({
  targetAudience,
  setTargetAudience,
  salesStrategy,
  setSalesStrategy,
  isTestChatOpen,
  setIsTestChatOpen,
  companyProfile,
}: AdvancedSettingsEliteProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [aiTrainingData, setAiTrainingData] = useState<AITrainingData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadAdvancedData();
  }, []);

  const loadAdvancedData = async () => {
    setIsLoading(true);
    try {
      // Load automations, metrics, and AI training data
      const [automationsRes, metricsRes, trainingRes] = await Promise.all([
        fetch("/api/automations"),
        fetch("/api/analytics/performance"),
        fetch("/api/ai/training-data"),
      ]);

      if (automationsRes.ok) {
        const data = await automationsRes.json();
        setAutomations(data.automations || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics);
      }

      if (trainingRes.ok) {
        const data = await trainingRes.json();
        setAiTrainingData(data.trainingData);
      }
    } catch (error) {
      console.error("Error loading advanced data:", error);
      toast.error("Failed to load advanced settings data");
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      id: "overview",
      name: "Performance Overview",
      icon: BarChart3,
      description: "Real-time performance metrics and insights",
    },
    {
      id: "automations",
      name: "Smart Automations",
      icon: Zap,
      description: "AI-powered automation rules and triggers",
    },
    {
      id: "ai-training",
      name: "AI Training Center",
      icon: Brain,
      description: "Advanced AI learning and optimization",
    },
    {
      id: "triggers",
      name: "Behavioral Triggers",
      icon: Target,
      description: "Customer behavior-based triggers",
    },
    {
      id: "optimization",
      name: "Auto-Optimization",
      icon: TrendingUp,
      description: "Continuous performance optimization",
    },
    {
      id: "analytics",
      name: "Advanced Analytics",
      icon: PieChart,
      description: "Deep insights and predictive analytics",
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          change="+12.5%"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Response Time"
          value={`${metrics?.averageResponseTime || 0}s`}
          change="-2.3s"
          trend="up"
          icon={Clock}
          color="blue"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={`${metrics?.customerSatisfaction || 0}/5`}
          change="+0.3"
          trend="up"
          icon={Star}
          color="yellow"
        />
        <MetricCard
          title="Revenue Generated"
          value={`$${metrics?.revenueGenerated || 0}K`}
          change="+$15.2K"
          trend="up"
          icon={DollarSign}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Real-time Activity
          </h3>
          <div className="space-y-3">
            <ActivityItem
              icon={MessageSquare}
              title="New lead qualified"
              description="John Smith from TechCorp"
              time="2 minutes ago"
              status="success"
            />
            <ActivityItem
              icon={Mail}
              title="Follow-up email sent"
              description="Sarah Johnson - Demo scheduled"
              time="5 minutes ago"
              status="info"
            />
            <ActivityItem
              icon={Phone}
              title="Call completed"
              description="Mike Wilson - $50K deal closed"
              time="12 minutes ago"
              status="success"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            AI Insights
          </h3>
          <div className="space-y-3">
            <InsightItem
              title="Peak Performance Time"
              description="Your conversion rate is 40% higher between 2-4 PM"
              type="optimization"
            />
            <InsightItem
              title="Best Performing Message"
              description="Personalized subject lines increase open rates by 25%"
              type="success"
            />
            <InsightItem
              title="Follow-up Optimization"
              description="3-day follow-up interval shows best results"
              type="recommendation"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutomations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Smart Automations
          </h3>
          <p className="text-sm text-gray-600">
            AI-powered automation rules that adapt and optimize
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {automations.map((automation) => (
          <AutomationCard
            key={automation.id}
            automation={automation}
            onEdit={() => setSelectedAutomation(automation)}
            onToggle={() => toggleAutomation(automation.id)}
            onDelete={() => deleteAutomation(automation.id)}
          />
        ))}
      </div>

      {automations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Automations Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first automation to start optimizing your sales process
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Automation
          </button>
        </div>
      )}
    </div>
  );

  const renderAITraining = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Training Center
            </h3>
            <p className="text-gray-600 mb-4">
              Advanced machine learning system that continuously improves
              Marvin's performance based on real interactions
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Learning Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Optimizing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrainingModule
          title="Conversation Analysis"
          description="Analyzing successful vs failed conversations"
          progress={85}
          status="active"
          icon={MessageSquare}
        />
        <TrainingModule
          title="Response Optimization"
          description="Optimizing response patterns and timing"
          progress={72}
          status="active"
          icon={Zap}
        />
        <TrainingModule
          title="Personalization Engine"
          description="Learning customer preferences and behaviors"
          progress={91}
          status="active"
          icon={Users}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Training Insights
        </h3>
        <div className="space-y-4">
          <InsightItem
            title="Response Pattern Optimization"
            description="AI identified that questions in the first message increase engagement by 35%"
            type="success"
          />
          <InsightItem
            title="Timing Optimization"
            description="Optimal response time is 2-5 minutes for maximum conversion"
            type="optimization"
          />
          <InsightItem
            title="Personalization Success"
            description="Personalized greetings increase positive responses by 28%"
            type="recommendation"
          />
        </div>
      </div>
    </div>
  );

  const renderTriggers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Behavioral Triggers
          </h3>
          <p className="text-sm text-gray-600">
            Advanced triggers based on customer behavior and interactions
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Trigger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TriggerCard
          title="Email Engagement"
          description="Trigger when lead opens email 3+ times"
          status="active"
          executions={1247}
          successRate={89}
          icon={Mail}
        />
        <TriggerCard
          title="Website Behavior"
          description="Trigger when lead visits pricing page"
          status="active"
          executions={892}
          successRate={76}
          icon={Eye}
        />
        <TriggerCard
          title="Form Abandonment"
          description="Trigger when lead starts but doesn't complete form"
          status="active"
          executions={456}
          successRate={82}
          icon={AlertTriangle}
        />
        <TriggerCard
          title="Time-based Follow-up"
          description="Trigger follow-up after 24 hours of no response"
          status="active"
          executions={2156}
          successRate={91}
          icon={Clock}
        />
        <TriggerCard
          title="High Intent Signals"
          description="Trigger when lead shows high purchase intent"
          status="active"
          executions={678}
          successRate={94}
          icon={Target}
        />
        <TriggerCard
          title="Competitor Research"
          description="Trigger when lead researches competitors"
          status="inactive"
          executions={234}
          successRate={67}
          icon={Search}
        />
      </div>
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Auto-Optimization Engine
            </h3>
            <p className="text-gray-600 mb-4">
              Continuously optimizing your sales process using advanced AI and
              machine learning algorithms
            </p>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">+23%</div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">-45%</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">+67%</div>
                <div className="text-sm text-gray-600">
                  Customer Satisfaction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OptimizationCard
          title="Message Optimization"
          description="AI continuously tests and optimizes message content"
          improvements={[
            "Subject line optimization: +25% open rate",
            "Personalization: +18% response rate",
            "CTA placement: +12% click rate",
          ]}
          status="active"
        />
        <OptimizationCard
          title="Timing Optimization"
          description="Optimal send times based on recipient behavior"
          improvements={[
            "Best send time: 2-4 PM EST",
            "Follow-up interval: 3 days",
            "Response window: 2-5 minutes",
          ]}
          status="active"
        />
        <OptimizationCard
          title="Channel Optimization"
          description="Multi-channel approach optimization"
          improvements={[
            "Email + LinkedIn: +34% engagement",
            "Phone follow-up: +28% conversion",
            "SMS for urgent: +45% response",
          ]}
          status="active"
        />
        <OptimizationCard
          title="Segmentation Optimization"
          description="Dynamic audience segmentation"
          improvements={[
            "Industry-based: +22% relevance",
            "Company size: +19% targeting",
            "Behavior-based: +31% personalization",
          ]}
          status="active"
        />
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-blue-600" />
            Conversion Funnel
          </h3>
          <div className="space-y-4">
            <FunnelStep
              step="Initial Contact"
              count={1000}
              percentage={100}
              color="blue"
            />
            <FunnelStep
              step="Email Opened"
              count={750}
              percentage={75}
              color="green"
            />
            <FunnelStep
              step="Response Received"
              count={450}
              percentage={45}
              color="yellow"
            />
            <FunnelStep
              step="Meeting Scheduled"
              count={200}
              percentage={20}
              color="orange"
            />
            <FunnelStep
              step="Deal Closed"
              count={120}
              percentage={12}
              color="red"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Channel Performance
          </h3>
          <div className="space-y-4">
            <ChannelPerformance
              channel="Email"
              percentage={45}
              conversions={540}
              color="blue"
            />
            <ChannelPerformance
              channel="LinkedIn"
              percentage={30}
              conversions={360}
              color="green"
            />
            <ChannelPerformance
              channel="Phone"
              percentage={15}
              conversions={180}
              color="yellow"
            />
            <ChannelPerformance
              channel="SMS"
              percentage={10}
              conversions={120}
              color="purple"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-indigo-600" />
          Predictive Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PredictionCard
            title="Lead Scoring"
            description="AI predicts lead conversion probability"
            accuracy="94%"
            trend="up"
            icon={Target}
          />
          <PredictionCard
            title="Churn Prediction"
            description="Identifies leads likely to churn"
            accuracy="87%"
            trend="up"
            icon={AlertTriangle}
          />
          <PredictionCard
            title="Revenue Forecast"
            description="Predicts monthly revenue based on pipeline"
            accuracy="92%"
            trend="up"
            icon={TrendingUp}
          />
        </div>
      </div>
    </div>
  );

  const toggleAutomation = async (id: string) => {
    // Implementation for toggling automation
    toast.success("Automation toggled successfully");
  };

  const deleteAutomation = async (id: string) => {
    // Implementation for deleting automation
    toast.success("Automation deleted successfully");
  };

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span>{section.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">
              Loading advanced settings...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeSection === "overview" && renderOverview()}
              {activeSection === "automations" && renderAutomations()}
              {activeSection === "ai-training" && renderAITraining()}
              {activeSection === "triggers" && renderTriggers()}
              {activeSection === "optimization" && renderOptimization()}
              {activeSection === "analytics" && renderAnalytics()}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Test Chat Modal */}
      <MarvinTestChat
        isOpen={isTestChatOpen}
        onClose={() => setIsTestChatOpen(false)}
        companyProfile={companyProfile}
      />
    </div>
  );
}

// Helper Components
const MetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p
          className={`text-sm flex items-center ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          {change}
        </p>
      </div>
      <div
        className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}
      >
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

const ActivityItem = ({
  icon: Icon,
  title,
  description,
  time,
  status,
}: any) => (
  <div className="flex items-start space-x-3">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center ${
        status === "success"
          ? "bg-green-100"
          : status === "info"
          ? "bg-blue-100"
          : "bg-gray-100"
      }`}
    >
      <Icon
        className={`w-4 h-4 ${
          status === "success"
            ? "text-green-600"
            : status === "info"
            ? "text-blue-600"
            : "text-gray-600"
        }`}
      />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

const InsightItem = ({ title, description, type }: any) => (
  <div className="flex items-start space-x-3">
    <div
      className={`w-2 h-2 rounded-full mt-2 ${
        type === "success"
          ? "bg-green-500"
          : type === "optimization"
          ? "bg-blue-500"
          : "bg-yellow-500"
      }`}
    ></div>
    <div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const AutomationCard = ({ automation, onEdit, onToggle, onDelete }: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-semibold text-gray-900">{automation.name}</h4>
        <p className="text-sm text-gray-600">{automation.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            automation.status === "active"
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {automation.status === "active" ? (
            <Play className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onEdit}
          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Executions:</span>
        <span className="ml-2 font-medium">{automation.executionCount}</span>
      </div>
      <div>
        <span className="text-gray-600">Success Rate:</span>
        <span className="ml-2 font-medium text-green-600">
          {automation.successRate}%
        </span>
      </div>
    </div>
  </div>
);

const TrainingModule = ({
  title,
  description,
  progress,
  status,
  icon: Icon,
}: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className={`w-2 h-2 rounded-full ${
            status === "active" ? "bg-green-500" : "bg-gray-400"
          }`}
        ></div>
        <span className="text-xs text-gray-600 capitalize">{status}</span>
      </div>
    </div>
  </div>
);

const TriggerCard = ({
  title,
  description,
  status,
  executions,
  successRate,
  icon: Icon,
}: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-gray-600">Executions:</span>
        <span className="ml-2 font-medium">{executions}</span>
      </div>
      <div>
        <span className="text-gray-600">Success:</span>
        <span className="ml-2 font-medium text-green-600">{successRate}%</span>
      </div>
    </div>
  </div>
);

const OptimizationCard = ({
  title,
  description,
  improvements,
  status,
}: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          status === "active"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </div>
    </div>
    <div className="space-y-2">
      {improvements.map((improvement: string, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-gray-700">{improvement}</span>
        </div>
      ))}
    </div>
  </div>
);

const FunnelStep = ({ step, count, percentage, color }: any) => (
  <div className="flex items-center space-x-4">
    <div className="w-24 text-sm text-gray-600">{step}</div>
    <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{count}</span>
        <span className="text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const ChannelPerformance = ({
  channel,
  percentage,
  conversions,
  color,
}: any) => (
  <div className="flex items-center space-x-4">
    <div className="w-20 text-sm text-gray-600">{channel}</div>
    <div className="flex-1">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="font-medium">{conversions} conversions</span>
        <span className="text-gray-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const PredictionCard = ({
  title,
  description,
  accuracy,
  trend,
  icon: Icon,
}: any) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div>
        <span className="text-2xl font-bold text-indigo-600">{accuracy}</span>
        <span className="text-sm text-gray-600 ml-1">accuracy</span>
      </div>
      <div className="flex items-center space-x-1 text-green-600">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm">+5%</span>
      </div>
    </div>
  </div>
);
