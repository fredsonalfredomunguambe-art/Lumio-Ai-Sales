/**
 * Calendar Suggestions Types
 * World-class type definitions for AI-powered calendar suggestions
 */

export interface CalendarSuggestion {
  id: string;
  type: "lead_meeting" | "follow_up" | "planning" | "optimization";
  leadId?: string;
  campaignId?: string;

  // Lead Information
  leadName: string;
  leadCompany?: string;
  leadEmail?: string;
  leadScore?: number;

  // Suggestion Details
  title: string;
  description: string;
  aiReasoning: string; // AI-generated explanation
  suggestedTime: Date;
  duration: number; // minutes

  // Priority & Scoring
  priority: "critical" | "high" | "medium" | "low";
  urgencyScore: number; // 0-100
  valueScore: number; // 0-100
  confidenceScore: number; // 0-1

  // Impact Prediction
  predictedImpact: string;
  successProbability: number; // 0-1

  // Metadata
  category: string;
  tags?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface SuggestionContext {
  userId: string;
  leads: LeadContext[];
  campaigns: CampaignContext[];
  meetings: MeetingContext[];
  userPreferences: UserPreferences;
}

export interface LeadContext {
  id: string;
  name: string;
  company?: string;
  email: string;
  score?: number;
  status: string;
  lastContact?: Date;
  engagementLevel: "high" | "medium" | "low";
  source?: string;
  industry?: string;
}

export interface CampaignContext {
  id: string;
  name: string;
  type: string;
  status: string;
  metrics?: {
    openRate?: number;
    replyRate?: number;
    conversionRate?: number;
  };
}

export interface MeetingContext {
  id: string;
  title: string;
  startDate: Date;
  category: string;
  linkedLeadId?: string;
  outcome?: string;
  completedAt?: Date;
}

export interface UserPreferences {
  workingHours: {
    start: number;
    end: number;
  };
  preferredMeetingTimes?: number[]; // hours of day
  meetingDuration: {
    default: number;
    sales: number;
    demo: number;
    followUp: number;
  };
  timezone: string;
}

export interface SuggestionAction {
  type: "schedule" | "snooze" | "dismiss" | "contact";
  payload?: any;
}

export interface AIAnalysis {
  suggestions: CalendarSuggestion[];
  overallInsights: string;
  recommendations: string[];
  confidence: number;
  generatedAt: Date;
}

