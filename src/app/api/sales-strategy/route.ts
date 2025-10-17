import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const strategy = await db.salesStrategy.findUnique({
      where: { userId: user.id },
    });

    if (!strategy) {
      return NextResponse.json({
        keyMessages: [],
        commonObjections: [],
        callToActions: [],
        followUpSteps: [],
      });
    }

    return NextResponse.json({
      keyMessages: JSON.parse(strategy.keyMessages || "[]"),
      commonObjections: JSON.parse(strategy.commonObjections || "[]"),
      callToActions: JSON.parse(strategy.callToActions || "[]"),
      followUpSteps: JSON.parse(strategy.followUpSteps || "[]"),
    });
  } catch (error) {
    console.error("Error fetching sales strategy:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales strategy" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    await db.salesStrategy.upsert({
      where: { userId: user.id },
      update: {
        keyMessages: JSON.stringify(data.keyMessages || []),
        commonObjections: JSON.stringify(data.commonObjections || []),
        callToActions: JSON.stringify(data.callToActions || []),
        followUpSteps: JSON.stringify(data.followUpSteps || []),
      },
      create: {
        userId: user.id,
        keyMessages: JSON.stringify(data.keyMessages || []),
        commonObjections: JSON.stringify(data.commonObjections || []),
        callToActions: JSON.stringify(data.callToActions || []),
        followUpSteps: JSON.stringify(data.followUpSteps || []),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating sales strategy:", error);
    return NextResponse.json(
      { error: "Failed to update sales strategy" },
      { status: 500 }
    );
  }
}

