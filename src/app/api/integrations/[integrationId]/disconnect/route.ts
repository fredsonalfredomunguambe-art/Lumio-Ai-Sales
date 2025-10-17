import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { disconnectPremiumIntegration } from "@/lib/premium-integrations";

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { integrationId } = params;

    // Disconnect the premium integration
    const success = await disconnectPremiumIntegration(userId, integrationId);

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Integration disconnected successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to disconnect integration" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
