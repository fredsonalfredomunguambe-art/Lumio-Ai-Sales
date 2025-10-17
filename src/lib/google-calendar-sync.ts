/**
 * Google Calendar Bi-Directional Sync Engine
 * Handles OAuth, event sync to/from Google Calendar, webhooks
 */

import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

export interface GoogleCalendarConfig {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  calendarId?: string; // Default: "primary"
}

export class GoogleCalendarSync {
  private config: GoogleCalendarConfig;
  private userId: string;

  constructor(userId: string, config: GoogleCalendarConfig) {
    this.userId = userId;
    this.config = config;
  }

  /**
   * Sync Lumio event TO Google Calendar
   */
  async syncToGoogle(
    eventId: string
  ): Promise<{ success: boolean; externalId?: string }> {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
        include: {
          lead: true,
        },
      });

      if (!event || event.userId !== this.userId) {
        throw new Error("Event not found");
      }

      // Prepare Google Calendar event format
      const googleEvent = {
        summary: event.title,
        description: event.description || "",
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        location: event.location || "",
        attendees: event.attendees
          ? JSON.parse(event.attendees as string).map((email: string) => ({
              email,
            }))
          : [],
        reminders: {
          useDefault: false,
          overrides: event.reminderMinutes
            ? [{ method: "popup", minutes: event.reminderMinutes }]
            : [],
        },
        conferenceData: event.meetingUrl
          ? {
              createRequest: {
                requestId: `lumio-${eventId}`,
              },
            }
          : undefined,
      };

      // Call Google Calendar API
      const googleApiUrl = event.externalId
        ? `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.externalId}`
        : "https://www.googleapis.com/calendar/v3/calendars/primary/events";

      const method = event.externalId ? "PATCH" : "POST";

      const response = await fetch(googleApiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleEvent),
      });

      if (!response.ok) {
        // Try refreshing token if expired
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.syncToGoogle(eventId); // Retry
        }
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Update Lumio event with Google ID
      await prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
          externalId: data.id,
          externalProvider: "google",
          syncStatus: "synced",
        },
      });

      logInfo("Event synced to Google Calendar", {
        eventId,
        externalId: data.id,
      });

      return { success: true, externalId: data.id };
    } catch (error: any) {
      logError(error, {
        message: "Failed to sync to Google Calendar",
        eventId,
      });

      await prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
          syncStatus: "failed",
        },
      });

      return { success: false };
    }
  }

  /**
   * Sync FROM Google Calendar to Lumio
   */
  async syncFromGoogle(): Promise<{
    imported: number;
    updated: number;
    errors: number;
  }> {
    let imported = 0;
    let updated = 0;
    let errors = 0;

    try {
      // Get events from Google Calendar (next 30 days)
      const now = new Date();
      const future = new Date();
      future.setDate(now.getDate() + 30);

      const url = new URL(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events"
      );
      url.searchParams.append("timeMin", now.toISOString());
      url.searchParams.append("timeMax", future.toISOString());
      url.searchParams.append("singleEvents", "true");
      url.searchParams.append("orderBy", "startTime");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await this.refreshAccessToken();
          return this.syncFromGoogle(); // Retry
        }
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      const googleEvents = data.items || [];

      // Process each Google event
      for (const gEvent of googleEvents) {
        try {
          const startDate = gEvent.start.dateTime
            ? new Date(gEvent.start.dateTime)
            : new Date(gEvent.start.date);

          const endDate = gEvent.end.dateTime
            ? new Date(gEvent.end.dateTime)
            : new Date(gEvent.end.date);

          // Check if event already exists in Lumio
          const existingEvent = await prisma.calendarEvent.findFirst({
            where: {
              userId: this.userId,
              externalId: gEvent.id,
            },
          });

          if (existingEvent) {
            // Update existing
            await prisma.calendarEvent.update({
              where: { id: existingEvent.id },
              data: {
                title: gEvent.summary || "Untitled",
                description: gEvent.description || null,
                startDate,
                endDate,
                location: gEvent.location || null,
                syncStatus: "synced",
                updatedAt: new Date(),
              },
            });
            updated++;
          } else {
            // Import new event
            await prisma.calendarEvent.create({
              data: {
                userId: this.userId,
                title: gEvent.summary || "Untitled",
                description: gEvent.description || null,
                startDate,
                endDate,
                allDay: !gEvent.start.dateTime,
                category: this.categorizeEvent(gEvent),
                priority: "MEDIUM",
                externalId: gEvent.id,
                externalProvider: "google",
                syncStatus: "synced",
                location: gEvent.location || null,
                meetingUrl: gEvent.hangoutLink || null,
                attendees: gEvent.attendees
                  ? JSON.stringify(gEvent.attendees.map((a: any) => a.email))
                  : null,
              },
            });
            imported++;
          }
        } catch (error) {
          console.error(`Error processing Google event ${gEvent.id}:`, error);
          errors++;
        }
      }

      logInfo("Google Calendar sync completed", {
        userId: this.userId,
        imported,
        updated,
        errors,
      });

      return { imported, updated, errors };
    } catch (error: any) {
      logError(error, {
        message: "Google Calendar sync failed",
        userId: this.userId,
      });

      return { imported, updated, errors: errors + 1 };
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteFromGoogle(externalId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${externalId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 410) {
        // 410 = already deleted
        throw new Error(`Failed to delete from Google: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      logError(error as Error, {
        message: "Failed to delete event from Google Calendar",
        externalId,
      });
      return false;
    }
  }

  /**
   * Handle Google Calendar webhook notification
   */
  async handleWebhook(notification: any): Promise<void> {
    try {
      // Google sends push notifications for calendar changes
      // Trigger incremental sync
      await this.syncFromGoogle();

      logInfo("Google Calendar webhook processed", {
        userId: this.userId,
        channelId: notification.channelId,
      });
    } catch (error) {
      logError(error as Error, {
        message: "Failed to process Google Calendar webhook",
        userId: this.userId,
      });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID || "",
          client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
          refresh_token: this.config.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();

      // Update stored tokens
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);

      this.config.accessToken = data.access_token;
      this.config.expiresAt = expiresAt;

      // Save to database
      await prisma.calendarSync.updateMany({
        where: {
          userId: this.userId,
          provider: "google",
        },
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || this.config.refreshToken,
          expiresAt,
        },
      });

      logInfo("Google access token refreshed", {
        userId: this.userId,
      });
    } catch (error) {
      logError(error as Error, {
        message: "Failed to refresh Google access token",
        userId: this.userId,
      });
      throw error;
    }
  }

  /**
   * Categorize Google event into Lumio category
   */
  private categorizeEvent(gEvent: any): string {
    const summary = (gEvent.summary || "").toLowerCase();

    if (summary.includes("demo") || summary.includes("demonstration")) {
      return "DEMO";
    }
    if (summary.includes("call") || summary.includes("phone")) {
      return "SALES_CALL";
    }
    if (summary.includes("follow") || summary.includes("check-in")) {
      return "FOLLOW_UP";
    }
    if (summary.includes("planning") || summary.includes("strategy")) {
      return "PLANNING";
    }

    return "MEETING";
  }
}

/**
 * Initialize Google Calendar sync for user
 */
export async function initializeGoogleCalendarSync(
  userId: string
): Promise<GoogleCalendarSync | null> {
  try {
    const connection = await prisma.calendarSync.findFirst({
      where: {
        userId,
        provider: "google",
        syncEnabled: true,
      },
    });

    if (!connection || !connection.accessToken || !connection.refreshToken) {
      return null;
    }

    const config: GoogleCalendarConfig = {
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt,
    };

    return new GoogleCalendarSync(userId, config);
  } catch (error) {
    logError(error as Error, {
      message: "Failed to initialize Google Calendar sync",
      userId,
    });
    return null;
  }
}
