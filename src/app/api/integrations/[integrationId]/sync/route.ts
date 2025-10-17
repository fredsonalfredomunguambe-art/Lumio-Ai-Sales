import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getIntegrationSyncService } from "@/lib/integrations/integration-sync-service";
import { logInfo, logError } from "@/lib/logger";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/**
 * POST /api/integrations/[integrationId]/sync
 * Start a sync job for an integration
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { integrationId } = await context.params;
    const body = await request.json();
    const { syncOptions, mode = "initial" } = body;

    logInfo("Starting integration sync", {
      userId,
      integrationId,
      syncOptions,
      mode,
    });

    // Verify integration is connected
    const connection = await prisma.integrationConnection.findUnique({
      where: {
        userId_integrationId: {
          userId,
          integrationId,
        },
      },
    });

    if (!connection || connection.status !== "connected") {
      return NextResponse.json(
        {
          success: false,
          error: "Integration not connected",
        },
        { status: 400 }
      );
    }

    // Start sync
    const syncService = getIntegrationSyncService();
    const result = await syncService.startSync(
      userId,
      integrationId,
      syncOptions,
      mode
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to start sync",
      path: request.url,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to start sync",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/[integrationId]/sync
 * Get sync status and history
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { integrationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const syncService = getIntegrationSyncService();

    // Get specific job progress
    if (jobId) {
      const progress = await syncService.getSyncProgress(jobId);

      if (!progress) {
        return NextResponse.json(
          {
            success: false,
            error: "Sync job not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: progress,
      });
    }

    // Get all sync jobs for integration
    const jobs = await syncService.getSyncJobs(userId, integrationId);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        total: jobs.length,
      },
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to get sync status",
      path: request.url,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get sync status",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/[integrationId]/sync
 * Cancel a running sync job
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ integrationId: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: "Job ID required",
        },
        { status: 400 }
      );
    }

    const syncService = getIntegrationSyncService();
    const cancelled = await syncService.cancelSync(jobId);

    if (!cancelled) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to cancel sync or job not found",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        status: "cancelled",
      },
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to cancel sync",
      path: request.url,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to cancel sync",
      },
      { status: 500 }
    );
  }
}
