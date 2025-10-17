import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Get AI-powered scheduling suggestions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const suggestions = await generateSchedulingSuggestions(user.id);

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

async function generateSchedulingSuggestions(userId: string) {
  const suggestions: any[] = [];

  // 1. Qualified leads without meetings
  const leadsNeedingMeetings = await prisma.lead.findMany({
    where: {
      userId,
      status: "QUALIFIED",
      calendarEvents: {
        none: {},
      },
    },
    take: 10,
    orderBy: { score: "desc" },
  });

  for (const lead of leadsNeedingMeetings) {
    const optimalTime = getOptimalMeetingTime();
    suggestions.push({
      id: `lead-${lead.id}`,
      type: "lead_follow_up",
      priority: "high",
      title: `Schedule Meeting with ${lead.firstName} ${lead.lastName}`,
      description: `Qualified lead from ${
        lead.company || "Unknown Company"
      }. Score: ${lead.score || "N/A"}`,
      suggestedTime: optimalTime,
      lead: {
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        email: lead.email,
      },
      action: {
        type: "schedule_meeting",
        data: {
          leadId: lead.id,
          category: "SALES_CALL",
          duration: 30,
        },
      },
    });
  }

  // 2. Stale high-value leads
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const staleLeads = await prisma.lead.findMany({
    where: {
      userId,
      score: { gte: 70 },
      updatedAt: { lt: thirtyDaysAgo },
    },
    take: 5,
    orderBy: { score: "desc" },
  });

  for (const lead of staleLeads) {
    suggestions.push({
      id: `stale-${lead.id}`,
      type: "reactivation",
      priority: "medium",
      title: `Re-engage ${lead.firstName} ${lead.lastName}`,
      description: `High-value lead hasn't been contacted in 30+ days`,
      suggestedTime: getOptimalMeetingTime(1), // Tomorrow
      lead: {
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        company: lead.company,
        email: lead.email,
      },
      action: {
        type: "schedule_call",
        data: {
          leadId: lead.id,
          category: "FOLLOW_UP",
          duration: 15,
        },
      },
    });
  }

  // 3. Campaign follow-ups
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      userId,
      status: "RUNNING",
    },
    take: 3,
  });

  for (const campaign of activeCampaigns) {
    const metrics = campaign.metrics as any;
    if (metrics?.replyRate && metrics.replyRate > 0) {
      suggestions.push({
        id: `campaign-${campaign.id}`,
        type: "campaign_review",
        priority: "low",
        title: `Review "${campaign.name}" Performance`,
        description: `Campaign has ${metrics.replyRate}% reply rate. Schedule time to analyze and optimize.`,
        suggestedTime: getOptimalMeetingTime(7), // Next week
        campaign: {
          id: campaign.id,
          name: campaign.name,
        },
        action: {
          type: "schedule_review",
          data: {
            campaignId: campaign.id,
            category: "ANALYTICS",
            duration: 45,
          },
        },
      });
    }
  }

  // 4. Weekly planning session
  const nextMonday = getNextMonday();
  const hasWeeklyPlanning = await prisma.calendarEvent.findFirst({
    where: {
      userId,
      category: "PLANNING",
      startDate: {
        gte: nextMonday,
        lt: new Date(nextMonday.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (!hasWeeklyPlanning) {
    suggestions.push({
      id: "weekly-planning",
      type: "planning",
      priority: "medium",
      title: "Weekly Planning Session",
      description:
        "Block time to review goals, pipeline, and upcoming activities",
      suggestedTime: new Date(nextMonday.setHours(9, 0, 0, 0)),
      action: {
        type: "schedule_planning",
        data: {
          category: "PLANNING",
          duration: 60,
        },
      },
    });
  }

  return suggestions;
}

function getOptimalMeetingTime(daysFromNow: number = 0): Date {
  const now = new Date();
  const targetDate = new Date();
  targetDate.setDate(now.getDate() + daysFromNow);

  // Set to 2 PM (optimal time based on research)
  targetDate.setHours(14, 0, 0, 0);

  // If weekend, move to next Monday
  if (targetDate.getDay() === 0) {
    // Sunday
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (targetDate.getDay() === 6) {
    // Saturday
    targetDate.setDate(targetDate.getDate() + 2);
  }

  return targetDate;
}

function getNextMonday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  return nextMonday;
}
