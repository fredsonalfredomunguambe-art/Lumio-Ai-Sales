import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get alerts for dashboard
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get alerts from database
    const alerts = await getAlertsFromDatabase(userId);

    return NextResponse.json({
      success: true,
      data: { alerts },
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

async function getAlertsFromDatabase(userId: string) {
  try {
    // TODO: Replace with actual database query
    // For now, return calculated alerts based on user data

    const alerts = [
      {
        id: "1",
        type: "warning" as const,
        message: "10 leads haven't been followed up in 24 hours",
        action: "Review leads",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        type: "info" as const,
        message: "Campaign 'Welcome Series' completed successfully",
        action: "View results",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        type: "success" as const,
        message: "New segment created: 'High-value customers'",
        action: "Create campaign",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return alerts;
  } catch (error) {
    console.error("Error getting alerts from database:", error);
    return [];
  }
}
