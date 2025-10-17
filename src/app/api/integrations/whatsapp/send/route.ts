import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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
      to,
      message,
      type = "text",
      mediaUrl,
      templateName,
      templateParams,
      accessToken,
      phoneNumberId,
    } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, message" },
        { status: 400 }
      );
    }

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "WhatsApp credentials required" },
        { status: 400 }
      );
    }

    // Send WhatsApp message
    const result = await sendWhatsAppMessage({
      accessToken,
      phoneNumberId,
      to,
      message,
      type,
      mediaUrl,
      templateName,
      templateParams,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: result.data.messageId,
        status: "sent",
        timestamp: new Date().toISOString(),
        recipient: to,
      },
      message: "WhatsApp message sent successfully",
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send WhatsApp message" },
      { status: 500 }
    );
  }
}

async function sendWhatsAppMessage({
  accessToken,
  phoneNumberId,
  to,
  message,
  type,
  mediaUrl,
  templateName,
  templateParams,
}: {
  accessToken: string;
  phoneNumberId: string;
  to: string;
  message: string;
  type: string;
  mediaUrl?: string;
  templateName?: string;
  templateParams?: any[];
}) {
  try {
    let messageData: any = {
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""), // Remove non-digits
    };

    if (type === "text") {
      messageData.text = { body: message };
    } else if (type === "image" && mediaUrl) {
      messageData.image = {
        link: mediaUrl,
        caption: message,
      };
    } else if (type === "document" && mediaUrl) {
      messageData.document = {
        link: mediaUrl,
        caption: message,
      };
    } else if (type === "template" && templateName) {
      messageData.template = {
        name: templateName,
        language: { code: "en_US" },
        components: templateParams ? [
          {
            type: "body",
            parameters: templateParams.map(param => ({
              type: "text",
              text: param,
            })),
          },
        ] : [],
      };
    } else {
      // Default to text
      messageData.text = { body: message };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: `WhatsApp API error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        messageId: data.messages?.[0]?.id || `msg_${Date.now()}`,
        status: "sent",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `WhatsApp send failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
