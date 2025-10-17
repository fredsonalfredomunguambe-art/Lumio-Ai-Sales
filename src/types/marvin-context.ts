/**
 * Marvin Unified Context Types
 * World-class type definitions for cross-context intelligence
 */

export interface MarvinUnifiedContext {
  // User Profile
  user: {
    id: string;
    name: string;
    email?: string;
  };

  // Cross-Page Data
  leads: LeadsContext;
  campaigns: CampaignsContext;
  calendar: CalendarContext;
  crossInsights: CrossInsights;

  // Metadata
  generatedAt: Date;
  cacheKey: string;
}

export interface LeadsContext {
  total: number;
  byStatus: {
    NEW: number;
    CONTACTED: number;
    QUALIFIED: number;
    UNQUALIFIED: number;
    CONVERTED: number;
    LOST: number;
  };
  highValue: LeadSummary[]; // Score >= 80
  hot: LeadSummary[]; // Recently engaged
  cold: LeadSummary[]; // >30 days no contact
  withUpcomingMeetings: LeadSummary[];
  withoutMeetings: LeadSummary[];
  topSources: SourceDistribution[];
}

export interface CampaignsContext {
  total: number;
  active: CampaignSummary[];
  performance: CampaignMetrics;
  topPerforming: CampaignSummary[];
  underperforming: CampaignSummary[];
  recentEngagement: EngagementData[];
}

export interface CalendarContext {
  upcomingMeetings: MeetingSummary[];
  pastMeetings: MeetingSummary[];
  meetingSuccessRate: number;
  thisWeekCount: number;
  nextWeekCount: number;
}

export interface CrossInsights {
  leadsFromCampaigns: LeadCampaignLink[];
  meetingsFromLeads: LeadMeetingLink[];
  campaignROI: CampaignROIData[];
  pipelineHealth: PipelineHealthScore;
  urgentOpportunities: UrgentOpportunity[];
}

// Supporting Types

export interface LeadSummary {
  id: string;
  name: string;
  company?: string;
  email: string;
  score?: number;
  status: string;
  source?: string;
  lastContact?: Date;
  engagementLevel: "high" | "medium" | "low";
  estimatedValue?: number;
}

export interface CampaignSummary {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics: {
    sent?: number;
    opened?: number;
    clicked?: number;
    replied?: number;
    openRate?: number;
    replyRate?: number;
    conversionRate?: number;
  };
}

export interface MeetingSummary {
  id: string;
  title: string;
  startDate: Date;
  category: string;
  linkedLeadId?: string;
  linkedLeadName?: string;
  outcome?: string;
  completedAt?: Date;
}

export interface LeadCampaignLink {
  leadId: string;
  leadName: string;
  leadScore?: number;
  campaignId: string;
  campaignName: string;
  engagement: {
    opened: number;
    clicked: number;
    replied: boolean;
  };
  lastEngagement: Date;
  hasMeeting: boolean;
  urgency: "critical" | "high" | "medium" | "low";
}

export interface LeadMeetingLink {
  leadId: string;
  leadName: string;
  meetingId: string;
  meetingDate: Date;
  outcome?: string;
  followUpNeeded: boolean;
}

export interface CampaignROIData {
  campaignId: string;
  campaignName: string;
  investment: number;
  leadsGenerated: number;
  meetingsScheduled: number;
  deals: number;
  revenue: number;
  roi: number;
}

export interface PipelineHealthScore {
  overall: number; // 0-100
  leadQuality: number;
  campaignEffectiveness: number;
  meetingConversion: number;
  followUpRate: number;
  bottlenecks: string[];
  recommendations: string[];
}

export interface UrgentOpportunity {
  id: string;
  type:
    | "hot_lead"
    | "cold_lead"
    | "campaign_optimization"
    | "meeting_needed"
    | "follow_up";
  priority: "critical" | "high" | "medium";
  title: string;
  description: string;
  data: Record<string, any>;
  suggestedAction: string;
  impact: string;
  urgency: string;
}

export interface SourceDistribution {
  source: string;
  count: number;
  percentage: number;
  avgScore?: number;
  conversionRate?: number;
}

export interface EngagementData {
  leadId: string;
  leadName: string;
  campaignId: string;
  campaignName: string;
  action: string;
  timestamp: Date;
}

export interface CampaignMetrics {
  avgOpenRate: number;
  avgReplyRate: number;
  avgConversionRate: number;
  totalSent: number;
  totalEngagement: number;
}

// Elite SDR Analysis Types

export interface EliteInsight {
  id: string;
  type: "suggestion" | "warning" | "success" | "info";
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  reasoning: string;
  action?: string;
  confidence: number;
  impact: string;
  urgency?: string;
  data?: Record<string, any>;
  crossReferences: string[]; // ["leads", "campaigns", "calendar"]
  createdAt: Date;
}

export interface CrossOpportunity {
  id: string;
  type: string;
  leads: LeadSummary[];
  campaigns?: CampaignSummary[];
  meetings?: MeetingSummary[];
  recommendation: string;
  expectedImpact: string;
  urgency: "now" | "today" | "this_week" | "this_month";
}







