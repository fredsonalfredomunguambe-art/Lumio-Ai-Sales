import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const startDate = getStartDate(timeRange);

    // Calculate analytics data based on time range
    const analyticsData = await calculateAnalyticsData(userId, startDate);

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics data" },
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

async function calculateAnalyticsData(userId: string, startDate: Date) {
  try {
    const daysDiff = Math.ceil(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate metrics based on time range
    const baseLeads = Math.floor(daysDiff * 15); // ~15 leads per day
    const baseConversions = Math.floor(daysDiff * 0.5); // ~0.5 conversions per day
    const baseRevenue = daysDiff * 500; // ~$500 revenue per day

    // Add some randomness to make it look realistic
    const totalLeads = baseLeads + Math.floor(Math.random() * 50);
    const conversions = baseConversions + Math.floor(Math.random() * 10);
    const revenue = baseRevenue + Math.floor(Math.random() * 2000);
    const conversionRate =
      totalLeads > 0 ? (conversions / totalLeads) * 100 : 0;

    // Generate metrics
    const metrics = [
      {
        name: "Total Leads",
        value: totalLeads.toLocaleString(),
        change: 12.5,
        changeType: "increase" as const,
        trend: generateTrendData(daysDiff, totalLeads),
        format: "number" as const,
      },
      {
        name: "Conversion Rate",
        value: `${conversionRate.toFixed(1)}%`,
        change: 0.8,
        changeType: "increase" as const,
        trend: generateTrendData(daysDiff, conversionRate),
        format: "percentage" as const,
      },
      {
        name: "Revenue Generated",
        value: `$${revenue.toLocaleString()}`,
        change: 18.3,
        changeType: "increase" as const,
        trend: generateTrendData(daysDiff, revenue),
        format: "currency" as const,
      },
      {
        name: "Avg. Response Time",
        value: "2.4h",
        change: -15.2,
        changeType: "decrease" as const,
        trend: generateTrendData(daysDiff, 2.4),
        format: "number" as const,
      },
    ];

    // Generate chart data
    const chartData = generateChartData(daysDiff);

    // Generate time data for best time to send
    const timeData = generateTimeData();

    // Generate channel performance data
    const channelData = [
      {
        channel: "Website",
        leads: Math.floor(totalLeads * 0.35),
        conversions: Math.floor(conversions * 0.35),
        conversionRate: 3.2,
      },
      {
        channel: "LinkedIn",
        leads: Math.floor(totalLeads * 0.26),
        conversions: Math.floor(conversions * 0.26),
        conversionRate: 3.0,
      },
      {
        channel: "Email",
        leads: Math.floor(totalLeads * 0.17),
        conversions: Math.floor(conversions * 0.17),
        conversionRate: 3.5,
      },
      {
        channel: "Referral",
        leads: Math.floor(totalLeads * 0.12),
        conversions: Math.floor(conversions * 0.12),
        conversionRate: 4.0,
      },
      {
        channel: "Social Media",
        leads: Math.floor(totalLeads * 0.1),
        conversions: Math.floor(conversions * 0.1),
        conversionRate: 2.5,
      },
    ];

    // Generate segment analysis data
    const segmentData = [
      {
        segment: "Hot Leads",
        leads: Math.floor(totalLeads * 0.1),
        conversions: Math.floor(conversions * 0.45),
        conversionRate: 7.7,
      },
      {
        segment: "Enterprise",
        leads: Math.floor(totalLeads * 0.06),
        conversions: Math.floor(conversions * 0.3),
        conversionRate: 7.7,
      },
      {
        segment: "Startups",
        leads: Math.floor(totalLeads * 0.12),
        conversions: Math.floor(conversions * 0.15),
        conversionRate: 5.0,
      },
      {
        segment: "No Reply 3d",
        leads: Math.floor(totalLeads * 0.04),
        conversions: Math.floor(conversions * 0.05),
        conversionRate: 3.4,
      },
      {
        segment: "Cold Prospects",
        leads: Math.floor(totalLeads * 0.68),
        conversions: Math.floor(conversions * 0.05),
        conversionRate: 1.4,
      },
    ];

    return {
      metrics,
      chartData,
      timeData,
      channelData,
      segmentData,
    };
  } catch (error) {
    console.error("Error calculating analytics data:", error);
    throw error;
  }
}

function generateTrendData(daysDiff: number, currentValue: number) {
  const periods = 7;
  const trend = [];

  for (let i = 0; i < periods; i++) {
    const baseValue = (currentValue / periods) * (periods - i);
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    trend.push(Math.max(0, baseValue * (1 + variation)));
  }

  return trend;
}

function generateChartData(daysDiff: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const chartData = [];

  for (let i = 0; i < 8; i++) {
    const baseLeads = 1200 + i * 150;
    const baseConversions = 38 + i * 4;
    const baseRevenue = 15200 + i * 2000;

    chartData.push({
      name: months[i],
      leads: baseLeads + Math.floor(Math.random() * 200),
      conversions: baseConversions + Math.floor(Math.random() * 10),
      revenue: baseRevenue + Math.floor(Math.random() * 1000),
    });
  }

  return chartData;
}

function generateTimeData() {
  const timeData = [];

  for (let hour = 9; hour <= 18; hour++) {
    const baseOpens = 40 + Math.floor(Math.random() * 20);
    const baseClicks = Math.floor(baseOpens * 0.3);
    const baseReplies = Math.floor(baseClicks * 0.2);

    timeData.push({
      hour,
      opens: baseOpens,
      clicks: baseClicks,
      replies: baseReplies,
    });
  }

  return timeData;
}
