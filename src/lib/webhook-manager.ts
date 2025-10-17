import crypto from "crypto";
import { PrismaClient } from "@/generated/prisma";
import { logWebhookEvent, logError } from "./logger";
import { decryptCredentials } from "./encryption";
import { scheduleSync } from "./sync-engine";

const prisma = new PrismaClient();

export interface WebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  payload: any;
  timestamp: Date;
  signature?: string;
  userId?: string;
}

export interface WebhookConfig {
  integrationId: string;
  userId: string;
  events: string[];
  endpoint: string;
  secret: string;
  active: boolean;
}

export interface WebhookHandler {
  (event: WebhookEvent, credentials: any): Promise<void>;
}

// Webhook handlers for different integrations
const webhookHandlers: Record<string, Record<string, WebhookHandler>> = {
  hubspot: {
    "contact.created": async (event, credentials) => {
      logWebhookEvent("info", "HubSpot contact created", {
        integrationId: event.integrationId,
        contactId: event.payload.objectId,
      });

      // Trigger incremental sync for contacts
      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "contact.created" }
      );
    },

    "contact.updated": async (event, credentials) => {
      logWebhookEvent("info", "HubSpot contact updated", {
        integrationId: event.integrationId,
        contactId: event.payload.objectId,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "contact.updated" }
      );
    },

    "deal.updated": async (event, credentials) => {
      logWebhookEvent("info", "HubSpot deal updated", {
        integrationId: event.integrationId,
        dealId: event.payload.objectId,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "deal.updated" }
      );
    },
  },

  shopify: {
    "orders/create": async (event, credentials) => {
      logWebhookEvent("info", "Shopify order created", {
        integrationId: event.integrationId,
        orderId: event.payload.id,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "order.created" }
      );
    },

    "orders/updated": async (event, credentials) => {
      logWebhookEvent("info", "Shopify order updated", {
        integrationId: event.integrationId,
        orderId: event.payload.id,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "order.updated" }
      );
    },

    "products/create": async (event, credentials) => {
      logWebhookEvent("info", "Shopify product created", {
        integrationId: event.integrationId,
        productId: event.payload.id,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "normal",
        0,
        { eventType: "product.created" }
      );
    },
  },

  salesforce: {
    Lead: async (event, credentials) => {
      logWebhookEvent("info", "Salesforce lead event", {
        integrationId: event.integrationId,
        leadId: event.payload.Id,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "high",
        0,
        { eventType: "lead.updated" }
      );
    },

    Account: async (event, credentials) => {
      logWebhookEvent("info", "Salesforce account event", {
        integrationId: event.integrationId,
        accountId: event.payload.Id,
      });

      await scheduleSync(
        event.userId!,
        event.integrationId,
        "incremental",
        "normal",
        0,
        { eventType: "account.updated" }
      );
    },
  },
};

/**
 * Verify webhook signature
 * @param payload - Webhook payload
 * @param signature - Signature from header
 * @param secret - Webhook secret
 * @param algorithm - Hashing algorithm (default: sha256)
 * @returns Boolean indicating if signature is valid
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  algorithm: string = "sha256"
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest("hex");

    const providedSignature = signature.replace(`${algorithm}=`, "");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(providedSignature, "hex")
    );
  } catch (error) {
    logError(error as Error, { action: "verifyWebhookSignature" });
    return false;
  }
}

/**
 * Process incoming webhook
 * @param integrationId - Integration identifier
 * @param eventType - Type of webhook event
 * @param payload - Webhook payload
 * @param signature - Signature for verification
 * @returns Processing result
 */
export async function processWebhook(
  integrationId: string,
  eventType: string,
  payload: any,
  signature?: string
): Promise<{ success: boolean; message: string }> {
  try {
    logWebhookEvent("info", "Processing webhook", {
      integrationId,
      eventType,
      hasSignature: !!signature,
    });

    // Get all active webhook configurations for this integration
    const connections = await prisma.integrationConnection.findMany({
      where: {
        integrationId,
        status: "connected",
      },
    });

    if (connections.length === 0) {
      return {
        success: false,
        message: "No active connections found for integration",
      };
    }

    // Find matching webhook handler
    const handlers = webhookHandlers[integrationId];
    if (!handlers || !handlers[eventType]) {
      logWebhookEvent("warn", "No handler found for webhook event", {
        integrationId,
        eventType,
      });
      return {
        success: false,
        message: "No handler found for this event type",
      };
    }

    // Process webhook for each connection
    const results = await Promise.allSettled(
      connections.map(async (connection) => {
        try {
          // Verify signature if provided
          if (signature) {
            const credentials = decryptCredentials(connection.credentials);
            const webhookSecret = credentials.webhookSecret;

            if (
              webhookSecret &&
              !verifyWebhookSignature(
                JSON.stringify(payload),
                signature,
                webhookSecret
              )
            ) {
              throw new Error("Invalid webhook signature");
            }
          }

          // Create webhook event
          const event: WebhookEvent = {
            id: crypto.randomUUID(),
            integrationId,
            eventType,
            payload,
            timestamp: new Date(),
            signature,
            userId: connection.userId,
          };

          // Get credentials for handler
          const credentials = decryptCredentials(connection.credentials);

          // Execute handler
          await handlers[eventType](event, credentials);

          logWebhookEvent("info", "Webhook processed successfully", {
            userId: connection.userId,
            integrationId,
            eventType,
            eventId: event.id,
          });

          return { success: true, userId: connection.userId };
        } catch (error) {
          logError(error as Error, {
            userId: connection.userId,
            integrationId,
            eventType,
          });
          return { success: false, userId: connection.userId, error };
        }
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    return {
      success: successful > 0,
      message: `Processed webhook for ${successful}/${connections.length} connections`,
    };
  } catch (error) {
    logError(error as Error, {
      integrationId,
      eventType,
      action: "processWebhook",
    });

    return {
      success: false,
      message: "Internal error processing webhook",
    };
  }
}

/**
 * Register webhook configuration
 * @param config - Webhook configuration
 * @returns Registration result
 */
export async function registerWebhook(
  config: WebhookConfig
): Promise<{ success: boolean; message: string }> {
  try {
    // Get integration connection
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        userId: config.userId,
        integrationId: config.integrationId,
        status: "connected",
      },
    });

    if (!connection) {
      return {
        success: false,
        message: "Integration not connected",
      };
    }

    // Update connection settings with webhook config
    const currentSettings = JSON.parse(connection.settings || "{}");
    const updatedSettings = {
      ...currentSettings,
      webhook: {
        endpoint: config.endpoint,
        secret: config.secret,
        events: config.events,
        active: config.active,
        registeredAt: new Date().toISOString(),
      },
    };

    await prisma.integrationConnection.update({
      where: { id: connection.id },
      data: {
        settings: JSON.stringify(updatedSettings),
      },
    });

    logWebhookEvent("info", "Webhook registered", {
      userId: config.userId,
      integrationId: config.integrationId,
      events: config.events,
    });

    return {
      success: true,
      message: "Webhook registered successfully",
    };
  } catch (error) {
    logError(error as Error, {
      userId: config.userId,
      integrationId: config.integrationId,
      action: "registerWebhook",
    });

    return {
      success: false,
      message: "Failed to register webhook",
    };
  }
}

/**
 * Get webhook configuration for an integration
 * @param userId - User identifier
 * @param integrationId - Integration identifier
 * @returns Webhook configuration or null
 */
export async function getWebhookConfig(
  userId: string,
  integrationId: string
): Promise<WebhookConfig | null> {
  try {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        userId,
        integrationId,
        status: "connected",
      },
    });

    if (!connection) {
      return null;
    }

    const settings = JSON.parse(connection.settings || "{}");
    const webhookConfig = settings.webhook;

    if (!webhookConfig) {
      return null;
    }

    return {
      integrationId,
      userId,
      events: webhookConfig.events || [],
      endpoint: webhookConfig.endpoint || "",
      secret: webhookConfig.secret || "",
      active: webhookConfig.active || false,
    };
  } catch (error) {
    logError(error as Error, {
      userId,
      integrationId,
      action: "getWebhookConfig",
    });
    return null;
  }
}

/**
 * Test webhook endpoint
 * @param endpoint - Webhook endpoint URL
 * @param secret - Webhook secret
 * @returns Test result
 */
export async function testWebhookEndpoint(
  endpoint: string,
  secret: string
): Promise<{ success: boolean; message: string }> {
  try {
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      message: "Webhook test from Lumio",
    };

    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(testPayload))
      .digest("hex");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": `sha256=${signature}`,
        "User-Agent": "Lumio-Webhook/1.0",
      },
      body: JSON.stringify(testPayload),
    });

    if (response.ok) {
      return {
        success: true,
        message: "Webhook endpoint test successful",
      };
    } else {
      return {
        success: false,
        message: `Webhook endpoint returned status ${response.status}`,
      };
    }
  } catch (error) {
    logError(error as Error, {
      action: "testWebhookEndpoint",
      endpoint,
    });

    return {
      success: false,
      message: "Failed to test webhook endpoint",
    };
  }
}

/**
 * Get webhook statistics
 * @param userId - User identifier
 * @param integrationId - Integration identifier
 * @returns Webhook statistics
 */
export async function getWebhookStats(
  userId: string,
  integrationId: string
): Promise<{
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  lastEvent?: Date;
  averageProcessingTime: number;
}> {
  // This would typically come from a webhook events table
  // For now, return mock data
  return {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    lastEvent: undefined,
    averageProcessingTime: 0,
  };
}

export default {
  processWebhook,
  registerWebhook,
  getWebhookConfig,
  testWebhookEndpoint,
  getWebhookStats,
  verifyWebhookSignature,
};

