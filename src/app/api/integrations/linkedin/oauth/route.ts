import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOAuthUrl } from "@/lib/oauth-integrations";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate OAuth URL for LinkedIn
    const oauthUrl = generateOAuthUrl("linkedin", userId);

    return NextResponse.json({
      success: true,
      data: { oauthUrl },
    });
  } catch (error) {
    console.error("Error generating LinkedIn OAuth URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate OAuth URL" },
      { status: 500 }
    );
  }
}
