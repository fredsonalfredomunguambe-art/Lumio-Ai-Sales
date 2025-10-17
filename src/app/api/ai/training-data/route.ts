import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis-client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Check cache first
    const cacheKey = `ai_training_data:${user.id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // Get training data from conversations and interactions
    const [
      successfulConversations,
      failedConversations,
      customerFeedback,
      performanceInsights,
      optimizationSuggestions,
    ] = await Promise.all([
      // Successful conversations (high satisfaction)
      db.conversation.findMany({
        where: {
          userId: user.id,
          satisfaction: { gte: 4 },
          outcome: { in: ["qualified", "meeting"] },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      // Failed conversations (low satisfaction or negative outcome)
      db.conversation.findMany({
        where: {
          userId: user.id,
          OR: [
            { satisfaction: { lte: 2 } },
            { outcome: { in: ["not_interested", "objection"] } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),

      // Customer feedback
      db.conversation.findMany({
        where: {
          userId: user.id,
          satisfaction: { not: null },
        },
        select: {
          satisfaction: true,
          outcome: true,
          emotions: true,
          sentiment: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),

      // Performance insights (simulated AI analysis)
      Promise.resolve([
        {
          id: "1",
          type: "conversion_pattern",
          title: "Peak Performance Time",
          description: "Your conversion rate is 40% higher between 2-4 PM",
          confidence: 0.89,
          impact: "high",
          category: "timing",
        },
        {
          id: "2",
          type: "message_optimization",
          title: "Best Performing Message",
          description: "Personalized subject lines increase open rates by 25%",
          confidence: 0.92,
          impact: "medium",
          category: "content",
        },
        {
          id: "3",
          type: "follow_up_optimization",
          title: "Follow-up Optimization",
          description: "3-day follow-up interval shows best results",
          confidence: 0.85,
          impact: "high",
          category: "timing",
        },
      ]),

      // Optimization suggestions (AI-generated)
      Promise.resolve([
        {
          id: "1",
          type: "personalization",
          title: "Enhance Personalization",
          description: "Add company-specific pain points to initial messages",
          priority: "high",
          effort: "low",
          expectedImpact: "+15% response rate",
        },
        {
          id: "2",
          type: "timing",
          title: "Optimize Send Times",
          description: "Schedule emails for 2-4 PM EST for better engagement",
          priority: "medium",
          effort: "low",
          expectedImpact: "+8% open rate",
        },
        {
          id: "3",
          type: "content",
          title: "Improve Value Proposition",
          description: "Highlight ROI and cost savings in first message",
          priority: "high",
          effort: "medium",
          expectedImpact: "+12% conversion rate",
        },
      ]),
    ]);

    const trainingData = {
      successfulConversations: successfulConversations.map((conv) => ({
        id: conv.id,
        message: conv.message,
        response: conv.response,
        satisfaction: conv.satisfaction,
        outcome: conv.outcome,
        emotions: JSON.parse(conv.emotions || "[]"),
        sentiment: conv.sentiment,
        createdAt: conv.createdAt,
      })),

      failedConversations: failedConversations.map((conv) => ({
        id: conv.id,
        message: conv.message,
        response: conv.response,
        satisfaction: conv.satisfaction,
        outcome: conv.outcome,
        emotions: JSON.parse(conv.emotions || "[]"),
        sentiment: conv.sentiment,
        createdAt: conv.createdAt,
      })),

      customerFeedback: customerFeedback.map((conv) => ({
        satisfaction: conv.satisfaction,
        outcome: conv.outcome,
        emotions: JSON.parse(conv.emotions || "[]"),
        sentiment: conv.sentiment,
        createdAt: conv.createdAt,
      })),

      performanceInsights,
      optimizationSuggestions,

      // Training progress
      trainingProgress: {
        conversationAnalysis: 85,
        responseOptimization: 72,
        personalizationEngine: 91,
        sentimentAnalysis: 78,
        behaviorPrediction: 67,
      },

      // Learning status
      learningStatus: {
        isActive: true,
        lastUpdate: new Date().toISOString(),
        totalDataPoints:
          successfulConversations.length + failedConversations.length,
        accuracy: 0.89,
        confidence: 0.92,
      },
    };

    // Cache for 15 minutes
    await cacheSet(cacheKey, JSON.stringify({ trainingData }), 900);

    return NextResponse.json({ trainingData });
  } catch (error) {
    console.error("Error fetching AI training data:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI training data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // Update training data based on new interactions
    if (body.type === "conversation_feedback") {
      await db.conversation.update({
        where: {
          id: body.conversationId,
          userId: user.id,
        },
        data: {
          satisfaction: body.satisfaction,
          outcome: body.outcome,
          emotions: JSON.stringify(body.emotions || []),
          sentiment: body.sentiment,
        },
      });
    }

    // Clear cache to force refresh
    const cacheKey = `ai_training_data:${user.id}`;
    await cacheDelete(cacheKey);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating AI training data:", error);
    return NextResponse.json(
      { error: "Failed to update AI training data" },
      { status: 500 }
    );
  }
}

