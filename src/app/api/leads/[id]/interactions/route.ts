import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;

    // Verify lead belongs to user
    const lead = await db.lead.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const interactions = await db.leadInteraction.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error("Error fetching lead interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = params;
    const body = await req.json();

    // Verify lead belongs to user
    const lead = await db.lead.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { type, channel, subject, content, direction, status, scheduledAt } =
      body;

    const interaction = await db.leadInteraction.create({
      data: {
        leadId: id,
        type,
        channel,
        subject,
        content,
        direction,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        userId: user.id,
      },
    });

    return NextResponse.json(interaction, { status: 201 });
  } catch (error) {
    console.error("Error creating interaction:", error);
    return NextResponse.json(
      { error: "Failed to create interaction" },
      { status: 500 }
    );
  }
}
