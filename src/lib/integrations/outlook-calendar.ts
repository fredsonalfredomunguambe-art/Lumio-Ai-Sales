/**
 * Outlook Calendar Integration
 * Microsoft Graph API and OAuth 2.0
 */

import { Client } from "@microsoft/microsoft-graph-client";

export class OutlookCalendarIntegration {
  private client: Client | null = null;

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(): string {
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const redirectUri =
      process.env.MICROSOFT_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/sync/outlook/callback`;
    const scopes = "Calendars.ReadWrite offline_access";

    const authUrl =
      `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_mode=query`;

    return authUrl;
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
    const redirectUri =
      process.env.MICROSOFT_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/sync/outlook/callback`;

    const response = await fetch(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      }
    );

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  /**
   * Initialize Graph Client with access token
   */
  setAccessToken(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * List user's calendars
   */
  async listCalendars() {
    if (!this.client) throw new Error("Client not initialized");

    const response = await this.client.api("/me/calendars").get();

    return response.value.map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      description: cal.description,
      timeZone: cal.timeZone,
      primary: cal.isDefaultCalendar,
    }));
  }

  /**
   * Fetch events from calendar
   */
  async fetchEvents(calendarId: string, startDate: Date, endDate: Date) {
    if (!this.client) throw new Error("Client not initialized");

    const response = await this.client
      .api(`/me/calendars/${calendarId}/events`)
      .filter(
        `start/dateTime ge '${startDate.toISOString()}' and ` +
          `end/dateTime le '${endDate.toISOString()}'`
      )
      .orderby("start/dateTime")
      .select(
        "id,subject,bodyPreview,start,end,isAllDay,location,onlineMeetingUrl,attendees"
      )
      .get();

    return response.value.map((event: any) => ({
      externalId: event.id,
      title: event.subject,
      description: event.bodyPreview,
      startDate: new Date(event.start.dateTime),
      endDate: new Date(event.end.dateTime),
      allDay: event.isAllDay,
      location: event.location?.displayName,
      meetingUrl: event.onlineMeetingUrl,
      attendees: event.attendees?.map((a: any) => a.emailAddress.address) || [],
    }));
  }

  /**
   * Create event in Outlook Calendar
   */
  async createEvent(calendarId: string, event: any) {
    if (!this.client) throw new Error("Client not initialized");

    const outlookEvent = {
      subject: event.title,
      body: {
        contentType: "HTML",
        content: event.description || "",
      },
      start: {
        dateTime: event.startDate.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: event.endDate.toISOString(),
        timeZone: "UTC",
      },
      isAllDay: event.allDay,
      location: event.location
        ? {
            displayName: event.location,
          }
        : undefined,
      attendees: event.attendees?.map((email: string) => ({
        emailAddress: {
          address: email,
        },
        type: "required",
      })),
      isOnlineMeeting: !!event.meetingUrl,
    };

    const response = await this.client
      .api(`/me/calendars/${calendarId}/events`)
      .post(outlookEvent);

    return {
      externalId: response.id,
      meetingUrl: response.onlineMeetingUrl,
    };
  }

  /**
   * Update event in Outlook Calendar
   */
  async updateEvent(calendarId: string, eventId: string, updates: any) {
    if (!this.client) throw new Error("Client not initialized");

    const outlookUpdates: any = {};
    if (updates.title) outlookUpdates.subject = updates.title;
    if (updates.description) {
      outlookUpdates.body = {
        contentType: "HTML",
        content: updates.description,
      };
    }
    if (updates.startDate) {
      outlookUpdates.start = {
        dateTime: updates.startDate.toISOString(),
        timeZone: "UTC",
      };
    }
    if (updates.endDate) {
      outlookUpdates.end = {
        dateTime: updates.endDate.toISOString(),
        timeZone: "UTC",
      };
    }
    if (updates.location) {
      outlookUpdates.location = {
        displayName: updates.location,
      };
    }

    await this.client
      .api(`/me/calendars/${calendarId}/events/${eventId}`)
      .patch(outlookUpdates);
  }

  /**
   * Delete event from Outlook Calendar
   */
  async deleteEvent(calendarId: string, eventId: string) {
    if (!this.client) throw new Error("Client not initialized");

    await this.client
      .api(`/me/calendars/${calendarId}/events/${eventId}`)
      .delete();
  }

  /**
   * Subscribe to calendar change notifications
   */
  async createSubscription(calendarId: string, webhookUrl: string) {
    if (!this.client) throw new Error("Client not initialized");

    const subscription = {
      changeType: "created,updated,deleted",
      notificationUrl: webhookUrl,
      resource: `/me/calendars/${calendarId}/events`,
      expirationDateTime: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days
      ).toISOString(),
      clientState: `lumio-${Date.now()}`,
    };

    const response = await this.client.api("/subscriptions").post(subscription);

    return {
      subscriptionId: response.id,
      expirationDateTime: new Date(response.expirationDateTime),
    };
  }

  /**
   * Renew subscription
   */
  async renewSubscription(subscriptionId: string) {
    if (!this.client) throw new Error("Client not initialized");

    const expirationDateTime = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000
    ).toISOString();

    await this.client
      .api(`/subscriptions/${subscriptionId}`)
      .patch({ expirationDateTime });
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(subscriptionId: string) {
    if (!this.client) throw new Error("Client not initialized");

    await this.client.api(`/subscriptions/${subscriptionId}`).delete();
  }
}

