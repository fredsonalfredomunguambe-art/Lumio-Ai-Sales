"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Mail,
  DollarSign,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { getChartColors } from "@/lib/chartTheme";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { MarvinInsightsPanel } from "@/components/marvin/MarvinInsightsPanel";
import { MarvinToggle } from "@/components/marvin/MarvinToggle";
import { HelpButton } from "@/components/HelpCenter/HelpButton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function InsightsPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(false);
  const [showMarvinInsights, setShowMarvinInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [marvinOpened, setMarvinOpened] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if Marvin was opened before in this session
  useEffect(() => {
    const opened = sessionStorage.getItem("marvin-opened-insights") === "true";
    setMarvinOpened(opened);
  }, []);

  const handleMarvinOpen = () => {
    setShowMarvinInsights(true);
    if (!marvinOpened) {
      sessionStorage.setItem("marvin-opened-insights", "true");
      setMarvinOpened(true);
    }
  };

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 12000, leads: 145 },
    { month: "Feb", revenue: 15000, leads: 178 },
    { month: "Mar", revenue: 18000, leads: 210 },
    { month: "Apr", revenue: 22000, leads: 245 },
    { month: "May", revenue: 28000, leads: 298 },
    { month: "Jun", revenue: 35000, leads: 345 },
  ];

  const conversionFunnelData = [
    { stage: "Visitors", count: 10000, percentage: 100 },
    { stage: "Leads", count: 2500, percentage: 25 },
    { stage: "Qualified", count: 750, percentage: 7.5 },
    { stage: "Proposals", count: 300, percentage: 3 },
    { stage: "Customers", count: 150, percentage: 1.5 },
  ];

  const sourceData = [
    { name: "Shopify", value: 450, color: "#3B82F6" },
    { name: "LinkedIn", value: 320, color: "#10B981" },
    { name: "Salesforce", value: 280, color: "#F59E0B" },
    { name: "HubSpot", value: 180, color: "#8B5CF6" },
    { name: "Direct", value: 120, color: "#6B7280" },
  ];

  const campaignPerformanceData = [
    {
      name: "Email Seq 1",
      sent: 500,
      opened: 320,
      clicked: 145,
      converted: 45,
    },
    { name: "LinkedIn 1", sent: 300, opened: 210, clicked: 98, converted: 32 },
    { name: "Nurture 1", sent: 450, opened: 298, clicked: 156, converted: 52 },
    { name: "Reactivation", sent: 200, opened: 98, clicked: 42, converted: 15 },
  ];

  const timeBasedData = [
    { hour: "9 AM", leads: 12, meetings: 2 },
    { hour: "10 AM", leads: 25, meetings: 5 },
    { hour: "11 AM", leads: 32, meetings: 7 },
    { hour: "12 PM", leads: 18, meetings: 3 },
    { hour: "1 PM", leads: 15, meetings: 2 },
    { hour: "2 PM", leads: 42, meetings: 9 },
    { hour: "3 PM", leads: 38, meetings: 8 },
    { hour: "4 PM", leads: 28, meetings: 6 },
    { hour: "5 PM", leads: 15, meetings: 3 },
  ];

  const handleExport = () => {
    console.log("Exporting analytics data...");
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const isDark = mounted && theme === "dark";
  const chartColors = getChartColors(isDark);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50 font-outfit">
            Insights
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-1 font-outfit">
            Data-driven insights to optimize performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 font-outfit"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <ActionButton
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            Export
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={
              <RefreshCw
                className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"}
              />
            }
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </ActionButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={35000}
          format="currency"
          icon={DollarSign}
          trend={[12, 15, 18, 22, 28, 35]}
          change={27}
          changeType="increase"
        />
        <StatCard
          title="Total Leads"
          value={1350}
          icon={Users}
          trend={[145, 178, 210, 245, 298, 345]}
          change={16}
          changeType="increase"
        />
        <StatCard
          title="Conversion Rate"
          value={11.1}
          format="percentage"
          icon={Target}
          trend={[8.5, 9.2, 10.1, 10.5, 10.8, 11.1]}
          change={8}
          changeType="increase"
        />
        <StatCard
          title="Active Campaigns"
          value={12}
          icon={Mail}
          trend={[8, 9, 10, 11, 11, 12]}
          change={5}
          changeType="increase"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue & Leads Trend
              </h3>
              <p className="text-sm text-gray-500">Monthly performance</p>
            </div>
            <Badge variant="success" icon={<TrendingUp className="w-3 h-3" />}>
              +27% vs last period
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartColors.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartColors.secondary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartColors.secondary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" stroke={chartColors.axis} />
              <YAxis stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: "8px",
                  color: chartColors.text,
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={chartColors.primary}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke={chartColors.secondary}
                fillOpacity={1}
                fill="url(#colorLeads)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversion Funnel
            </h3>
            <p className="text-sm text-gray-500">Lead journey breakdown</p>
          </div>
          <div className="space-y-3">
            {conversionFunnelData.map((stage, index) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {stage.stage}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stage.count.toLocaleString()} ({stage.percentage}%)
                      </div>
                    </div>
                  </div>
                  {index > 0 && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <ArrowDown className="w-4 h-4 text-red-500" />
                      {(
                        ((conversionFunnelData[index - 1].count - stage.count) /
                          conversionFunnelData[index - 1].count) *
                        100
                      ).toFixed(1)}
                      % drop
                    </div>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all"
                    style={{ width: `${stage.percentage * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lead Sources */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Sources
            </h3>
            <p className="text-sm text-gray-500">Distribution by channel</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {sourceData.map((source) => (
              <div key={source.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                />
                <div className="text-sm">
                  <span className="text-gray-900 font-medium">
                    {source.name}
                  </span>
                  <span className="text-gray-500 ml-1">({source.value})</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Campaign Performance
            </h3>
            <p className="text-sm text-gray-500">Engagement metrics</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={campaignPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="name" stroke={chartColors.axis} fontSize={12} />
              <YAxis stroke={chartColors.axis} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  border: `1px solid ${chartColors.tooltipBorder}`,
                  borderRadius: "8px",
                  color: chartColors.text,
                }}
              />
              <Legend />
              <Bar
                dataKey="opened"
                fill={chartColors.primary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="clicked"
                fill={chartColors.secondary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="converted"
                fill={chartColors.tertiary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Time-Based Analysis */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Best Performing Hours
          </h3>
          <p className="text-sm text-gray-500">
            Leads and meetings by time of day
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeBasedData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="hour" stroke={chartColors.axis} />
            <YAxis stroke={chartColors.axis} />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.tooltipBorder}`,
                borderRadius: "8px",
                color: chartColors.text,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="meetings"
              stroke={chartColors.secondary}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="bordered" className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Peak Performance
              </h4>
              <p className="text-sm text-gray-700">
                2-3 PM shows highest lead engagement. Schedule important
                activities during this window.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" className="bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Top Performer
              </h4>
              <p className="text-sm text-gray-700">
                Shopify leads convert 32% better than average. Focus expansion
                on this channel.
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" className="bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Action Needed
              </h4>
              <p className="text-sm text-gray-700">
                45% drop-off at proposal stage. Review pricing and value
                proposition.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Marvin Toggle */}
      <MarvinToggle
        onClick={handleMarvinOpen}
        isOpen={showMarvinInsights}
        insightCount={insightCount}
        context="insights"
        showBadge={marvinOpened}
      />

      {/* Marvin Insights Panel */}
      <MarvinInsightsPanel
        isOpen={showMarvinInsights}
        onClose={() => setShowMarvinInsights(false)}
        context="insights"
        data={{ timeRange }}
        onAction={(action, data) => {
          console.log("Marvin action:", action, data);
        }}
        onInsightsLoad={(count) => setInsightCount(count)}
      />

      {/* Help Center Button */}
      <HelpButton context="insights" />
    </div>
  );
}
