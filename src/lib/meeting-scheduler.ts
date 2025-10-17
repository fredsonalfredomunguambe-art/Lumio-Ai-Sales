import { prisma } from "@/lib/prisma";

interface MeetingSlot {
  start: Date;
  end: Date;
  available: boolean;
  timezone: string;
}

interface MeetingPreferences {
  duration: number; // in minutes
  timezone: string;
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    days: number[]; // [1,2,3,4,5] for Mon-Fri
  };
  bufferTime: number; // in minutes
  advanceNotice: number; // in hours
}

export class MeetingScheduler {
  async findAvailableSlots(
    preferences: MeetingPreferences,
    dateRange: { start: Date; end: Date }
  ): Promise<MeetingSlot[]> {
    const slots: MeetingSlot[] = [];
    const currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      if (preferences.workingHours.days.includes(dayOfWeek)) {
        const daySlots = await this.generateDaySlots(currentDate, preferences);
        slots.push(...daySlots);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  private async generateDaySlots(
    date: Date,
    preferences: MeetingPreferences
  ): Promise<MeetingSlot[]> {
    const slots: MeetingSlot[] = [];
    const [startHour, startMinute] = preferences.workingHours.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = preferences.workingHours.end
      .split(":")
      .map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    const currentTime = new Date();
    const advanceNotice = new Date(
      currentTime.getTime() + preferences.advanceNotice * 60 * 60 * 1000
    );

    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(
        currentSlot.getTime() + preferences.duration * 60 * 1000
      );

      if (slotEnd <= endTime && currentSlot >= advanceNotice) {
        const isAvailable = await this.isSlotAvailable(currentSlot, slotEnd);

        slots.push({
          start: new Date(currentSlot),
          end: new Date(slotEnd),
          available: isAvailable,
          timezone: preferences.timezone,
        });
      }

      currentSlot.setMinutes(currentSlot.getMinutes() + 30); // 30-minute intervals
    }

    return slots;
  }

  private async isSlotAvailable(start: Date, end: Date): Promise<boolean> {
    try {
      // Check for existing meetings in this time slot
      const existingMeetings = await prisma.meeting.findMany({
        where: {
          OR: [
            {
              startDate: {
                gte: start,
                lt: end,
              },
            },
            {
              endDate: {
                gt: start,
                lte: end,
              },
            },
            {
              AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }],
            },
          ],
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
      });

      return existingMeetings.length === 0;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }

  async scheduleMeeting(
    leadId: string,
    slot: MeetingSlot,
    type: "CALL" | "VIDEO" | "IN_PERSON" = "VIDEO",
    title?: string,
    description?: string
  ): Promise<any> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error("Lead not found");
      }

      const meeting = await prisma.meeting.create({
        data: {
          title: title || `Meeting with ${lead.firstName} ${lead.lastName}`,
          description:
            description ||
            `Sales meeting with ${lead.firstName} from ${lead.company}`,
          leadId,
          startDate: slot.start,
          endDate: slot.end,
          type,
          status: "SCHEDULED",
          meetingUrl: type === "VIDEO" ? this.generateMeetingUrl() : null,
          userId: lead.userId,
        },
      });

      // Send calendar invite
      await this.sendCalendarInvite(meeting, lead);

      return meeting;
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      throw error;
    }
  }

  private generateMeetingUrl(): string {
    // In a real implementation, this would integrate with Google Meet, Zoom, etc.
    const meetingId = Math.random().toString(36).substr(2, 9);
    return `https://meet.google.com/${meetingId}`;
  }

  private async sendCalendarInvite(meeting: any, lead: any): Promise<void> {
    try {
      // In a real implementation, this would send actual calendar invites
      console.log(
        `Sending calendar invite for meeting ${meeting.id} to ${lead.email}`
      );

      // You could integrate with Google Calendar API, Outlook API, etc.
      // For now, we'll just log the action
    } catch (error) {
      console.error("Error sending calendar invite:", error);
    }
  }

  async rescheduleMeeting(
    meetingId: string,
    newSlot: MeetingSlot
  ): Promise<any> {
    try {
      const meeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          startDate: newSlot.start,
          endDate: newSlot.end,
          status: "SCHEDULED",
        },
      });

      return meeting;
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
      throw error;
    }
  }

  async cancelMeeting(meetingId: string, reason?: string): Promise<any> {
    try {
      const meeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: "CANCELLED",
          notes: reason ? `Cancelled: ${reason}` : "Meeting cancelled",
        },
      });

      return meeting;
    } catch (error) {
      console.error("Error cancelling meeting:", error);
      throw error;
    }
  }

  async getUpcomingMeetings(userId: string, days: number = 7): Promise<any[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const meetings = await prisma.meeting.findMany({
        where: {
          userId,
          startDate: {
            gte: startDate,
            lte: endDate,
          },
          status: "SCHEDULED",
        },
        include: {
          lead: true,
        },
        orderBy: {
          startDate: "asc",
        },
      });

      return meetings;
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
      return [];
    }
  }

  async getMeetingAnalytics(
    userId: string,
    period: "week" | "month" | "quarter"
  ): Promise<any> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "quarter":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const meetings = await prisma.meeting.findMany({
        where: {
          userId,
          startDate: {
            gte: startDate,
          },
        },
      });

      const analytics = {
        total: meetings.length,
        scheduled: meetings.filter((m) => m.status === "SCHEDULED").length,
        completed: meetings.filter((m) => m.status === "COMPLETED").length,
        cancelled: meetings.filter((m) => m.status === "CANCELLED").length,
        completionRate:
          meetings.length > 0
            ? (meetings.filter((m) => m.status === "COMPLETED").length /
                meetings.length) *
              100
            : 0,
        averageDuration:
          meetings.length > 0
            ? meetings.reduce((sum, m) => {
                const duration =
                  new Date(m.endDate).getTime() -
                  new Date(m.startDate).getTime();
                return sum + duration;
              }, 0) /
              meetings.length /
              (1000 * 60)
            : 0, // in minutes
      };

      return analytics;
    } catch (error) {
      console.error("Error getting meeting analytics:", error);
      return null;
    }
  }
}

export const meetingScheduler = new MeetingScheduler();
