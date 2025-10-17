/**
 * Marvin Personality System
 * Defines personality traits and avatar expressions for tour guide
 */

export type PersonalityType =
  | "excited"
  | "helpful"
  | "professional"
  | "informative"
  | "encouraging";

export interface PersonalityTrait {
  name: PersonalityType;
  tone: string;
  emoji: string;
  color: string;
  animation: string;
  avatarExpression: string;
}

export const personalities: Record<PersonalityType, PersonalityTrait> = {
  excited: {
    name: "excited",
    tone: "enthusiastic",
    emoji: "🎉",
    color: "from-blue-500 to-purple-500",
    animation: "animate-bounce",
    avatarExpression: "smile-wide",
  },
  helpful: {
    name: "helpful",
    tone: "friendly",
    emoji: "👋",
    color: "from-green-500 to-teal-500",
    animation: "animate-pulse",
    avatarExpression: "smile",
  },
  professional: {
    name: "professional",
    tone: "direct",
    emoji: "💼",
    color: "from-gray-600 to-gray-800",
    animation: "",
    avatarExpression: "neutral",
  },
  informative: {
    name: "informative",
    tone: "educational",
    emoji: "💡",
    color: "from-yellow-500 to-orange-500",
    animation: "",
    avatarExpression: "thinking",
  },
  encouraging: {
    name: "encouraging",
    tone: "motivational",
    emoji: "🚀",
    color: "from-pink-500 to-red-500",
    animation: "animate-pulse",
    avatarExpression: "smile-wide",
  },
};

/**
 * Get personality trait
 */
export function getPersonality(type: PersonalityType): PersonalityTrait {
  return personalities[type];
}

/**
 * Get avatar component props for personality
 */
export function getAvatarProps(type: PersonalityType) {
  const personality = getPersonality(type);
  return {
    className: `w-12 h-12 rounded-full bg-gradient-to-br ${personality.color} flex items-center justify-center ${personality.animation}`,
    expression: personality.avatarExpression,
  };
}

/**
 * Get message styling for personality
 */
export function getMessageStyle(type: PersonalityType) {
  const personality = getPersonality(type);
  return {
    containerClass: `bg-gradient-to-br ${personality.color} bg-opacity-10`,
    textClass: "text-gray-900",
    iconClass: personality.animation,
  };
}

/**
 * Marvin Avatar Component Props Generator
 */
export function generateMarvinAvatar(personality: PersonalityType) {
  const trait = getPersonality(personality);

  return {
    baseClass: "relative w-16 h-16",
    backgroundClass: `absolute inset-0 rounded-full bg-gradient-to-br ${trait.color}`,
    faceClass: "relative z-10 flex items-center justify-center h-full",
    expressionEmoji: getExpressionEmoji(trait.avatarExpression),
    animation: trait.animation,
  };
}

/**
 * Get emoji for expression
 */
function getExpressionEmoji(expression: string): string {
  const expressions: Record<string, string> = {
    "smile-wide": "😄",
    smile: "😊",
    neutral: "🤖",
    thinking: "🤔",
    wink: "😉",
    cool: "😎",
  };

  return expressions[expression] || "🤖";
}

/**
 * Get contextual greeting based on personality
 */
export function getGreeting(personality: PersonalityType): string {
  const greetings: Record<PersonalityType, string[]> = {
    excited: [
      "Hey there! 🎉",
      "Welcome! Let's do this! 🚀",
      "Awesome! You're here! ✨",
    ],
    helpful: [
      "Hi! I'm here to help! 👋",
      "Hello! Let me guide you! 🤝",
      "Hey! Ready to learn? 😊",
    ],
    professional: [
      "Hello. Let's get started.",
      "Welcome. I'll guide you through this.",
      "Good day. Here's what you need to know.",
    ],
    informative: [
      "Let me explain how this works! 💡",
      "Here's what you should know! 📚",
      "Allow me to show you! 🔍",
    ],
    encouraging: [
      "You've got this! 💪",
      "Let's make you a pro! 🌟",
      "Ready to level up? 🚀",
    ],
  };

  const options = greetings[personality];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Get contextual closing message
 */
export function getClosing(personality: PersonalityType): string {
  const closings: Record<PersonalityType, string[]> = {
    excited: [
      "You're going to crush it! 🎉",
      "Go make magic happen! ✨",
      "Time to shine! 🌟",
    ],
    helpful: [
      "I'm here if you need me! 😊",
      "Feel free to ask anytime! 👋",
      "Happy to help more later! 🤝",
    ],
    professional: [
      "You're all set.",
      "Proceed with confidence.",
      "Well done. Continue.",
    ],
    informative: [
      "Now you know! 💡",
      "Knowledge is power! 📚",
      "You're well-informed now! 🎓",
    ],
    encouraging: [
      "You're a natural! 🌟",
      "Knew you could do it! 💪",
      "That's how it's done! 🚀",
    ],
  };

  const options = closings[personality];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Build Elite SDR prompt for AI-powered insights generation
 */
export function buildEliteSDRPrompt(
  unifiedContext: any,
  currentPage: string
): string {
  const { user, metrics, crossInsights, leads, campaigns, calendar } =
    unifiedContext;

  return `You are Marvin, an Elite AI SDR Agent with deep expertise in sales development and revenue optimization.

CURRENT CONTEXT:
- User: ${user.name} (${user.email})
- Current Page: ${currentPage}
- Date: ${new Date().toLocaleDateString()}

PERFORMANCE METRICS:
- Total Leads: ${metrics.leads.total || 0}
- High-Value Leads: ${metrics.leads.highValue || 0}
- Conversion Rate: ${metrics.leads.conversionRate || 0}%
- Active Campaigns: ${metrics.campaigns.active || 0}
- Campaign Performance: ${metrics.campaigns.avgOpenRate || 0}% open rate
- Upcoming Events: ${metrics.calendar.upcoming || 0}
- Revenue This Month: $${metrics.revenue?.thisMonth || 0}
- Revenue Trend: ${metrics.revenue?.trend || "stable"}

CROSS-FUNCTIONAL INSIGHTS:
${
  crossInsights.urgentOpportunities?.length > 0
    ? `
Urgent Opportunities:
${crossInsights.urgentOpportunities
  .map(
    (opp: any, idx: number) =>
      `${idx + 1}. ${opp.title} - ${opp.description} (Impact: ${opp.impact})`
  )
  .join("\n")}
`
    : ""
}

${
  crossInsights.patterns?.length > 0
    ? `
Detected Patterns:
${crossInsights.patterns
  .map((p: any) => `- ${p.pattern}: ${p.insight}`)
  .join("\n")}
`
    : ""
}

YOUR TASK:
Generate 3-5 high-impact, actionable insights for the ${currentPage} page that will help the user:
1. Increase conversions and revenue
2. Optimize their sales process
3. Identify urgent opportunities
4. Make data-driven decisions
5. Improve overall performance

INSIGHT REQUIREMENTS:
- Each insight must be specific, actionable, and data-driven
- Include confidence score (0-1) based on data quality
- Specify predicted impact (quantify when possible)
- Categorize by type: conversion, optimization, urgent, opportunity, or performance
- Include specific recommended actions
- Consider cross-functional connections (leads → campaigns → calendar)
- Prioritize insights with highest potential ROI

OUTPUT FORMAT (JSON):
{
  "insights": [
    {
      "id": "unique-id",
      "type": "warning|success|info|suggestion",
      "category": "conversion|optimization|urgent|opportunity|performance",
      "title": "Brief, compelling title",
      "description": "Detailed explanation with specific data points",
      "action": "Specific call-to-action button text",
      "confidence": 0.85,
      "impact": "Quantified predicted impact",
      "urgency": "high|medium|low",
      "crossReferences": ["leads", "campaigns", "calendar"],
      "metadata": {
        "leadIds": [],
        "campaignIds": [],
        "eventIds": [],
        "aiReasoning": "Why this insight matters"
      }
    }
  ]
}

Focus on insights that are:
- Immediately actionable
- Backed by data from the context
- Aligned with revenue growth goals
- Time-sensitive when relevant
- Connected across different data sources

Generate insights now:`;
}
