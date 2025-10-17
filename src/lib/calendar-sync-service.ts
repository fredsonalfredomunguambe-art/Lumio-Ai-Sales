/**
 * Calendar Sync Service
 * Unified interface for Google and Outlook calendar sync
 */

import { prisma } from "./prisma";
import { GoogleCalendarIntegration } from "./integrations/google-calendar";
import { OutlookCalendarIntegration } from "./integrations/outlook-calendar";

export class CalendarSyncService {
  /**
   * Sync events from external calendar to Lumio
   */
  async syncFromExternal(userId: string, syncId: string) {
    try {
      const sync = await prisma.calendarSync.findUnique({
        where: { id: syncId },
      });

      if (!sync || sync.userId !== userId) {
        throw new Error("Calendar sync not found");
      }

      let integration: GoogleCalendarIntegration | OutlookCalendarIntegration;

      if (sync.provider === "google") {
        integration = new GoogleCalendarIntegration();
        integration.setCredentials(sync.accessToken, sync.refreshToken);
      } else if (sync.provider === "outlook") {
        integration = new OutlookCalendarIntegration();
        integration.setAccessToken(sync.accessToken);
      } else {
        throw new Error("Invalid provider");
      }

      // Fetch events from last sync or last 30 days
      const startDate =
        sync.lastSyncedAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // Next 90 days

      const externalEvents = await integration.fetchEvents(
        sync.calendarId,
        startDate,
        endDate
      );

      // Sync events to Lumio
      for (const externalEvent of externalEvents) {
        await this.upsertEvent(userId, sync.provider, externalEvent);
      }

      // Update last synced timestamp
      await prisma.calendarSync.update({
        where: { id: syncId },
        data: { lastSyncedAt: new Date() },
      });

      return {
        success: true,
        syncedCount: externalEvents.length,
      };
    } catch (error) {
      console.error("Error syncing from external:", error);
      throw error;
    }
  }

  /**
   * Sync event from Lumio to external calendar
   */
  async syncToExternal(eventId: string) {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Find active syncs for this user
      const syncs = await prisma.calendarSync.findMany({
        where: {
          userId: event.userId,
          syncEnabled: true,
        },
      });

      const results: any[] = [];

      for (const sync of syncs) {
        const syncDirection = sync.syncDirection;
        if (syncDirection === "from_external") {
          continue; // Skip if only syncing from external
        }

        let integration: GoogleCalendarIntegration | OutlookCalendarIntegration;

        if (sync.provider === "google") {
          integration = new GoogleCalendarIntegration();
          integration.setCredentials(sync.accessToken, sync.refreshToken);
        } else if (sync.provider === "outlook") {
          integration = new OutlookCalendarIntegration();
          integration.setAccessToken(sync.accessToken);
        } else {
          continue;
        }

        try {
          if (event.externalId && event.externalProvider === sync.provider) {
            // Update existing event
            await integration.updateEvent(sync.calendarId, event.externalId, {
              title: event.title,
              description: event.description,
              startDate: event.startDate,
              endDate: event.endDate,
              allDay: event.allDay,
              location: event.location,
            });

            results.push({
              provider: sync.provider,
              action: "updated",
            });
          } else {
            // Create new event
            const result = await integration.createEvent(sync.calendarId, {
              title: event.title,
              description: event.description,
              startDate: event.startDate,
              endDate: event.endDate,
              allDay: event.allDay,
              location: event.location,
              meetingUrl: event.meetingUrl,
              attendees: event.attendees ? JSON.parse(event.attendees) : [],
              reminderMinutes: event.reminderMinutes,
            });

            // Update Lumio event with external ID
            await prisma.calendarEvent.update({
              where: { id: eventId },
              data: {
                externalId: result.externalId,
                externalProvider: sync.provider,
                syncStatus: "synced",
                meetingUrl: result.meetingUrl || event.meetingUrl,
              },
            });

            results.push({
              provider: sync.provider,
              action: "created",
              externalId: result.externalId,
            });
          }
        } catch (error) {
          console.error(`Error syncing to ${sync.provider}:`, error);
          results.push({
            provider: sync.provider,
            action: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return {
        success: true,
        results,
      };
    } catch (error) {
      console.error("Error syncing to external:", error);
      throw error;
    }
  }

  /**
   * Upsert event from external source
   */
  private async upsertEvent(
    userId: string,
    provider: string,
    externalEvent: any
  ) {
    const existing = await prisma.calendarEvent.findFirst({
      where: {
        userId,
        externalId: externalEvent.externalId,
        externalProvider: provider,
      },
    });

    const eventData = {
      userId,
      title: externalEvent.title,
      description: externalEvent.description,
      startDate: externalEvent.startDate,
      endDate: externalEvent.endDate,
      allDay: externalEvent.allDay,
      location: externalEvent.location,
      meetingUrl: externalEvent.meetingUrl,
      attendees: JSON.stringify(externalEvent.attendees),
      externalId: externalEvent.externalId,
      externalProvider: provider,
      syncStatus: "synced",
      category: "MEETING", // Default category
      priority: "MEDIUM", // Default priority
    };

    if (existing) {
      await prisma.calendarEvent.update({
        where: { id: existing.id },
        data: eventData,
      });
    } else {
      await prisma.calendarEvent.create({
        data: eventData,
      });
    }
  }

  /**
   * Delete event from both Lumio and external calendars
   */
  async deleteEventEverywhere(eventId: string) {
    try {
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Delete from external calendar if synced
      if (event.externalId && event.externalProvider) {
        const sync = await prisma.calendarSync.findFirst({
          where: {
            userId: event.userId,
            provider: event.externalProvider,
            syncEnabled: true,
          },
        });

        if (sync) {
          let integration:
            | GoogleCalendarIntegration
            | OutlookCalendarIntegration;

          if (sync.provider === "google") {
            integration = new GoogleCalendarIntegration();
            integration.setCredentials(sync.accessToken, sync.refreshToken);
          } else {
            integration = new OutlookCalendarIntegration();
            integration.setAccessToken(sync.accessToken);
          }

          await integration.deleteEvent(sync.calendarId, event.externalId);
        }
      }

      // Delete from Lumio
      await prisma.calendarEvent.delete({
        where: { id: eventId },
      });

      return {
        success: true,
        message: "Event deleted from all calendars",
      };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  /**
   * Handle webhook from external calendar
   */
  async handleWebhook(provider: string, webhookData: any) {
    console.log(`Webhook received from ${provider}:`, webhookData);

    // Find affected syncs and trigger re-sync
    // Implementation depends on webhook format from each provider

    return {
      success: true,
      message: "Webhook processed",
    };
  }
}

export const calendarSyncService = new CalendarSyncService();

