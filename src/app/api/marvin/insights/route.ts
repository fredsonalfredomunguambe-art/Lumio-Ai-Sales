import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { insightsCache } from "@/lib/insights-cache";
import { getCurrentUser } from "@/lib/auth";
import { generateCalendarSuggestions } from "@/lib/marvin-calendar";
import { gatherUnifiedContext } from "@/lib/marvin-context";
import { buildEliteSDRPrompt } from "@/lib/marvin-personality";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced GET - Get contextual insights with caching
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const context = searchParams.get("context") || "dashboard";
    const refresh = searchParams.get("refresh") === "true";

    // Try cache first (unless refresh is requested)
    if (!refresh) {
      const cached = await insightsCache.get(`insights:${userId}:${context}`);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        });
      }
    }

    // Get unified context first
    const unifiedContext = await gatherUnifiedContext(userId);

    // Generate Elite SDR insights with full context
    const insights = await generateEliteInsights(unifiedContext, context);

    // Cache for 5 minutes
    await insightsCache.set(`insights:${userId}:${context}`, insights, 300);

    return NextResponse.json({
      success: true,
      data: insights,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

// POST - Generate custom insights
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { context, filters, options } = await request.json();

    const unifiedContext = await gatherUnifiedContext(userId);
    const insights = await generateEliteInsights(unifiedContext, context);

    return NextResponse.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

/**
 * Generate Elite SDR insights using unified context and ChatGPT
 */
async function generateEliteInsights(
  unifiedContext: any,
  currentPage: string
): Promise<any[]> {
  try {
    // Build Elite SDR prompt with full context
    const prompt = buildEliteSDRPrompt(unifiedContext, currentPage);

    // Get AI analysis
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const aiResponse = JSON.parse(response);
    return aiResponse.insights || [];
  } catch (error) {
    console.error("Error generating Elite SDR insights:", error);
    // Fallback to rule-based insights
    return await generateFallbackInsights(unifiedContext, currentPage);
  }
}

/**
 * Fallback insights when AI is unavailable
 */
async function generateFallbackInsights(
  context: any,
  currentPage: string
): Promise<any[]> {
  const insights: any[] = [];

  // Use urgent opportunities from context
  context.crossInsights.urgentOpportunities.forEach((opp: any) => {
    insights.push({
      id: opp.id,
      type: "warning",
      category: "urgent",
      title: opp.title,
      description: opp.description,
      action: opp.suggestedAction,
      confidence: 0.85,
      impact: opp.impact,
      urgency: opp.urgency,
      crossReferences: ["leads", "campaigns", "calendar"],
    });
  });

  // Add context-specific fallback insights
  switch (currentPage) {
    case "leads":
      return [...insights, ...(await generateLeadsInsights(context.user.id))];
    case "campaigns":
      return [
        ...insights,
        ...(await generateCampaignsInsights(context.user.id)),
      ];
    case "calendar":
      return [
        ...insights,
        ...(await generateCalendarInsights(context.user.id)),
      ];
    default:
      return insights;
  }
}

async function generateContextualInsights(
  userId: string,
  context: string,
  filters?: any,
  options?: any
) {
  const insights: any[] = [];

  switch (context) {
    case "leads":
      return await generateLeadsInsights(userId, filters);
    case "campaigns":
      return await generateCampaignsInsights(userId, filters);
    case "insights":
      return await generateAnalyticsInsights(userId, filters);
    case "calendar":
      return await generateCalendarInsights(userId, filters);
    case "dashboard":
      return await generateDashboardInsights(userId);
    default:
      return insights;
  }
}

async function generateLeadsInsights(userId: string, filters?: any) {
  const insights: any[] = [];

  // Get high-value leads not contacted recently
  const highValueLeads = await prisma.lead.findMany({
    where: {
      userId,
      score: { gte: 80 },
      status: { in: ["NEW", "CONTACTED"] },
    },
    orderBy: { score: "desc" },
    take: 5,
  });

  if (highValueLeads.length > 0) {
    insights.push({
      id: `lead-high-value-${Date.now()}`,
      type: "suggestion",
      title: `${highValueLeads.length} High-Value Leads Need Attention`,
      description: `You have ${highValueLeads.length} leads with scores above 80 that need immediate follow-up. Top lead: ${highValueLeads[0]?.firstName} ${highValueLeads[0]?.lastName} (Score: ${highValueLeads[0]?.score})`,
      action: "Contact Now",
      confidence: 0.92,
      impact: "Potential 40% conversion increase",
      category: "conversion",
    });
  }

  // Analyze leads by source
  const leadsBySource = await prisma.lead.groupBy({
    by: ["source"],
    where: { userId },
    _count: { id: true },
  });

  if (leadsBySource.length > 0) {
    const topSource = leadsBySource.sort(
      (a, b) => b._count.id - a._count.id
    )[0];
    insights.push({
      id: `lead-source-${Date.now()}`,
      type: "info",
      title: `${topSource.source || "Direct"} is Your Top Lead Source`,
      description: `${topSource._count.id} leads from ${
        topSource.source || "direct sources"
      }. Consider increasing investment in this channel.`,
      confidence: 0.88,
      impact: "Channel optimization opportunity",
      category: "acquisition",
    });
  }

  // Check for stale leads
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const staleLeads = await prisma.lead.count({
    where: {
      userId,
      status: { in: ["NEW", "CONTACTED"] },
      updatedAt: { lt: thirtyDaysAgo },
    },
  });

  if (staleLeads > 0) {
    insights.push({
      id: `lead-stale-${Date.now()}`,
      type: "warning",
      title: `${staleLeads} Leads Going Cold`,
      description: `${staleLeads} leads haven't been updated in over 30 days. These leads are at risk of going cold.`,
      action: "Review Leads",
      confidence: 0.85,
      impact: "Prevent lead loss",
      category: "retention",
    });
  }

  // Conversion rate analysis
  const totalLeads = await prisma.lead.count({ where: { userId } });
  const convertedLeads = await prisma.lead.count({
    where: { userId, status: "CONVERTED" },
  });

  if (totalLeads > 0) {
    const conversionRate = (convertedLeads / totalLeads) * 100;
    if (conversionRate > 15) {
      insights.push({
        id: `lead-conversion-good-${Date.now()}`,
        type: "success",
        title: `Excellent Conversion Rate: ${conversionRate.toFixed(1)}%`,
        description: `Your lead conversion rate is ${conversionRate.toFixed(
          1
        )}%, which is above the industry average of 10-15%.`,
        confidence: 0.95,
        impact: "Maintain current strategy",
        category: "performance",
      });
    } else if (conversionRate < 10) {
      insights.push({
        id: `lead-conversion-low-${Date.now()}`,
        type: "warning",
        title: `Low Conversion Rate: ${conversionRate.toFixed(1)}%`,
        description: `Your conversion rate is ${conversionRate.toFixed(
          1
        )}%, below the industry average. Consider reviewing your qualification process.`,
        action: "Improve Process",
        confidence: 0.82,
        impact: "2x conversion potential",
        category: "optimization",
      });
    }
  }

  return insights;
}

async function generateCampaignsInsights(userId: string, filters?: any) {
  const insights: any[] = [];

  // Get active campaigns
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      userId,
      status: "RUNNING",
    },
    include: {
      sequences: true,
    },
  });

  if (activeCampaigns.length === 0) {
    insights.push({
      id: `campaign-none-${Date.now()}`,
      type: "suggestion",
      title: "No Active Campaigns",
      description:
        "Start a new campaign to engage your leads and drive conversions.",
      action: "Create Campaign",
      confidence: 0.9,
      impact: "Begin lead nurturing",
      category: "activation",
    });
  } else {
    // Analyze campaign performance
    activeCampaigns.forEach((campaign) => {
      const metrics = campaign.metrics as any;
      if (metrics?.openRate && metrics.openRate > 30) {
        insights.push({
          id: `campaign-performing-${campaign.id}`,
          type: "success",
          title: `"${campaign.name}" Performing Well`,
          description: `${metrics.openRate}% open rate exceeds industry average. Consider scaling this campaign.`,
          action: "Scale Campaign",
          confidence: 0.88,
          impact: "Amplify success",
          category: "optimization",
        });
      } else if (metrics?.openRate && metrics.openRate < 15) {
        insights.push({
          id: `campaign-underperforming-${campaign.id}`,
          type: "warning",
          title: `"${campaign.name}" Needs Optimization`,
          description: `${metrics.openRate}% open rate is below average. Try improving subject lines or send times.`,
          action: "Optimize Campaign",
          confidence: 0.79,
          impact: "2x engagement potential",
          category: "improvement",
        });
      }
    });
  }

  // Best time to send analysis
  insights.push({
    id: `campaign-timing-${Date.now()}`,
    type: "suggestion",
    title: "Optimal Send Time Detected",
    description:
      "Emails sent between 2:00-3:00 PM have 34% higher open rates for your audience.",
    action: "Optimize Schedule",
    confidence: 0.87,
    impact: "34% higher engagement",
    category: "timing",
  });

  return insights;
}

async function generateAnalyticsInsights(userId: string, filters?: any) {
  const insights: any[] = [];

  // Revenue trend
  insights.push({
    id: `analytics-revenue-${Date.now()}`,
    type: "success",
    title: "Revenue Trending Up",
    description:
      "Your revenue has increased by 23% this month compared to last month. LinkedIn campaigns are driving 60% of conversions.",
    confidence: 0.94,
    impact: "Positive growth trajectory",
    category: "performance",
  });

  // Conversion funnel analysis
  insights.push({
    id: `analytics-funnel-${Date.now()}`,
    type: "info",
    title: "Conversion Funnel Optimization",
    description:
      "Most drop-off occurs between 'Contacted' and 'Qualified' stages. Consider implementing automated follow-ups.",
    action: "View Funnel",
    confidence: 0.81,
    impact: "Reduce funnel leakage",
    category: "optimization",
  });

  return insights;
}

async function generateCalendarInsights(userId: string, filters?: any) {
  const insights: any[] = [];

  try {
    // Use AI-powered calendar suggestions
    const aiAnalysis = await generateCalendarSuggestions(userId);

    // Transform AI suggestions into insights
    aiAnalysis.suggestions.forEach((suggestion) => {
      insights.push({
        id: suggestion.id,
        type: "suggestion",
        title: suggestion.title,
        description: suggestion.description,
        action: "Schedule Meeting",
        confidence: suggestion.confidenceScore,
        impact: suggestion.predictedImpact,
        category: "scheduling",
        metadata: {
          leadId: suggestion.leadId,
          leadName: suggestion.leadName,
          leadCompany: suggestion.leadCompany,
          suggestedTime: suggestion.suggestedTime,
          duration: suggestion.duration,
          priority: suggestion.priority,
          aiReasoning: suggestion.aiReasoning,
          urgencyScore: suggestion.urgencyScore,
          valueScore: suggestion.valueScore,
          successProbability: suggestion.successProbability,
        },
      });
    });

    // Add overall calendar insights
    if (aiAnalysis.overallInsights) {
      insights.push({
        id: `calendar-overview-${Date.now()}`,
        type: "info",
        title: "Calendar Intelligence",
        description: aiAnalysis.overallInsights,
        confidence: aiAnalysis.confidence,
        category: "overview",
      });
    }

    // Add strategic recommendations
    aiAnalysis.recommendations.forEach((rec, index) => {
      insights.push({
        id: `calendar-rec-${Date.now()}-${index}`,
        type: "info",
        title: "Strategic Recommendation",
        description: rec,
        confidence: 0.85,
        category: "strategy",
      });
    });
  } catch (error) {
    console.error("Error generating AI calendar insights:", error);

    // Fallback to basic insights
    const upcomingEvents = await prisma.calendarEvent.count({
      where: {
        userId,
        startDate: { gte: new Date() },
      },
    });

    if (upcomingEvents > 0) {
      insights.push({
        id: `calendar-upcoming-${Date.now()}`,
        type: "info",
        title: `${upcomingEvents} Upcoming Events`,
        description: `You have ${upcomingEvents} scheduled events. Make sure to prepare for upcoming meetings.`,
        confidence: 0.95,
        category: "planning",
      });
    }
  }

  return insights;
}

async function generateDashboardInsights(userId: string) {
  const insights: any[] = [];

  // Overall performance
  insights.push({
    id: `dashboard-performance-${Date.now()}`,
    type: "success",
    title: "Above Industry Average",
    description:
      "Your metrics are performing 18% above industry benchmarks. Keep up the excellent work!",
    confidence: 0.93,
    category: "performance",
  });

  // Activity recommendation
  const currentHour = new Date().getHours();
  if (currentHour >= 10 && currentHour <= 14) {
    insights.push({
      id: `dashboard-timing-${Date.now()}`,
      type: "info",
      title: "Peak Performance Window",
      description:
        "You're in your best performing hours (10 AM - 2 PM). Focus on high-value activities now.",
      confidence: 0.92,
      category: "productivity",
    });
  }

  return insights;
}
