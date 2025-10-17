import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/marvin/analyze
 * Marvin analyzes data and provides insights
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { type, data, language = "en" } = await request.json();

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Type and data are required" },
        { status: 400 }
      );
    }

    const languageInstructions = {
      en: "Respond in English",
      es: "Responde en Español",
      pt: "Responda em Português",
      fr: "Répondez en Français",
    };

    let systemPrompt = `You are Marvin, an elite AI SDR analytics expert. Analyze the provided data and give actionable insights. ${
      languageInstructions[language as keyof typeof languageInstructions] ||
      languageInstructions.en
    }.`;

    let userPrompt = "";

    switch (type) {
      case "leads":
        userPrompt = `Analyze these lead metrics and provide 3-5 key insights and recommendations:
        
Total Leads: ${data.totalLeads}
High-Value Leads: ${data.highValueLeads}
Average Score: ${data.avgScore}
Response Rate: ${data.responseRate}%
Sources: ${JSON.stringify(data.sources)}

Focus on: lead quality, conversion opportunities, and next actions.`;
        break;

      case "campaigns":
        userPrompt = `Analyze these campaign metrics and provide optimization suggestions:
        
Total Campaigns: ${data.totalCampaigns}
Active: ${data.activeCampaigns}
Avg Open Rate: ${data.avgOpenRate}%
Avg Click Rate: ${data.avgClickRate}%
Avg Reply Rate: ${data.avgReplyRate}%

Focus on: performance optimization, timing, and content improvements.`;
        break;

      case "segment":
        userPrompt = `Analyze this customer segment and suggest strategies:
        
Segment: ${data.segmentName}
Size: ${data.leadCount} leads
Avg Score: ${data.avgScore}
Conversion Rate: ${data.conversionRate}%
Top Characteristics: ${JSON.stringify(data.characteristics)}

Focus on: targeting strategy, messaging, and conversion tactics.`;
        break;

      case "integration":
        userPrompt = `Analyze this integration's data and provide recommendations:
        
Integration: ${data.integration}
Synced Records: ${data.syncedRecords}
Last Sync: ${data.lastSync}
Data Quality: ${data.dataQuality}

Focus on: data utilization, sync optimization, and ROI.`;
        break;

      default:
        userPrompt = `Analyze this data and provide insights: ${JSON.stringify(
          data
        )}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_tokens: 600,
      temperature: 0.5,
    });

    const insights =
      completion.choices[0]?.message?.content ||
      "Unable to analyze data at this time.";

    return NextResponse.json({
      success: true,
      insights: insights,
      type: type,
    });
  } catch (error) {
    console.error("Error in Marvin analyze:", error);
    return NextResponse.json(
      { success: false, error: "Failed to analyze data" },
      { status: 500 }
    );
  }
}

