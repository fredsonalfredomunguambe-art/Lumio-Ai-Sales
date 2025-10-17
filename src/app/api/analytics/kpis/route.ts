import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get KPIs for dashboard
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get KPIs from database
    const kpis = await getKPIsFromDatabase(userId);

    return NextResponse.json({
      success: true,
      data: { kpis },
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch KPIs" },
      { status: 500 }
    );
  }
}

async function getKPIsFromDatabase(userId: string) {
  try {
    // TODO: Replace with actual database query
    // For now, return calculated KPIs based on user data

    // In a real implementation, these would be calculated from actual data
    const kpis = [
      {
        title: "Total Leads",
        value: "1,234",
        change: 12.5,
        changeType: "increase" as const,
        trend: [1000, 1100, 1200, 1150, 1180, 1200, 1234],
        format: "number" as const,
        icon: "Users",
      },
      {
        title: "Conversion Rate",
        value: "3.2%",
        change: 0.8,
        changeType: "increase" as const,
        trend: [2.5, 2.7, 2.9, 3.0, 3.1, 3.1, 3.2],
        format: "percentage" as const,
        icon: "Target",
      },
      {
        title: "Revenue Generated",
        value: "$45,230",
        change: 18.3,
        changeType: "increase" as const,
        trend: [35000, 37000, 39000, 41000, 43000, 44000, 45230],
        format: "currency" as const,
        icon: "DollarSign",
      },
      {
        title: "Avg. Response Time",
        value: "2.4h",
        change: -15.2,
        changeType: "decrease" as const,
        trend: [3.2, 3.0, 2.8, 2.6, 2.5, 2.4, 2.4],
        format: "number" as const,
        icon: "Mail",
      },
    ];

    return kpis;
  } catch (error) {
    console.error("Error getting KPIs from database:", error);
    return [];
  }
}
