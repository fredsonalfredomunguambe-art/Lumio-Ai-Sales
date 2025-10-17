import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's onboarding data to personalize modules
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { onboardingData: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get or create training modules for this user
    let trainingModules = await prisma.trainingModule.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    // If no modules exist, create default ones based on onboarding data
    if (trainingModules.length === 0) {
      const defaultModules = [
        {
          id: "prospecting",
          title: "Intelligent Prospecting",
          description: "Learn to identify and qualify high-quality leads",
          duration: "45 min",
          skills: ["Lead Research", "Qualification", "ICP"],
          status: "locked",
          progress: 0,
          userId: user.id,
        },
        {
          id: "outreach",
          title: "Effective Outreach",
          description: "Master first contact and follow-up techniques",
          duration: "60 min",
          skills: ["Email Writing", "Personalization", "Subject Lines"],
          status: "locked",
          progress: 0,
          userId: user.id,
        },
        {
          id: "objections",
          title: "Objection Handling",
          description: "Convert objections into sales opportunities",
          duration: "75 min",
          skills: ["Active Listening", "Empathy", "Solution Positioning"],
          status: "locked",
          progress: 0,
          userId: user.id,
        },
        {
          id: "closing",
          title: "Closing Techniques",
          description: "Master the art of closing deals effectively",
          duration: "90 min",
          skills: [
            "Closing Questions",
            "Urgency Creation",
            "Value Proposition",
          ],
          status: "locked",
          progress: 0,
          userId: user.id,
        },
      ];

      // Unlock first module
      defaultModules[0].status = "in_progress";

      // Create modules in database
      for (const module of defaultModules) {
        await prisma.trainingModule.create({
          data: module,
        });
      }

      trainingModules = defaultModules;
    }

    // Get training progress for each module
    const modulesWithProgress = await Promise.all(
      trainingModules.map(async (module) => {
        const progress = await prisma.trainingProgress.findFirst({
          where: {
            userId: user.id,
            moduleId: module.id,
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          progress: progress?.progress || 0,
          status: progress?.status || module.status,
          duration: module.duration,
          skills: Array.isArray(module.skills)
            ? module.skills
            : JSON.parse(module.skills as string),
          lastTrained: progress?.updatedAt?.toISOString().split("T")[0],
          accuracy: progress?.accuracy || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      modules: modulesWithProgress,
    });
  } catch (error) {
    console.error("Error loading training modules:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load training modules",
      },
      { status: 500 }
    );
  }
}
