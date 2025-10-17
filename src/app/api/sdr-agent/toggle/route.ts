import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/sdr-agent/toggle
 * Toggle SDR Agent on/off
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { active } = body;

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Active must be a boolean" },
        { status: 400 }
      );
    }

    // Update config
    await prisma.sDRAgentConfig.upsert({
      where: { userId },
      update: {
        active,
        updatedAt: new Date(),
      },
      create: {
        userId,
        active,
        mode: "COPILOT",
        scoreThreshold: 70,
        maxTouchpointsPerWeek: 3,
        channels: ["email"],
        rules: [],
      },
    });

    return NextResponse.json({
      success: true,
      data: { active },
      message: `SDR Agent ${active ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling SDR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle SDR Agent" },
      { status: 500 }
    );
  }
}
