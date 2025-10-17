import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { logInfo, logError } from "@/lib/logger";

/**
 * POST /api/integrations/google-calendar/disconnect
 * Disconnect Google Calendar integration
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Delete calendar sync connection
    await prisma.calendarSync.deleteMany({
      where: {
        userId,
        provider: "google",
      },
    });

    logInfo("Google Calendar disconnected", { userId });

    return NextResponse.json({
      success: true,
      message: "Google Calendar disconnected successfully",
    });
  } catch (error) {
    logError(error as Error, {
      message: "Failed to disconnect Google Calendar",
    });

    return NextResponse.json(
      { success: false, error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}


