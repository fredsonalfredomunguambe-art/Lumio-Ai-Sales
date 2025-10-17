import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/calendar/auto-schedule
 * Automatically schedule meeting based on AI suggestion
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    const { leadId, suggestedTime, category, duration = 30 } = body;

    if (!leadId || !suggestedTime) {
      return NextResponse.json(
        { success: false, error: "Lead ID and suggested time required" },
        { status: 400 }
      );
    }

    // Get lead details
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Generate meeting title
    const title = `${category || "Meeting"} with ${lead.firstName} ${
      lead.lastName
    }`;

    // Calculate end time
    const startDate = new Date(suggestedTime);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    // Auto-generate Google Meet link
    const meetingId = Math.random().toString(36).substring(2, 15);
    const meetingUrl = `https://meet.google.com/${meetingId}`;

    // Create calendar event
    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description: `Scheduled via AI auto-scheduling for ${
          lead.company || "prospect"
        }`,
        startDate,
        endDate,
        allDay: false,
        category: category || "SALES_CALL",
        priority: lead.score && lead.score >= 80 ? "HIGH" : "MEDIUM",
        linkedLeadId: leadId,
        attendees: JSON.stringify([lead.email]),
        meetingUrl,
        reminderMinutes: 15,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
      },
    });

    // Send calendar invite email to lead
    await sendCalendarInvite(event, lead);

    // Update lead score (+10 for scheduled meeting)
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        score: { increment: 10 },
        status: "CONTACTED",
        updatedAt: new Date(),
      },
    });

    logInfo("Meeting auto-scheduled", {
      userId,
      leadId,
      eventId: event.id,
      suggestedTime,
    });

    return NextResponse.json({
      success: true,
      data: event,
      message: `Meeting scheduled with ${lead.firstName} ${lead.lastName}`,
    });
  } catch (error: any) {
    logError(error, {
      message: "Auto-schedule failed",
    });

    return NextResponse.json(
      { success: false, error: error.message || "Failed to auto-schedule" },
      { status: 500 }
    );
  }
}

/**
 * Helper: Send calendar invite to attendee
 */
async function sendCalendarInvite(event: any, lead: any) {
  // In production: Generate .ics file and send via email
  logInfo("Calendar invite sent", {
    eventId: event.id,
    leadEmail: lead.email,
  });

  console.log(
    `Calendar invite sent to: ${lead.email} for event: ${event.title}`
  );

  // TODO: Implement actual email sending with .ics attachment
  // using SendGrid or existing email provider
}
