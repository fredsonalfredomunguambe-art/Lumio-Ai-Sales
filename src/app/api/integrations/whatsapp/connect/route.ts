import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// POST - Connect WhatsApp Business API
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
      service,
      accessToken,
      phoneNumberId,
      businessAccountId,
      webhookVerifyToken,
    } = await request.json();

    if (!service || !accessToken || !phoneNumberId || !businessAccountId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test the WhatsApp service connection
    let testResult;

    if (service === "whatsapp-business") {
      testResult = await testWhatsAppBusinessConnection(
        accessToken,
        phoneNumberId
      );
    } else if (service === "twilio") {
      testResult = await testTwilioConnection(accessToken, phoneNumberId);
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported WhatsApp service" },
        { status: 400 }
      );
    }

    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: testResult.error },
        { status: 400 }
      );
    }

    // Save connection to database (mock for now)
    const connection = {
      id: `whatsapp-${Date.now()}`,
      userId,
      service,
      phoneNumberId,
      businessAccountId,
      accessToken: accessToken.substring(0, 8) + "...", // Only store partial token for security
      webhookVerifyToken,
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastTest: new Date().toISOString(),
      phoneNumber: testResult.data.phoneNumber,
      displayName: testResult.data.displayName,
    };

    // TODO: Save to database in production
    // await saveWhatsAppConnection(connection);

    return NextResponse.json({
      success: true,
      data: connection,
      message: `${service} WhatsApp service connected successfully`,
    });
  } catch (error) {
    console.error("Error connecting WhatsApp service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect WhatsApp service" },
      { status: 500 }
    );
  }
}

async function testWhatsAppBusinessConnection(
  accessToken: string,
  phoneNumberId: string
) {
  try {
    // Get phone number details
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: `WhatsApp Business API connection failed: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        phoneNumber: data.display_phone_number || phoneNumberId,
        displayName: data.verified_name || "WhatsApp Business",
        status: data.code_verification_status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `WhatsApp Business API test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function testTwilioConnection(
  accessToken: string,
  phoneNumberId: string
) {
  try {
    // Extract account SID from access token (format: ACxxxxx:auth_token)
    const accountSid = accessToken.split(":")[0];

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${Buffer.from(accessToken).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Twilio connection failed: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        phoneNumber: phoneNumberId,
        displayName: "Twilio WhatsApp",
        accountSid: accountSid,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Twilio test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// GET - Get WhatsApp connection status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Fetch from database in production
    const connections = [
      {
        id: "whatsapp-1",
        service: "whatsapp-business",
        phoneNumber: "+1234567890",
        displayName: "Your Business",
        status: "connected",
        connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastTest: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("Error fetching WhatsApp connections:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch WhatsApp connections" },
      { status: 500 }
    );
  }
}
