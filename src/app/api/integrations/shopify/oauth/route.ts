import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { logInfo, logError } from "@/lib/logger";

/**
 * GET /api/integrations/shopify/oauth
 * Generate Shopify OAuth URL
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/shopify/oauth/callback`;
    const scopes =
      "read_products,read_orders,read_customers,write_products,write_customers";

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Shopify client ID not configured" },
        { status: 500 }
      );
    }

    // Shopify requires shop parameter
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop parameter required",
          message:
            "Please provide your Shopify store domain (e.g., mystore.myshopify.com)",
        },
        { status: 400 }
      );
    }

    // Generate state for CSRF protection
    const state = `${userId}:${Date.now()}`;

    const oauthUrl = new URL(`https://${shop}/admin/oauth/authorize`);
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("scope", scopes);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("state", state);

    logInfo("Shopify OAuth URL generated", {
      userId,
      shop,
    });

    return NextResponse.json({
      success: true,
      data: {
        oauthUrl: oauthUrl.toString(),
      },
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to generate Shopify OAuth URL",
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
