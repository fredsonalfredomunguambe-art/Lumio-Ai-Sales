// Marvin SDR Engine - AI Sales Development Representative
// World-Class Automation with Client-Configurable Rules

export interface MarvinProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  personality: string;
  tone: string;
  expertise: string[];
  goals: string[];
  guidelines: string[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SDRRule {
  id: string;
  category: string;
  enabled: boolean;
  conditions: {
    field: string;
    operator: string;
    value: any;
  }[];
  strategy: string;
  channels: string[];
  timing: {
    delay?: number;
    maxPerWeek?: number;
  };
  template?: string;
  discountPercent?: number;
}

export interface SDRConfig {
  active: boolean;
  mode: "AUTOPILOT" | "COPILOT" | "HYBRID";
  scoreThreshold: number;
  maxTouchpointsPerWeek: number;
  channels: string[];
  rules: SDRRule[];
}

export interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  industry: string;
  source: string;
  score: number;
  status: string;
  interactions: any[];
  customFields: Record<string, any>;
}

export interface ConversationContext {
  lead: LeadData;
  previousInteractions: any[];
  currentStage: string;
  goals: string[];
  painPoints: string[];
  budget: string;
  timeline: string;
  decisionMakers: string[];
}

export interface MarvinResponse {
  response: string;
  sentiment: "positive" | "neutral" | "negative";
  intent: string;
  urgency: "low" | "medium" | "high";
  nextAction: string;
  confidence: number;
}

export class MarvinSDREngine {
  private profile: MarvinProfile;
  private config: SDRConfig;

  constructor(profile: MarvinProfile, config: SDRConfig) {
    this.profile = profile;
    this.config = config;
  }

  /**
   * Scan leads and identify those ready for SDR outreach
   */
  async scanLeads(userId: string): Promise<LeadData[]> {
    // This would query the database in production
    // For now, returning structure showing what would be scanned

    const query = {
      where: {
        userId,
        score: { gte: this.config.scoreThreshold },
        status: { in: ["NEW", "CONTACTED"] },
      },
      include: {
        interactions: true,
        leadScores: true,
      },
    };

    // Return leads that match any enabled rule conditions
    return []; // Would return actual leads from DB
  }

  /**
   * Check if a lead matches a specific rule
   */
  checkRuleMatch(lead: LeadData, rule: SDRRule): boolean {
    if (!rule.enabled) return false;

    // Check all conditions (AND logic)
    return rule.conditions.every((condition) => {
      const fieldValue = this.getLeadFieldValue(lead, condition.field);

      switch (condition.operator) {
        case ">=":
          return Number(fieldValue) >= Number(condition.value);
        case "<=":
          return Number(fieldValue) <= Number(condition.value);
        case "==":
          return fieldValue === condition.value;
        case "!==":
          return fieldValue !== condition.value;
        case "contains":
          return String(fieldValue)
            .toLowerCase()
            .includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    });
  }

  /**
   * Get field value from lead (handles nested fields and metadata)
   */
  private getLeadFieldValue(lead: LeadData, field: string): any {
    // Direct fields
    if (field in lead) {
      return (lead as any)[field];
    }

    // Custom fields from integrations
    if (lead.customFields && field in lead.customFields) {
      return lead.customFields[field];
    }

    // Computed fields
    switch (field) {
      case "totalSpent":
        return lead.customFields?.syncMetadata?.totalSpent || 0;
      case "ordersCount":
        return lead.customFields?.syncMetadata?.ordersCount || 0;
      case "cartValue":
        return lead.customFields?.abandonedCheckout?.totalPrice || 0;
      case "abandonedHours":
        if (lead.customFields?.abandonedCheckout?.abandonedAt) {
          const hours =
            (Date.now() -
              new Date(
                lead.customFields.abandonedCheckout.abandonedAt
              ).getTime()) /
            (1000 * 60 * 60);
          return Math.floor(hours);
        }
        return 0;
      case "firstOrderValue":
        return lead.customFields?.firstOrderValue || 0;
      case "daysSinceLastPurchase":
        if (lead.customFields?.lastPurchaseDate) {
          const days =
            (Date.now() -
              new Date(lead.customFields.lastPurchaseDate).getTime()) /
            (1000 * 60 * 60 * 24);
          return Math.floor(days);
        }
        return 999;
      case "daysSinceLastContact":
        if (lead.interactions && lead.interactions.length > 0) {
          const lastInteraction = lead.interactions[0].createdAt;
          const days =
            (Date.now() - new Date(lastInteraction).getTime()) /
            (1000 * 60 * 60 * 24);
          return Math.floor(days);
        }
        return 999;
      case "dealStage":
        return lead.customFields?.dealStage || "";
      case "dealValue":
        return lead.customFields?.dealValue || 0;
      default:
        return null;
    }
  }

  /**
   * Create outreach sequence for a lead based on matched rule
   */
  async createOutreachSequence(
    leadId: string,
    rule: SDRRule,
    trainingKnowledge?: any
  ): Promise<{
    sequenceId: string;
    steps: any[];
    estimatedCompletion: Date;
  }> {
    const steps = [];
    const now = new Date();

    // Generate personalized message using training knowledge
    const message = await this.generatePersonalizedMessage(
      leadId,
      rule,
      trainingKnowledge
    );

    // Create steps based on rule configuration
    rule.channels.forEach((channel, index) => {
      steps.push({
        step: index + 1,
        channel,
        delay:
          index === 0
            ? rule.timing.delay || 0
            : (rule.timing.delay || 24) * (index + 1),
        type: this.getMessageType(channel),
        subject: this.generateSubject(rule.category),
        content: message,
        status: "SCHEDULED",
        scheduledFor: new Date(
          now.getTime() +
            ((rule.timing.delay || 0) + index * 24) * 60 * 60 * 1000
        ),
      });
    });

    const estimatedCompletion = new Date(
      now.getTime() +
        (rule.timing.delay || 0) * 60 * 60 * 1000 +
        rule.channels.length * 24 * 60 * 60 * 1000
    );

    return {
      sequenceId: `seq_${leadId}_${Date.now()}`,
      steps,
      estimatedCompletion,
    };
  }

  /**
   * Generate personalized message using AI and training data
   */
  private async generatePersonalizedMessage(
    leadId: string,
    rule: SDRRule,
    trainingKnowledge?: any
  ): Promise<string> {
    // In production, this would call OpenAI API with:
    // - Lead data
    // - Training documents
    // - Rule strategy
    // - Company voice/tone

    const templates: Record<string, string> = {
      vip_welcome: `Hi {{firstName}},

I noticed you've been a valued customer with {{ordersCount}} orders and ${{
        totalSpent,
      }} in purchases. Thank you!

As a VIP member, you get exclusive access to {{vipBenefit}}.

Would you like to learn more about our premium offerings?

Best regards,
${this.profile.name}`,

      abandoned_cart: `Hi {{firstName}},

I noticed you left ${{ cartValue }} worth of items in your cart:

{{#each cartItems}}
- {{name}} (${{ price }})
{{/each}}

Complete your purchase in the next 24 hours and get {{discountPercent}}% off!

[Complete Purchase]

Cheers,
${this.profile.name}`,

      hot_lead_intro: `Hi {{firstName}},

I came across ${`{{company}}`} and was impressed by what you're building in ${`{{industry}}`}.

${
  trainingKnowledge?.elevator_pitch ||
  "We help companies like yours achieve their goals with our platform."
}

I'd love to show you how we can help. Are you available for a quick 15-minute call this week?

Best,
${this.profile.name}`,

      thank_you_upsell: `Hi {{firstName}},

Thank you for your recent purchase! I hope you're enjoying your order.

Based on what you bought, I think you might also like:
{{#each recommendations}}
- {{name}} - Perfect complement to your purchase
{{/each}}

As a thank you, here's 15% off your next order: CODE15

Best regards,
${this.profile.name}`,

      win_back: `Hi {{firstName}},

We haven't seen you in {{daysSinceLastPurchase}} days and we miss you!

Since your last visit, we've added:
${
  trainingKnowledge?.new_products ||
  "- New products you'll love\\n- Improved features\\n- Better pricing"
}

Welcome back with {{discountPercent}}% off: WELCOME{{discountPercent}}

Hope to see you soon!
${this.profile.name}`,

      at_risk_follow_up: `Hi {{firstName}},

I wanted to follow up on the proposal we sent {{daysSinceLastContact}} days ago for ${`{{company}}`}.

${
  trainingKnowledge?.objection_handling ||
  "I understand you may have questions or concerns. I'm here to help address them."
}

Can we schedule a quick call to discuss any questions you might have?

Best regards,
${this.profile.name}`,
    };

    return (
      templates[rule.template || "hot_lead_intro"] || templates.hot_lead_intro
    );
  }

  /**
   * Get message type based on channel
   */
  private getMessageType(channel: string): string {
    const types: Record<string, string> = {
      email: "EMAIL",
      linkedin: "LINKEDIN_MESSAGE",
      whatsapp: "WHATSAPP",
      sms: "SMS",
    };
    return types[channel] || "EMAIL";
  }

  /**
   * Generate subject line based on category
   */
  private generateSubject(category: string): string {
    const subjects: Record<string, string> = {
      "VIP Customers": "Your VIP Benefits Await",
      "Abandoned Cart": "You Left Something Behind",
      "New High-Value Customers": "Thank You for Your Order!",
      "Hot Leads": "Quick Question About {{company}}",
      "Re-engagement": "We Miss You - Special Offer Inside",
      "At-Risk Deals": "Following Up on Our Proposal",
    };
    return subjects[category] || "Reaching Out";
  }

  /**
   * Process responses and update lead status
   */
  async processResponses(leadId: string): Promise<{
    hasResponse: boolean;
    sentiment: string;
    shouldEscalate: boolean;
    nextAction: string;
  }> {
    // Check for email replies, LinkedIn messages, etc.
    // In production, this would integrate with email provider APIs

    return {
      hasResponse: false,
      sentiment: "neutral",
      shouldEscalate: false,
      nextAction: "continue_sequence",
    };
  }

  /**
   * Optimize messages based on performance data
   */
  async optimizeMessages(
    ruleId: string,
    performanceData: {
      sent: number;
      opened: number;
      clicked: number;
      replied: number;
      converted: number;
    }
  ): Promise<{
    openRate: number;
    responseRate: number;
    conversionRate: number;
    recommendations: string[];
  }> {
    const openRate = (performanceData.opened / performanceData.sent) * 100;
    const responseRate = (performanceData.replied / performanceData.sent) * 100;
    const conversionRate =
      (performanceData.converted / performanceData.sent) * 100;

    const recommendations: string[] = [];

    if (openRate < 20) {
      recommendations.push(
        "Try A/B testing subject lines - current open rate is below benchmark"
      );
    }
    if (responseRate < 5) {
      recommendations.push(
        "Consider adding more personalization - response rate can be improved"
      );
    }
    if (conversionRate < 2) {
      recommendations.push(
        "Review call-to-action clarity - conversion rate is low"
      );
    }

    // High performers
    if (openRate > 30 && responseRate > 10) {
      recommendations.push(
        "✨ This sequence is performing excellently! Consider using this template for similar segments."
      );
    }

    return {
      openRate,
      responseRate,
      conversionRate,
      recommendations,
    };
  }

  /**
   * A/B test message variations
   */
  async createABTest(
    ruleId: string,
    variations: {
      subject: string;
      content: string;
    }[]
  ): Promise<{
    testId: string;
    variantIds: string[];
    targetPerVariant: number;
  }> {
    const testId = `abtest_${ruleId}_${Date.now()}`;
    const variantIds = variations.map((_, i) => `${testId}_variant_${i}`);

    return {
      testId,
      variantIds,
      targetPerVariant: Math.floor(100 / variations.length),
    };
  }

  async generateResponse(
    lead: LeadData,
    message: string,
    context: ConversationContext,
    channel: "email" | "whatsapp" | "chat"
  ): Promise<MarvinResponse> {
    // Simplified response generation
    // In a real implementation, this would use OpenAI or similar AI service

    const responses = {
      greeting: [
        `Hello ${lead.name}! I'm ${this.profile.name} from ${this.profile.company}. I'd be happy to help you with any questions about our services.`,
        `Hi ${lead.name}! Thanks for reaching out. I'm here to help you find the right solution for your business needs.`,
        `Good day ${lead.name}! I'm ${this.profile.name}, and I specialize in helping companies like ${lead.company} achieve their goals.`,
      ],
      pricing: [
        `Great question about pricing! Our solutions are tailored to each company's specific needs. I'd love to schedule a quick call to discuss the best options for ${lead.company}. Are you available for a 15-minute conversation this week?`,
        `I'd be happy to discuss our pricing options with you. Since every business is unique, I'd recommend a brief consultation to understand your specific requirements. When would be a good time to connect?`,
        `Our pricing varies based on your company size and specific needs. I'd love to show you how we can help ${lead.company} achieve your goals. Can we schedule a demo this week?`,
      ],
      general: [
        `I'd be happy to help you learn more about our services. What specific challenges is ${lead.company} looking to solve?`,
        `That's a great question! I'd love to understand more about your business needs. What's your biggest priority right now?`,
        `I'm here to help you find the right solution. What would you like to know more about?`,
      ],
    };

    // Simple intent detection
    const lowerMessage = message.toLowerCase();
    let intent = "general";
    let responseText = "";

    if (
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hey")
    ) {
      intent = "greeting";
      responseText =
        responses.greeting[
          Math.floor(Math.random() * responses.greeting.length)
        ];
    } else if (
      lowerMessage.includes("price") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("pricing")
    ) {
      intent = "pricing";
      responseText =
        responses.pricing[Math.floor(Math.random() * responses.pricing.length)];
    } else {
      responseText =
        responses.general[Math.floor(Math.random() * responses.general.length)];
    }

    // Simple sentiment analysis
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "love",
      "like",
      "interested",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "dislike",
      "not interested",
    ];

    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    if (positiveWords.some((word) => lowerMessage.includes(word))) {
      sentiment = "positive";
    } else if (negativeWords.some((word) => lowerMessage.includes(word))) {
      sentiment = "negative";
    }

    return {
      response: responseText,
      sentiment,
      intent,
      urgency: sentiment === "positive" ? "high" : "medium",
      nextAction: intent === "pricing" ? "schedule_call" : "gather_info",
      confidence: 0.85,
    };
  }

  async calculateLeadScore(lead: LeadData): Promise<number> {
    // Simple lead scoring algorithm
    let score = 50; // Base score

    // Company size scoring
    if (lead.company && lead.company.length > 10) score += 10;

    // Job title scoring
    const highValueTitles = ["ceo", "cto", "vp", "director", "manager"];
    if (
      highValueTitles.some((title) =>
        lead.jobTitle.toLowerCase().includes(title)
      )
    ) {
      score += 15;
    }

    // Industry scoring
    const targetIndustries = ["technology", "software", "saas", "fintech"];
    if (
      targetIndustries.some((industry) =>
        lead.industry.toLowerCase().includes(industry)
      )
    ) {
      score += 10;
    }

    // Source scoring
    if (lead.source === "website" || lead.source === "referral") {
      score += 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  async analyzeConversation(conversation: any[]): Promise<any> {
    // Simple conversation analysis
    return {
      totalMessages: conversation.length,
      averageResponseTime: 120, // seconds
      sentimentTrend: "positive",
      keyTopics: ["pricing", "features", "implementation"],
      nextBestAction: "schedule_demo",
    };
  }

  async generateFollowUp(
    lead: LeadData,
    context: ConversationContext
  ): Promise<string> {
    // Generate follow-up message
    const followUps = [
      `Hi ${lead.name}, I wanted to follow up on our conversation about ${context.goals[0]}. I have some additional information that might be helpful for ${lead.company}.`,
      `Hello ${lead.name}, I hope you're doing well! I wanted to share some insights about how we've helped similar companies in ${lead.industry} achieve their goals.`,
      `Hi ${lead.name}, I wanted to check in and see if you had any questions about our discussion. I'm here to help make this process as smooth as possible for ${lead.company}.`,
    ];

    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  /**
   * Execute SDR agent for all eligible leads
   */
  async executeSDRAgent(userId: string): Promise<{
    processed: number;
    sequencesCreated: number;
    errors: number;
  }> {
    if (!this.config.active) {
      return { processed: 0, sequencesCreated: 0, errors: 0 };
    }

    let processed = 0;
    let sequencesCreated = 0;
    let errors = 0;

    try {
      // 1. Scan leads
      const eligibleLeads = await this.scanLeads(userId);

      // 2. For each lead, check which rules match
      for (const lead of eligibleLeads) {
        processed++;

        try {
          const matchedRules = this.config.rules.filter((rule) =>
            this.checkRuleMatch(lead, rule)
          );

          // If multiple rules match, use highest priority
          if (matchedRules.length > 0) {
            const rule = this.selectBestRule(matchedRules, lead);

            // Create outreach sequence
            const sequence = await this.createOutreachSequence(
              lead.id,
              rule,
              null // Training knowledge would be loaded here
            );

            sequencesCreated++;

            // If COPILOT mode, queue for approval
            if (this.config.mode === "COPILOT") {
              await this.queueForApproval(lead.id, sequence, rule);
            } else {
              // AUTOPILOT - execute immediately
              await this.scheduleSequence(lead.id, sequence);
            }
          }
        } catch (error) {
          console.error(`Error processing lead ${lead.id}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error("Error in SDR Agent execution:", error);
      errors++;
    }

    return { processed, sequencesCreated, errors };
  }

  /**
   * Select best rule when multiple match (priority logic)
   */
  private selectBestRule(rules: SDRRule[], lead: LeadData): SDRRule {
    // Priority order (can be configured by client)
    const priorityOrder = [
      "At-Risk Deals",
      "VIP Customers",
      "Abandoned Cart",
      "Hot Leads",
      "New High-Value Customers",
      "Re-engagement",
    ];

    for (const category of priorityOrder) {
      const rule = rules.find((r) => r.category === category);
      if (rule) return rule;
    }

    return rules[0];
  }

  /**
   * Queue sequence for approval (COPILOT mode)
   */
  private async queueForApproval(
    leadId: string,
    sequence: any,
    rule: SDRRule
  ): Promise<void> {
    // In production, save to approval queue
    console.log(`Queued sequence for lead ${leadId} - awaiting approval`);
  }

  /**
   * Schedule sequence execution (AUTOPILOT mode)
   */
  private async scheduleSequence(leadId: string, sequence: any): Promise<void> {
    // In production, schedule with job queue (Bull/BullMQ)
    console.log(`Scheduled sequence for lead ${leadId}`);
  }

  /**
   * Apply client-configured segmentation
   */
  async segmentLead(lead: LeadData): Promise<string[]> {
    const segments: string[] = [];

    for (const rule of this.config.rules) {
      if (this.checkRuleMatch(lead, rule)) {
        segments.push(rule.category);
      }
    }

    return segments;
  }

  /**
   * Generate activity summary for dashboard
   */
  async getActivitySummary(
    userId: string,
    days: number = 7
  ): Promise<{
    totalSequences: number;
    activeSequences: number;
    completedSequences: number;
    responseRate: number;
    conversionRate: number;
    topPerformingRule: string;
  }> {
    // In production, query from database
    return {
      totalSequences: 127,
      activeSequences: 34,
      completedSequences: 93,
      responseRate: 34.2,
      conversionRate: 12.1,
      topPerformingRule: "VIP Customers",
    };
  }
}

// Export default instance
export default MarvinSDREngine;
