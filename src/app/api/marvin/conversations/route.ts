import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET - Get conversation examples and history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const channel = searchParams.get("channel") || "all";

    // Fetch real conversations from database
    const conversationsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/database/marvin-conversations?userId=${userId}&limit=${limit}&channel=${channel}`
    );
    const conversationsData = await conversationsResponse.json();

    if (!conversationsData.success) {
      // Return empty array if no conversations exist
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        stats: {
          totalConversations: 0,
          positiveOutcomes: 0,
          averageConfidence: 0,
          channelDistribution: {
            chat: 0,
            email: 0,
            whatsapp: 0,
          },
        },
      });
    }

    const conversations = conversationsData.data;

    // Calculate stats from real data
    const totalConversations = conversations.length;
    const positiveOutcomes = conversations.filter(
      (c) => c.outcome === "positive"
    ).length;
    const averageConfidence =
      totalConversations > 0
        ? conversations.reduce((sum, c) => sum + c.confidence, 0) /
          totalConversations
        : 0;
    const channelDistribution = {
      chat: conversations.filter((c) => c.channel === "chat").length,
      email: conversations.filter((c) => c.channel === "email").length,
      whatsapp: conversations.filter((c) => c.channel === "whatsapp").length,
    };

    return NextResponse.json({
      success: true,
      data: conversations,
      total: totalConversations,
      stats: {
        totalConversations,
        positiveOutcomes,
        averageConfidence,
        channelDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST - Add new conversation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      customerMessage,
      marvinResponse,
      channel,
      outcome,
      sentiment,
      intent,
    } = await request.json();

    if (!customerMessage || !marvinResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer message and Marvin response are required",
        },
        { status: 400 }
      );
    }

    // Save to database
    const newConversation = {
      id: `conv-${Date.now()}`,
      userId,
      customerMessage,
      marvinResponse,
      outcome: outcome || "neutral",
      channel: channel || "chat",
      timestamp: new Date().toISOString(),
      sentiment: sentiment || "neutral",
      intent: intent || "information",
      confidence: 0.85,
    };

    const saveResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/database/marvin-conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConversation),
      }
    );

    const saveData = await saveResponse.json();
    if (!saveData.success) {
      return NextResponse.json(
        { success: false, error: "Failed to save conversation to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newConversation,
      message: "Conversation saved successfully",
    });
  } catch (error) {
    console.error("Error saving conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save conversation" },
      { status: 500 }
    );
  }
}
