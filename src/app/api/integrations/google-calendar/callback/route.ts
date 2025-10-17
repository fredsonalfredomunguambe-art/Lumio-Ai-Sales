import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/integrations/google-calendar/callback
 * Handle Google Calendar OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=google_calendar_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=invalid_callback`
      );
    }

    // Verify state (CSRF protection)
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
    const { userId: clerkId, timestamp } = stateData;

    // Check if state is too old (5 minutes max)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=state_expired`
      );
    }

    // Get the actual Prisma user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=user_not_found`
      );
    }

    const userId = user.id;

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google-calendar/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const tokens = await tokenResponse.json();

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Store connection in CalendarSync table (correct model)
    await prisma.calendarSync.upsert({
      where: {
        userId_provider_calendarId: {
          userId,
          provider: "google",
          calendarId: "primary",
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        lastSyncedAt: new Date(),
        syncEnabled: true,
      },
      create: {
        userId,
        provider: "google",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        calendarId: "primary",
        calendarName: "Google Calendar",
        syncEnabled: true,
      },
    });

    logInfo("Google Calendar connected successfully", {
      userId,
    });

    // Redirect back to integrations page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?success=google_calendar`
    );
  } catch (error: any) {
    logError(error, {
      message: "Google Calendar OAuth callback failed",
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/integrations?error=connection_failed`
    );
  }
}
