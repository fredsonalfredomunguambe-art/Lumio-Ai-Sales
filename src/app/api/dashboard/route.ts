import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get dashboard overview data
    const [
      totalLeads,
      newLeads,
      convertedLeads,
      totalSegments,
      totalCampaigns,
      recentLeads,
      recentActivity,
    ] = await Promise.all([
      db.lead.count({ where: { userId: user.id } }),
      db.lead.count({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.lead.count({
        where: {
          userId: user.id,
          status: "CONVERTED",
        },
      }),
      db.segment.count({ where: { userId: user.id } }),
      db.outreachCampaign.count({ where: { userId: user.id } }),

      // Recent leads
      db.lead.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent activity (leads without follow-up)
      db.lead.findMany({
        where: {
          userId: user.id,
          status: { in: ["NEW", "CONTACTED"] },
          interactions: { none: {} },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const dashboard = {
      overview: {
        totalLeads,
        newLeads,
        convertedLeads,
        conversionRate:
          totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
        totalSegments,
        totalCampaigns,
      },
      recentLeads,
      alerts: {
        leadsWithoutFollowUp: recentActivity.length,
        newLeadsToday: newLeads,
      },
      quickActions: [
        {
          title: "Add New Lead",
          description: "Manually add a new lead to your pipeline",
          action: "create_lead",
          icon: "UserPlus",
        },
        {
          title: "Create Campaign",
          description: "Start a new outreach campaign",
          action: "create_campaign",
          icon: "Mail",
        },
        {
          title: "Ask Marvin",
          description: "Get AI insights and recommendations",
          action: "chat_marvin",
          icon: "Bot",
        },
      ],
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
