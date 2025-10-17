/**
 * Google Calendar Integration
 * OAuth 2.0 flow and calendar sync
 */

import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export class GoogleCalendarIntegration {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/sync/google/callback`
    );
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date!),
    };
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * List user's calendars
   */
  async listCalendars() {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    const response = await calendar.calendarList.list();

    return (
      response.data.items?.map((cal) => ({
        id: cal.id!,
        name: cal.summary!,
        description: cal.description,
        timeZone: cal.timeZone,
        primary: cal.primary || false,
      })) || []
    );
  }

  /**
   * Fetch events from calendar
   */
  async fetchEvents(calendarId: string, startDate: Date, endDate: Date) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    return (
      response.data.items?.map((event) => ({
        externalId: event.id!,
        title: event.summary!,
        description: event.description,
        startDate: new Date(event.start?.dateTime || event.start?.date!),
        endDate: new Date(event.end?.dateTime || event.end?.date!),
        allDay: !!event.start?.date,
        location: event.location,
        meetingUrl: event.hangoutLink,
        attendees: event.attendees?.map((a) => a.email!) || [],
      })) || []
    );
  }

  /**
   * Create event in Google Calendar
   */
  async createEvent(calendarId: string, event: any) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const googleEvent = {
      summary: event.title,
      description: event.description,
      start: event.allDay
        ? { date: event.startDate.toISOString().split("T")[0] }
        : { dateTime: event.startDate.toISOString() },
      end: event.allDay
        ? { date: event.endDate.toISOString().split("T")[0] }
        : { dateTime: event.endDate.toISOString() },
      location: event.location,
      attendees: event.attendees?.map((email: string) => ({ email })),
      reminders: event.reminderMinutes
        ? {
            useDefault: false,
            overrides: [
              { method: "popup", minutes: event.reminderMinutes },
              { method: "email", minutes: event.reminderMinutes },
            ],
          }
        : { useDefault: true },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: googleEvent,
      conferenceDataVersion: event.meetingUrl ? 1 : 0,
    });

    return {
      externalId: response.data.id!,
      meetingUrl: response.data.hangoutLink,
    };
  }

  /**
   * Update event in Google Calendar
   */
  async updateEvent(calendarId: string, eventId: string, updates: any) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const googleUpdates: any = {};
    if (updates.title) googleUpdates.summary = updates.title;
    if (updates.description) googleUpdates.description = updates.description;
    if (updates.startDate) {
      googleUpdates.start = updates.allDay
        ? { date: updates.startDate.toISOString().split("T")[0] }
        : { dateTime: updates.startDate.toISOString() };
    }
    if (updates.endDate) {
      googleUpdates.end = updates.allDay
        ? { date: updates.endDate.toISOString().split("T")[0] }
        : { dateTime: updates.endDate.toISOString() };
    }
    if (updates.location) googleUpdates.location = updates.location;

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: googleUpdates,
    });
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEvent(calendarId: string, eventId: string) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  /**
   * Watch calendar for changes (webhooks)
   */
  async watchCalendar(calendarId: string, webhookUrl: string) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    const response = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: `lumio-${Date.now()}`,
        type: "web_hook",
        address: webhookUrl,
      },
    });

    return {
      channelId: response.data.id!,
      resourceId: response.data.resourceId!,
      expiration: new Date(parseInt(response.data.expiration!)),
    };
  }

  /**
   * Stop watching calendar
   */
  async stopWatching(channelId: string, resourceId: string) {
    const calendar = google.calendar({
      version: "v3",
      auth: this.oauth2Client,
    });

    await calendar.channels.stop({
      requestBody: {
        id: channelId,
        resourceId,
      },
    });
  }
}

