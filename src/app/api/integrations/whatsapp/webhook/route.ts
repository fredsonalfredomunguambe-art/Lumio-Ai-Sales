import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { PrismaClient } from "@/generated/prisma";
import crypto from "crypto";

const prisma = new PrismaClient();

/**
 * Verify WhatsApp webhook signature
 */
function verifyWhatsAppWebhook(
  signature: string,
  body: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}

/**
 * GET /api/integrations/whatsapp/webhook
 * Verify webhook endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "lumio_whatsapp_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    logInfo("WhatsApp webhook verified", { challenge });
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { success: false, error: "Invalid verify token" },
    { status: 403 }
  );
}

/**
 * POST /api/integrations/whatsapp/webhook
 * Handle WhatsApp webhooks
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const signature = request.headers.get("x-hub-signature-256");
    const body = await request.text();

    // Verify webhook signature if secret is configured
    const secret = process.env.WHATSAPP_APP_SECRET;
    if (
      secret &&
      signature &&
      !verifyWhatsAppWebhook(signature, body, secret)
    ) {
      logError(new Error("Invalid WhatsApp webhook signature"), {});
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    logInfo("WhatsApp webhook received", {
      object: payload.object,
    });

    // Process webhook entries
    if (payload.object === "whatsapp_business_account") {
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            await handleMessagesWebhook(change.value);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error, {
      message: "WhatsApp webhook processing failed",
      path: request.url,
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle incoming messages
 */
async function handleMessagesWebhook(value: any): Promise<void> {
  try {
    const phoneNumberId = value.metadata?.phone_number_id;

    if (!phoneNumberId) {
      logError(new Error("No phone number ID in webhook"), {});
      return;
    }

    // Find user by phone number ID
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        integrationId: "whatsapp",
        status: "connected",
        credentials: {
          contains: phoneNumberId,
        },
      },
    });

    if (!connection) {
      logError(new Error("No user found for phone number"), { phoneNumberId });
      return;
    }

    const userId = connection.userId;

    // Process messages
    for (const message of value.messages || []) {
      const from = message.from;
      const messageId = message.id;
      const messageType = message.type;
      const timestamp = message.timestamp;

      // Create or update lead for contact
      let lead = await prisma.lead.findFirst({
        where: {
          userId,
          phone: from,
        },
      });

      if (!lead && value.contacts && value.contacts.length > 0) {
        const contact = value.contacts.find((c: any) => c.wa_id === from);

        lead = await prisma.lead.create({
          data: {
            userId,
            email: `${from}@whatsapp.placeholder.com`, // Placeholder email
            firstName: contact?.profile?.name || "WhatsApp",
            lastName: "Contact",
            phone: from,
            source: "whatsapp",
            externalId: from,
            status: "NEW",
            score: 50,
            lastSyncedAt: new Date(),
          },
        });
      }

      if (lead) {
        // Create interaction
        let content = "";

        if (messageType === "text") {
          content = message.text?.body || "";
        } else if (messageType === "image") {
          content = `[Image] ${message.image?.caption || ""}`;
        } else if (messageType === "document") {
          content = `[Document] ${message.document?.filename || ""}`;
        } else if (messageType === "audio") {
          content = "[Audio Message]";
        } else if (messageType === "video") {
          content = "[Video Message]";
        }

        await prisma.leadInteraction.create({
          data: {
            leadId: lead.id,
            type: "MESSAGE_RECEIVED",
            channel: "WHATSAPP",
            subject: `WhatsApp Message`,
            content,
            metadata: JSON.stringify({
              messageId,
              messageType,
              timestamp,
              from,
            }),
            date: new Date(parseInt(timestamp) * 1000),
          },
        });

        logInfo("WhatsApp message webhook processed", {
          userId,
          leadId: lead.id,
          messageId,
          messageType,
        });
      }
    }

    // Process message status updates
    for (const status of value.statuses || []) {
      // Update delivery status in interactions
      await prisma.leadInteraction.updateMany({
        where: {
          metadata: {
            contains: status.id,
          },
        },
        data: {
          metadata: JSON.stringify({
            status: status.status,
            timestamp: status.timestamp,
          }),
        },
      });
    }
  } catch (error: any) {
    logError(error, {
      message: "Failed to process messages webhook",
    });
    throw error;
  }
}
