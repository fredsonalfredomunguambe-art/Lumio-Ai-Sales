import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

/**
 * POST /api/integrations/mailchimp/webhook
 * Handle Mailchimp webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();

    const type = formData.get("type");
    const data = formData.get("data");

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Missing type or data" },
        { status: 400 }
      );
    }

    const webhookData = JSON.parse(data as string);

    logInfo("Mailchimp webhook received", {
      type,
      email: webhookData.email,
      listId: webhookData.list_id,
    });

    // Find user by list ID
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        integrationId: "mailchimp",
        status: "connected",
        settings: {
          contains: webhookData.list_id,
        },
      },
    });

    if (!connection) {
      logError(new Error("No user found for list"), {
        listId: webhookData.list_id,
      });
      return NextResponse.json({ success: true }); // Return 200 to avoid retry
    }

    // Handle different webhook types
    switch (type) {
      case "subscribe":
        await handleSubscribe(connection.userId, webhookData);
        break;

      case "unsubscribe":
        await handleUnsubscribe(connection.userId, webhookData);
        break;

      case "profile":
        await handleProfileUpdate(connection.userId, webhookData);
        break;

      case "cleaned":
        await handleCleaned(connection.userId, webhookData);
        break;

      case "campaign":
        await handleCampaignEvent(connection.userId, webhookData);
        break;

      default:
        logInfo("Unhandled Mailchimp webhook type", { type });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error, {
      message: "Mailchimp webhook processing failed",
      path: request.url,
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle subscribe event
 */
async function handleSubscribe(userId: string, data: any): Promise<void> {
  try {
    const email = data.email;
    const merges = data.merges || {};

    await prisma.lead.upsert({
      where: {
        userId_email: {
          userId,
          email,
        },
      },
      update: {
        firstName: merges.FNAME || "Mailchimp",
        lastName: merges.LNAME || "Subscriber",
        source: "mailchimp",
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          listId: data.list_id,
          subscribedAt: data.fired_at,
          ipSignup: data.ip_signup,
        }),
      },
      create: {
        userId,
        email,
        firstName: merges.FNAME || "Mailchimp",
        lastName: merges.LNAME || "Subscriber",
        source: "mailchimp",
        status: "NEW",
        score: 40,
        lastSyncedAt: new Date(),
        syncMetadata: JSON.stringify({
          listId: data.list_id,
          subscribedAt: data.fired_at,
        }),
      },
    });

    logInfo("Mailchimp subscribe processed", {
      userId,
      email,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process subscribe webhook",
      userId,
      email: data.email,
    });
  }
}

/**
 * Handle unsubscribe event
 */
async function handleUnsubscribe(userId: string, data: any): Promise<void> {
  try {
    await prisma.lead.updateMany({
      where: {
        userId,
        email: data.email,
        source: "mailchimp",
      },
      data: {
        status: "UNQUALIFIED",
        syncMetadata: JSON.stringify({
          unsubscribedAt: data.fired_at,
          reason: data.reason,
        }),
        lastSyncedAt: new Date(),
      },
    });

    logInfo("Mailchimp unsubscribe processed", {
      userId,
      email: data.email,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process unsubscribe webhook",
      userId,
      email: data.email,
    });
  }
}

/**
 * Handle profile update event
 */
async function handleProfileUpdate(userId: string, data: any): Promise<void> {
  try {
    const merges = data.merges || {};

    await prisma.lead.updateMany({
      where: {
        userId,
        email: data.email,
      },
      data: {
        firstName: merges.FNAME,
        lastName: merges.LNAME,
        lastSyncedAt: new Date(),
      },
    });

    logInfo("Mailchimp profile update processed", {
      userId,
      email: data.email,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process profile update webhook",
      userId,
      email: data.email,
    });
  }
}

/**
 * Handle cleaned (bounced) event
 */
async function handleCleaned(userId: string, data: any): Promise<void> {
  try {
    await prisma.lead.updateMany({
      where: {
        userId,
        email: data.email,
      },
      data: {
        status: "UNQUALIFIED",
        notes: "Email bounced or invalid",
        syncMetadata: JSON.stringify({
          cleanedAt: data.fired_at,
          reason: data.reason,
        }),
        lastSyncedAt: new Date(),
      },
    });

    logInfo("Mailchimp cleaned processed", {
      userId,
      email: data.email,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process cleaned webhook",
      userId,
      email: data.email,
    });
  }
}

/**
 * Handle campaign event
 */
async function handleCampaignEvent(userId: string, data: any): Promise<void> {
  try {
    // Store campaign event in analytics
    await prisma.analytics.create({
      data: {
        userId,
        type: "CAMPAIGN_PERFORMANCE",
        period: "daily",
        data: JSON.stringify({
          source: "mailchimp",
          campaignId: data.campaign_id,
          action: data.action,
          subject: data.subject,
          firedAt: data.fired_at,
        }),
      },
    });

    logInfo("Mailchimp campaign event processed", {
      userId,
      campaignId: data.campaign_id,
      action: data.action,
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to process campaign webhook",
      userId,
      campaignId: data.campaign_id,
    });
  }
}
