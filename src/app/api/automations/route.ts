import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cacheSet, cacheGet } from "@/lib/redis-client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Check cache first
    const cacheKey = `automations:${user.id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const automations = await db.automation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const result = {
      automations: automations.map((automation) => ({
        id: automation.id,
        name: automation.name,
        description: automation.description,
        trigger: JSON.parse(automation.trigger),
        conditions: JSON.parse(automation.conditions || "[]"),
        actions: JSON.parse(automation.actions),
        status: automation.status,
        priority: automation.priority || 1,
        createdAt: automation.createdAt,
        lastRun: automation.lastRun,
        totalRuns: automation.totalRuns,
        successRate: automation.successRate,
      })),
    };

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json(
      { error: "Failed to fetch automations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const automation = await db.automation.create({
      data: {
        name: body.name,
        description: body.description,
        trigger: JSON.stringify(body.trigger),
        conditions: JSON.stringify(body.conditions || []),
        actions: JSON.stringify(body.actions),
        status: body.status || "active",
        priority: body.priority || 1,
        userId: user.id,
      },
    });

    // Clear cache
    const cacheKey = `automations:${user.id}`;
    await cacheDelete(cacheKey);

    return NextResponse.json({
      success: true,
      automation: {
        id: automation.id,
        name: automation.name,
        description: automation.description,
        trigger: JSON.parse(automation.trigger),
        conditions: JSON.parse(automation.conditions || "[]"),
        actions: JSON.parse(automation.actions),
        status: automation.status,
        priority: automation.priority,
        createdAt: automation.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json(
      { error: "Failed to create automation" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const automation = await db.automation.update({
      where: {
        id: body.id,
        userId: user.id,
      },
      data: {
        name: body.name,
        description: body.description,
        trigger: JSON.stringify(body.trigger),
        conditions: JSON.stringify(body.conditions || []),
        actions: JSON.stringify(body.actions),
        status: body.status,
        priority: body.priority,
      },
    });

    // Clear cache
    const cacheKey = `automations:${user.id}`;
    await cacheDelete(cacheKey);

    return NextResponse.json({
      success: true,
      automation: {
        id: automation.id,
        name: automation.name,
        description: automation.description,
        trigger: JSON.parse(automation.trigger),
        conditions: JSON.parse(automation.conditions || "[]"),
        actions: JSON.parse(automation.actions),
        status: automation.status,
        priority: automation.priority,
        updatedAt: automation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating automation:", error);
    return NextResponse.json(
      { error: "Failed to update automation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Automation ID is required" },
        { status: 400 }
      );
    }

    await db.automation.delete({
      where: {
        id: id,
        userId: user.id,
      },
    });

    // Clear cache
    const cacheKey = `automations:${user.id}`;
    await cacheDelete(cacheKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting automation:", error);
    return NextResponse.json(
      { error: "Failed to delete automation" },
      { status: 500 }
    );
  }
}

