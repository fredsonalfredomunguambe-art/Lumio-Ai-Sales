import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { moduleId, onboardingData } = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update module status to in_progress
    await prisma.trainingModule.updateMany({
      where: {
        userId: user.id,
        id: moduleId,
      },
      data: { status: "in_progress" },
    });

    // Create training session
    const trainingSession = await prisma.trainingSession.create({
      data: {
        userId: user.id,
        moduleId,
        status: "in_progress",
        startTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: trainingSession.id,
    });
  } catch (error) {
    console.error("Error starting training:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start training",
      },
      { status: 500 }
    );
  }
}
