"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  FileText,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Activity,
  ExternalLink,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { IntegrationIcon } from "./IntegrationIcon";

interface Integration {
  id: string;
  name: string;
  category: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync?: Date;
  totalSynced: number;
  last24h: number;
  errors: number;
  lastError?: string;
  health: "healthy" | "degraded" | "unhealthy";
}

export function IntegrationHealthDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingIntegrations, setSyncingIntegrations] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadIntegrations();
    // Refresh every 30 seconds
    const interval = setInterval(loadIntegrations, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations?health=true");
      const data = await response.json();
      if (data.success) {
        setIntegrations(
          data.data.integrations.map((int: any) => ({
            ...int,
            lastSync: int.lastSync ? new Date(int.lastSync) : undefined,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    setSyncingIntegrations((prev) => new Set(prev).add(integrationId));

    try {
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "incremental",
        }),
      });

      if (response.ok) {
        // Poll for completion
        pollSyncStatus(integrationId);
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      alert("Failed to start sync. Please try again.");
      setSyncingIntegrations((prev) => {
        const next = new Set(prev);
        next.delete(integrationId);
        return next;
      });
    }
  };

  const pollSyncStatus = async (integrationId: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const check = async () => {
      try {
        const response = await fetch(`/api/integrations/${integrationId}/sync`);
        const data = await response.json();

        if (data.success && data.data.jobs.length > 0) {
          const latestJob = data.data.jobs[0];

          if (
            latestJob.status === "completed" ||
            latestJob.status === "failed"
          ) {
            setSyncingIntegrations((prev) => {
              const next = new Set(prev);
              next.delete(integrationId);
              return next;
            });
            loadIntegrations();
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(check, 2000);
        } else {
          setSyncingIntegrations((prev) => {
            const next = new Set(prev);
            next.delete(integrationId);
            return next;
          });
        }
      } catch (error) {
        console.error("Error polling sync status:", error);
      }
    };

    check();
  };

  const handleDisconnect = async (integrationId: string) => {
    if (
      !confirm(
        "Are you sure you want to disconnect this integration? Synced data will remain but won't update."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/integrations/${integrationId}/disconnect`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        loadIntegrations();
      } else {
        throw new Error("Disconnect failed");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      alert("Failed to disconnect integration. Please try again.");
    }
  };

  const handleViewLogs = (integrationId: string) => {
    // Open logs modal or navigate to logs page
    window.open(
      `/dashboard/settings/integrations/${integrationId}/logs`,
      "_blank"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "syncing":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "unhealthy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return "Never";

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-600 mb-1">Connected</div>
          <div className="text-2xl font-bold text-green-600">
            {integrations.filter((i) => i.status === "connected").length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Total Synced</div>
          <div className="text-2xl font-bold text-blue-600">
            {integrations.reduce((sum, i) => sum + i.totalSynced, 0)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Last 24 Hours</div>
          <div className="text-2xl font-bold text-purple-600">
            {integrations.reduce((sum, i) => sum + i.last24h, 0)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">Errors</div>
          <div className="text-2xl font-bold text-red-600">
            {integrations.reduce((sum, i) => sum + i.errors, 0)}
          </div>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const isSyncing = syncingIntegrations.has(integration.id);

          return (
            <Card
              key={integration.id}
              className={integration.status === "error" ? "border-red-200" : ""}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IntegrationIcon
                    source={integration.id}
                    className="w-8 h-8"
                    showEmoji
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {integration.name}
                    </h3>
                    <Badge variant="ghost" size="sm">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(isSyncing ? "syncing" : integration.status)}
                  <Badge
                    variant={
                      integration.status === "connected"
                        ? "success"
                        : integration.status === "error"
                        ? "danger"
                        : "default"
                    }
                    size="sm"
                  >
                    {isSyncing ? "Syncing" : integration.status}
                  </Badge>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Last Sync</div>
                  <div className="font-medium text-sm">
                    {formatTimeAgo(integration.lastSync)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Total Synced</div>
                  <div className="font-medium text-sm">
                    {integration.totalSynced.toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Last 24h</div>
                  <div className="font-medium text-sm text-green-600">
                    +{integration.last24h}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <div className="text-xs text-gray-600">Health</div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded inline-block ${getHealthColor(
                      integration.health
                    )}`}
                  >
                    {integration.health}
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {integration.status === "error" && integration.lastError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-red-900 mb-1">
                        Error
                      </div>
                      <p className="text-xs text-red-700 line-clamp-2">
                        {integration.lastError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.status === "connected" && (
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    icon={<RefreshCw className="w-3 h-3" />}
                    onClick={() => handleSyncNow(integration.id)}
                    loading={isSyncing}
                    disabled={isSyncing}
                    className="flex-1"
                  >
                    {isSyncing ? "Syncing..." : "Sync Now"}
                  </ActionButton>
                )}
                <ActionButton
                  variant="ghost"
                  size="sm"
                  icon={<FileText className="w-3 h-3" />}
                  onClick={() => handleViewLogs(integration.id)}
                  title="View Logs"
                >
                  Logs
                </ActionButton>
                {integration.status === "connected" && (
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleDisconnect(integration.id)}
                    title="Disconnect"
                  >
                    Disconnect
                  </ActionButton>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Integration Tips */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Integration Health Tips
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>Healthy:</strong> All systems operational, data
                syncing normally
              </li>
              <li>
                • <strong>Degraded:</strong> Minor issues, some delays possible
              </li>
              <li>
                • <strong>Unhealthy:</strong> Sync errors, requires attention
              </li>
              <li>• Use "Sync Now" to force an immediate sync</li>
              <li>• Check logs if you see errors persisting</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
