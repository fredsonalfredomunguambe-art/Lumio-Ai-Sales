import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get pipeline data for dashboard
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pipeline data from database
    const pipeline = await getPipelineDataFromDatabase(userId);

    return NextResponse.json({
      success: true,
      data: { pipeline },
    });
  } catch (error) {
    console.error("Error fetching pipeline data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pipeline data" },
      { status: 500 }
    );
  }
}

async function getPipelineDataFromDatabase(userId: string) {
  try {
    // TODO: Replace with actual database query
    // For now, return calculated pipeline data based on user data

    const pipeline = [
      { stage: "Captured", count: 1234, percentage: 100 },
      { stage: "Engaged", count: 890, percentage: 72 },
      { stage: "Qualified", count: 456, percentage: 37 },
      { stage: "Won", count: 89, percentage: 7 },
    ];

    return pipeline;
  } catch (error) {
    console.error("Error getting pipeline data from database:", error);
    return [];
  }
}
