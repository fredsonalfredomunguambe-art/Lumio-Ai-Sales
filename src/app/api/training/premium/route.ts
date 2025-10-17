import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { premiumSDRTraining } from "@/lib/premium-sdr-training";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // For testing purposes, use a fallback userId if not authenticated
    const testUserId = userId || "test-user-123";

    if (!userId) {
      console.warn("No authenticated user, using test user for development");
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "modules":
        const modules = premiumSDRTraining.getAvailableModules(testUserId);
        return NextResponse.json({ modules });

      case "progress":
        const progress = premiumSDRTraining.getTrainingProgress(testUserId);
        return NextResponse.json({ progress });

      case "all-modules":
        const allModules = premiumSDRTraining.getAllModules();
        return NextResponse.json({ modules: allModules });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in premium training API:", error);
    return NextResponse.json(
      { error: "Failed to fetch training data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    // For testing purposes, use a fallback userId if not authenticated
    const testUserId = userId || "test-user-123";

    if (!userId) {
      console.warn("No authenticated user, using test user for development");
    }

    const body = await request.json();
    const { action, moduleId, sessionId, exerciseId, score } = body;

    switch (action) {
      case "start-session":
        if (!moduleId) {
          return NextResponse.json(
            { error: "Module ID required" },
            { status: 400 }
          );
        }
        const session = await premiumSDRTraining.startTrainingSession(
          testUserId,
          moduleId
        );
        return NextResponse.json({ session });

      case "complete-exercise":
        if (!sessionId || !exerciseId || score === undefined) {
          return NextResponse.json(
            { error: "Session ID, exercise ID, and score required" },
            { status: 400 }
          );
        }
        await premiumSDRTraining.completeExercise(sessionId, exerciseId, score);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in premium training API:", error);
    return NextResponse.json(
      { error: "Failed to process training request" },
      { status: 500 }
    );
  }
}
