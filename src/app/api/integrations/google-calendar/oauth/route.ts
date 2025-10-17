import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/integrations/google-calendar/oauth
 * Generate Google Calendar OAuth URL
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

    const userId = user.clerkId; // Use clerkId for state parameter

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Google Calendar not configured" },
        { status: 500 }
      );
    }

    // Google Calendar OAuth scopes
    const scopes = [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ];

    // Generate state for CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        userId,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7),
      })
    ).toString("base64");

    // Build OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("access_type", "offline");
    authUrl.searchParams.append("prompt", "consent");
    authUrl.searchParams.append("state", state);

    return NextResponse.json({
      success: true,
      data: {
        authUrl: authUrl.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate auth URL" },
      { status: 500 }
    );
  }
}
