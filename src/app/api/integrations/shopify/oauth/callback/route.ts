import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/**
 * GET /api/integrations/shopify/oauth/callback
 * Handle Shopify OAuth callback
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");
    const hmac = searchParams.get("hmac");

    if (!code || !shop || !state) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Extract userId from state
    const [userId] = state.split(":");

    if (!userId) {
      return new NextResponse("Invalid state parameter", { status: 400 });
    }

    // Exchange code for access token
    const clientId = process.env.SHOPIFY_CLIENT_ID!;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET!;

    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();

    // Save connection
    await prisma.integrationConnection.upsert({
      where: {
        userId_integrationId: {
          userId,
          integrationId: "shopify",
        },
      },
      update: {
        credentials: JSON.stringify({
          accessToken: tokenData.access_token,
          shop,
          scope: tokenData.scope,
        }),
        status: "connected",
        connectedAt: new Date(),
      },
      create: {
        userId,
        integrationId: "shopify",
        credentials: JSON.stringify({
          accessToken: tokenData.access_token,
          shop,
          scope: tokenData.scope,
        }),
        status: "connected",
        connectedAt: new Date(),
      },
    });

    logInfo("Shopify OAuth completed", {
      userId,
      shop,
    });

    // Redirect to settings page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&success=shopify`
    );
  } catch (error: any) {
    logError(error, {
      message: "Shopify OAuth callback failed",
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=shopify`
    );
  }
}
