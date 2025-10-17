import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPremiumIntegrationsForUser } from "@/lib/premium-integrations";
import { prisma } from "@/lib/prisma";

// GET - Get all integrations
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
    const includeHealth = searchParams.get("health") === "true";

    // Get premium integrations from database
    const integrations = await getPremiumIntegrationsForUser(userId);

    // If health data requested, enhance with health info
    if (includeHealth) {
      const enhancedIntegrations = await Promise.all(
        integrations.map(async (integration: any) => {
          try {
            // Get connection info
            const connection = await prisma.integrationConnection.findUnique({
              where: {
                userId_integrationId: {
                  userId,
                  integrationId: integration.id,
                },
              },
            });

            if (!connection || connection.status !== "connected") {
              return {
                ...integration,
                status: "disconnected",
                health: "unhealthy",
                totalSynced: 0,
                last24h: 0,
                errors: 0,
              };
            }

            // Get sync stats (count leads from this source)
            const totalSynced = await prisma.lead.count({
              where: {
                userId,
                source: integration.id,
              },
            });

            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const last24h = await prisma.lead.count({
              where: {
                userId,
                source: integration.id,
                createdAt: { gte: yesterday },
              },
            });

            // Get recent sync jobs and errors
            const recentJobs = await prisma.integrationSyncJob.findMany({
              where: {
                userId,
                integrationId: integration.id,
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            });

            const errors = recentJobs.filter(
              (job) => job.status === "failed"
            ).length;
            const lastJob = recentJobs[0];

            // Determine health
            let health = "healthy";
            if (errors > 3) {
              health = "unhealthy";
            } else if (errors > 0) {
              health = "degraded";
            }

            return {
              ...integration,
              status: connection.status,
              lastSync: connection.lastSync || lastJob?.createdAt,
              totalSynced,
              last24h,
              errors,
              lastError: lastJob?.status === "failed" ? lastJob.error : null,
              health,
            };
          } catch (error) {
            console.error(`Error getting health for ${integration.id}:`, error);
            return {
              ...integration,
              status: "error",
              health: "unhealthy",
              totalSynced: 0,
              last24h: 0,
              errors: 1,
              lastError: "Failed to load health data",
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        data: { integrations: enhancedIntegrations },
      });
    }

    return NextResponse.json({
      success: true,
      data: { integrations },
    });
  } catch (error) {
    console.error("Error fetching integrations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }
}
