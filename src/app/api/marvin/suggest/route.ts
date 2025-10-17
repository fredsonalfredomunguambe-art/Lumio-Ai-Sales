import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/marvin/suggest
 * Marvin suggests actions based on context
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

    const { context, data, language = "en" } = await request.json();

    if (!context) {
      return NextResponse.json(
        { success: false, error: "Context is required" },
        { status: 400 }
      );
    }

    const languageInstructions = {
      en: "Respond in English with actionable suggestions",
      es: "Responde en Español con sugerencias accionables",
      pt: "Responda em Português com sugestões acionáveis",
      fr: "Répondez en Français avec des suggestions exploitables",
    };

    const systemPrompt = `You are Marvin, an elite AI SDR agent. Provide specific, actionable suggestions. ${
      languageInstructions[language as keyof typeof languageInstructions] ||
      languageInstructions.en
    }.`;

    let userPrompt = "";

    switch (context) {
      case "lead_actions":
        userPrompt = `Suggest 3 best next actions for this lead:
        
Lead: ${data.name}
Score: ${data.score}
Status: ${data.status}
Last Interaction: ${data.lastInteraction}
Source: ${data.source}

Provide specific actions with expected outcomes.`;
        break;

      case "campaign_optimization":
        userPrompt = `Suggest ways to optimize this campaign:
        
Campaign: ${data.name}
Open Rate: ${data.openRate}%
Click Rate: ${data.clickRate}%
Reply Rate: ${data.replyRate}%
Recipients: ${data.recipients}

Suggest 3-4 specific improvements.`;
        break;

      case "segmentation":
        userPrompt = `Suggest valuable customer segments based on this data:
        
Total Leads: ${data.totalLeads}
Industries: ${JSON.stringify(data.industries)}
Job Titles: ${JSON.stringify(data.jobTitles)}
Sources: ${JSON.stringify(data.sources)}

Suggest 3-5 high-value segments with targeting strategies.`;
        break;

      case "integration_opportunities":
        userPrompt = `Based on these connected integrations, suggest opportunities:
        
Connected: ${data.integrations.join(", ")}
Lead Count: ${data.leadCount}
Conversion Rate: ${data.conversionRate}%

Suggest 3 ways to leverage integrations for better results.`;
        break;

      default:
        userPrompt = `Provide suggestions for: ${JSON.stringify(data)}`;
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
      max_tokens: 500,
      temperature: 0.6,
    });

    const suggestions =
      completion.choices[0]?.message?.content ||
      "Unable to generate suggestions at this time.";

    return NextResponse.json({
      success: true,
      suggestions: suggestions,
      context: context,
    });
  } catch (error) {
    console.error("Error in Marvin suggest:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}

