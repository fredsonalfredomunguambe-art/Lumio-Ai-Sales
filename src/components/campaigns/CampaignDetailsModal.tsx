"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Copy,
  Trash2,
  Mail,
  Users,
  BarChart3,
  Calendar,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onAction: (action: string) => void;
}

export function CampaignDetailsModal({
  isOpen,
  onClose,
  campaign,
  onAction,
}: CampaignDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!campaign) return null;

  // Mock performance data for charts
  const performanceData = [
    { day: "Mon", sent: 100, opened: 45, clicked: 12, replied: 3 },
    { day: "Tue", sent: 120, opened: 58, clicked: 18, replied: 5 },
    { day: "Wed", sent: 95, opened: 42, clicked: 10, replied: 2 },
    { day: "Thu", sent: 110, opened: 52, clicked: 15, replied: 4 },
    { day: "Fri", sent: 130, opened: 62, clicked: 20, replied: 6 },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "SCHEDULED":
        return "info";
      case "RUNNING":
        return "success";
      case "PAUSED":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center justify-between w-full pr-8">
          <div>
            <ModalTitle>{campaign.name}</ModalTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusBadgeVariant(campaign.status)} dot>
                {campaign.status}
              </Badge>
              <Badge variant="ghost">{campaign.mode}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaign.status === "RUNNING" ? (
              <ActionButton
                variant="secondary"
                size="sm"
                icon={<Pause className="w-4 h-4" />}
                onClick={() => onAction("pause")}
              >
                Pause
              </ActionButton>
            ) : (
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                onClick={() => onAction("play")}
              >
                Start
              </ActionButton>
            )}
            <ActionButton
              variant="secondary"
              size="sm"
              icon={<Copy className="w-4 h-4" />}
              onClick={() => onAction("duplicate")}
            >
              Duplicate
            </ActionButton>
          </div>
        </div>
      </ModalHeader>

      <ModalContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Recipients</div>
                <div className="text-2xl font-bold text-gray-900">
                  {campaign.recipients}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Open Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {campaign.openRate}%
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Click Rate</div>
                <div className="text-2xl font-bold text-purple-600">
                  {campaign.clickRate}%
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 mb-1">Reply Rate</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {campaign.replyRate}%
                </div>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">
                Campaign Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Type</div>
                  <div className="font-medium">{campaign.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Target Segment</div>
                  <div className="font-medium">
                    {campaign.targetSegment || "All Leads"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="font-medium">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last Sent</div>
                  <div className="font-medium">
                    {campaign.lastSent
                      ? new Date(campaign.lastSent).toLocaleDateString()
                      : "Never"}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sequences Tab */}
          <TabsContent value="sequences" className="space-y-4">
            <div className="space-y-3">
              {campaign.sequences?.map((seq: any, index: number) => (
                <div
                  key={seq.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {seq.subject || "Untitled"}
                        </h5>
                        <Badge variant="ghost" size="sm">
                          {seq.channel || "email"}
                        </Badge>
                        <Badge
                          variant={
                            seq.status === "SENT"
                              ? "success"
                              : seq.status === "SCHEDULED"
                              ? "info"
                              : "default"
                          }
                          size="sm"
                        >
                          {seq.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {seq.delay === 0
                          ? "Send immediately"
                          : `Wait ${seq.delay} hours after previous step`}
                      </p>
                      <div className="bg-gray-100 rounded p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {seq.content || "No content"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Chart */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                Daily Performance
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorOpened"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sent"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorSent)"
                    name="Sent"
                  />
                  <Area
                    type="monotone"
                    dataKey="opened"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorOpened)"
                    name="Opened"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Funnel */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                Engagement Funnel
              </h4>
              <div className="space-y-2">
                {[
                  {
                    label: "Sent",
                    value: campaign.recipients,
                    color: "bg-blue-600",
                  },
                  {
                    label: "Opened",
                    value: Math.round(
                      (campaign.recipients * campaign.openRate) / 100
                    ),
                    color: "bg-green-600",
                  },
                  {
                    label: "Clicked",
                    value: Math.round(
                      (campaign.recipients * campaign.clickRate) / 100
                    ),
                    color: "bg-purple-600",
                  },
                  {
                    label: "Replied",
                    value: Math.round(
                      (campaign.recipients * campaign.replyRate) / 100
                    ),
                    color: "bg-yellow-600",
                  },
                ].map((stage, index) => (
                  <div key={stage.label} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600">
                      {stage.label}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-8 relative">
                        <div
                          className={`${stage.color} h-8 rounded-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all`}
                          style={{
                            width: `${
                              (stage.value / campaign.recipients) * 100
                            }%`,
                          }}
                        >
                          {stage.value > 0 && stage.value}
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-semibold text-gray-900 text-right">
                      {((stage.value / campaign.recipients) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Recipients Tab */}
          <TabsContent value="recipients">
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Recipients list will be loaded here</p>
              <p className="text-sm mt-2">
                Total: {campaign.recipients} recipients
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </ModalContent>

      <ModalFooter>
        <ActionButton
          variant="danger"
          icon={<Trash2 className="w-4 h-4" />}
          onClick={() => {
            if (confirm("Are you sure you want to delete this campaign?")) {
              onAction("delete");
              onClose();
            }
          }}
        >
          Delete Campaign
        </ActionButton>
        <ActionButton variant="secondary" onClick={onClose}>
          Close
        </ActionButton>
      </ModalFooter>
    </Modal>
  );
}
