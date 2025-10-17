import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// POST - Connect LinkedIn Integration
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
      clientId, 
      clientSecret, 
      accessToken, 
      refreshToken,
      expiresIn 
    } = await request.json();

    if (!clientId || !clientSecret || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing required LinkedIn credentials" },
        { status: 400 }
      );
    }

    // Test LinkedIn connection
    const testResult = await testLinkedInConnection(accessToken);

    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: testResult.error },
        { status: 400 }
      );
    }

    // Save connection to database
    const connection = {
      id: `linkedin-${Date.now()}`,
      userId,
      clientId,
      clientSecret: clientSecret.substring(0, 8) + "...", // Partial for security
      accessToken: accessToken.substring(0, 8) + "...", // Partial for security
      refreshToken: refreshToken ? refreshToken.substring(0, 8) + "..." : null,
      expiresIn,
      status: "connected",
      connectedAt: new Date().toISOString(),
      lastTest: new Date().toISOString(),
      profile: testResult.data.profile,
      permissions: testResult.data.permissions,
    };

    // TODO: Save to database in production
    // await saveLinkedInConnection(connection);

    return NextResponse.json({
      success: true,
      data: connection,
      message: "LinkedIn integration connected successfully",
    });
  } catch (error) {
    console.error("Error connecting LinkedIn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect LinkedIn integration" },
      { status: 500 }
    );
  }
}

// GET - Get LinkedIn connection status
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
        id: "linkedin-1",
        status: "connected",
        connectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        lastTest: new Date().toISOString(),
        profile: {
          name: "John Doe",
          headline: "VP of Sales at TechCorp",
          profileUrl: "https://linkedin.com/in/johndoe",
        },
        permissions: ["r_liteprofile", "r_emailaddress", "w_member_social"],
      },
    ];

    return NextResponse.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("Error fetching LinkedIn connections:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch LinkedIn connections" },
      { status: 500 }
    );
  }
}

async function testLinkedInConnection(accessToken: string) {
  try {
    // Test basic profile access
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/me",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      return {
        success: false,
        error: `LinkedIn API error: ${profileResponse.status} - ${
          errorData.message || "Unknown error"
        }`,
      };
    }

    const profileData = await profileResponse.json();

    // Test email access
    const emailResponse = await fetch(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    let email = null;
    if (emailResponse.ok) {
      const emailData = await emailResponse.json();
      email = emailData.elements?.[0]?.["handle~"]?.emailAddress;
    }

    return {
      success: true,
      data: {
        profile: {
          id: profileData.id,
          name: `${profileData.localizedFirstName} ${profileData.localizedLastName}`,
          headline: profileData.localizedHeadline,
          profileUrl: `https://linkedin.com/in/${profileData.vanityName || profileData.id}`,
          email,
        },
        permissions: ["r_liteprofile", "r_emailaddress", "w_member_social"],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `LinkedIn connection test failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
