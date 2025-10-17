import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Test database connection without authentication first
    const userCount = await db.user.count();
    const leadCount = await db.lead.count();
    const segmentCount = await db.segment.count();

    return NextResponse.json({
      message: "API is working!",
      database: {
        users: userCount,
        leads: leadCount,
        segments: segmentCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test API error:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
