import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/oauth-integrations";
import { PrismaClient } from "@/generated/prisma";
import { logInfo, logError } from "@/lib/logger";

const prisma = new PrismaClient();

/**
 * GET /api/integrations/salesforce/oauth/callback
 * Handle Salesforce OAuth callback
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Verify state and extract userId
    const [userId, timestamp] = state.split(":");

    if (!userId) {
      return new NextResponse("Invalid state parameter", { status: 400 });
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken("salesforce", code);

    // Get instance URL from token response
    const instanceUrl =
      (tokens as any).instance_url || "https://login.salesforce.com";

    // Save connection
    await prisma.integrationConnection.upsert({
      where: {
        userId_integrationId: {
          userId,
          integrationId: "salesforce",
        },
      },
      update: {
        credentials: JSON.stringify({
          ...tokens,
          instanceUrl,
        }),
        status: "connected",
        connectedAt: new Date(),
      },
      create: {
        userId,
        integrationId: "salesforce",
        credentials: JSON.stringify({
          ...tokens,
          instanceUrl,
        }),
        status: "connected",
        connectedAt: new Date(),
      },
    });

    logInfo("Salesforce OAuth completed", {
      userId,
      instanceUrl,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&success=salesforce`
    );
  } catch (error: any) {
    logError(error, {
      message: "Salesforce OAuth callback failed",
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=salesforce`
    );
  }
}
