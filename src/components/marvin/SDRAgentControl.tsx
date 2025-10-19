"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Users,
  Mail,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import Link from "next/link";

interface SDRActivity {
  id: string;
  leadName: string;
  action: string;
  timestamp: Date;
  status: "success" | "pending" | "failed";
  channel: string;
}

interface SDRAgentControlProps {
  compact?: boolean;
}

export function SDRAgentControl({ compact = false }: SDRAgentControlProps) {
  const [sdrActive, setSdrActive] = useState(false);
  const [activities, setActivities] = useState<SDRActivity[]>([]);
  const [stats, setStats] = useState({
    activeSequences: 0,
    leadsInQueue: 0,
    todayOutreach: 0,
    responseRate: 0,
  });

  useEffect(() => {
    loadSDRStatus();
    loadActivities();
  }, []);

  const loadSDRStatus = async () => {
    try {
      const response = await fetch("/api/sdr-agent/status");
      const data = await response.json();
      if (data.success) {
        setSdrActive(data.data.active);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Error loading SDR status:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/sdr-agent/activities?limit=10");
      const data = await response.json();
      if (data.success) {
        setActivities(
          data.data.activities.map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const handleToggleSDR = async () => {
    try {
      const response = await fetch("/api/sdr-agent/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !sdrActive }),
      });

      if (response.ok) {
        setSdrActive(!sdrActive);
      }
    } catch (error) {
      console.error("Error toggling SDR:", error);
    }
  };

  if (compact) {
    return (
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                sdrActive ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Bot
                className={`w-5 h-5 ${
                  sdrActive ? "text-green-600" : "text-gray-600"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white font-outfit">
                SDR Agent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-outfit">
                {sdrActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSDR}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sdrActive ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sdrActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              sdrActive
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gray-200"
            }`}
          >
            <Bot
              className={`w-6 h-6 ${
                sdrActive ? "text-white" : "text-gray-600"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-outfit">
              SDR Agent
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-outfit">
              Automated outreach and lead engagement
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/settings/sdr-agent">
            <ActionButton
              variant="ghost"
              size="sm"
              icon={<Settings className="w-4 h-4" />}
            >
              Configure
            </ActionButton>
          </Link>
          <button
            onClick={handleToggleSDR}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
              sdrActive ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                sdrActive ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-outfit">
            {stats.activeSequences}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-outfit">
            Active Sequences
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-outfit">
            {stats.leadsInQueue}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-outfit">
            In Queue
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-outfit">
            {stats.todayOutreach}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-outfit">
            Today's Outreach
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-outfit">
            {stats.responseRate}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 font-outfit">
            Response Rate
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 font-outfit">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-outfit">No activity yet</p>
              <p className="text-xs mt-1 font-outfit">
                Activate SDR Agent to start automated outreach
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    activity.status === "success"
                      ? "bg-green-500"
                      : activity.status === "pending"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate font-outfit">
                      {activity.leadName}
                    </span>
                    <Badge variant="ghost" size="sm">
                      {activity.channel}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-outfit">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-outfit">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Call to Action */}
      {!sdrActive && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="font-medium text-gray-900 mb-1">
                Ready to Automate?
              </h5>
              <p className="text-sm text-gray-700 mb-3">
                Activate SDR Agent to automatically engage leads based on your
                rules.
              </p>
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                onClick={handleToggleSDR}
              >
                Activate SDR Agent
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
