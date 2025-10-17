import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis-client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Check cache first
    const cacheKey = `performance_metrics:${user.id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Calculate performance metrics
    const [
      totalLeads,
      convertedLeads,
      totalInteractions,
      avgResponseTime,
      satisfactionData,
      revenueData,
      qualifiedLeads,
      followUpData,
      automationData,
    ] = await Promise.all([
      // Total leads
      db.lead.count({
        where: { userId: user.id },
      }),

      // Converted leads
      db.lead.count({
        where: {
          userId: user.id,
          status: "CONVERTED",
        },
      }),

      // Total interactions
      db.leadInteraction.count({
        where: { userId: user.id },
      }),

      // Average response time (simulated for now)
      Promise.resolve(2.3),

      // Customer satisfaction (from conversations)
      db.conversation.aggregate({
        where: { userId: user.id },
        _avg: { satisfaction: true },
      }),

      // Revenue generated (simulated)
      Promise.resolve(125000),

      // Qualified leads
      db.lead.count({
        where: {
          userId: user.id,
          status: { in: ["QUALIFIED", "CONVERTED"] },
        },
      }),

      // Follow-up success rate
      db.leadInteraction.count({
        where: {
          userId: user.id,
          type: "FOLLOW_UP",
          status: "REPLIED",
        },
      }),

      // Automation efficiency
      db.automation.aggregate({
        where: { userId: user.id },
        _avg: { successRate: true },
      }),
    ]);

    const totalFollowUps = await db.leadInteraction.count({
      where: {
        userId: user.id,
        type: "FOLLOW_UP",
      },
    });

    const metrics = {
      totalConversions: convertedLeads,
      conversionRate:
        totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      averageResponseTime: avgResponseTime,
      customerSatisfaction: Math.round(
        (satisfactionData._avg.satisfaction || 0) * 20
      ), // Convert to percentage
      revenueGenerated: revenueData,
      leadsQualified: qualifiedLeads,
      followUpSuccess:
        totalFollowUps > 0
          ? Math.round((followUpData / totalFollowUps) * 100)
          : 0,
      automationEfficiency: Math.round(automationData._avg.successRate || 0),
      totalLeads,
      totalInteractions,
      trends: {
        conversionRate: "+12.5%",
        responseTime: "-2.3s",
        satisfaction: "+0.3",
        revenue: "+$15.2K",
      },
    };

    // Cache for 10 minutes
    await cacheSet(cacheKey, JSON.stringify({ metrics }), 600);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance metrics" },
      { status: 500 }
    );
  }
}

