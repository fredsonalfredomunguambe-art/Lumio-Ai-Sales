import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/marvin/actions
 * Marvin executes actions (generate email, create campaign template, etc.)
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

    const { action, data, language = "en" } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    const languageMap = {
      en: "English",
      es: "Spanish",
      pt: "Portuguese",
      fr: "French",
    };

    let systemPrompt = `You are Marvin, an elite AI SDR agent. Generate professional, effective sales content in ${
      languageMap[language as keyof typeof languageMap] || "English"
    }.`;
    let userPrompt = "";

    switch (action) {
      case "generate_email":
        userPrompt = `Generate a personalized sales email for this lead:
        
Lead Name: ${data.leadName}
Company: ${data.company}
Job Title: ${data.jobTitle}
Context: ${data.context || "First outreach"}
Goal: ${data.goal || "Schedule a demo"}

Write a compelling email (subject + body) that's professional, personalized, and gets replies. Keep it under 150 words.`;
        break;

      case "create_campaign_template":
        userPrompt = `Create an email campaign template:
        
Campaign Type: ${data.campaignType}
Target Audience: ${data.targetAudience}
Goal: ${data.goal}
Number of Emails: ${data.sequenceLength || 3}

Generate subject lines and email outlines for each step in the sequence.`;
        break;

      case "qualify_lead":
        userPrompt = `Generate qualifying questions for this lead:
        
Lead: ${data.leadName}
Company: ${data.company}
Industry: ${data.industry}
Goal: Determine if they're a good fit

Provide 5 BANT-framework questions (Budget, Authority, Need, Timeline).`;
        break;

      case "handle_objection":
        userPrompt = `Suggest how to handle this objection:
        
Objection: "${data.objection}"
Lead: ${data.leadName}
Context: ${data.context}

Provide a diplomatic, solution-focused response.`;
        break;

      case "follow_up_suggestion":
        userPrompt = `Suggest a follow-up message for this lead:
        
Lead: ${data.leadName}
Last Interaction: ${data.lastInteraction}
Days Since Contact: ${data.daysSince}
Previous Topic: ${data.previousTopic}

Generate a natural, value-adding follow-up message.`;
        break;

      default:
        userPrompt = `Execute action: ${action} with data: ${JSON.stringify(
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
      max_tokens: 800,
      temperature: 0.7,
    });

    const result =
      completion.choices[0]?.message?.content ||
      "Unable to execute action at this time.";

    return NextResponse.json({
      success: true,
      result: result,
      action: action,
    });
  } catch (error) {
    console.error("Error in Marvin actions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute action" },
      { status: 500 }
    );
  }
}

