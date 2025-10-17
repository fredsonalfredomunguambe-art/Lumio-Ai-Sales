import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET - Find available time slots
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const duration = parseInt(searchParams.get("duration") || "30"); // minutes
    const bufferTime = parseInt(searchParams.get("buffer") || "15"); // minutes between meetings

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: "Start and end dates required" },
        { status: 400 }
      );
    }

    const availableSlots = await findAvailableSlots(
      userId,
      new Date(startDate),
      new Date(endDate),
      duration,
      bufferTime
    );

    return NextResponse.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("Error finding available slots:", error);
    return NextResponse.json(
      { success: false, error: "Failed to find available slots" },
      { status: 500 }
    );
  }
}

async function findAvailableSlots(
  userId: string,
  startDate: Date,
  endDate: Date,
  duration: number,
  bufferTime: number
) {
  // Get all existing events in the date range
  const existingEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startDate: { gte: startDate },
      endDate: { lte: endDate },
    },
    orderBy: { startDate: "asc" },
  });

  const availableSlots: any[] = [];
  const workingHours = {
    start: 9, // 9 AM
    end: 17, // 5 PM
  };

  // Iterate through each day
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Skip weekends
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const daySlots = findDaySLots(
        currentDate,
        existingEvents,
        duration,
        bufferTime,
        workingHours
      );
      availableSlots.push(...daySlots);
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return availableSlots;
}

function findDaySLots(
  date: Date,
  existingEvents: any[],
  duration: number,
  bufferTime: number,
  workingHours: { start: number; end: number }
) {
  const slots: any[] = [];
  const dayStart = new Date(date);
  dayStart.setHours(workingHours.start, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(workingHours.end, 0, 0, 0);

  // Filter events for this specific day
  const dayEvents = existingEvents.filter((event) => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === date.toDateString();
  });

  // Sort events by start time
  dayEvents.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  let currentTime = dayStart;

  // If no events, the whole day is free
  if (dayEvents.length === 0) {
    while (currentTime.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
      slots.push({
        start: new Date(currentTime),
        end: slotEnd,
        duration,
      });
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30-minute intervals
    }
    return slots;
  }

  // Find gaps between events
  for (let i = 0; i < dayEvents.length; i++) {
    const eventStart = new Date(dayEvents[i].startDate);
    const gapEnd = eventStart;

    // Check if there's a gap between current time and next event
    while (
      currentTime.getTime() + duration * 60 * 1000 + bufferTime * 60 * 1000 <=
      gapEnd.getTime()
    ) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
      slots.push({
        start: new Date(currentTime),
        end: slotEnd,
        duration,
      });
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    // Move current time to after this event (with buffer)
    const eventEnd = new Date(dayEvents[i].endDate);
    currentTime = new Date(eventEnd.getTime() + bufferTime * 60 * 1000);
  }

  // Check for slots after the last event
  while (currentTime.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60 * 1000);
    slots.push({
      start: new Date(currentTime),
      end: slotEnd,
      duration,
    });
    currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
  }

  return slots;
}
