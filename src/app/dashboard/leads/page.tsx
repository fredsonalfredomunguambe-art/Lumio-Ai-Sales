"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Trash2,
  Star,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/LoadingState";
import { MarvinInsightsPanel } from "@/components/marvin/MarvinInsightsPanel";
import { MarvinToggle } from "@/components/marvin/MarvinToggle";
import { ScheduleMeetingButton } from "@/components/calendar/ScheduleMeetingButton";
import { HelpButton } from "@/components/HelpCenter/HelpButton";
import { IntegrationIcon } from "@/components/integrations/IntegrationIcon";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  source: string | null;
  score: number | null;
  status: LeadStatus;
  updatedAt: Date;
  tags: string | null;
}

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<keyof Lead>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showMarvinInsights, setShowMarvinInsights] = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [marvinOpened, setMarvinOpened] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadLeads();
    loadStats();
    // Check if Marvin was opened before in this session
    const opened = sessionStorage.getItem("marvin-opened-leads") === "true";
    setMarvinOpened(opened);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedStatus, selectedSource, sortBy, sortOrder]);

  const handleMarvinOpen = () => {
    setShowMarvinInsights(true);
    if (!marvinOpened) {
      sessionStorage.setItem("marvin-opened-leads", "true");
      setMarvinOpened(true);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: selectedStatus,
        source: selectedSource,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.data.leads);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
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
          total: data.data.totalLeads || 0,
          new: data.data.newLeads || 0,
          qualified: data.data.qualifiedLeads || 0,
          converted: data.data.convertedLeads || 0,
          conversionRate: data.data.conversionRate || 0,
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getStatusBadgeVariant = (status: LeadStatus) => {
    switch (status) {
      case "NEW":
        return "primary";
      case "CONTACTED":
        return "info";
      case "QUALIFIED":
        return "warning";
      case "CONVERTED":
        return "success";
      case "LOST":
        return "danger";
      default:
        return "default";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-gray-600 dark:text-zinc-400";
  };

  const handleSort = (column: keyof Lead) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-50 font-outfit">
            Leads
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-1 font-outfit">
            Manage and nurture your prospects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton
            variant="secondary"
            icon={<Upload className="w-4 h-4" />}
          >
            Import
          </ActionButton>
          <ActionButton
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </ActionButton>
          <ActionButton variant="primary" icon={<Plus className="w-4 h-4" />}>
            Add Lead
          </ActionButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Leads"
          value={stats.total}
          icon={Users}
          trend={[45, 52, 48, 65, 72, 68, 75]}
          change={12}
          changeType="increase"
        />
        <StatCard
          title="New Leads"
          value={stats.new}
          icon={Star}
          trend={[12, 18, 15, 22, 28, 25, 30]}
          change={25}
          changeType="increase"
        />
        <StatCard
          title="Qualified"
          value={stats.qualified}
          icon={Target}
          trend={[8, 12, 10, 15, 18, 16, 20]}
          change={15}
          changeType="increase"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={CheckCircle}
          trend={[10, 12, 11, 14, 16, 15, 18]}
          change={8}
          changeType="increase"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-outfit placeholder:font-outfit"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-outfit"
          >
            <option value="all">All Status</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-outfit"
          >
            <option value="all">All Sources</option>
            <option value="shopify">Shopify</option>
            <option value="salesforce">Salesforce</option>
            <option value="hubspot">HubSpot</option>
            <option value="linkedin">LinkedIn</option>
            <option value="mailchimp">Mailchimp</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 rounded transition-colors font-outfit ${
                view === "table"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1 rounded transition-colors font-outfit ${
                view === "cards"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card padding="sm" className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? "s" : ""}{" "}
              selected
            </span>
            <div className="flex items-center gap-2">
              <ActionButton size="sm" variant="secondary">
                Assign
              </ActionButton>
              <ActionButton size="sm" variant="secondary">
                Tag
              </ActionButton>
              <ActionButton size="sm" variant="secondary">
                Export
              </ActionButton>
              <ActionButton
                size="sm"
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete
              </ActionButton>
            </div>
          </div>
        </Card>
      )}

      {/* Leads Table/Cards */}
      <Card padding="none">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} />
          </div>
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No leads found"
            description="Get started by importing leads or creating a new one"
            action={{
              label: "Add Your First Lead",
              onClick: () => console.log("Add lead"),
              icon: <Plus className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Import from CSV",
              onClick: () => console.log("Import"),
            }}
          />
        ) : view === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead
                  sortable
                  sortDirection={sortBy === "firstName" ? sortOrder : null}
                  onSort={() => handleSort("firstName")}
                >
                  Name
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead
                  sortable
                  sortDirection={sortBy === "score" ? sortOrder : null}
                  onSort={() => handleSort("score")}
                >
                  Score
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead
                  sortable
                  sortDirection={sortBy === "updatedAt" ? sortOrder : null}
                  onSort={() => handleSort("updatedAt")}
                >
                  Last Updated
                </TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} hover>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id)}
                      onChange={() => handleSelectLead(lead.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold">
                        {lead.firstName?.charAt(0)}
                        {lead.lastName?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-zinc-50 dark:text-zinc-50">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-zinc-400">
                          {lead.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-zinc-50">
                      {lead.company || "-"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-zinc-400">
                      {lead.jobTitle || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-2xl font-bold ${getScoreColor(
                          lead.score
                        )}`}
                      >
                        {lead.score || "-"}
                      </div>
                      {lead.score && lead.score >= 80 && (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(lead.status)} dot>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.source && (
                      <div className="flex items-center gap-2">
                        <IntegrationIcon
                          source={lead.source}
                          className="w-4 h-4"
                        />
                        <Badge variant="ghost">{lead.source}</Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                      {new Date(lead.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ScheduleMeetingButton
                        leadId={lead.id}
                        leadName={`${lead.firstName} ${lead.lastName}`}
                        leadEmail={lead.email}
                        leadCompany={lead.company || undefined}
                        onScheduled={() => console.log("Meeting scheduled")}
                      />
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <Eye className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {leads.map((lead) => (
              <Card key={lead.id} hover className="cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {lead.firstName?.charAt(0)}
                      {lead.lastName?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-zinc-50 dark:text-zinc-50">
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-zinc-400">
                        {lead.company}
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(lead.status)} size="sm">
                    {lead.status}
                  </Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-zinc-400">
                    {lead.email}
                  </div>
                  {lead.phone && (
                    <div className="text-sm text-gray-600 dark:text-zinc-400">
                      {lead.phone}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div
                      className={`text-xl font-bold ${getScoreColor(
                        lead.score
                      )}`}
                    >
                      {lead.score || "-"}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      Score
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ScheduleMeetingButton
                      leadId={lead.id}
                      leadName={`${lead.firstName} ${lead.lastName}`}
                      leadEmail={lead.email}
                      leadCompany={lead.company || undefined}
                      onScheduled={() => loadLeads()}
                    />
                    <a
                      href={`mailto:${lead.email}`}
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
                      title="Send Email"
                    >
                      <Mail className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                    </a>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
                        title="Call"
                      >
                        <Phone className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Marvin Toggle */}
      <MarvinToggle
        onClick={handleMarvinOpen}
        isOpen={showMarvinInsights}
        insightCount={insightCount}
        context="leads"
        showBadge={marvinOpened}
      />

      {/* Marvin Insights Panel */}
      <MarvinInsightsPanel
        isOpen={showMarvinInsights}
        onClose={() => setShowMarvinInsights(false)}
        context="leads"
        data={{ leads, stats }}
        onAction={(action, data) => {
          console.log("Marvin action:", action, data);
          if (action === "Contact Now") {
            // Handle contact action
          }
        }}
        onInsightsLoad={(count) => setInsightCount(count)}
      />

      {/* Help Center Button */}
      <HelpButton context="leads" />
    </div>
  );
}
