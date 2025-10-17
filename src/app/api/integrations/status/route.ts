import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/integrations/status
 * Get real-time connection status for all integrations
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

    // Get IntegrationConnection statuses (HubSpot, Shopify, etc)
    const connections = await prisma.integrationConnection.findMany({
      where: { userId },
      select: {
        integrationId: true,
        status: true,
        lastSync: true,
        connectedAt: true,
      },
    });

    // Get CalendarSync status (Google Calendar, Outlook)
    const calendarSyncs = await prisma.calendarSync.findMany({
      where: { userId },
      select: {
        provider: true,
        syncEnabled: true,
        lastSyncedAt: true,
        createdAt: true,
      },
    });

    // Build status map
    const statusMap: Record<string, any> = {};

    // Add regular integrations
    connections.forEach((conn) => {
      statusMap[conn.integrationId] = {
        status: conn.status,
        lastSync: conn.lastSync,
        connectedAt: conn.connectedAt,
      };
    });

    // Add calendar integrations
    calendarSyncs.forEach((sync) => {
      const integrationId =
        sync.provider === "google"
          ? "google-calendar"
          : `${sync.provider}-calendar`;
      statusMap[integrationId] = {
        status: sync.syncEnabled ? "connected" : "disconnected",
        lastSync: sync.lastSyncedAt,
        connectedAt: sync.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      connections: statusMap,
    });
  } catch (error) {
    console.error("Error fetching integration status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch integration status",
      },
      { status: 500 }
    );
  }
}


