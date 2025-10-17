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

    // Force manual sync
    await backgroundSyncService.runSync();

    return NextResponse.json({
      success: true,
      message: "Manual sync completed",
    });
  } catch (error) {
    console.error("Error running manual sync:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run manual sync" },
      { status: 500 }
    );
  }
}
