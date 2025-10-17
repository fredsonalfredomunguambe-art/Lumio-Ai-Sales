import { NextRequest, NextResponse } from "next/server";

// GET - Verify WhatsApp webhook
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === verifyToken) {
      console.log("WhatsApp webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.log("WhatsApp webhook verification failed");
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST - Handle WhatsApp webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("WhatsApp webhook received:", JSON.stringify(body, null, 2));

    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get("x-hub-signature-256");
    if (signature && !verifyWebhookSignature(body, signature)) {
      console.log("Invalid webhook signature");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Process webhook events
    if (body.object === "whatsapp_business_account") {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === "messages") {
            await processMessageEvents(change.value);
          }
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook processing error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function processMessageEvents(value: any) {
  try {
    const messages = value.messages || [];
    const statuses = value.statuses || [];

    // Process incoming messages
    for (const message of messages) {
      await processIncomingMessage(message);
    }

    // Process message statuses
    for (const status of statuses) {
      await processMessageStatus(status);
    }
  } catch (error) {
    console.error("Error processing message events:", error);
  }
}

async function processIncomingMessage(message: any) {
  try {
    const {
      id,
      from,
      timestamp,
      type,
      text,
      image,
      document,
      audio,
      video,
      location,
      contacts,
    } = message;

    console.log(`Processing incoming message ${id} from ${from}`);

    // Store message in database
    const messageData = {
      id,
      from,
      timestamp: new Date(parseInt(timestamp) * 1000),
      type,
      content: text?.body || image?.caption || document?.caption || "",
      mediaUrl: image?.id || document?.id || audio?.id || video?.id,
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            address: location.address,
          }
        : null,
      contacts: contacts || [],
      status: "received",
      processed: false,
    };

    // TODO: Save to database
    // await saveWhatsAppMessage(messageData);

    // Trigger automated responses based on message content
    await triggerAutomatedResponse(messageData);

    // Update lead status if this is a known contact
    await updateLeadFromMessage(messageData);
  } catch (error) {
    console.error("Error processing incoming message:", error);
  }
}

async function processMessageStatus(status: any) {
  try {
    const { id, status: messageStatus, timestamp, recipient_id } = status;

    console.log(`Message ${id} status: ${messageStatus}`);

    // Update message status in database
    const statusData = {
      messageId: id,
      status: messageStatus,
      timestamp: new Date(parseInt(timestamp) * 1000),
      recipientId: recipient_id,
    };

    // TODO: Update message status in database
    // await updateMessageStatus(statusData);

    // Handle failed messages
    if (messageStatus === "failed") {
      await handleFailedMessage(statusData);
    }
  } catch (error) {
    console.error("Error processing message status:", error);
  }
}

async function triggerAutomatedResponse(messageData: any) {
  try {
    // Simple keyword-based responses
    const content = messageData.content.toLowerCase();

    if (content.includes("hello") || content.includes("hi")) {
      await sendAutomatedResponse(
        messageData.from,
        "Hello! Thank you for reaching out. How can I help you today?"
      );
    } else if (content.includes("price") || content.includes("cost")) {
      await sendAutomatedResponse(
        messageData.from,
        "I'd be happy to discuss pricing with you. Let me connect you with our sales team."
      );
    } else if (content.includes("demo") || content.includes("trial")) {
      await sendAutomatedResponse(
        messageData.from,
        "Great! I can schedule a demo for you. What time works best?"
      );
    }
  } catch (error) {
    console.error("Error triggering automated response:", error);
  }
}

async function sendAutomatedResponse(to: string, message: string) {
  try {
    // TODO: Implement actual WhatsApp message sending
    console.log(`Sending automated response to ${to}: ${message}`);
  } catch (error) {
    console.error("Error sending automated response:", error);
  }
}

async function updateLeadFromMessage(messageData: any) {
  try {
    // TODO: Update lead status based on WhatsApp interaction
    console.log(`Updating lead status for ${messageData.from}`);
  } catch (error) {
    console.error("Error updating lead from message:", error);
  }
}

async function handleFailedMessage(statusData: any) {
  try {
    // TODO: Implement retry logic or alert system for failed messages
    console.log(`Handling failed message: ${statusData.messageId}`);
  } catch (error) {
    console.error("Error handling failed message:", error);
  }
}

function verifyWebhookSignature(body: any, signature: string): boolean {
  try {
    // TODO: Implement webhook signature verification
    // This is important for security in production
    return true; // For now, always return true
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}
