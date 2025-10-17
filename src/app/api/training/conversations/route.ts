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

    // Get recent conversations with emotion analysis
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        lead: true,
      },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      message: conv.message,
      response: conv.response,
      confidence: conv.confidence,
      emotions: Array.isArray(conv.emotions)
        ? conv.emotions
        : JSON.parse((conv.emotions as string) || "[]"),
      sentiment: conv.sentiment || "neutral",
      timestamp: conv.createdAt.toISOString().split("T")[0],
      leadName: conv.lead?.name || "Unknown Lead",
      outcome: conv.outcome || "pending",
    }));

    return NextResponse.json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Error loading conversations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load conversations",
      },
      { status: 500 }
    );
  }
}
