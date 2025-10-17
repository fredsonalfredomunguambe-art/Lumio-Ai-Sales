import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { rateLimit } from "@/lib/rate-limiter";
import { cacheGet, cacheSet } from "@/lib/redis-client";
import { logInfo, logError } from "@/lib/logger";
import {
  detectLanguage,
  getLanguageInstruction,
} from "@/lib/language-detector";
import { addFollowUpJob } from "@/lib/queue";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimit(userId, 60000, 30); // 30 requests per minute
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in 60 seconds." },
        { status: 429 }
      );
    }

    const { message, marvinConfig } = await request.json();

    if (!message || !marvinConfig) {
      return NextResponse.json(
        { error: "Message and configuration required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `marvin:${userId}:${Buffer.from(message).toString(
      "base64"
    )}`;
    const cachedResponse = await cacheGet(cacheKey);

    if (cachedResponse) {
      logInfo("Cache hit for Marvin response", {
        userId,
        messageLength: message.length,
      });
      return NextResponse.json(JSON.parse(cachedResponse));
    }

    // Detect language
    const languageDetection = detectLanguage(message);
    const languageInstruction = marvinConfig.autoDetectLanguage
      ? getLanguageInstruction(languageDetection.iso639_1)
      : getLanguageInstruction(marvinConfig.defaultLanguage);

    // Build dynamic system prompt
    const systemPrompt = buildSystemPrompt(marvinConfig, languageInstruction);

    // Get OpenAI response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I apologize, but I cannot respond at the moment.";

    // Calculate confidence score
    const confidence = calculateConfidence(response, marvinConfig);

    // Check if follow-up is needed
    if (
      marvinConfig.enableFollowUp &&
      confidence < marvinConfig.followUpThreshold
    ) {
      await addFollowUpJob({
        userId,
        customerMessage: message,
        marvinResponse: response,
        confidence,
        language: languageDetection.iso639_1,
        timestamp: new Date().toISOString(),
      });
    }

    // Cache response
    await cacheSet(
      cacheKey,
      JSON.stringify({
        response,
        confidence,
        language: languageDetection.iso639_1,
        cached: false,
      }),
      3600
    ); // Cache for 1 hour

    // Log interaction
    logInfo("Marvin response generated", {
      userId,
      messageLength: message.length,
      responseLength: response.length,
      confidence,
      language: languageDetection.iso639_1,
      followUpTriggered: confidence < marvinConfig.followUpThreshold,
    });

    return NextResponse.json({
      response,
      confidence,
      language: languageDetection.iso639_1,
      cached: false,
    });
  } catch (error) {
    logError("Marvin chat error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(config: any, languageInstruction: string): string {
  return `You are Marvin, an intelligent SDR (Sales Development Representative) assistant for ${
    config.companyName || "our company"
  }.

COMPANY INFORMATION:
- Company: ${config.companyName}
- Industry: ${config.industry}
- Website: ${config.website || "Not provided"}
- Founded: ${config.foundedYear || "Not provided"}
- Employees: ${config.employeeCount || "Not provided"}
- Headquarters: ${config.headquarters || "Not provided"}
- Description: ${config.companyDescription || "Not provided"}
- Value Proposition: ${config.valueProposition || "Not provided"}

CONTACT INFORMATION:
- Support Email: ${config.supportEmail || "Not provided"}
- Support Phone: ${config.supportPhone || "Not provided"}
- Business Hours: ${config.businessHours || "Not provided"}

SERVICES & PRICING:
${
  config.pricing
    ?.map(
      (tier: any) => `
- ${tier.name}: ${tier.price}${tier.currency}${tier.billingPeriod}
  Features: ${tier.features.join(", ")}
  ${tier.trialDays ? `Free Trial: ${tier.trialDays} days` : ""}
`
    )
    .join("") || "No pricing information provided"
}

FAQ:
${
  config.qa
    ?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`)
    .join("\n\n") || "No FAQ provided"
}

INSTRUCTIONS:
- ${languageInstruction}
- Maintain a ${config.tone || "professional"} tone
- Be helpful, informative, and sales-oriented
- If you don't know something, offer to connect them with the sales team
- Always be polite and professional
- Focus on lead generation and qualification
- Ask qualifying questions when appropriate
- Provide clear next steps for interested prospects

CRITICAL KEYWORDS: ${
    config.criticalKeywords?.join(", ") || "urgent, emergency, asap, critical"
  }

If you detect any critical keywords or if you're unsure about an answer, mention that a team member will follow up shortly.`;
}

function calculateConfidence(response: string, config: any): number {
  let confidence = 0.8; // Base confidence

  // Check if response contains pricing info when asked
  if (
    response.toLowerCase().includes("pricing") ||
    response.toLowerCase().includes("price")
  ) {
    if (config.pricing && config.pricing.length > 0) {
      confidence += 0.1;
    } else {
      confidence -= 0.3;
    }
  }

  // Check if response contains company info
  if (config.companyName && response.includes(config.companyName)) {
    confidence += 0.1;
  }

  // Check response length (too short might indicate uncertainty)
  if (response.length < 50) {
    confidence -= 0.2;
  }

  // Check for uncertainty phrases
  const uncertaintyPhrases = ["not sure", "don't know", "unclear", "might be"];
  if (
    uncertaintyPhrases.some((phrase) => response.toLowerCase().includes(phrase))
  ) {
    confidence -= 0.3;
  }

  return Math.max(0, Math.min(1, confidence));
}
