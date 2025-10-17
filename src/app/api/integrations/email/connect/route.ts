import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// POST - Connect Email Service (SendGrid)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { service, apiKey, fromEmail, fromName } = await request.json();

    if (!service || !apiKey || !fromEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test the email service connection
    let testResult;

    if (service === "sendgrid") {
      testResult = await testSendGridConnection(apiKey, fromEmail, fromName);
    } else if (service === "mailchimp") {
      testResult = await testMailchimpConnection(apiKey);
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported email service" },
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
      id: `email-${Date.now()}`,
      userId,
      service,
      apiKey: apiKey.substring(0, 8) + "...", // Only store partial key for security
      fromEmail,
      fromName,
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastTest: new Date().toISOString(),
    };

    // TODO: Save to database in production
    // await saveEmailConnection(connection);

    return NextResponse.json({
      success: true,
      data: connection,
      message: `${service} email service connected successfully`,
    });
  } catch (error) {
    console.error("Error connecting email service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect email service" },
      { status: 500 }
    );
  }
}

async function testSendGridConnection(
  apiKey: string,
  fromEmail: string,
  fromName?: string
) {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/user/account", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return {
        success: false,
        error: `SendGrid connection failed: ${response.status} - ${errorData}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        username: data.username,
        email: data.email,
        fromEmail,
        fromName,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `SendGrid test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

async function testMailchimpConnection(apiKey: string) {
  try {
    // Extract server prefix from API key
    const serverPrefix = apiKey.split("-")[1];
    if (!serverPrefix) {
      return {
        success: false,
        error: "Invalid Mailchimp API key format",
      };
    }

    const response = await fetch(
      `https://${serverPrefix}.api.mailchimp.com/3.0/ping`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `Mailchimp connection failed: ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        health_status: data.health_status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Mailchimp test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// GET - Get email connection status
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
        id: "email-1",
        service: "sendgrid",
        fromEmail: "noreply@yourcompany.com",
        fromName: "Your Company",
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
    console.error("Error fetching email connections:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch email connections" },
      { status: 500 }
    );
  }
}
