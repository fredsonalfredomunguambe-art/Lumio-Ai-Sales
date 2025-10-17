import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

/**
 * POST /api/campaigns/[id]/actions
 * Handle campaign actions: play, pause, duplicate
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["play", "pause", "duplicate"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be: play, pause, or duplicate",
        },
        { status: 400 }
      );
    }

    // Verify campaign belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        sequences: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    logInfo(`Campaign action: ${action}`, {
      userId,
      campaignId: id,
      campaignName: campaign.name,
    });

    let result;

    switch (action) {
      case "play":
        result = await handlePlayAction(campaign);
        break;
      case "pause":
        result = await handlePauseAction(campaign);
        break;
      case "duplicate":
        result = await handleDuplicateAction(campaign, userId);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Campaign ${action}ed successfully`,
    });
  } catch (error: any) {
    logError(error, {
      message: "Campaign action failed",
      path: request.url,
    });

    return NextResponse.json(
      { success: false, error: error.message || "Failed to perform action" },
      { status: 500 }
    );
  }
}

/**
 * Handle play action - Start/Resume campaign
 */
async function handlePlayAction(campaign: any) {
  const now = new Date();

  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: "RUNNING",
      schedule: {
        ...(campaign.schedule as any),
        nextSend: now,
        lastStarted: now.toISOString(),
      },
      updatedAt: now,
    },
    include: {
      sequences: true,
    },
  });

  logInfo("Campaign started", {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: "RUNNING",
  });

  return updated;
}

/**
 * Handle pause action - Pause campaign
 */
async function handlePauseAction(campaign: any) {
  const updated = await prisma.campaign.update({
    where: { id: campaign.id },
    data: {
      status: "PAUSED",
      schedule: {
        ...(campaign.schedule as any),
        lastPaused: new Date().toISOString(),
      },
      updatedAt: new Date(),
    },
    include: {
      sequences: true,
    },
  });

  logInfo("Campaign paused", {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: "PAUSED",
  });

  return updated;
}

/**
 * Handle duplicate action - Create a copy of the campaign
 */
async function handleDuplicateAction(campaign: any, userId: string) {
  // Create new campaign with " (Copy)" suffix
  const newCampaign = await prisma.campaign.create({
    data: {
      userId,
      name: `${campaign.name} (Copy)`,
      type: campaign.type,
      status: "DRAFT",
      mode: campaign.mode,
      targetSegment: campaign.targetSegment,
      schedule: campaign.schedule,
      metrics: {
        recipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        bounced: 0,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        conversionRate: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Duplicate sequences
  if (campaign.sequences && campaign.sequences.length > 0) {
    const sequencesData = campaign.sequences.map((seq: any) => ({
      campaignId: newCampaign.id,
      step: seq.step,
      delay: seq.delay,
      type: seq.type,
      channel: seq.channel,
      subject: seq.subject,
      content: seq.content,
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await prisma.campaignSequence.createMany({
      data: sequencesData,
    });
  }

  // Fetch complete duplicated campaign
  const duplicated = await prisma.campaign.findUnique({
    where: { id: newCampaign.id },
    include: {
      sequences: true,
    },
  });

  logInfo("Campaign duplicated", {
    originalId: campaign.id,
    originalName: campaign.name,
    duplicatedId: newCampaign.id,
    duplicatedName: newCampaign.name,
  });

  return duplicated;
}
