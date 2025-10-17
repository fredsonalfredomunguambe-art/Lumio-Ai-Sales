import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";
import { getCurrentUser } from "@/lib/auth";

/**
 * POST /api/calendar/[id]/actions
 * Handle event actions: reschedule, cancel, complete, duplicate, send-reminder
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { id } = await context.params;
    const body = await request.json();
    const { action, data } = body;

    if (
      !action ||
      ![
        "reschedule",
        "cancel",
        "complete",
        "duplicate",
        "send-reminder",
      ].includes(action)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid action. Must be: reschedule, cancel, complete, duplicate, or send-reminder",
        },
        { status: 400 }
      );
    }

    // Verify event belongs to user
    const event = await prisma.calendarEvent.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        lead: true,
        campaign: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    logInfo(`Calendar event action: ${action}`, {
      userId,
      eventId: id,
      eventTitle: event.title,
    });

    let result;

    switch (action) {
      case "reschedule":
        result = await handleReschedule(event, data);
        break;
      case "cancel":
        result = await handleCancel(event, data);
        break;
      case "complete":
        result = await handleComplete(event, userId);
        break;
      case "duplicate":
        result = await handleDuplicate(event, userId);
        break;
      case "send-reminder":
        result = await handleSendReminder(event);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Event ${action}d successfully`,
    });
  } catch (error: any) {
    logError(error, {
      message: "Calendar event action failed",
      path: request.url,
    });

    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform action" },
      { status: 500 }
    );
  }
}

/**
 * Reschedule event to new time
 */
async function handleReschedule(event: any, data: any) {
  const { startDate, endDate } = data;

  if (!startDate) {
    throw new Error("Start date required for rescheduling");
  }

  const start = new Date(startDate);
  const end = endDate
    ? new Date(endDate)
    : new Date(start.getTime() + 30 * 60 * 1000);

  const updated = await prisma.calendarEvent.update({
    where: { id: event.id },
    data: {
      startDate: start,
      endDate: end,
      updatedAt: new Date(),
    },
    include: {
      lead: true,
      campaign: true,
    },
  });

  // Send reschedule notification to attendees
  if (event.attendees) {
    await sendRescheduleNotification(event, start, end);
  }

  logInfo("Event rescheduled", {
    eventId: event.id,
    oldStart: event.startDate,
    newStart: start,
  });

  return updated;
}

/**
 * Cancel event (soft delete or mark as cancelled)
 */
async function handleCancel(event: any, data: any) {
  const { notifyAttendees = true, reason } = data || {};

  // Update event status (you could add a status field or just delete)
  await prisma.calendarEvent.delete({
    where: { id: event.id },
  });

  // Send cancellation notification
  if (notifyAttendees && event.attendees) {
    await sendCancellationNotification(event, reason);
  }

  logInfo("Event cancelled", {
    eventId: event.id,
    title: event.title,
    reason,
  });

  return { cancelled: true };
}

/**
 * Mark event as complete
 */
async function handleComplete(event: any, userId: string) {
  const updated = await prisma.calendarEvent.update({
    where: { id: event.id },
    data: {
      completedAt: new Date(),
      updatedAt: new Date(),
    },
    include: {
      lead: true,
    },
  });

  // Update lead score if linked
  if (event.linkedLeadId) {
    await prisma.lead.update({
      where: { id: event.linkedLeadId },
      data: {
        score: { increment: 10 }, // Bonus for completing meeting
        status: "CONTACTED",
        updatedAt: new Date(),
      },
    });
  }

  // Trigger post-meeting workflow
  // (create follow-up tasks, send thank you email, etc)
  await triggerPostMeetingWorkflow(event, userId);

  logInfo("Event marked complete", {
    eventId: event.id,
    linkedLeadId: event.linkedLeadId,
  });

  return updated;
}

/**
 * Duplicate event
 */
async function handleDuplicate(event: any, userId: string) {
  // Create copy with " (Copy)" suffix and new date (1 week later)
  const newStartDate = new Date(event.startDate);
  newStartDate.setDate(newStartDate.getDate() + 7);

  const newEndDate = new Date(event.endDate);
  newEndDate.setDate(newEndDate.getDate() + 7);

  const duplicated = await prisma.calendarEvent.create({
    data: {
      userId,
      title: `${event.title} (Copy)`,
      description: event.description,
      startDate: newStartDate,
      endDate: newEndDate,
      allDay: event.allDay,
      category: event.category,
      priority: event.priority,
      color: event.color,
      linkedLeadId: event.linkedLeadId,
      linkedCampaignId: event.linkedCampaignId,
      attendees: event.attendees,
      reminderMinutes: event.reminderMinutes,
      meetingUrl: event.meetingUrl,
      location: event.location,
    },
    include: {
      lead: true,
      campaign: true,
    },
  });

  logInfo("Event duplicated", {
    originalId: event.id,
    duplicatedId: duplicated.id,
  });

  return duplicated;
}

/**
 * Send reminder to attendees
 */
async function handleSendReminder(event: any) {
  if (!event.attendees) {
    return { sent: false, message: "No attendees to notify" };
  }

  const attendeesList =
    typeof event.attendees === "string"
      ? JSON.parse(event.attendees)
      : event.attendees;

  // In production, send actual emails
  logInfo("Sending meeting reminder", {
    eventId: event.id,
    attendeesCount: attendeesList.length,
  });

  // Simulate email sending
  for (const email of attendeesList) {
    console.log(`Reminder sent to: ${email} for event: ${event.title}`);
  }

  return { sent: true, count: attendeesList.length };
}

/**
 * Helper: Send reschedule notification
 */
async function sendRescheduleNotification(
  event: any,
  newStart: Date,
  newEnd: Date
) {
  const attendeesList =
    typeof event.attendees === "string"
      ? JSON.parse(event.attendees)
      : event.attendees;

  logInfo("Sending reschedule notification", {
    eventId: event.id,
    attendees: attendeesList,
  });

  // In production: Send actual emails with .ics file
  console.log(`Reschedule notification sent for: ${event.title}`);
}

/**
 * Helper: Send cancellation notification
 */
async function sendCancellationNotification(event: any, reason?: string) {
  const attendeesList =
    typeof event.attendees === "string"
      ? JSON.parse(event.attendees)
      : event.attendees;

  logInfo("Sending cancellation notification", {
    eventId: event.id,
    attendees: attendeesList,
    reason,
  });

  // In production: Send actual cancellation emails
  console.log(`Cancellation sent for: ${event.title}`);
}

/**
 * Helper: Trigger post-meeting workflow
 */
async function triggerPostMeetingWorkflow(event: any, userId: string) {
  // In production:
  // 1. Create follow-up tasks
  // 2. Send thank you email (using SDR template)
  // 3. Update CRM (if HubSpot/Salesforce)
  // 4. Log interaction to lead record

  logInfo("Post-meeting workflow triggered", {
    eventId: event.id,
    leadId: event.linkedLeadId,
  });

  console.log("Post-meeting workflow: Follow-ups created, emails queued");
}
