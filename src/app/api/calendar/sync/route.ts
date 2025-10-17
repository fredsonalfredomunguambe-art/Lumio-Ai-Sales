import { NextRequest, NextResponse } from "next/server";
import { initializeGoogleCalendarSync } from "@/lib/google-calendar-sync";
import { logInfo, logError } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/calendar/sync
 * Manually trigger Google Calendar sync
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

    const body = await request.json();
    const { direction = "both" } = body; // "to_google", "from_google", or "both"

    const syncEngine = await initializeGoogleCalendarSync(userId);

    if (!syncEngine) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Calendar not connected. Please connect first.",
        },
        { status: 400 }
      );
    }

    let results: any = {};

    // Sync FROM Google to Lumio
    if (direction === "from_google" || direction === "both") {
      const fromGoogleResults = await syncEngine.syncFromGoogle();
      results.fromGoogle = fromGoogleResults;
    }

    // Sync TO Google from Lumio
    if (direction === "to_google" || direction === "both") {
      results.toGoogle = await syncLumioEventsToGoogle(userId, syncEngine);
    }

    logInfo("Manual calendar sync completed", {
      userId,
      direction,
      results,
    });

    return NextResponse.json({
      success: true,
      data: results,
      message: "Sync completed successfully",
    });
  } catch (error: any) {
    logError(error, {
      message: "Calendar sync failed",
    });

    return NextResponse.json(
      { success: false, error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/sync
 * Get sync status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const connection = await prisma.calendarSync.findFirst({
      where: {
        userId,
        provider: "google",
      },
    });

    if (!connection) {
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          lastSync: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        connected: connection.syncEnabled,
        lastSync: connection.lastSyncedAt,
        status: connection.syncEnabled ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get sync status" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Sync all Lumio events to Google
 */
async function syncLumioEventsToGoogle(userId: string, syncEngine: any) {
  let synced = 0;
  let errors = 0;

  try {
    // Get all Lumio events without externalId (not yet in Google)
    const events = await prisma.calendarEvent.findMany({
      where: {
        userId,
        externalId: null,
        startDate: { gte: new Date() }, // Only future events
      },
      take: 50, // Limit to avoid rate limits
    });

    for (const event of events) {
      const result = await syncEngine.syncToGoogle(event.id);
      if (result.success) {
        synced++;
      } else {
        errors++;
      }
    }

    return { synced, errors };
  } catch (error) {
    console.error("Error syncing to Google:", error);
    return { synced, errors: errors + 1 };
  }
}

// Import prisma for the helper function
import { prisma } from "@/lib/prisma";
