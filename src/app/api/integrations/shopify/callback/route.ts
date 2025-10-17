import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  exchangeCodeForToken,
  saveOAuthConnection,
} from "@/lib/oauth-integrations";

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
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const shop = searchParams.get("shop");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=${error}`
      );
    }

    if (!code || !state || !shop) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=missing_parameters`
      );
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken("shopify", code, state);

    // Save connection to database with shop domain
    await saveOAuthConnection(
      userId,
      "shopify",
      tokenData.accessToken,
      tokenData.refreshToken,
      tokenData.expiresIn
    );

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=shopify_connected`
    );
  } catch (error) {
    console.error("Error in Shopify OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?error=oauth_failed`
    );
  }
}
