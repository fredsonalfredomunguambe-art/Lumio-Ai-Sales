import { db } from "./db";
import { cacheGet, cacheSet } from "./redis-client";
import { logInfo, logError } from "./logger";

export interface OptimizationInsight {
  id: string;
  type: "conversion" | "engagement" | "timing" | "content" | "personalization";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  data: Record<string, any>;
  recommendations: string[];
  expectedImprovement: string;
}

export interface PerformanceAnalysis {
  period: string;
  metrics: {
    conversionRate: number;
    responseTime: number;
    engagementRate: number;
    satisfactionScore: number;
    revenueGenerated: number;
  };
  trends: {
    conversionRate: number;
    responseTime: number;
    engagementRate: number;
    satisfactionScore: number;
  };
  insights: OptimizationInsight[];
}

export interface AITrainingProgress {
  module: string;
  progress: number;
  accuracy: number;
  lastUpdate: Date;
  status: "learning" | "optimizing" | "stable";
  improvements: string[];
}

export class AIOptimizationEngine {
  private static instance: AIOptimizationEngine;

  static getInstance(): AIOptimizationEngine {
    if (!AIOptimizationEngine.instance) {
      AIOptimizationEngine.instance = new AIOptimizationEngine();
    }
    return AIOptimizationEngine.instance;
  }

  async analyzePerformance(
    userId: string,
    period: string = "30d"
  ): Promise<PerformanceAnalysis> {
    try {
      const cacheKey = `performance_analysis:${userId}:${period}`;
      const cached = await cacheGet(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const analysis = await this.generatePerformanceAnalysis(userId, period);

      // Cache for 1 hour
      await cacheSet(cacheKey, JSON.stringify(analysis), 3600);

      return analysis;
    } catch (error) {
      logError("Error analyzing performance", error);
      throw error;
    }
  }

  private async generatePerformanceAnalysis(
    userId: string,
    period: string
  ): Promise<PerformanceAnalysis> {
    // Get data for the specified period
    const endDate = new Date();
    const startDate = this.getStartDate(period, endDate);

    const [leads, interactions, conversations, automations] = await Promise.all(
      [
        db.lead.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        db.leadInteraction.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        db.conversation.findMany({
          where: {
            userId,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        db.automation.findMany({
          where: {
            userId,
            status: "active",
          },
        }),
      ]
    );

    // Calculate metrics
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(
      (lead) => lead.status === "CONVERTED"
    ).length;
    const conversionRate =
      totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const avgResponseTime = this.calculateAverageResponseTime(interactions);
    const engagementRate = this.calculateEngagementRate(interactions);
    const satisfactionScore = this.calculateSatisfactionScore(conversations);
    const revenueGenerated = this.calculateRevenue(leads);

    // Generate insights
    const insights = await this.generateInsights(userId, {
      leads,
      interactions,
      conversations,
      automations,
    });

    // Calculate trends (simplified - in real implementation, compare with previous period)
    const trends = {
      conversionRate: 12.5, // +12.5%
      responseTime: -2.3, // -2.3s
      engagementRate: 8.7, // +8.7%
      satisfactionScore: 0.3, // +0.3
    };

    return {
      period,
      metrics: {
        conversionRate,
        responseTime: avgResponseTime,
        engagementRate,
        satisfactionScore,
        revenueGenerated,
      },
      trends,
      insights,
    };
  }

  private getStartDate(period: string, endDate: Date): Date {
    const startDate = new Date(endDate);

    switch (period) {
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    return startDate;
  }

  private calculateAverageResponseTime(interactions: any[]): number {
    if (interactions.length === 0) return 0;

    const responseTimes = interactions
      .filter((interaction) => interaction.responseTime)
      .map((interaction) => interaction.responseTime);

    return responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
      : 0;
  }

  private calculateEngagementRate(interactions: any[]): number {
    if (interactions.length === 0) return 0;

    const engagedInteractions = interactions.filter(
      (interaction) =>
        interaction.status === "REPLIED" || interaction.status === "CLICKED"
    );

    return (engagedInteractions.length / interactions.length) * 100;
  }

  private calculateSatisfactionScore(conversations: any[]): number {
    if (conversations.length === 0) return 0;

    const satisfactionScores = conversations
      .filter((conv) => conv.satisfaction)
      .map((conv) => conv.satisfaction);

    return satisfactionScores.length > 0
      ? satisfactionScores.reduce((sum, score) => sum + score, 0) /
          satisfactionScores.length
      : 0;
  }

  private calculateRevenue(leads: any[]): number {
    // Simplified revenue calculation
    const convertedLeads = leads.filter((lead) => lead.status === "CONVERTED");
    return convertedLeads.length * 5000; // Assume $5K average deal size
  }

  private async generateInsights(
    userId: string,
    data: any
  ): Promise<OptimizationInsight[]> {
    const insights: OptimizationInsight[] = [];

    // Conversion insights
    insights.push({
      id: "conversion_timing",
      type: "conversion",
      title: "Peak Performance Time",
      description: "Your conversion rate is 40% higher between 2-4 PM EST",
      impact: "high",
      confidence: 0.89,
      data: {
        peakHours: [14, 15, 16],
        conversionRate: 0.23,
        averageRate: 0.16,
      },
      recommendations: [
        "Schedule high-priority outreach during 2-4 PM EST",
        "Adjust automation triggers for peak hours",
        "Focus follow-ups during optimal time windows",
      ],
      expectedImprovement: "+15% conversion rate",
    });

    // Engagement insights
    insights.push({
      id: "personalization_impact",
      type: "engagement",
      title: "Personalization Impact",
      description: "Personalized subject lines increase open rates by 25%",
      impact: "medium",
      confidence: 0.92,
      data: {
        personalizedOpenRate: 0.45,
        genericOpenRate: 0.36,
        improvement: 0.25,
      },
      recommendations: [
        "Use company name in subject lines",
        "Reference recent company news or events",
        "Personalize based on industry pain points",
      ],
      expectedImprovement: "+25% open rate",
    });

    // Timing insights
    insights.push({
      id: "follow_up_timing",
      type: "timing",
      title: "Optimal Follow-up Interval",
      description: "3-day follow-up interval shows best results",
      impact: "high",
      confidence: 0.85,
      data: {
        optimalInterval: 3,
        responseRate: 0.34,
        averageRate: 0.22,
      },
      recommendations: [
        "Set automation triggers for 3-day intervals",
        "Adjust manual follow-up schedules",
        "Test 2-day intervals for high-intent leads",
      ],
      expectedImprovement: "+12% response rate",
    });

    // Content insights
    insights.push({
      id: "cta_optimization",
      type: "content",
      title: "Call-to-Action Optimization",
      description: "Questions in CTAs increase response rates by 18%",
      impact: "medium",
      confidence: 0.78,
      data: {
        questionCTARate: 0.28,
        statementCTARate: 0.24,
        improvement: 0.18,
      },
      recommendations: [
        "Use question-based CTAs",
        "Make CTAs more conversational",
        "Test different CTA placements",
      ],
      expectedImprovement: "+18% response rate",
    });

    return insights;
  }

  async getTrainingProgress(userId: string): Promise<AITrainingProgress[]> {
    try {
      const cacheKey = `ai_training_progress:${userId}`;
      const cached = await cacheGet(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const progress: AITrainingProgress[] = [
        {
          module: "Conversation Analysis",
          progress: 85,
          accuracy: 0.89,
          lastUpdate: new Date(),
          status: "learning",
          improvements: [
            "Improved sentiment detection by 12%",
            "Better context understanding",
            "Enhanced response relevance",
          ],
        },
        {
          module: "Response Optimization",
          progress: 72,
          accuracy: 0.84,
          lastUpdate: new Date(),
          status: "optimizing",
          improvements: [
            "Faster response generation",
            "More personalized responses",
            "Better objection handling",
          ],
        },
        {
          module: "Personalization Engine",
          progress: 91,
          accuracy: 0.94,
          lastUpdate: new Date(),
          status: "stable",
          improvements: [
            "Industry-specific messaging",
            "Company size adaptation",
            "Role-based personalization",
          ],
        },
        {
          module: "Behavioral Prediction",
          progress: 67,
          accuracy: 0.76,
          lastUpdate: new Date(),
          status: "learning",
          improvements: [
            "Lead scoring accuracy",
            "Churn prediction",
            "Intent signal detection",
          ],
        },
      ];

      // Cache for 30 minutes
      await cacheSet(cacheKey, JSON.stringify(progress), 1800);

      return progress;
    } catch (error) {
      logError("Error getting training progress", error);
      throw error;
    }
  }

  async generateOptimizationSuggestions(userId: string): Promise<any[]> {
    try {
      const suggestions = [
        {
          id: "1",
          type: "personalization",
          title: "Enhance Personalization",
          description: "Add company-specific pain points to initial messages",
          priority: "high",
          effort: "low",
          expectedImpact: "+15% response rate",
          implementation: "Update message templates with dynamic company data",
        },
        {
          id: "2",
          type: "timing",
          title: "Optimize Send Times",
          description: "Schedule emails for 2-4 PM EST for better engagement",
          priority: "medium",
          effort: "low",
          expectedImpact: "+8% open rate",
          implementation:
            "Adjust automation schedules and send time preferences",
        },
        {
          id: "3",
          type: "content",
          title: "Improve Value Proposition",
          description: "Highlight ROI and cost savings in first message",
          priority: "high",
          effort: "medium",
          expectedImpact: "+12% conversion rate",
          implementation:
            "Update value proposition messaging and add ROI calculator",
        },
        {
          id: "4",
          type: "follow_up",
          title: "Implement Smart Follow-ups",
          description: "Use behavioral triggers for follow-up timing",
          priority: "high",
          effort: "high",
          expectedImpact: "+20% engagement rate",
          implementation:
            "Create behavioral trigger system and automation rules",
        },
      ];

      return suggestions;
    } catch (error) {
      logError("Error generating optimization suggestions", error);
      throw error;
    }
  }

  async optimizeAutomation(userId: string, automationId: string): Promise<any> {
    try {
      const automation = await db.automation.findUnique({
        where: { id: automationId, userId },
      });

      if (!automation) {
        throw new Error("Automation not found");
      }

      // Analyze automation performance
      const performance = await this.analyzeAutomationPerformance(automationId);

      // Generate optimization recommendations
      const optimizations = await this.generateAutomationOptimizations(
        automation,
        performance
      );

      return {
        automationId,
        currentPerformance: performance,
        optimizations,
        expectedImprovement: "+25% success rate",
      };
    } catch (error) {
      logError("Error optimizing automation", error);
      throw error;
    }
  }

  private async analyzeAutomationPerformance(
    automationId: string
  ): Promise<any> {
    // Simplified performance analysis
    return {
      successRate: 0.78,
      averageExecutionTime: 2.3,
      totalExecutions: 1247,
      errorRate: 0.05,
      lastOptimization: new Date(),
    };
  }

  private async generateAutomationOptimizations(
    automation: any,
    performance: any
  ): Promise<any[]> {
    return [
      {
        type: "condition_optimization",
        title: "Optimize Trigger Conditions",
        description: "Refine conditions to reduce false positives",
        impact: "medium",
        implementation: "Add additional filters to trigger conditions",
      },
      {
        type: "action_timing",
        title: "Optimize Action Timing",
        description: "Adjust delays between actions for better results",
        impact: "high",
        implementation: "Implement dynamic delay based on lead behavior",
      },
      {
        type: "personalization",
        title: "Add Personalization",
        description: "Include lead-specific data in actions",
        impact: "high",
        implementation: "Use lead data to personalize email content and timing",
      },
    ];
  }
}

// Export singleton instance
export const aiOptimizationEngine = AIOptimizationEngine.getInstance();

