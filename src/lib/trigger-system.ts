import { db } from "./db";
import { automationEngine } from "./automation-engine";
import { logInfo, logError } from "./logger";

export interface TriggerEvent {
  type: string;
  leadId: string;
  userId: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface BehavioralTrigger {
  id: string;
  name: string;
  description: string;
  conditions: TriggerCondition[];
  actions: TriggerAction[];
  status: "active" | "inactive";
  priority: number;
  executionCount: number;
  successRate: number;
}

export interface TriggerCondition {
  field: string;
  operator:
    | "equals"
    | "contains"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in"
    | "exists"
    | "not_exists";
  value: any;
  logic?: "AND" | "OR";
}

export interface TriggerAction {
  type:
    | "send_email"
    | "create_task"
    | "update_lead"
    | "send_notification"
    | "schedule_followup"
    | "ai_response";
  config: Record<string, any>;
  delay?: number;
}

export class TriggerSystem {
  private static instance: TriggerSystem;
  private eventQueue: TriggerEvent[] = [];
  private isProcessing = false;

  static getInstance(): TriggerSystem {
    if (!TriggerSystem.instance) {
      TriggerSystem.instance = new TriggerSystem();
    }
    return TriggerSystem.instance;
  }

  // Main method to process trigger events
  async processTrigger(event: TriggerEvent): Promise<void> {
    try {
      logInfo("Processing trigger event", {
        type: event.type,
        leadId: event.leadId,
        userId: event.userId,
      });

      // Get active triggers for this user and event type
      const triggers = await this.getActiveTriggers(event.userId, event.type);

      // Process each trigger
      for (const trigger of triggers) {
        try {
          const shouldExecute = await this.evaluateTriggerConditions(
            trigger.conditions,
            event
          );

          if (shouldExecute) {
            await this.executeTriggerActions(trigger.actions, event, trigger);
            await this.updateTriggerStats(trigger.id, true);
          }
        } catch (error) {
          logError("Error processing trigger", error, {
            triggerId: trigger.id,
            eventType: event.type,
          });
          await this.updateTriggerStats(trigger.id, false);
        }
      }

      // Also process automation engine
      await automationEngine.processEvent({
        userId: event.userId,
        leadId: event.leadId,
        eventType: event.type,
        eventData: event.data,
        timestamp: event.timestamp,
      });
    } catch (error) {
      logError("Error in trigger system", error);
    }
  }

  // Queue event for processing
  async queueEvent(event: TriggerEvent): Promise<void> {
    this.eventQueue.push(event);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.processTrigger(event);
      }
    }

    this.isProcessing = false;
  }

  private async getActiveTriggers(
    userId: string,
    eventType: string
  ): Promise<BehavioralTrigger[]> {
    // For now, we'll use the automation system as triggers
    // In a full implementation, you'd have a separate triggers table
    const automations = await db.automation.findMany({
      where: {
        userId,
        status: "active",
      },
    });

    return automations.map((automation) => ({
      id: automation.id,
      name: automation.name,
      description: automation.description,
      conditions: JSON.parse(automation.conditions || "[]"),
      actions: JSON.parse(automation.actions),
      status: automation.status as "active" | "inactive",
      priority: automation.priority || 1,
      executionCount: automation.totalRuns,
      successRate: automation.successRate,
    }));
  }

  private async evaluateTriggerConditions(
    conditions: TriggerCondition[],
    event: TriggerEvent
  ): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    let result = true;
    let logicOperator = "AND";

    for (const condition of conditions) {
      const conditionResult = await this.evaluateCondition(condition, event);

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
    condition: TriggerCondition,
    event: TriggerEvent
  ): Promise<boolean> {
    const { field, operator, value } = condition;

    // Get the actual value from event data
    const actualValue = this.getFieldValue(field, event);

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
      case "exists":
        return actualValue !== null && actualValue !== undefined;
      case "not_exists":
        return actualValue === null || actualValue === undefined;
      default:
        return false;
    }
  }

  private getFieldValue(field: string, event: TriggerEvent): any {
    const fieldParts = field.split(".");
    let value = event.data;

    for (const part of fieldParts) {
      if (value && typeof value === "object") {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  private async executeTriggerActions(
    actions: TriggerAction[],
    event: TriggerEvent,
    trigger: BehavioralTrigger
  ): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, event, trigger);
      } catch (error) {
        logError("Error executing trigger action", error, {
          actionType: action.type,
          triggerId: trigger.id,
        });
        throw error;
      }
    }
  }

  private async executeAction(
    action: TriggerAction,
    event: TriggerEvent,
    trigger: BehavioralTrigger
  ): Promise<void> {
    const { type, config, delay } = action;

    // Handle delay if specified
    if (delay && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    }

    switch (type) {
      case "send_email":
        await this.sendEmail(config, event);
        break;
      case "create_task":
        await this.createTask(config, event);
        break;
      case "update_lead":
        await this.updateLead(config, event);
        break;
      case "send_notification":
        await this.sendNotification(config, event);
        break;
      case "schedule_followup":
        await this.scheduleFollowup(config, event);
        break;
      case "ai_response":
        await this.generateAIResponse(config, event);
        break;
      default:
        throw new Error(`Unknown trigger action type: ${type}`);
    }
  }

  private async sendEmail(config: any, event: TriggerEvent): Promise<void> {
    logInfo("Trigger: Sending email", { config, event });
    // TODO: Integrate with email service
  }

  private async createTask(config: any, event: TriggerEvent): Promise<void> {
    logInfo("Trigger: Creating task", { config, event });
    // TODO: Create task in database
  }

  private async updateLead(config: any, event: TriggerEvent): Promise<void> {
    if (!event.leadId) return;

    await db.lead.update({
      where: { id: event.leadId },
      data: config.updates,
    });

    logInfo("Trigger: Updated lead", {
      leadId: event.leadId,
      updates: config.updates,
    });
  }

  private async sendNotification(
    config: any,
    event: TriggerEvent
  ): Promise<void> {
    logInfo("Trigger: Sending notification", { config, event });
    // TODO: Integrate with notification service
  }

  private async scheduleFollowup(
    config: any,
    event: TriggerEvent
  ): Promise<void> {
    logInfo("Trigger: Scheduling follow-up", { config, event });
    // TODO: Create scheduled task
  }

  private async generateAIResponse(
    config: any,
    event: TriggerEvent
  ): Promise<void> {
    logInfo("Trigger: Generating AI response", { config, event });
    // TODO: Integrate with AI service
  }

  private async updateTriggerStats(
    triggerId: string,
    success: boolean
  ): Promise<void> {
    await db.automation.update({
      where: { id: triggerId },
      data: {
        totalRuns: { increment: 1 },
        lastRun: new Date(),
        successRate: success ? { increment: 1 } : undefined,
      },
    });
  }

  // Specific trigger methods for common events
  async triggerEmailEngagement(
    leadId: string,
    userId: string,
    emailData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "email_engagement",
      leadId,
      userId,
      data: {
        emailId: emailData.emailId,
        action: emailData.action, // opened, clicked, replied
        timestamp: emailData.timestamp,
        subject: emailData.subject,
        openCount: emailData.openCount,
        clickCount: emailData.clickCount,
      },
      timestamp: new Date(),
    });
  }

  async triggerWebsiteBehavior(
    leadId: string,
    userId: string,
    behaviorData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "website_behavior",
      leadId,
      userId,
      data: {
        page: behaviorData.page,
        timeOnPage: behaviorData.timeOnPage,
        actions: behaviorData.actions,
        referrer: behaviorData.referrer,
        device: behaviorData.device,
        location: behaviorData.location,
      },
      timestamp: new Date(),
    });
  }

  async triggerFormAbandonment(
    leadId: string,
    userId: string,
    formData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "form_abandonment",
      leadId,
      userId,
      data: {
        formId: formData.formId,
        formName: formData.formName,
        fieldsCompleted: formData.fieldsCompleted,
        fieldsTotal: formData.fieldsTotal,
        timeSpent: formData.timeSpent,
        lastField: formData.lastField,
      },
      timestamp: new Date(),
    });
  }

  async triggerHighIntentSignals(
    leadId: string,
    userId: string,
    intentData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "high_intent_signals",
      leadId,
      userId,
      data: {
        signals: intentData.signals,
        score: intentData.score,
        sources: intentData.sources,
        urgency: intentData.urgency,
        budget: intentData.budget,
        timeline: intentData.timeline,
      },
      timestamp: new Date(),
    });
  }

  async triggerCompetitorResearch(
    leadId: string,
    userId: string,
    researchData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "competitor_research",
      leadId,
      userId,
      data: {
        competitors: researchData.competitors,
        researchDepth: researchData.researchDepth,
        comparisonPages: researchData.comparisonPages,
        timeSpent: researchData.timeSpent,
        intent: researchData.intent,
      },
      timestamp: new Date(),
    });
  }

  async triggerTimeBasedEvent(
    leadId: string,
    userId: string,
    timeData: any
  ): Promise<void> {
    await this.queueEvent({
      type: "time_based",
      leadId,
      userId,
      data: {
        triggerType: timeData.triggerType, // follow_up, reminder, check_in
        delay: timeData.delay,
        lastContact: timeData.lastContact,
        nextAction: timeData.nextAction,
        priority: timeData.priority,
      },
      timestamp: new Date(),
    });
  }
}

// Export singleton instance
export const triggerSystem = TriggerSystem.getInstance();

