import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get recent activity for dashboard
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get recent activity from database
    const activities = await getRecentActivityFromDatabase(userId);

    return NextResponse.json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}

async function getRecentActivityFromDatabase(userId: string) {
  try {
    // TODO: Replace with actual database query
    // For now, return calculated activities based on user data

    const activities = [
      {
        id: "1",
        type: "lead" as const,
        title: "New high-value lead",
        description: "John Smith from TechCorp opened pricing page",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "success" as const,
      },
      {
        id: "2",
        type: "campaign" as const,
        title: "Campaign performance update",
        description: "Welcome Series: 24.5% open rate achieved",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "info" as const,
      },
      {
        id: "3",
        type: "meeting" as const,
        title: "Meeting scheduled",
        description: "Demo call with Sarah Johnson at 3:00 PM",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: "success" as const,
      },
    ];

    return activities;
  } catch (error) {
    console.error("Error getting recent activity from database:", error);
    return [];
  }
}
