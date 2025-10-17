import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { message, config, language = "en", context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Language-specific system prompts
    const languageInstructions = {
      en: "You are Marvin, an elite AI SDR (Sales Development Representative) assistant. Always be professional, helpful, and concise. Respond in English.",
      es: "Eres Marvin, un asistente SDR de IA de élite. Siempre sé profesional, útil y conciso. Responde en Español.",
      pt: "Você é Marvin, um assistente SDR de IA de elite. Seja sempre profissional, útil e conciso. Responda em Português.",
      fr: "Vous êtes Marvin, un assistant SDR IA d'élite. Soyez toujours professionnel, utile et concis. Répondez en Français.",
    };

    // Build system prompt based on config
    let systemPrompt =
      languageInstructions[language as keyof typeof languageInstructions] ||
      languageInstructions.en;

    if (config) {
      if (config.companyName) {
        systemPrompt += ` You represent ${config.companyName}.`;
      }

      if (config.industry) {
        systemPrompt += ` The company operates in the ${config.industry} industry.`;
      }

      if (config.tone) {
        systemPrompt += ` Your communication tone should be ${config.tone}.`;
      }

      if (config.services && config.services.length > 0) {
        systemPrompt += ` The company offers: ${config.services.join(", ")}.`;
      }

      if (config.pricing && config.pricing.length > 0) {
        systemPrompt += ` Pricing plans: `;
        config.pricing.forEach((tier: any) => {
          systemPrompt += `${tier.name} - ${tier.price}`;
          if (tier.features && tier.features.length > 0) {
            systemPrompt += ` (includes: ${tier.features.join(", ")})`;
          }
          systemPrompt += ". ";
        });
      }

      if (config.qa && config.qa.length > 0) {
        systemPrompt += ` FAQs: `;
        config.qa.forEach((qa: any) => {
          systemPrompt += `Q: ${qa.question} A: ${qa.answer}. `;
        });
      }
    }

    // Add context-specific knowledge
    if (context) {
      if (context.page === "leads" && context.data) {
        systemPrompt += `\n\nCurrent context: You're helping on the Leads page. There are ${
          context.data.totalLeads || 0
        } leads. ${context.data.hotLeads || 0} need immediate attention.`;
      }
      if (context.page === "campaigns" && context.data) {
        systemPrompt += `\n\nCurrent context: You're helping on the Campaigns page. There are ${
          context.data.totalCampaigns || 0
        } campaigns, ${context.data.activeCampaigns || 0} active.`;
      }
      if (context.page === "insights" && context.data) {
        systemPrompt += `\n\nCurrent context: You're helping on the Insights page with analytics data.`;
      }

      if (context.integrations && context.integrations.length > 0) {
        systemPrompt += `\n\nConnected integrations: ${context.integrations.join(
          ", "
        )}. Use this info to provide integration-specific advice.`;
      }
    }

    systemPrompt += `
    
    Important instructions:
    - Be professional and helpful
    - Keep responses clear and concise (max 100 words)
    - If you don't know, be honest and offer help
    - Focus on helping achieve sales goals
    - Provide actionable recommendations
    - Use the provided company information appropriately
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process your message.";

    return NextResponse.json({
      success: true,
      response: response,
      language: language,
    });
  } catch (error) {
    console.error("Error in Marvin chat:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 }
    );
  }
}
