"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  Users,
  Target,
  Eye,
  MoreVertical,
  TrendingUp,
  BarChart3,
  Settings,
  Clock,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingState";
import { MarvinInsightsPanel } from "@/components/marvin/MarvinInsightsPanel";
import { MarvinToggle } from "@/components/marvin/MarvinToggle";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { CampaignDetailsModal } from "@/components/campaigns/CampaignDetailsModal";
import { HelpButton } from "@/components/HelpCenter/HelpButton";

interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  mode: CampaignMode;
  targetSegment: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
  createdAt: Date;
  lastSent: Date;
  nextSend: Date;
  sequences: CampaignSequence[];
}

type CampaignType =
  | "EMAIL_SEQUENCE"
  | "LINKEDIN_SEQUENCE"
  | "PHONE_SEQUENCE"
  | "MIXED_SEQUENCE"
  | "NURTURE"
  | "REACTIVATION"
  | "CART_RECOVERY"
  | "COLD_INTRO";

type CampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "RUNNING"
  | "LEARNING"
  | "PAUSED"
  | "COMPLETED"
  | "ARCHIVED";

type CampaignMode = "AUTOPILOT" | "COPILOT";

interface CampaignSequence {
  id: string;
  step: number;
  delay: number;
  type: string;
  subject: string;
  content: string;
  status: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showMarvinInsights, setShowMarvinInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [marvinOpened, setMarvinOpened] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // Stats
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    avgOpenRate: 0,
    avgConversionRate: 0,
  });

  useEffect(() => {
    loadCampaigns();
    loadStats();
    // Check if Marvin was opened before in this session
    const opened = sessionStorage.getItem("marvin-opened-campaigns") === "true";
    setMarvinOpened(opened);
  }, [selectedStatus, selectedType]);

  const handleMarvinOpen = () => {
    setShowMarvinInsights(true);
    if (!marvinOpened) {
      sessionStorage.setItem("marvin-opened-campaigns", "true");
      setMarvinOpened(true);
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedType !== "all") params.append("type", selectedType);

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();

      if (data.success) {
        setCampaigns(data.data.campaigns);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/analytics/kpis");
      const data = await response.json();

      if (data.success) {
        setStats({
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter((c) => c.status === "RUNNING")
            .length,
          avgOpenRate:
            campaigns.reduce((acc, c) => acc + c.openRate, 0) /
              campaigns.length || 0,
          avgConversionRate:
            campaigns.reduce((acc, c) => acc + c.conversionRate, 0) /
              campaigns.length || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getStatusBadgeVariant = (status: CampaignStatus) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SCHEDULED":
        return "info";
      case "RUNNING":
        return "success";
      case "LEARNING":
        return "warning";
      case "PAUSED":
        return "warning";
      case "COMPLETED":
        return "default";
      case "ARCHIVED":
        return "ghost";
      default:
        return "default";
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case "EMAIL_SEQUENCE":
        return <Mail className="w-4 h-4" />;
      case "LINKEDIN_SEQUENCE":
        return <Users className="w-4 h-4" />;
      case "PHONE_SEQUENCE":
        return <Users className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCampaignAction = async (
    campaignId: string,
    action: "play" | "pause" | "duplicate" | "delete"
  ) => {
    setActionLoading(campaignId);

    try {
      if (action === "delete") {
        // Delete requires confirmation
        if (
          !confirm(
            "Are you sure you want to delete this campaign? This action cannot be undone."
          )
        ) {
          setActionLoading(null);
          return;
        }

        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete campaign");
        }
      } else {
        // Play, Pause, Duplicate
        const response = await fetch(`/api/campaigns/${campaignId}/actions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${action} campaign`);
        }
      }

      // Success - reload campaigns
      await loadCampaigns();

      // Show success message based on action
      const messages = {
        play: "Campaign started successfully",
        pause: "Campaign paused successfully",
        duplicate: "Campaign duplicated successfully",
        delete: "Campaign deleted successfully",
      };

      console.log(messages[action]);
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      alert(`Failed to ${action} campaign. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200">
            Campaigns
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 mt-1 transition-colors duration-200">
            Automate and optimize your outreach
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            variant="secondary"
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Analytics
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Create Campaign
          </ActionButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={Target}
          trend={[15, 18, 16, 22, 25, 23, 28]}
          change={15}
          changeType="increase"
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns}
          icon={Play}
          trend={[5, 6, 5, 8, 9, 8, 10]}
          change={20}
          changeType="increase"
        />
        <StatCard
          title="Avg Open Rate"
          value={`${stats.avgOpenRate.toFixed(1)}%`}
          icon={Mail}
          trend={[20, 22, 21, 25, 27, 26, 29]}
          change={8}
          changeType="increase"
        />
        <StatCard
          title="Avg Conversion"
          value={`${stats.avgConversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          trend={[8, 9, 10, 11, 12, 11, 13]}
          change={12}
          changeType="increase"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RUNNING">Running</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200"
          >
            <option value="all">All Types</option>
            <option value="EMAIL_SEQUENCE">Email Sequence</option>
            <option value="LINKEDIN_SEQUENCE">LinkedIn Sequence</option>
            <option value="NURTURE">Nurture</option>
            <option value="REACTIVATION">Reactivation</option>
            <option value="CART_RECOVERY">Cart Recovery</option>
          </select>
        </div>
      </Card>

      {/* Campaigns Grid */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No campaigns found"
          description="Create your first campaign to start engaging with leads"
          action={{
            label: "Create Campaign",
            onClick: () => console.log("Create campaign"),
            icon: <Plus className="w-4 h-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} hover className="cursor-pointer">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center transition-colors duration-200">
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 truncate transition-colors duration-200">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 transition-colors duration-200">
                      {campaign.recipients} recipients
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={getStatusBadgeVariant(campaign.status)}
                    size="sm"
                    dot
                  >
                    {campaign.status}
                  </Badge>
                  <Badge variant="ghost" size="sm">
                    {campaign.mode}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 mb-1 transition-colors duration-200">
                    Open Rate
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200">
                    {campaign.openRate}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 mb-1 transition-colors duration-200">
                    Click Rate
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200">
                    {campaign.clickRate}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 mb-1 transition-colors duration-200">
                    Reply Rate
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200 dark:text-gray-100 transition-colors duration-200">
                    {campaign.replyRate}%
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 transition-colors duration-200">
                  <div className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 mb-1 transition-colors duration-200">
                    Conversion
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400 transition-colors duration-200">
                    {campaign.conversionRate}%
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-2">
                  <span>
                    Sequence Progress ({campaign.sequences.length} steps)
                  </span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors duration-200">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: "75%" }}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 dark:text-gray-400 transition-colors duration-200">
                  {campaign.status === "RUNNING" ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Next send in 2h
                    </div>
                  ) : campaign.status === "SCHEDULED" ? (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Starts tomorrow
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Ready to launch
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {campaign.status === "RUNNING" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignAction(campaign.id, "pause");
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="Pause"
                      disabled={actionLoading === campaign.id}
                    >
                      <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-200" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCampaignAction(campaign.id, "play");
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                      title="Start"
                      disabled={actionLoading === campaign.id}
                    >
                      <Play className="w-4 h-4 text-green-600" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCampaignAction(campaign.id, "duplicate");
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                    title="Duplicate"
                    disabled={actionLoading === campaign.id}
                  >
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-200" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCampaign(campaign);
                      setShowDetailsModal(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-200" />
                  </button>
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="More"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-200" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Marvin Toggle */}
      <MarvinToggle
        onClick={handleMarvinOpen}
        isOpen={showMarvinInsights}
        insightCount={insightCount}
        context="campaigns"
        showBadge={marvinOpened}
      />

      {/* Marvin Insights Panel */}
      <MarvinInsightsPanel
        isOpen={showMarvinInsights}
        onClose={() => setShowMarvinInsights(false)}
        context="campaigns"
        data={{ campaigns, stats }}
        onAction={(action, data) => {
          console.log("Marvin action:", action, data);
          if (action === "Optimize Campaign") {
            // Handle optimize action
          }
        }}
        onInsightsLoad={(count) => setInsightCount(count)}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCampaigns();
          loadStats();
        }}
      />

      {/* Campaign Details Modal */}
      <CampaignDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onAction={(action) => {
          if (selectedCampaign) {
            handleCampaignAction(selectedCampaign.id, action as any);
          }
        }}
      />

      {/* Help Center Button */}
      <HelpButton context="campaigns" />
    </div>
  );
}
