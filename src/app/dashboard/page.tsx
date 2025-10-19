"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Target,
  AlertCircle,
  CheckCircle,
  Bot,
  BarChart3,
  Calendar,
  Upload,
  Activity,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/NotificationSystem";
import MarvinAssistant from "@/components/MarvinAssistant";
import SmartMetricCard from "@/components/SmartMetricCard";
import CommandPalette from "@/components/CommandPalette";
import { SmartNotificationContainer } from "@/components/SmartNotificationSystem";
import { HelpButton } from "@/components/HelpCenter/HelpButton";
import { SDRAgentControl } from "@/components/marvin/SDRAgentControl";

interface KPI {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  trend?: number[];
}

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  message: string;
  action: string;
  timestamp: Date;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "lead" | "campaign" | "meeting" | "conversion";
  title: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "info";
}

// Map icon strings to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Mail,
  Target,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
};

export default function DashboardHome() {
  const toast = useToast();
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load data from API
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pipelineData, setPipelineData] = useState<
    Array<{ stage: string; count: number; percentage: number }>
  >([]);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load KPIs
      const kpisResponse = await fetch("/api/analytics/kpis");
      const kpisData = await kpisResponse.json();
      if (kpisData.success) {
        // Map icon strings to actual components
        const kpisWithIcons = (kpisData.data.kpis || []).map(
          (kpi: {
            icon: string;
            title: string;
            value: string;
            change: string;
            changeType: "positive" | "negative" | "neutral";
            trend?: number[];
          }) => ({
            ...kpi,
            icon: iconMap[kpi.icon] || Activity, // Fallback to Activity icon
          })
        );
        setKpis(kpisWithIcons);
      }

      // Load alerts
      const alertsResponse = await fetch("/api/alerts");
      const alertsData = await alertsResponse.json();
      if (alertsData.success) {
        // Convert timestamp strings to Date objects
        const alertsWithDates = (alertsData.data.alerts || []).map(
          (alert: {
            id: string;
            type: "warning" | "info" | "success" | "error";
            message: string;
            action: string;
            timestamp: string;
          }) => ({
            ...alert,
            timestamp: new Date(alert.timestamp),
          })
        );
        setAlerts(alertsWithDates);
      }

      // Load quick actions (static configuration)
      setQuickActions([
        {
          title: "Import Leads",
          description: "Upload CSV or connect data source",
          icon: Upload,
          href: "/dashboard/leads",
          color: "from-blue-500 to-blue-600",
        },
        {
          title: "Create Campaign",
          description: "Start a new email sequence",
          icon: Mail,
          href: "/dashboard/campaigns",
          color: "from-green-500 to-green-600",
        },
        {
          title: "Test Marvin",
          description: "Try AI-powered responses",
          icon: Bot,
          href: "#",
          color: "from-blue-500 to-blue-600",
        },
        {
          title: "View Analytics",
          description: "Check performance metrics",
          icon: BarChart3,
          href: "/dashboard/insights",
          color: "from-orange-500 to-orange-600",
        },
      ]);

      // Load recent activity
      const activityResponse = await fetch("/api/activity");
      const activityData = await activityResponse.json();
      if (activityData.success) {
        // Convert timestamp strings to Date objects
        const activitiesWithDates = (activityData.data.activities || []).map(
          (activity: {
            id: string;
            type: "lead" | "campaign" | "meeting" | "conversion";
            title: string;
            description: string;
            timestamp: string;
            status: "success" | "warning" | "info";
          }) => ({
            ...activity,
            timestamp: new Date(activity.timestamp),
          })
        );
        setRecentActivity(activitiesWithDates);
      }

      // Load pipeline data
      const pipelineResponse = await fetch("/api/analytics/pipeline");
      const pipelineResponseData = await pipelineResponse.json();
      if (pipelineResponseData.success) {
        setPipelineData(pipelineResponseData.data.pipeline || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Error", "Failed to load dashboard data");
    }
  };

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Activity className="h-5 w-5 text-blue-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "lead":
        return <Users className="h-4 w-4" />;
      case "campaign":
        return <Mail className="h-4 w-4" />;
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "conversion":
        return <Target className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: RecentActivity["status"]) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section with Pipeline Background */}
      <div className="relative overflow-hidden rounded-lg p-5 text-white shadow-md">
        {/* Pipeline Background Image */}
        <div className="absolute inset-0">
          <img
            src="/fotos/pipeline.png"
            alt="Pipeline Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-bold mb-1 font-outfit text-white">
              Welcome back!
            </h1>
            <p className="text-blue-200 text-sm font-outfit">
              Your sales pipeline at a glance
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right mr-3">
              <p className="text-sm font-semibold font-outfit text-white">
                Marvin AI
              </p>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-300 font-outfit">
                  Active
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Compact KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <SmartMetricCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={parseFloat(kpi.change)}
            changeType={kpi.changeType}
            icon={kpi.icon}
            trend={kpi.trend}
            format="number"
            explanation={`Real-time ${kpi.title.toLowerCase()} metric from your connected integrations`}
            marvinTip={`Marvin: Analyzing ${kpi.title.toLowerCase()} trends...`}
          />
        ))}
      </div>

      {/* SDR Agent Control */}
      <SDRAgentControl />

      {/* Marvin Assistant */}
      <MarvinAssistant
        context="dashboard"
        data={{ kpis, alerts, recentActivity }}
      />

      {/* Compact Alerts */}
      {alerts.length > 0 && (
        <div className="card-compact">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 font-outfit">
              Marvin Alerts
            </h2>
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 text-xxs font-semibold rounded border border-yellow-200 dark:border-yellow-500/20 font-outfit">
              {alerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getAlertIcon(alert.type)}
                  <p className="text-xs font-medium text-gray-900 dark:text-zinc-100 truncate font-outfit">
                    {alert.message}
                  </p>
                </div>
                <button
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium ml-2 flex-shrink-0 font-outfit"
                  onClick={() =>
                    toast.info("Action", `Executed: ${alert.action}`)
                  }
                >
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compact Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="group p-4 border border-gray-200 dark:border-zinc-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <action.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100 text-sm truncate font-outfit">
                  {action.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate font-outfit">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Compact Pipeline */}
      <div className="card-compact">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 font-outfit">
            Sales Pipeline
          </h2>
          <Link
            href="/dashboard/leads"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium font-outfit"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {pipelineData.map((stage, index) => (
            <div
              key={stage.stage}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-outfit">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs text-gray-900 dark:text-zinc-100 block truncate font-outfit">
                    {stage.stage}
                  </span>
                  <p className="text-xxs text-gray-500 dark:text-zinc-400 font-outfit">
                    {stage.count} leads
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-zinc-100 font-outfit">
                    {stage.percentage}%
                  </div>
                </div>
                <div className="w-20 bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Recent Activity */}
      <div className="card-compact">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-zinc-50 font-outfit">
            Recent Activity
          </h2>
          <Link
            href="/dashboard/insights"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium font-outfit"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-2">
          {recentActivity.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${getActivityColor(
                  activity.status
                )} dark:opacity-90 flex-shrink-0`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100 truncate font-outfit">
                  {activity.title}
                </p>
                <p className="text-xxs text-gray-500 dark:text-zinc-400 truncate font-outfit">
                  {activity.description}
                </p>
              </div>
              <div className="text-xxs text-gray-400 dark:text-zinc-500 flex-shrink-0 font-outfit">
                {activity.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State for First-Time Users */}
      {false && ( // This would be based on actual user state
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-50 mb-2">
            Get Started with Lumio
          </h3>
          <p className="text-gray-500 dark:text-zinc-400 mb-6">
            Import your first leads or connect a data source to begin.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Import CSV
            </button>
            <button className="border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800">
              Connect Source
            </button>
          </div>
        </div>
      )}

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(path) => {
          // Handle navigation
          console.log("Navigate to:", path);
        }}
      />

      {/* Help Center Button */}
      <HelpButton context="home" />
    </div>
  );
}
