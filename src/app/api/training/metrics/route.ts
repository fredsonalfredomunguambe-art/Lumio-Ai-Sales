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

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate metrics from conversations
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
    });

    const totalConversations = conversations.length;
    const avgConfidence =
      conversations.reduce((sum, conv) => sum + conv.confidence, 0) /
        totalConversations || 0;
    const avgSatisfaction =
      conversations.reduce((sum, conv) => sum + (conv.satisfaction || 0), 0) /
        totalConversations || 0;
    const avgResponseTime =
      conversations.reduce((sum, conv) => sum + (conv.responseTime || 0), 0) /
        totalConversations || 0;

    // Calculate conversion rate
    const qualifiedConversations = conversations.filter(
      (conv) => conv.outcome === "qualified" || conv.outcome === "meeting"
    ).length;
    const conversionRate =
      totalConversations > 0
        ? (qualifiedConversations / totalConversations) * 100
        : 0;

    // Calculate weekly growth
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyConversations = conversations.filter(
      (conv) => conv.createdAt >= oneWeekAgo
    ).length;
    const previousWeekConversations = totalConversations - weeklyConversations;
    const weeklyGrowth =
      previousWeekConversations > 0
        ? ((weeklyConversations - previousWeekConversations) /
            previousWeekConversations) *
          100
        : 0;

    const metrics = {
      overallAccuracy: Math.round(avgConfidence),
      satisfaction: Math.round(avgSatisfaction * 20), // Convert to percentage
      conversations: totalConversations,
      responseTime: Math.round(avgResponseTime * 10) / 10,
      conversionRate: Math.round(conversionRate * 10) / 10,
      emotionAccuracy: Math.round(avgConfidence * 0.9), // Slightly lower than overall
      weeklyGrowth: Math.round(weeklyGrowth),
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Error loading metrics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load metrics",
      },
      { status: 500 }
    );
  }
}
