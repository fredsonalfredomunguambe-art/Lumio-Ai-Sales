import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get WhatsApp messages for a contact
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contact");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!contactId) {
      return NextResponse.json(
        { success: false, error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Get messages from database
    const messages = await getWhatsAppMessages(userId, contactId, limit);

    return NextResponse.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch WhatsApp messages" },
      { status: 500 }
    );
  }
}

// POST - Send WhatsApp message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      contactId,
      message,
      type = "text",
      mediaUrl,
    } = await request.json();

    if (!contactId || !message) {
      return NextResponse.json(
        { success: false, error: "Contact ID and message are required" },
        { status: 400 }
      );
    }

    // Send message via WhatsApp API
    const result = await sendWhatsAppMessage({
      contactId,
      message,
      type,
      mediaUrl,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Save message to database
    const savedMessage = await saveWhatsAppMessage({
      id: result.data.messageId,
      contactId,
      message,
      type,
      mediaUrl,
      status: "sent",
      userId,
    });

    return NextResponse.json({
      success: true,
      data: savedMessage,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}

async function getWhatsAppMessages(
  userId: string,
  contactId: string,
  limit: number
) {
  try {
    // TODO: Replace with actual database query
    // For now, return mock messages

    const mockMessages = [
      {
        id: "msg_1",
        contactId,
        message: "Hello! Thank you for your interest in our services.",
        type: "text",
        status: "read",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        mediaUrl: null,
        direction: "outbound",
        userId,
      },
      {
        id: "msg_2",
        contactId,
        message: "I'd like to learn more about your pricing.",
        type: "text",
        status: "delivered",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        mediaUrl: null,
        direction: "inbound",
        userId,
      },
      {
        id: "msg_3",
        contactId,
        message: "I'll send you our pricing information right away!",
        type: "text",
        status: "sent",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        mediaUrl: null,
        direction: "outbound",
        userId,
      },
    ];

    return mockMessages.slice(0, limit);
  } catch (error) {
    console.error("Error getting WhatsApp messages:", error);
    return [];
  }
}

async function sendWhatsAppMessage({
  contactId,
  message,
  type,
  mediaUrl,
  userId,
}: {
  contactId: string;
  message: string;
  type: string;
  mediaUrl?: string;
  userId: string;
}) {
  try {
    // TODO: Implement actual WhatsApp API call
    // For now, simulate successful sending

    const messageId = `msg_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        messageId,
        status: "sent",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to send WhatsApp message: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function saveWhatsAppMessage(messageData: {
  id: string;
  contactId: string;
  message: string;
  type: string;
  mediaUrl?: string;
  status: string;
  userId: string;
}) {
  try {
    // TODO: Implement actual database insertion
    const savedMessage = {
      ...messageData,
      timestamp: new Date().toISOString(),
      direction: "outbound",
    };

    return savedMessage;
  } catch (error) {
    console.error("Error saving WhatsApp message:", error);
    throw error;
  }
}
