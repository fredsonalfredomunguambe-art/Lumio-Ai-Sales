import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get lead KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const startDate = getStartDate(timeRange);

    // Calculate KPIs based on time range
    const kpis = await calculateLeadKPIs(userId, startDate);

    return NextResponse.json({
      success: true,
      data: { kpis },
    });
  } catch (error) {
    console.error("Error fetching lead KPIs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead KPIs" },
      { status: 500 }
    );
  }
}

function getStartDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

async function calculateLeadKPIs(userId: string, startDate: Date) {
  try {
    // TODO: Replace with actual database queries
    // For now, return calculated mock data based on time range

    const daysDiff = Math.ceil(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Simulate realistic data based on time range
    const baseLeads = Math.floor(daysDiff * 15); // ~15 leads per day
    const baseMeetings = Math.floor(daysDiff * 2); // ~2 meetings per day
    const baseRevenue = daysDiff * 500; // ~$500 revenue per day

    // Add some randomness to make it look realistic
    const newLeads = baseLeads + Math.floor(Math.random() * 50);
    const meetings = baseMeetings + Math.floor(Math.random() * 10);
    const revenue = baseRevenue + Math.floor(Math.random() * 2000);

    // Calculate trends (last 7 data points)
    const trendData = generateTrendData(daysDiff);

    return [
      {
        title: "New Leads",
        value: newLeads.toLocaleString(),
        change: "+12%",
        changeType: "positive" as const,
        icon: "Users",
        trend: trendData.leads,
        format: "number",
        explanation:
          "Total number of new leads added in the selected time period.",
        status: "good",
        actionable: true,
        actionLabel: "View Details",
      },
      {
        title: "Reply Rate",
        value: "24.5%",
        change: "+2.1%",
        changeType: "positive" as const,
        icon: "Mail",
        trend: trendData.replyRate,
        format: "percentage",
        explanation:
          "Percentage of leads who responded to your outreach efforts.",
        status: "excellent",
        actionable: true,
        actionLabel: "Optimize",
      },
      {
        title: "Meetings",
        value: meetings.toString(),
        change: "+8%",
        changeType: "positive" as const,
        icon: "Calendar",
        trend: trendData.meetings,
        format: "number",
        explanation: "Total meetings scheduled with leads.",
        status: "good",
        actionable: true,
        actionLabel: "Schedule More",
      },
      {
        title: "Revenue Est.",
        value: `$${revenue.toLocaleString()}`,
        change: "+15%",
        changeType: "positive" as const,
        icon: "DollarSign",
        trend: trendData.revenue,
        format: "currency",
        explanation: "Estimated revenue generated from leads.",
        status: "excellent",
        actionable: true,
        actionLabel: "Analyze",
      },
    ];
  } catch (error) {
    console.error("Error calculating lead KPIs:", error);
    throw error;
  }
}

function generateTrendData(daysDiff: number) {
  // Generate realistic trend data for the last 7 periods
  const periods = 7;
  const leads = [];
  const replyRate = [];
  const meetings = [];
  const revenue = [];

  for (let i = 0; i < periods; i++) {
    const baseValue = Math.floor(daysDiff / periods) * (periods - i);

    leads.push(Math.max(0, baseValue + Math.floor(Math.random() * 20)));
    replyRate.push(Math.max(15, Math.min(35, 20 + Math.random() * 10)));
    meetings.push(
      Math.max(0, Math.floor(baseValue / 10) + Math.floor(Math.random() * 5))
    );
    revenue.push(Math.max(0, baseValue * 20 + Math.floor(Math.random() * 500)));
  }

  return { leads, replyRate, meetings, revenue };
}
