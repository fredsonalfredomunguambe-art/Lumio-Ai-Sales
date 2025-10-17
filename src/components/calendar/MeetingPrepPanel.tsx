"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  User,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Target,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MeetingPrepPanelProps {
  leadId: string;
  event: any;
}

interface PrepData {
  lead: {
    name: string;
    company: string;
    jobTitle: string;
    email: string;
    phone: string;
    score: number;
    status: string;
  };
  background: {
    industry: string;
    companySize: string;
    source: string;
    daysAsLead: number;
  };
  recentActivity: {
    lastContact: string;
    emailsSent: number;
    emailsOpened: number;
    lastCampaign: string;
  };
  talkingPoints: string[];
  painPoints: string[];
  suggestedAgenda: string[];
  previousNotes: string[];
  competitiveIntel: string;
}

export function MeetingPrepPanel({ leadId, event }: MeetingPrepPanelProps) {
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrepData();
  }, [leadId]);

  const loadPrepData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/calendar/meeting-prep?leadId=${leadId}`
      );
      const data = await response.json();

      if (data.success) {
        setPrepData(data.data);
      }
    } catch (error) {
      console.error("Error loading prep data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Generating meeting brief...</span>
      </div>
    );
  }

  if (!prepData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Unable to load meeting prep data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              AI-Generated Meeting Brief
            </h3>
            <p className="text-sm text-gray-600">
              Prepared by Marvin for your {event.category.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Lead Overview */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">About the Lead</h4>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600">Name</div>
              <div className="font-medium">{prepData.lead.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Company</div>
              <div className="font-medium">{prepData.lead.company}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Role</div>
              <div className="font-medium">
                {prepData.lead.jobTitle || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Lead Score</div>
              <div className="flex items-center gap-2">
                <div className="font-medium text-lg">{prepData.lead.score}</div>
                <Badge
                  variant={
                    prepData.lead.score >= 80
                      ? "success"
                      : prepData.lead.score >= 60
                      ? "warning"
                      : "default"
                  }
                  size="sm"
                >
                  {prepData.lead.score >= 80
                    ? "Hot"
                    : prepData.lead.score >= 60
                    ? "Warm"
                    : "Cold"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-600">Industry</div>
              <div className="text-sm">
                {prepData.background.industry || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Company Size</div>
              <div className="text-sm">
                {prepData.background.companySize || "Unknown"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">Recent Activity</h4>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Contact</span>
            <span className="font-medium">
              {prepData.recentActivity.lastContact}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Emails Sent</span>
            <span className="font-medium">
              {prepData.recentActivity.emailsSent}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Open Rate</span>
            <span className="font-medium text-green-600">
              {prepData.recentActivity.emailsSent > 0
                ? Math.round(
                    (prepData.recentActivity.emailsOpened /
                      prepData.recentActivity.emailsSent) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          {prepData.recentActivity.lastCampaign && (
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-1">Last Campaign</div>
              <div className="text-sm font-medium">
                {prepData.recentActivity.lastCampaign}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Talking Points */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-900">
            Suggested Talking Points
          </h4>
        </div>
        <ul className="space-y-2">
          {prepData.talkingPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Pain Points */}
      {prepData.painPoints.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h4 className="font-semibold text-gray-900">
              Identified Pain Points
            </h4>
          </div>
          <ul className="space-y-2">
            {prepData.painPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Suggested Agenda */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-gray-900">Suggested Agenda</h4>
        </div>
        <ol className="space-y-2">
          {prepData.suggestedAgenda.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-gray-700 mt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Previous Meeting Notes */}
      {prepData.previousNotes.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">
              Previous Meeting Notes
            </h4>
          </div>
          <div className="space-y-3">
            {prepData.previousNotes.map((note, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Competitive Intel */}
      {prepData.competitiveIntel && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900">Competitive Intel</h4>
          </div>
          <p className="text-sm text-gray-700">{prepData.competitiveIntel}</p>
        </Card>
      )}
    </div>
  );
}
