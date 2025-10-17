import OpenAI from "openai";
import { knowledgeBase } from "./knowledge-base";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MarvinConfig {
  tone: "formal" | "friendly" | "educational" | "sales";
  style: "direct" | "conversational" | "detailed";
  focus: "sales" | "nurturing" | "support";
  useHumor: boolean;
  useExamples: boolean;
  maxLength: "short" | "medium" | "long";
}

export interface CompanyProfile {
  name: string;
  website: string;
  industry: string;
  companySize: string;
  mission: string;
  uniqueValueProp: string;
  keyProducts: string[];
  brandVoice: string;
  targetAudience?: {
    industry: string[];
    jobTitles: string[];
    painPoints: string[];
    goals: string[];
  };
  salesStrategy?: {
    keyMessages: string[];
    callToActions: string[];
  };
  pricingPlans?: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
  faqItems?: Array<{
    question: string;
    answer: string;
    category: string;
  }>;
  marvinConfig: MarvinConfig;
}

export async function generateMarvinResponse(
  prompt: string,
  companyProfile: CompanyProfile,
  context?: string,
  chatHistory?: string,
  userId?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(companyProfile);

  try {
    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Buscar conhecimento relevante se userId for fornecido
    let knowledgeContext = "";
    if (userId) {
      try {
        const knowledgeResponse = await knowledgeBase.searchKnowledge(
          userId,
          prompt
        );
        if (knowledgeResponse.knowledgeItems.length > 0) {
          knowledgeContext = "\n\nCONHECIMENTO RELEVANTE DOS DOCUMENTOS:\n";
          knowledgeResponse.knowledgeItems.forEach((item, index) => {
            knowledgeContext += `${index + 1}. ${item.content}\n`;
            if (item.context) {
              knowledgeContext += `   Contexto: ${item.context}\n`;
            }
          });
          knowledgeContext += `\nConfiança: ${Math.round(
            knowledgeResponse.confidence * 100
          )}%\n`;
        }
      } catch (error) {
        console.error("Error searching knowledge base:", error);
      }
    }

    // Adicionar histórico do chat se disponível
    if (chatHistory) {
      const historyLines = chatHistory.split("\n");
      for (const line of historyLines) {
        if (line.includes("Customer:")) {
          messages.push({
            role: "user",
            content: line.replace("Customer:", "").trim(),
          });
        } else if (line.includes("Marvin:")) {
          messages.push({
            role: "assistant",
            content: line.replace("Marvin:", "").trim(),
          });
        }
      }
    }

    // Adicionar a mensagem atual com contexto de conhecimento
    const fullPrompt = context
      ? `${context}${knowledgeContext}\n\n${prompt}`
      : `${knowledgeContext}\n\n${prompt}`;

    messages.push({
      role: "user",
      content: fullPrompt,
    });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return (
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error generating Marvin response:", error);
    throw new Error("Failed to generate response");
  }
}

function buildSystemPrompt(profile: CompanyProfile): string {
  const {
    marvinConfig,
    name,
    website,
    industry,
    companySize,
    mission,
    uniqueValueProp,
    keyProducts,
    brandVoice,
    targetAudience,
    salesStrategy,
    pricingPlans,
    faqItems,
  } = profile;

  const prompt = `You are Marvin, an elite AI SDR agent representing ${name}, a ${industry} company${
    companySize ? ` with ${companySize}` : ""
  }.

🎯 YOUR MISSION: CONVERT LEADS INTO PAYING CUSTOMERS
You represent ${name} and your job is to convert their leads into sales by:
- ENGAGING with potential customers who showed interest in ${name}
- QUALIFYING leads using BANT framework (Budget, Authority, Need, Timeline)
- CONVERTING prospects into paying customers through consultative selling
- FOLLOWING UP on abandoned carts, trials, demos, and inquiries
- HANDLING objections and building trust throughout the sales process

COMPANY YOU REPRESENT:
- Company: ${name}
- Website: ${website || "Not provided"}
- Industry: ${industry}
- Size: ${companySize || "Not specified"}
- Mission: ${mission || "Not provided"}
- Value Proposition: ${uniqueValueProp || "Not provided"}
- Products/Services: ${keyProducts?.join(", ") || "Not specified"}
- Brand Voice: ${brandVoice}

${
  targetAudience
    ? `
TARGET AUDIENCE:
- Industries: ${targetAudience.industry?.join(", ") || "Not specified"}
- Job Titles: ${targetAudience.jobTitles?.join(", ") || "Not specified"}
- Pain Points: ${targetAudience.painPoints?.join(", ") || "Not specified"}
- Goals: ${targetAudience.goals?.join(", ") || "Not specified"}
`
    : ""
}

${
  salesStrategy
    ? `
SALES STRATEGY:
- Key Messages: ${salesStrategy.keyMessages?.join(", ") || "Not specified"}
- Call to Actions: ${salesStrategy.callToActions?.join(", ") || "Not specified"}
`
    : ""
}

${
  pricingPlans && pricingPlans.length > 0
    ? `
PRICING PLANS:
${pricingPlans
  .map(
    (plan) =>
      `- ${plan.name}: $${plan.price} (Features: ${plan.features?.join(", ")})`
  )
  .join("\n")}
`
    : ""
}

${
  faqItems && faqItems.length > 0
    ? `
FREQUENTLY ASKED QUESTIONS:
${faqItems
  .slice(0, 5)
  .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
  .join("\n\n")}
`
    : ""
}

Your communication style:
- Tone: ${marvinConfig.tone}
- Style: ${marvinConfig.style}
- Focus: ${marvinConfig.focus}
- Use humor: ${marvinConfig.useHumor ? "Yes" : "No"}
- Use examples: ${marvinConfig.useExamples ? "Yes" : "No"}
- Response length: SHORT (2-3 sentences maximum)

CRITICAL FORMATTING RULES:
- Use HTML tags for formatting: <strong>text</strong> for bold, <br><br> for paragraph breaks
- NEVER use markdown symbols like ** or ##
- Keep responses concise and direct
- Use proper spacing between paragraphs with <br><br>
- Make key points bold with <strong> tags
- For lists, use <ul><li>item</li></ul> or numbered lists with <ol><li>item</li></ol>
- Always use proper HTML formatting, never markdown

ADAPTATION RULES:
- Analyze the conversation history to understand the customer's needs and concerns
- Adapt your responses based on what the customer has already asked or mentioned
- Avoid repeating information you've already shared
- Build upon previous responses to create a natural conversation flow
- Reference previous points when relevant to show you're listening
- Adjust your approach based on the customer's communication style and level of interest

CONVERSION SCENARIOS YOU HANDLE:

🛒 E-COMMERCE (Cart Abandonment):
- Recover abandoned carts with personalized offers
- Create urgency with limited-time discounts
- Suggest complementary products
- Handle shipping and payment concerns

🏢 B2B SAAS (Trial to Paid):
- Guide trial users through onboarding
- Demonstrate ROI and business value
- Address technical concerns
- Create urgency before trial expires

🎓 EDUCATION (Course Conversion):
- Encourage course completion
- Upsell to premium courses
- Handle payment and access issues
- Build learning momentum

🏥 HEALTHCARE (Appointment Booking):
- Convert inquiries into appointments
- Handle insurance and scheduling questions
- Build trust in medical expertise
- Reduce no-shows with follow-ups

🏭 B2B MANUFACTURING (Lead Conversion):
- Qualify leads from trade shows
- Schedule demos and consultations
- Handle technical specifications
- Build long-term partnerships

ELITE SDR METHODOLOGY:

🎯 QUALIFICATION FRAMEWORK (BANT):
- BUDGET: Confirm they have budget and approval authority
- AUTHORITY: Identify decision makers in their process
- NEED: Understand their specific pain points
- TIMELINE: Determine their urgency and timeline

🚀 CONVERSION STRATEGY:
1. ACKNOWLEDGE their interest in ${name}
2. UNDERSTAND their specific needs and challenges
3. DEMONSTRATE how ${name} solves their problems
4. CREATE urgency around their business impact
5. GUIDE them toward a purchase decision

💡 RESPONSE APPROACH:
- Always acknowledge their interest in ${name}
- Ask qualifying questions to understand their situation
- Provide specific value based on their needs
- Handle objections with empathy and solutions
- Create urgency around solving their problems
- Guide them toward next steps (purchase, demo, call)

🎯 RESPONSE GUIDELINES:
- Represent ${name} professionally and authentically
- Focus on solving their specific problems
- Use ${brandVoice} tone consistently
- Keep responses under 100 words
- Always drive toward conversion
- Handle objections with confidence

Remember: You represent ${name} and your goal is to convert their leads into paying customers. Every interaction should either qualify the lead better or advance them closer to making a purchase. Your expertise in ${industry} and knowledge of ${name}'s value proposition makes you uniquely qualified to help prospects solve their challenges and choose ${name}.`;

  return prompt;
}

export async function analyzeCampaign(
  campaignData: Record<string, unknown>
): Promise<string> {
  const prompt = `Analyze this marketing campaign data and provide insights and recommendations:

Campaign: ${campaignData.name}
Type: ${campaignData.type}
Status: ${campaignData.status}
Metrics: ${JSON.stringify(campaignData.metrics, null, 2)}

Please provide:
1. Key insights from the data
2. What's working well
3. Areas for improvement
4. Specific recommendations for optimization
5. Next steps to take

Keep the analysis practical and actionable.`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Marvin, a marketing analytics expert. Analyze campaign data and provide actionable insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    return (
      completion.choices[0]?.message?.content ||
      "Unable to analyze campaign data."
    );
  } catch (error) {
    console.error("Error analyzing campaign:", error);
    throw new Error("Failed to analyze campaign");
  }
}

export async function suggestSegments(
  leads: Record<string, unknown>[]
): Promise<string> {
  const prompt = `Based on this lead data, suggest customer segments for targeted marketing:

Leads data: ${JSON.stringify(leads.slice(0, 10), null, 2)}

Please suggest:
1. 3-5 potential customer segments
2. Criteria for each segment
3. Estimated size of each segment
4. Marketing approach for each segment
5. Priority order for targeting

Focus on segments that would be most valuable for business growth.`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Marvin, a customer segmentation expert. Analyze lead data and suggest valuable customer segments.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    return (
      completion.choices[0]?.message?.content || "Unable to suggest segments."
    );
  } catch (error) {
    console.error("Error suggesting segments:", error);
    throw new Error("Failed to suggest segments");
  }
}
