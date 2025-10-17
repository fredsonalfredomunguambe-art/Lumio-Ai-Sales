import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  MarvinSDREngine,
  MarvinProfile,
  LeadData,
  ConversationContext,
} from "@/lib/marvin-sdr-engine";

// POST - Test Marvin's response
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, channel = "chat", leadData } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create Marvin profile
    const mockProfile: MarvinProfile = {
      id: "marvin-001",
      name: "Sarah Johnson",
      role: "Senior Sales Representative",
      company: "Your Company",
      industry: "Technology",
      personality: "Professional, helpful, and results-oriented",
      tone: "Friendly but professional",
      expertise: ["Product knowledge", "Customer service", "Sales"],
      goals: ["Generate qualified leads", "Schedule demos", "Close deals"],
      guidelines: [
        "Always be helpful and accurate",
        "Never mention being an AI",
        "Focus on customer value",
        "Move conversations toward conversion",
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create mock lead data if not provided
    const mockLead: LeadData = leadData || {
      id: "test-lead-001",
      name: "Test Customer",
      email: "test@example.com",
      company: "Test Company",
      jobTitle: "Manager",
      industry: "Technology",
      source: "Website",
      score: 75,
      status: "interested",
      interactions: [],
      customFields: {},
    };

    // Create conversation context
    const context: ConversationContext = {
      lead: mockLead,
      previousInteractions: [],
      currentStage: "interest",
      goals: ["Generate qualified leads", "Schedule demos"],
      painPoints: ["Time constraints", "Budget concerns"],
      budget: "Not specified",
      timeline: "Not specified",
      decisionMakers: ["Test Customer"],
    };

    // Initialize Marvin engine
    const marvinEngine = new MarvinSDREngine(mockProfile);

    // Generate response
    const response = await marvinEngine.generateResponse(
      mockLead,
      message,
      context,
      channel as "email" | "whatsapp" | "chat"
    );

    // Calculate lead score
    const leadScore = await marvinEngine.calculateLeadScore(mockLead);

    return NextResponse.json({
      success: true,
      data: {
        response: response.response,
        sentiment: response.sentiment,
        intent: response.intent,
        urgency: response.urgency,
        nextAction: response.nextAction,
        confidence: response.confidence,
        leadScore,
        channel,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error testing Marvin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

// GET - Get test history
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, this would fetch from database
    const mockTestHistory = [
      {
        id: "test-001",
        message: "Hi, I'm interested in your services",
        response:
          "Hello! I'd be happy to help you learn more about our services. What specific challenges are you looking to solve?",
        sentiment: "positive",
        intent: "information",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        channel: "chat",
      },
      {
        id: "test-002",
        message: "What are your pricing options?",
        response:
          "Great question! Our pricing varies based on your specific needs and company size. I'd love to schedule a quick call to discuss the best options for you. Are you available for a 15-minute conversation this week?",
        sentiment: "positive",
        intent: "pricing",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        channel: "chat",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        tests: mockTestHistory,
        totalTests: mockTestHistory.length,
      },
    });
  } catch (error) {
    console.error("Error fetching test history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch test history" },
      { status: 500 }
    );
  }
}
