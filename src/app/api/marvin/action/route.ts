import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { action, context, insightId, data } = await request.json();

    // Execute action based on context and action type
    const result = await executeAction(userId, action, context, data);

    // Log action for analytics
    await logMarvinAction(userId, action, context, insightId);

    return NextResponse.json({
      success: true,
      message: `Action "${action}" executed successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error executing Marvin action:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to execute action",
      },
      { status: 500 }
    );
  }
}

async function executeAction(
  userId: string,
  action: string,
  context: string,
  data?: any
): Promise<any> {
  switch (action) {
    case "Contact Now":
      return await scheduleContactAction(userId, data);

    case "Schedule Meeting":
      // Return meeting data for calendar modal
      return {
        metadata: data?.metadata || {},
        message: "Ready to schedule meeting",
      };

    case "Create Campaign":
      return { redirect: "/dashboard/campaigns?action=create" };

    case "Optimize Campaign":
      return await optimizeCampaignAction(userId, data);

    case "Schedule Meetings":
      return { redirect: "/dashboard/calendar?action=schedule" };

    case "Review Leads":
      return { redirect: "/dashboard/leads?filter=stale" };

    case "Improve Process":
      return { redirect: "/dashboard/insights?view=conversion" };

    case "Scale Campaign":
      return await scaleCampaignAction(userId, data);

    default:
      return { message: "Action queued for processing" };
  }
}

async function scheduleContactAction(userId: string, data?: any) {
  // Get high-value leads
  const leads = await prisma.lead.findMany({
    where: {
      userId,
      score: { gte: 80 },
      status: { in: ["NEW", "CONTACTED"] },
    },
    orderBy: { score: "desc" },
    take: 5,
  });

  return {
    leads,
    action: "contact_scheduled",
    message: `${leads.length} high-value leads ready for contact`,
  };
}

async function optimizeCampaignAction(userId: string, data?: any) {
  // This would typically integrate with campaign optimization logic
  return {
    optimizations: [
      "Adjust send time to 2:00-3:00 PM",
      "Test question-based subject lines",
      "Segment by engagement level",
    ],
    message: "Campaign optimization recommendations generated",
  };
}

async function scaleCampaignAction(userId: string, data?: any) {
  return {
    recommendations: [
      "Increase budget by 50%",
      "Expand to similar audience segments",
      "Add retargeting sequences",
    ],
    message: "Scaling recommendations prepared",
  };
}

async function logMarvinAction(
  userId: string,
  action: string,
  context: string,
  insightId?: string
) {
  // Log to analytics or database for tracking
  console.log("Marvin Action:", {
    userId,
    action,
    context,
    insightId,
    timestamp: new Date(),
  });
}
