import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sdr-agent/status
 * Get current SDR Agent status and stats
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

    // Get config
    const config = await prisma.sDRAgentConfig.findUnique({
      where: { userId },
    });

    // Get stats (in production, query actual data)
    // For now, returning mock data structure
    const stats = {
      activeSequences: 34,
      leadsInQueue: 12,
      todayOutreach: 28,
      responseRate: 34.2,
      lastRun: config?.updatedAt || new Date(),
    };

    return NextResponse.json({
      success: true,
      data: {
        active: config?.active || false,
        stats,
      },
    });
  } catch (error) {
    console.error("Error getting SDR status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get status" },
      { status: 500 }
    );
  }
}
