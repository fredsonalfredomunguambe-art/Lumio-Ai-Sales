/**
 * Marvin Unified Context System
 * Aggregates data from all sources for cross-context intelligence
 */

import { prisma } from "./prisma";
import type {
  MarvinUnifiedContext,
  LeadsContext,
  CampaignsContext,
  CalendarContext,
  CrossInsights,
  LeadSummary,
  CampaignSummary,
  MeetingSummary,
  LeadCampaignLink,
  PipelineHealthScore,
  UrgentOpportunity,
} from "@/types/marvin-context";

/**
 * Gather complete unified context for Marvin Elite SDR
 */
export async function gatherUnifiedContext(
  userId: string
): Promise<MarvinUnifiedContext> {
  try {
    // Parallel data fetching for performance
    const [user, leadsData, campaignsData, calendarData] = await Promise.all([
      getUserData(userId),
      gatherLeadsContext(userId),
      gatherCampaignsContext(userId),
      gatherCalendarContext(userId),
    ]);

    // Generate cross-insights
    const crossInsights = await generateCrossInsights(
      leadsData,
      campaignsData,
      calendarData
    );

    return {
      user,
      leads: leadsData,
      campaigns: campaignsData,
      calendar: calendarData,
      crossInsights,
      generatedAt: new Date(),
      cacheKey: `marvin_context:${userId}:${Date.now()}`,
    };
  } catch (error) {
    console.error("Error gathering unified context:", error);
    throw error;
  }
}

/**
 * Get user data
 */
async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  return {
    id: userId,
    name: user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
      : "User",
    email: user?.email || undefined,
  };
}

/**
 * Gather comprehensive leads context
 */
async function gatherLeadsContext(userId: string): Promise<LeadsContext> {
  const [allLeads, statusCounts, sources] = await Promise.all([
    prisma.lead.findMany({
      where: { userId },
      include: {
        calendarEvents: {
          where: {
            startDate: { gte: new Date() },
          },
        },
      },
      orderBy: { score: "desc" },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { userId },
      _count: { id: true },
      _avg: { score: true },
    }),
  ]);

  // Transform to summaries
  const leadSummaries: LeadSummary[] = allLeads.map((lead) => ({
    id: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    company: lead.company || undefined,
    email: lead.email,
    score: lead.score || undefined,
    status: lead.status,
    source: lead.source || undefined,
    lastContact: lead.updatedAt,
    engagementLevel: calculateEngagementLevel(lead.score, lead.updatedAt),
    estimatedValue: calculateEstimatedValue(lead.score),
  }));

  // Segment leads
  const highValue = leadSummaries.filter((l) => (l.score || 0) >= 80);
  const hot = leadSummaries.filter((l) => {
    const daysSince = Math.floor(
      (Date.now() - l.lastContact!.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince < 7 && (l.score || 0) >= 60;
  });
  const cold = leadSummaries.filter((l) => {
    const daysSince = Math.floor(
      (Date.now() - l.lastContact!.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince > 30 && l.status !== "CONVERTED" && l.status !== "LOST";
  });

  const withUpcomingMeetings = allLeads
    .filter((l) => l.calendarEvents.length > 0)
    .map((l) => ({
      id: l.id,
      name: `${l.firstName} ${l.lastName}`,
      company: l.company || undefined,
      email: l.email,
      score: l.score || undefined,
      status: l.status,
      source: l.source || undefined,
      lastContact: l.updatedAt,
      engagementLevel: calculateEngagementLevel(l.score, l.updatedAt),
      estimatedValue: calculateEstimatedValue(l.score),
    }));

  const withoutMeetings = leadSummaries.filter(
    (l) =>
      !withUpcomingMeetings.find((w) => w.id === l.id) &&
      l.status === "QUALIFIED"
  );

  // Build status counts
  const byStatus = {
    NEW: statusCounts.find((s) => s.status === "NEW")?._count.id || 0,
    CONTACTED:
      statusCounts.find((s) => s.status === "CONTACTED")?._count.id || 0,
    QUALIFIED:
      statusCounts.find((s) => s.status === "QUALIFIED")?._count.id || 0,
    UNQUALIFIED:
      statusCounts.find((s) => s.status === "UNQUALIFIED")?._count.id || 0,
    CONVERTED:
      statusCounts.find((s) => s.status === "CONVERTED")?._count.id || 0,
    LOST: statusCounts.find((s) => s.status === "LOST")?._count.id || 0,
  };

  const topSources = sources
    .map((s) => ({
      source: s.source || "Direct",
      count: s._count.id,
      percentage: (s._count.id / allLeads.length) * 100,
      avgScore: s._avg.score || undefined,
      conversionRate: 0, // TODO: Calculate from converted leads
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: allLeads.length,
    byStatus,
    highValue,
    hot,
    cold,
    withUpcomingMeetings,
    withoutMeetings,
    topSources,
  };
}

/**
 * Gather comprehensive campaigns context
 */
async function gatherCampaignsContext(
  userId: string
): Promise<CampaignsContext> {
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    include: {
      sequences: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const campaignSummaries: CampaignSummary[] = campaigns.map((c) => {
    const metrics = c.metrics as any;
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      metrics: {
        sent: metrics?.sent || 0,
        opened: metrics?.opened || 0,
        clicked: metrics?.clicked || 0,
        replied: metrics?.replied || 0,
        openRate: metrics?.openRate || 0,
        replyRate: metrics?.replyRate || 0,
        conversionRate: metrics?.conversionRate || 0,
      },
    };
  });

  const active = campaignSummaries.filter((c) =>
    ["RUNNING", "LEARNING"].includes(c.status)
  );

  const topPerforming = campaignSummaries
    .filter((c) => (c.metrics.openRate || 0) > 25)
    .slice(0, 5);

  const underperforming = campaignSummaries
    .filter((c) => (c.metrics.openRate || 0) < 15 && c.status === "RUNNING")
    .slice(0, 5);

  // Calculate overall performance
  const totalSent = campaignSummaries.reduce(
    (acc, c) => acc + (c.metrics.sent || 0),
    0
  );
  const totalOpened = campaignSummaries.reduce(
    (acc, c) => acc + (c.metrics.opened || 0),
    0
  );
  const totalReplied = campaignSummaries.reduce(
    (acc, c) => acc + (c.metrics.replied || 0),
    0
  );

  const performance = {
    avgOpenRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    avgReplyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
    avgConversionRate: 0, // TODO: Calculate from actual conversions
    totalSent,
    totalEngagement: totalOpened + totalReplied,
  };

  return {
    total: campaigns.length,
    active,
    performance,
    topPerforming,
    underperforming,
    recentEngagement: [], // TODO: Implement engagement tracking
  };
}

/**
 * Gather comprehensive calendar context
 */
async function gatherCalendarContext(userId: string): Promise<CalendarContext> {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [upcomingEvents, pastEvents] = await Promise.all([
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startDate: { gte: now, lte: twoWeeksFromNow },
      },
      include: {
        lead: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
      take: 20,
    }),
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startDate: { lt: now },
        completedAt: { not: null },
      },
      orderBy: { startDate: "desc" },
      take: 50,
    }),
  ]);

  const meetingSummaries: MeetingSummary[] = upcomingEvents.map((e) => ({
    id: e.id,
    title: e.title,
    startDate: e.startDate,
    category: e.category,
    linkedLeadId: e.linkedLeadId || undefined,
    linkedLeadName: e.lead
      ? `${e.lead.firstName} ${e.lead.lastName}`
      : undefined,
    outcome: e.outcome || undefined,
    completedAt: e.completedAt || undefined,
  }));

  const pastMeetingSummaries: MeetingSummary[] = pastEvents.map((e) => ({
    id: e.id,
    title: e.title,
    startDate: e.startDate,
    category: e.category,
    linkedLeadId: e.linkedLeadId || undefined,
    outcome: e.outcome || undefined,
    completedAt: e.completedAt || undefined,
  }));

  // Calculate success rate
  const completedWithOutcome = pastEvents.filter((e) => e.outcome);
  const successfulMeetings = completedWithOutcome.filter(
    (e) => e.outcome === "positive"
  ).length;
  const meetingSuccessRate =
    completedWithOutcome.length > 0
      ? (successfulMeetings / completedWithOutcome.length) * 100
      : 0;

  const thisWeekCount = upcomingEvents.filter(
    (e) => e.startDate <= weekFromNow
  ).length;
  const nextWeekCount = upcomingEvents.filter(
    (e) => e.startDate > weekFromNow && e.startDate <= twoWeeksFromNow
  ).length;

  return {
    upcomingMeetings: meetingSummaries,
    pastMeetings: pastMeetingSummaries,
    meetingSuccessRate,
    thisWeekCount,
    nextWeekCount,
  };
}

/**
 * Generate cross-insights from all contexts
 */
async function generateCrossInsights(
  leads: LeadsContext,
  campaigns: CampaignsContext,
  calendar: CalendarContext
): Promise<CrossInsights> {
  // Identify leads from campaigns that need meetings
  const leadsFromCampaigns: LeadCampaignLink[] = [];
  // TODO: Implement campaign-lead correlation tracking

  // Calculate pipeline health
  const pipelineHealth: PipelineHealthScore = {
    overall: calculateOverallHealth(leads, campaigns, calendar),
    leadQuality: (leads.highValue.length / Math.max(leads.total, 1)) * 100,
    campaignEffectiveness: campaigns.performance.avgOpenRate,
    meetingConversion: calendar.meetingSuccessRate,
    followUpRate: 0, // TODO: Implement follow-up tracking
    bottlenecks: identifyBottlenecks(leads, campaigns, calendar),
    recommendations: generateRecommendations(leads, campaigns, calendar),
  };

  // Identify urgent opportunities
  const urgentOpportunities: UrgentOpportunity[] = [];

  // Hot leads without meetings
  if (leads.hot.length > 0 && leads.withoutMeetings.length > 0) {
    const hotWithoutMeetings = leads.hot.filter((hot) =>
      leads.withoutMeetings.some((without) => without.id === hot.id)
    );

    if (hotWithoutMeetings.length > 0) {
      urgentOpportunities.push({
        id: `urgent-hot-leads-${Date.now()}`,
        type: "meeting_needed",
        priority: "critical",
        title: `${hotWithoutMeetings.length} Hot Leads Need Meetings`,
        description: `You have ${hotWithoutMeetings.length} highly engaged leads without scheduled meetings. These are your hottest opportunities right now.`,
        data: { leads: hotWithoutMeetings },
        suggestedAction: "Schedule meetings within 24 hours",
        impact: `Potential ${hotWithoutMeetings.length * 30}K in pipeline`,
        urgency: "Critical - Act today",
      });
    }
  }

  // Cold high-value leads
  const coldHighValue = leads.cold.filter((l) => (l.score || 0) >= 70);
  if (coldHighValue.length > 0) {
    urgentOpportunities.push({
      id: `urgent-cold-leads-${Date.now()}`,
      type: "cold_lead",
      priority: "high",
      title: `${coldHighValue.length} High-Value Leads Going Cold`,
      description: `${coldHighValue.length} leads with scores above 70 haven't been contacted in 30+ days. Revenue at risk.`,
      data: { leads: coldHighValue },
      suggestedAction: "Re-engagement campaign + personal outreach",
      impact: `Save ${coldHighValue.length * 25}K in pipeline`,
      urgency: "High - Act this week",
    });
  }

  // Underperforming campaigns with potential
  if (campaigns.underperforming.length > 0) {
    urgentOpportunities.push({
      id: `urgent-campaigns-${Date.now()}`,
      type: "campaign_optimization",
      priority: "medium",
      title: `${campaigns.underperforming.length} Campaigns Need Optimization`,
      description: `Some active campaigns are underperforming. Quick optimizations could boost results significantly.`,
      data: { campaigns: campaigns.underperforming },
      suggestedAction: "A/B test subject lines and timing",
      impact: "Potential 30-50% improvement in open rates",
      urgency: "Medium - Optimize this week",
    });
  }

  return {
    leadsFromCampaigns,
    meetingsFromLeads: [],
    campaignROI: [],
    pipelineHealth,
    urgentOpportunities,
  };
}

/**
 * Helper: Calculate engagement level
 */
function calculateEngagementLevel(
  score: number | null,
  lastContact: Date
): "high" | "medium" | "low" {
  const daysSince = Math.floor(
    (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (score && score >= 80 && daysSince < 7) return "high";
  if (score && score >= 60 && daysSince < 14) return "medium";
  return "low";
}

/**
 * Helper: Calculate estimated deal value
 */
function calculateEstimatedValue(score: number | null): number {
  if (!score) return 10000; // Default $10K
  if (score >= 90) return 50000; // $50K
  if (score >= 80) return 35000; // $35K
  if (score >= 70) return 25000; // $25K
  if (score >= 60) return 15000; // $15K
  return 10000;
}

/**
 * Helper: Calculate overall pipeline health
 */
function calculateOverallHealth(
  leads: LeadsContext,
  campaigns: CampaignsContext,
  calendar: CalendarContext
): number {
  const leadHealth = (leads.highValue.length / Math.max(leads.total, 1)) * 100;
  const campaignHealth = campaigns.performance.avgOpenRate;
  const meetingHealth = calendar.meetingSuccessRate;

  return (leadHealth * 0.4 + campaignHealth * 0.3 + meetingHealth * 0.3) / 3;
}

/**
 * Helper: Identify bottlenecks
 */
function identifyBottlenecks(
  leads: LeadsContext,
  campaigns: CampaignsContext,
  calendar: CalendarContext
): string[] {
  const bottlenecks: string[] = [];

  if (leads.withoutMeetings.length > leads.withUpcomingMeetings.length) {
    bottlenecks.push("Qualified leads not converting to meetings");
  }

  if (campaigns.performance.avgOpenRate < 20) {
    bottlenecks.push("Low campaign engagement rates");
  }

  if (leads.cold.length > leads.hot.length) {
    bottlenecks.push("Too many leads going cold");
  }

  if (calendar.meetingSuccessRate < 50) {
    bottlenecks.push("Low meeting success rate");
  }

  return bottlenecks;
}

/**
 * Helper: Generate recommendations
 */
function generateRecommendations(
  leads: LeadsContext,
  campaigns: CampaignsContext,
  calendar: CalendarContext
): string[] {
  const recommendations: string[] = [];

  if (leads.hot.length > 0) {
    recommendations.push(
      `Schedule meetings with ${leads.hot.length} hot leads immediately`
    );
  }

  if (campaigns.underperforming.length > 0) {
    recommendations.push("Optimize underperforming campaigns");
  }

  if (leads.cold.length > 5) {
    recommendations.push("Launch re-engagement campaign for cold leads");
  }

  if (calendar.thisWeekCount < 5) {
    recommendations.push("Increase meeting volume this week");
  }

  return recommendations;
}







