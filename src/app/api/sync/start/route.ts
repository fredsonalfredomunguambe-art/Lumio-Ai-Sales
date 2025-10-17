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

    // Start background sync service
    backgroundSyncService.start();

    return NextResponse.json({
      success: true,
      message: "Background sync service started",
    });
  } catch (error) {
    console.error("Error starting background sync:", error);
    return NextResponse.json(
      { success: false, error: "Failed to start background sync" },
      { status: 500 }
    );
  }
}
