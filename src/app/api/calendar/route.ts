import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch calendar events
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const category = searchParams.get("category");
    const leadId = searchParams.get("leadId");
    const campaignId = searchParams.get("campaignId");

    // Build where clause
    const where: Record<string, unknown> = { userId };

    if (start && end) {
      where.startDate = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (leadId) {
      where.linkedLeadId = leadId;
    }

    if (campaignId) {
      where.linkedCampaignId = campaignId;
    }

    const events = await prisma.calendarEvent.findMany({
      where,
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
        campaign: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create calendar event
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
    const {
      title,
      description,
      startDate,
      endDate,
      allDay = false,
      category = "MEETING",
      priority = "MEDIUM",
      color,
      linkedLeadId,
      linkedCampaignId,
      attendees,
      reminderMinutes,
      meetingUrl,
      location,
      recurrence,
    } = body;

    // Validation
    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId,
        title,
        description: description || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        allDay,
        category,
        priority,
        color: color || undefined,
        linkedLeadId: linkedLeadId || undefined,
        linkedCampaignId: linkedCampaignId || undefined,
        attendees: attendees ? JSON.stringify(attendees) : undefined,
        reminderMinutes: reminderMinutes || undefined,
        meetingUrl: meetingUrl || undefined,
        location: location || undefined,
        recurrenceRule: recurrence || undefined,
      },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If external calendar sync is enabled, queue sync job
    const calendarSyncs = await prisma.calendarSync.findMany({
      where: { userId, syncEnabled: true },
    });

    if (calendarSyncs.length > 0) {
      // Queue sync jobs (implement later with external calendar integration)
      console.log("Calendar sync queued for event:", event.id);
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: "Event created successfully",
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update calendar event
export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existingEvent || existingEvent.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Process dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.attendees) {
      updateData.attendees = JSON.stringify(updateData.attendees);
    }
    // Handle recurrence field
    if ("recurrence" in updateData) {
      updateData.recurrenceRule = updateData.recurrence;
      delete updateData.recurrence;
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
      include: {
        lead: true,
        campaign: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: "Event updated successfully",
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update event";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete calendar event
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event || event.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete event";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
