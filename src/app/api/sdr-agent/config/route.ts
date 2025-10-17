import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/sdr-agent/config
 * Get SDR Agent configuration for current user
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

    // Try to get existing config
    const config = await prisma.sDRAgentConfig.findUnique({
      where: { userId },
    });

    if (config) {
      return NextResponse.json({
        success: true,
        data: {
          active: config.active,
          mode: config.mode,
          scoreThreshold: config.scoreThreshold,
          maxTouchpointsPerWeek: config.maxTouchpointsPerWeek,
          channels: config.channels,
          rules: config.rules,
        },
      });
    }

    // Return default config if none exists
    return NextResponse.json({
      success: true,
      data: {
        active: false,
        mode: "COPILOT",
        scoreThreshold: 70,
        maxTouchpointsPerWeek: 3,
        channels: ["email"],
        rules: [],
      },
    });
  } catch (error) {
    console.error("Error getting SDR config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sdr-agent/config
 * Save SDR Agent configuration
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
    const { config, rules } = body;

    // Validate
    if (!config || !rules) {
      return NextResponse.json(
        { success: false, error: "Config and rules are required" },
        { status: 400 }
      );
    }

    // Save to database
    await prisma.sDRAgentConfig.upsert({
      where: { userId },
      update: {
        active: config.active,
        mode: config.mode,
        scoreThreshold: config.scoreThreshold,
        maxTouchpointsPerWeek: config.maxTouchpointsPerWeek,
        channels: config.channels,
        rules: rules, // JSON field
        updatedAt: new Date(),
      },
      create: {
        userId,
        active: config.active,
        mode: config.mode,
        scoreThreshold: config.scoreThreshold,
        maxTouchpointsPerWeek: config.maxTouchpointsPerWeek,
        channels: config.channels,
        rules: rules,
      },
    });

    return NextResponse.json({
      success: true,
      message: "SDR Agent configuration saved successfully",
    });
  } catch (error) {
    console.error("Error saving SDR config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}
