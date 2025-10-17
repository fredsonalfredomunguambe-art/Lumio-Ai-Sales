import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backgroundSyncService } from "@/lib/background-sync";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Stop background sync service
    backgroundSyncService.stop();

    return NextResponse.json({
      success: true,
      message: "Background sync service stopped",
    });
  } catch (error) {
    console.error("Error stopping background sync:", error);
    return NextResponse.json(
      { success: false, error: "Failed to stop background sync" },
      { status: 500 }
    );
  }
}
