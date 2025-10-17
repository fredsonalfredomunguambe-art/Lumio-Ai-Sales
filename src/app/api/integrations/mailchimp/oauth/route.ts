import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOAuthUrl } from "@/lib/oauth-integrations";
import { logInfo, logError } from "@/lib/logger";

/**
 * GET /api/integrations/mailchimp/oauth
 * Generate Mailchimp OAuth URL
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const oauthUrl = await generateOAuthUrl("mailchimp", userId);

    logInfo("Mailchimp OAuth URL generated", {
      userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        oauthUrl,
      },
    });
  } catch (error: any) {
    logError(error, {
      message: "Failed to generate Mailchimp OAuth URL",
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
