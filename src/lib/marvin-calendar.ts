/**
 * Marvin Calendar Intelligence
 * World-class AI-powered calendar suggestions and optimization
 */

import OpenAI from "openai";
import { prisma } from "./prisma";
import type {
  CalendarSuggestion,
  SuggestionContext,
  AIAnalysis,
  LeadContext,
  CampaignContext,
  MeetingContext,
} from "@/types/calendar-suggestions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI-powered calendar suggestions for a user
 */
export async function generateCalendarSuggestions(
  userId: string
): Promise<AIAnalysis> {
  try {
    // Gather comprehensive context
    const context = await gatherUserContext(userId);

    // Use ChatGPT to analyze and generate suggestions
    const aiSuggestions = await analyzeWithAI(context);

    return aiSuggestions;
  } catch (error) {
    console.error("Error generating calendar suggestions:", error);
    // Fallback to rule-based suggestions
    return generateFallbackSuggestions(userId);
  }
}

/**
 * Gather comprehensive user context for AI analysis
 */
async function gatherUserContext(userId: string): Promise<SuggestionContext> {
  const [leads, campaigns, meetings] = await Promise.all([
    // Get high-value and qualified leads
    prisma.lead.findMany({
      where: {
        userId,
        status: { in: ["QUALIFIED", "CONTACTED", "NEW"] },
      },
      orderBy: { score: "desc" },
      take: 20,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        company: true,
        email: true,
        score: true,
        status: true,
        updatedAt: true,
        source: true,
        industry: true,
      },
    }),

    // Get active campaigns
    prisma.campaign.findMany({
      where: {
        userId,
        status: { in: ["RUNNING", "LEARNING"] },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        metrics: true,
      },
    }),

    // Get recent and upcoming meetings
    prisma.calendarEvent.findMany({
      where: {
        userId,
        startDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: { startDate: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        startDate: true,
        category: true,
        linkedLeadId: true,
        outcome: true,
        completedAt: true,
      },
    }),
  ]);

  // Transform to context objects
  const leadContexts: LeadContext[] = leads.map((lead) => ({
    id: lead.id,
    name: `${lead.firstName} ${lead.lastName}`,
    company: lead.company || undefined,
    email: lead.email,
    score: lead.score || undefined,
    status: lead.status,
    lastContact: lead.updatedAt,
    engagementLevel: calculateEngagementLevel(lead.score, lead.updatedAt),
    source: lead.source || undefined,
    industry: lead.industry || undefined,
  }));

  const campaignContexts: CampaignContext[] = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    metrics: campaign.metrics as any,
  }));

  const meetingContexts: MeetingContext[] = meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    startDate: meeting.startDate,
    category: meeting.category,
    linkedLeadId: meeting.linkedLeadId || undefined,
    outcome: meeting.outcome || undefined,
    completedAt: meeting.completedAt || undefined,
  }));

  return {
    userId,
    leads: leadContexts,
    campaigns: campaignContexts,
    meetings: meetingContexts,
    userPreferences: {
      workingHours: { start: 9, end: 17 },
      preferredMeetingTimes: [10, 11, 14, 15],
      meetingDuration: {
        default: 30,
        sales: 45,
        demo: 60,
        followUp: 15,
      },
      timezone: "UTC",
    },
  };
}

/**
 * Analyze context with ChatGPT and generate intelligent suggestions
 */
async function analyzeWithAI(context: SuggestionContext): Promise<AIAnalysis> {
  const prompt = buildAnalysisPrompt(context);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: MARVIN_CALENDAR_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    const aiResponse = JSON.parse(response);
    return transformAIResponse(aiResponse, context);
  } catch (error) {
    console.error("Error in AI analysis:", error);
    throw error;
  }
}

/**
 * Build the analysis prompt for ChatGPT
 */
function buildAnalysisPrompt(context: SuggestionContext): string {
  const { leads, campaigns, meetings } = context;

  // Calculate statistics
  const highValueLeads = leads.filter((l) => (l.score || 0) >= 80);
  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED");
  const recentMeetings = meetings.filter(
    (m) => m.startDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  return `Analyze this sales pipeline and generate the top 5 most valuable meeting suggestions:

LEADS (${leads.length} total):
${leads
  .slice(0, 10)
  .map(
    (l) =>
      `- ${l.name} (${l.company || "No company"}) | Score: ${
        l.score || "N/A"
      } | Status: ${l.status} | Source: ${
        l.source || "Unknown"
      } | Last Contact: ${l.lastContact ? formatDate(l.lastContact) : "Never"}`
  )
  .join("\n")}

HIGH-VALUE LEADS: ${highValueLeads.length} leads with score >= 80
QUALIFIED LEADS: ${qualifiedLeads.length} ready for meetings

ACTIVE CAMPAIGNS (${campaigns.length}):
${campaigns
  .map(
    (c) =>
      `- ${c.name} (${c.type}) | Status: ${
        c.status
      } | Metrics: ${JSON.stringify(c.metrics || {})}`
  )
  .join("\n")}

RECENT MEETINGS (Last 7 days): ${recentMeetings.length}
TOTAL MEETINGS (Last 30 days): ${meetings.length}

TASK:
Generate exactly 5 meeting suggestions in JSON format. For each suggestion:
1. Identify the best leads to contact NOW
2. Explain WHY this meeting is important (AI reasoning)
3. Suggest the OPTIMAL timing
4. Predict the IMPACT and success probability
5. Prioritize by urgency and value

OUTPUT FORMAT (JSON):
{
  "suggestions": [
    {
      "leadId": "string",
      "leadName": "string",
      "leadCompany": "string or null",
      "title": "string (meeting title)",
      "description": "string (brief description)",
      "aiReasoning": "string (detailed AI explanation)",
      "suggestedTime": "ISO date string (optimal time)",
      "duration": number (minutes),
      "priority": "critical|high|medium|low",
      "urgencyScore": number (0-100),
      "valueScore": number (0-100),
      "confidenceScore": number (0-1),
      "predictedImpact": "string (expected outcome)",
      "successProbability": number (0-1),
      "category": "string"
    }
  ],
  "overallInsights": "string (general pipeline insights)",
  "recommendations": ["string array of strategic recommendations"],
  "confidence": number (0-1)
}

Focus on:
- High-value leads (score >= 80)
- Qualified leads without recent meetings
- Leads going cold (>30 days without contact)
- Time-sensitive opportunities
- Strategic account development`;
}

/**
 * Transform AI response to our format
 */
function transformAIResponse(
  aiResponse: any,
  context: SuggestionContext
): AIAnalysis {
  const suggestions: CalendarSuggestion[] = aiResponse.suggestions.map(
    (s: any, index: number) => ({
      id: `ai-suggestion-${Date.now()}-${index}`,
      type: "lead_meeting" as const,
      leadId: s.leadId,
      leadName: s.leadName,
      leadCompany: s.leadCompany,
      leadEmail:
        context.leads.find((l) => l.id === s.leadId)?.email || undefined,
      leadScore: context.leads.find((l) => l.id === s.leadId)?.score,
      title: s.title,
      description: s.description,
      aiReasoning: s.aiReasoning,
      suggestedTime: new Date(s.suggestedTime),
      duration: s.duration || 30,
      priority: s.priority,
      urgencyScore: s.urgencyScore,
      valueScore: s.valueScore,
      confidenceScore: s.confidenceScore,
      predictedImpact: s.predictedImpact,
      successProbability: s.successProbability,
      category: s.category || "sales",
      tags: ["ai-generated", "high-priority"],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })
  );

  return {
    suggestions,
    overallInsights: aiResponse.overallInsights,
    recommendations: aiResponse.recommendations || [],
    confidence: aiResponse.confidence,
    generatedAt: new Date(),
  };
}

/**
 * Fallback to rule-based suggestions when AI is unavailable
 */
async function generateFallbackSuggestions(
  userId: string
): Promise<AIAnalysis> {
  const leads = await prisma.lead.findMany({
    where: {
      userId,
      status: { in: ["QUALIFIED", "CONTACTED"] },
      score: { gte: 70 },
    },
    orderBy: { score: "desc" },
    take: 5,
  });

  const suggestions: CalendarSuggestion[] = leads.map((lead, index) => ({
    id: `fallback-${Date.now()}-${index}`,
    type: "lead_meeting",
    leadId: lead.id,
    leadName: `${lead.firstName} ${lead.lastName}`,
    leadCompany: lead.company || undefined,
    leadEmail: lead.email,
    leadScore: lead.score || undefined,
    title: `Meeting with ${lead.firstName} ${lead.lastName}`,
    description: `Schedule a meeting with ${lead.company || "this lead"}`,
    aiReasoning:
      "High-value lead that needs attention. Schedule a meeting to move forward.",
    suggestedTime: calculateOptimalTime(1 + index),
    duration: 30,
    priority: lead.score && lead.score >= 85 ? "high" : "medium",
    urgencyScore: lead.score || 70,
    valueScore: lead.score || 70,
    confidenceScore: 0.7,
    predictedImpact: "High conversion potential",
    successProbability: 0.75,
    category: "sales",
    createdAt: new Date(),
  }));

  return {
    suggestions,
    overallInsights: "Focus on these high-value leads to increase conversions.",
    recommendations: [
      "Schedule meetings with qualified leads",
      "Follow up on pending opportunities",
    ],
    confidence: 0.7,
    generatedAt: new Date(),
  };
}

/**
 * Helper: Calculate engagement level based on score and last contact
 */
function calculateEngagementLevel(
  score: number | null,
  lastContact: Date
): "high" | "medium" | "low" {
  const daysSinceContact = Math.floor(
    (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (score && score >= 80 && daysSinceContact < 7) return "high";
  if (score && score >= 60 && daysSinceContact < 14) return "medium";
  return "low";
}

/**
 * Helper: Calculate optimal meeting time
 */
function calculateOptimalTime(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(14, 0, 0, 0); // 2 PM
  return date;
}

/**
 * Helper: Format date for display
 */
function formatDate(date: Date): string {
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

/**
 * System prompt for Marvin Calendar AI
 */
const MARVIN_CALENDAR_SYSTEM_PROMPT = `You are Marvin, an expert AI sales calendar assistant. Your role is to analyze sales pipelines and generate intelligent meeting suggestions that maximize conversion rates and revenue.

EXPERTISE:
- Sales psychology and timing optimization
- Lead qualification and prioritization
- Meeting scheduling best practices
- Conversion rate optimization
- Pipeline management

ANALYSIS CRITERIA:
1. Lead Value: Prioritize high-score leads (80+)
2. Urgency: Identify time-sensitive opportunities
3. Engagement: Consider recent activity and responsiveness
4. Strategic Fit: Match leads with business goals
5. Timing: Suggest optimal meeting times based on context

RESPONSE QUALITY:
- Be specific and actionable
- Provide clear reasoning for each suggestion
- Use data-driven insights
- Focus on revenue impact
- Consider user's time efficiently

Always respond in valid JSON format as specified.`;

