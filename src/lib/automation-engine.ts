import { db } from "./db";
import { cacheGet, cacheSet } from "./redis-client";
import { logInfo, logError } from "./logger";

export interface AutomationContext {
  userId: string;
  leadId?: string;
  interactionId?: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
}

export interface AutomationResult {
  success: boolean;
  actionsExecuted: string[];
  errors: string[];
  nextRun?: Date;
}

export class AutomationEngine {
  private static instance: AutomationEngine;
  private isRunning = false;

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async processEvent(context: AutomationContext): Promise<AutomationResult> {
    try {
      logInfo("Processing automation event", {
        userId: context.userId,
        eventType: context.eventType,
        leadId: context.leadId,
      });

      // Get active automations for this user
      const automations = await this.getActiveAutomations(context.userId);

      const results: AutomationResult = {
        success: true,
        actionsExecuted: [],
        errors: [],
      };

      // Process each automation
      for (const automation of automations) {
        try {
          const shouldExecute = await this.evaluateConditions(
            automation.conditions,
            context
          );

          if (shouldExecute) {
            const actionResults = await this.executeActions(
              automation.actions,
              context,
              automation
            );

            results.actionsExecuted.push(...actionResults);

            // Update automation stats
            await this.updateAutomationStats(automation.id, true);
          }
        } catch (error) {
          logError("Error processing automation", error, {
            automationId: automation.id,
            userId: context.userId,
          });
          results.errors.push(
            `Automation ${automation.name}: ${error.message}`
          );
          results.success = false;

          // Update automation stats
          await this.updateAutomationStats(automation.id, false);
        }
      }

      return results;
    } catch (error) {
      logError("Error in automation engine", error);
      return {
        success: false,
        actionsExecuted: [],
        errors: [error.message],
      };
    }
  }

  private async getActiveAutomations(userId: string) {
    const cacheKey = `active_automations:${userId}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const automations = await db.automation.findMany({
      where: {
        userId,
        status: "active",
      },
      orderBy: { priority: "desc" },
    });

    const result = automations.map((automation) => ({
      id: automation.id,
      name: automation.name,
      trigger: JSON.parse(automation.trigger),
      conditions: JSON.parse(automation.conditions || "[]"),
      actions: JSON.parse(automation.actions),
      priority: automation.priority,
    }));

    // Cache for 5 minutes
    await cacheSet(cacheKey, JSON.stringify(result), 300);

    return result;
  }

  private async evaluateConditions(
    conditions: any[],
    context: AutomationContext
  ): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    let result = true;
    let logicOperator = "AND";

    for (const condition of conditions) {
      const conditionResult = await this.evaluateCondition(condition, context);

      if (logicOperator === "AND") {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      logicOperator = condition.logic || "AND";
    }

    return result;
  }

  private async evaluateCondition(
    condition: any,
    context: AutomationContext
  ): Promise<boolean> {
    const { field, operator, value } = condition;

    // Get the actual value from context
    const actualValue = this.getFieldValue(field, context);

    switch (operator) {
      case "equals":
        return actualValue === value;
      case "contains":
        return String(actualValue)
          .toLowerCase()
          .includes(String(value).toLowerCase());
      case "greater_than":
        return Number(actualValue) > Number(value);
      case "less_than":
        return Number(actualValue) < Number(value);
      case "in":
        return Array.isArray(value) && value.includes(actualValue);
      case "not_in":
        return Array.isArray(value) && !value.includes(actualValue);
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: AutomationContext): any {
    const fieldParts = field.split(".");
    let value = context.eventData;

    for (const part of fieldParts) {
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  private async executeActions(
    actions: any[],
    context: AutomationContext,
    automation: any
  ): Promise<string[]> {
    const executedActions: string[] = [];

    for (const action of actions) {
      try {
        await this.executeAction(action, context, automation);
        executedActions.push(action.type);
      } catch (error) {
        logError("Error executing action", error, {
          actionType: action.type,
          automationId: automation.id,
        });
        throw error;
      }
    }

    return executedActions;
  }

  private async executeAction(
    action: any,
    context: AutomationContext,
    automation: any
  ): Promise<void> {
    const { type, config, delay } = action;

    // Handle delay if specified
    if (delay && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }

    switch (type) {
      case "send_email":
        await this.sendEmail(config, context);
        break;
      case "create_task":
        await this.createTask(config, context);
        break;
      case "update_lead":
        await this.updateLead(config, context);
        break;
      case "send_slack":
        await this.sendSlack(config, context);
        break;
      case "webhook":
        await this.sendWebhook(config, context);
        break;
      case "ai_response":
        await this.generateAIResponse(config, context);
        break;
      case "schedule_followup":
        await this.scheduleFollowup(config, context);
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  private async sendEmail(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for sending email
    logInfo("Sending email", { config, context });
    // TODO: Integrate with email service
  }

  private async createTask(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for creating task
    logInfo("Creating task", { config, context });
    // TODO: Create task in database
  }

  private async updateLead(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    if (!context.leadId) return;

    await db.lead.update({
      where: { id: context.leadId },
      data: config.updates,
    });

    logInfo("Updated lead", {
      leadId: context.leadId,
      updates: config.updates,
    });
  }

  private async sendSlack(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for sending Slack message
    logInfo("Sending Slack message", { config, context });
    // TODO: Integrate with Slack API
  }

  private async sendWebhook(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for sending webhook
    logInfo("Sending webhook", { config, context });
    // TODO: Send HTTP request to webhook URL
  }

  private async generateAIResponse(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for generating AI response
    logInfo("Generating AI response", { config, context });
    // TODO: Integrate with AI service
  }

  private async scheduleFollowup(
    config: any,
    context: AutomationContext
  ): Promise<void> {
    // Implementation for scheduling follow-up
    logInfo("Scheduling follow-up", { config, context });
    // TODO: Create scheduled task
  }

  private async updateAutomationStats(
    automationId: string,
    success: boolean
  ): Promise<void> {
    await db.automation.update({
      where: { id: automationId },
        data: {
        totalRuns: { increment: 1 },
        lastRun: new Date(),
        successRate: success ? { increment: 1 } : undefined,
        },
      });
  }

  // Trigger methods for different events
  async triggerLeadCreated(
    leadId: string,
    userId: string,
    leadData: any
  ): Promise<void> {
    const context: AutomationContext = {
      userId,
      leadId,
      eventType: "lead_created",
      eventData: leadData,
      timestamp: new Date(),
    };

    await this.processEvent(context);
  }

  async triggerEmailOpened(
    leadId: string,
    userId: string,
    emailData: any
  ): Promise<void> {
    const context: AutomationContext = {
      userId,
      leadId,
      eventType: "email_opened",
      eventData: emailData,
      timestamp: new Date(),
    };

    await this.processEvent(context);
  }

  async triggerFormSubmitted(
    leadId: string,
    userId: string,
    formData: any
  ): Promise<void> {
    const context: AutomationContext = {
      userId,
      leadId,
      eventType: "form_submitted",
      eventData: formData,
      timestamp: new Date(),
    };

    await this.processEvent(context);
  }

  async triggerBehavioralEvent(
    leadId: string,
    userId: string,
    behaviorData: any
  ): Promise<void> {
    const context: AutomationContext = {
      userId,
      leadId,
      eventType: "behavioral",
      eventData: behaviorData,
      timestamp: new Date(),
    };

    await this.processEvent(context);
  }
}

// Export singleton instance
export const automationEngine = AutomationEngine.getInstance();
