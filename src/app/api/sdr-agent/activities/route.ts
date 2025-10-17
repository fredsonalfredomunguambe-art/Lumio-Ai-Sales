import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sdr-agent/activities
 * Get recent SDR Agent activities
 */
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
    const limit = parseInt(searchParams.get("limit") || "20");

    // In production, query actual SDR activities from LeadInteractions
    // For now, returning structure
    const activities = [
      {
        id: "act_1",
        leadName: "John Smith",
        action: "Sent VIP welcome email",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: "success",
        channel: "email",
      },
      {
        id: "act_2",
        leadName: "Sarah Johnson",
        action: "Sent abandoned cart recovery",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: "success",
        channel: "email",
      },
      {
        id: "act_3",
        leadName: "Mike Davis",
        action: "LinkedIn connection request",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: "pending",
        channel: "linkedin",
      },
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      data: { activities },
    });
  } catch (error) {
    console.error("Error getting SDR activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get activities" },
      { status: 500 }
    );
  }
}
