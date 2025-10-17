import { PrismaClient } from "@/generated/prisma";
import { getValidAccessToken } from "./oauth-integrations";
import { encryptCredentials, decryptCredentials } from "./encryption";
import { logIntegrationEvent, logSecurityEvent } from "./logger";
import { checkRateLimit, RATE_LIMITS } from "./rate-limiter";

const prisma = new PrismaClient();

export interface PremiumIntegration {
  id: string;
  name: string;
  category:
    | "crm"
    | "communication"
    | "ecommerce"
    | "marketing"
    | "notifications";
  description: string;
  status: "connected" | "disconnected" | "error";
  connectedAt?: Date;
  lastSync?: Date;
  icon: string;
  features: string[];
  benefits: string[];
  setupSteps: string[];
  requiredCredentials: string[];
  setupTime: string;
  popular: boolean;
}

export interface IntegrationConnection {
  id: string;
  userId: string;
  integrationId: string;
  credentials: Record<string, any>;
  status: "connected" | "disconnected" | "error";
  connectedAt: Date;
  lastSync?: Date;
  settings?: Record<string, any>;
}

// Premium integrations - only client-facing integrations
export const PREMIUM_INTEGRATIONS: Record<string, PremiumIntegration> = {
  // CRM Systems
  HUBSPOT: {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "All-in-one CRM and marketing platform",
    icon: "HubSpot",
    features: [
      "Contact sync",
      "Deal tracking",
      "Marketing automation",
      "Analytics",
    ],
    benefits: [
      "Sync all contacts automatically",
      "Track deal progress in real-time",
      "Automate marketing workflows",
      "Get comprehensive analytics",
    ],
    setupSteps: [
      "Go to HubSpot Settings → Private Apps",
      "Create new Private App",
      "Enable contacts and deals scopes",
      "Copy API token to Lumio",
    ],
    requiredCredentials: ["privateAppToken"],
    setupTime: "3 minutes",
    popular: true,
    status: "disconnected",
  },

  SALESFORCE: {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Enterprise CRM and sales management",
    icon: "Salesforce",
    features: [
      "Lead management",
      "Opportunity tracking",
      "Custom objects",
      "Reports",
    ],
    benefits: [
      "Manage leads efficiently",
      "Track opportunities",
      "Create custom objects",
      "Generate detailed reports",
    ],
    setupSteps: [
      "Create Salesforce Developer account",
      "Create Connected App",
      "Get OAuth credentials",
      "Connect to Lumio",
    ],
    requiredCredentials: [
      "clientId",
      "clientSecret",
      "username",
      "password",
      "securityToken",
    ],
    setupTime: "5 minutes",
    popular: true,
    status: "disconnected",
  },

  PIPEDRIVE: {
    id: "pipedrive",
    name: "Pipedrive",
    category: "crm",
    description: "Sales-focused CRM and pipeline management",
    icon: "Pipedrive",
    features: [
      "Pipeline management",
      "Activity tracking",
      "Deal forecasting",
      "Reports",
    ],
    benefits: [
      "Manage sales pipelines",
      "Track activities",
      "Forecast deals",
      "Generate sales reports",
    ],
    setupSteps: [
      "Go to Pipedrive Settings → API",
      "Generate API token",
      "Copy token to Lumio",
      "Test connection",
    ],
    requiredCredentials: ["apiToken"],
    setupTime: "2 minutes",
    popular: false,
    status: "disconnected",
  },

  // Communication
  LINKEDIN: {
    id: "linkedin",
    name: "LinkedIn",
    category: "communication",
    description: "Professional networking and lead generation",
    icon: "LinkedIn",
    features: [
      "Lead generation",
      "Profile search",
      "Connection requests",
      "Messaging",
    ],
    benefits: [
      "Find leads on LinkedIn",
      "Import contact information",
      "Track LinkedIn interactions",
      "Automate LinkedIn outreach",
    ],
    setupSteps: [
      "Create LinkedIn Developer account",
      "Create LinkedIn app",
      "Get API credentials",
      "Connect to Lumio",
    ],
    requiredCredentials: ["clientId", "clientSecret", "redirectUri"],
    setupTime: "5 minutes",
    popular: true,
    status: "disconnected",
  },

  WHATSAPP: {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "communication",
    description: "WhatsApp Business API for messaging",
    icon: "WhatsApp",
    features: [
      "Automated messages",
      "Media sharing",
      "Template messages",
      "Read receipts",
    ],
    benefits: [
      "Send WhatsApp messages automatically",
      "Share images and documents",
      "Track message status",
      "Professional messaging templates",
    ],
    setupSteps: [
      "Create Meta Business account",
      "Set up WhatsApp Business",
      "Get API credentials",
      "Connect to Lumio",
    ],
    requiredCredentials: ["accessToken", "phoneNumberId", "businessAccountId"],
    setupTime: "10 minutes",
    popular: true,
    status: "disconnected",
  },

  // E-commerce
  SHOPIFY: {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    description: "E-commerce platform integration",
    icon: "Shopify",
    features: ["Product sync", "Order tracking", "Customer data", "Inventory"],
    benefits: [
      "Sync products automatically",
      "Track orders",
      "Access customer data",
      "Monitor inventory",
    ],
    setupSteps: [
      "Go to Shopify Admin → Apps",
      "Create Private App",
      "Enable API access",
      "Copy credentials to Lumio",
    ],
    requiredCredentials: ["shopDomain", "accessToken"],
    setupTime: "4 minutes",
    popular: true,
    status: "disconnected",
  },

  WOOCOMMERCE: {
    id: "woocommerce",
    name: "WooCommerce",
    category: "ecommerce",
    description: "WordPress e-commerce integration",
    icon: "WooCommerce",
    features: ["Product sync", "Order management", "Customer data", "Reports"],
    benefits: [
      "Sync products",
      "Manage orders",
      "Access customer data",
      "Generate reports",
    ],
    setupSteps: [
      "Go to WooCommerce → Settings → Advanced → REST API",
      "Create API keys",
      "Copy keys to Lumio",
      "Test connection",
    ],
    requiredCredentials: ["consumerKey", "consumerSecret", "storeUrl"],
    setupTime: "3 minutes",
    popular: false,
    status: "disconnected",
  },

  // Marketing
  MAILCHIMP: {
    id: "mailchimp",
    name: "Mailchimp",
    category: "marketing",
    description: "Marketing automation and email campaigns",
    icon: "Mailchimp",
    features: ["Email campaigns", "Automation", "Segmentation", "Analytics"],
    benefits: [
      "Create email campaigns",
      "Automate email sequences",
      "Segment your audience",
      "Track campaign performance",
    ],
    setupSteps: [
      "Go to Mailchimp Account → Extras → API Keys",
      "Create API key",
      "Copy key and server prefix",
      "Connect to Lumio",
    ],
    requiredCredentials: ["apiKey", "serverPrefix"],
    setupTime: "3 minutes",
    popular: true,
    status: "disconnected",
  },

  // Notifications
  SLACK: {
    id: "slack",
    name: "Slack",
    category: "notifications",
    description: "Team communication and notifications",
    icon: "Slack",
    features: [
      "Notifications",
      "Team alerts",
      "Channel updates",
      "Bot integration",
    ],
    benefits: [
      "Get notifications in Slack",
      "Send team alerts",
      "Update channels automatically",
      "Integrate with your workflow",
    ],
    setupSteps: [
      "Go to Slack API → Create App",
      "Get bot token",
      "Copy token to Lumio",
      "Test connection",
    ],
    requiredCredentials: ["botToken", "appToken"],
    setupTime: "4 minutes",
    popular: true,
    status: "disconnected",
  },
};

export async function getPremiumIntegrationsForUser(
  userId: string
): Promise<PremiumIntegration[]> {
  try {
    // Get user's connected integrations from database
    const connections = await prisma.integrationConnection.findMany({
      where: { userId },
    });

    // Map to premium integration configs
    const integrations = Object.values(PREMIUM_INTEGRATIONS).map(
      (integration) => {
        const connection = connections.find(
          (conn) => conn.integrationId === integration.id
        );

        return {
          ...integration,
          status: connection?.status || "disconnected",
          connectedAt: connection?.connectedAt,
          lastSync: connection?.lastSync,
        };
      }
    );

    return integrations;
  } catch (error) {
    console.error("Error getting premium integrations for user:", error);
    return Object.values(PREMIUM_INTEGRATIONS);
  }
}

export async function connectPremiumIntegration(
  userId: string,
  integrationId: string,
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      userId,
      "INTEGRATION_CONNECT",
      RATE_LIMITS.INTEGRATION_CONNECT
    );

    if (!rateLimitResult.allowed) {
      logSecurityEvent("warn", "Integration connection rate limited", {
        userId,
        integrationId,
        message: rateLimitResult.message,
      });
      throw new Error(rateLimitResult.message);
    }

    logIntegrationEvent("info", "Starting integration connection", {
      userId,
      integrationId,
    });

    const integration = PREMIUM_INTEGRATIONS[integrationId.toUpperCase()];
    if (!integration) {
      throw new Error("Integration not found");
    }

    // Validate credentials
    const requiredCreds = integration.requiredCredentials;
    for (const cred of requiredCreds) {
      if (!credentials[cred]) {
        throw new Error(`Missing required credential: ${cred}`);
      }
    }

    // Test connection (implement specific tests for each integration)
    const isValid = await testPremiumIntegrationConnection(
      integrationId,
      credentials
    );
    if (!isValid) {
      logSecurityEvent("warn", "Invalid integration credentials", {
        userId,
        integrationId,
      });
      throw new Error("Invalid credentials or connection failed");
    }

    // Encrypt credentials before storing
    const encryptedCredentials = encryptCredentials(credentials);

    // Save connection to database
    await prisma.integrationConnection.upsert({
      where: {
        userId_integrationId: {
          userId,
          integrationId,
        },
      },
      update: {
        credentials: encryptedCredentials,
        status: "connected",
        connectedAt: new Date(),
        settings: JSON.stringify({
          lastConnectedAt: new Date().toISOString(),
          version: "2.0",
        }),
      },
      create: {
        userId,
        integrationId,
        credentials: encryptedCredentials,
        status: "connected",
        connectedAt: new Date(),
        settings: JSON.stringify({
          lastConnectedAt: new Date().toISOString(),
          version: "2.0",
        }),
      },
    });

    logIntegrationEvent("info", "Integration connected successfully", {
      userId,
      integrationId,
    });

    return true;
  } catch (error) {
    logIntegrationEvent("error", "Failed to connect integration", {
      userId,
      integrationId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

export async function disconnectPremiumIntegration(
  userId: string,
  integrationId: string
): Promise<boolean> {
  try {
    await prisma.integrationConnection.updateMany({
      where: {
        userId,
        integrationId,
      },
      data: {
        status: "disconnected",
      },
    });

    return true;
  } catch (error) {
    console.error("Error disconnecting premium integration:", error);
    return false;
  }
}

export async function testPremiumIntegrationConnection(
  integrationId: string,
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    // Implement specific connection tests for each integration
    switch (integrationId) {
      case "hubspot":
        return await testHubSpotConnection(credentials);
      case "salesforce":
        return await testSalesforceConnection(credentials);
      case "pipedrive":
        return await testPipedriveConnection(credentials);
      case "linkedin":
        return await testLinkedInConnection(credentials);
      case "whatsapp":
        return await testWhatsAppConnection(credentials);
      case "shopify":
        return await testShopifyConnection(credentials);
      case "woocommerce":
        return await testWooCommerceConnection(credentials);
      case "mailchimp":
        return await testMailchimpConnection(credentials);
      case "slack":
        return await testSlackConnection(credentials);
      default:
        return false;
    }
  } catch (error) {
    console.error("Error testing premium integration connection:", error);
    return false;
  }
}

// Individual connection test functions
async function testHubSpotConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    // For OAuth connections, we'll test with the access token
    const accessToken = credentials.accessToken || credentials.privateAppToken;

    if (!accessToken) {
      return false;
    }

    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      logIntegrationEvent("debug", "HubSpot connection test successful");
      return true;
    } else {
      logIntegrationEvent("warn", "HubSpot connection test failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }
  } catch (error) {
    logIntegrationEvent("error", "HubSpot connection test error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

async function testSalesforceConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  // Salesforce requires OAuth flow, so we'll just validate the format
  return !!(
    credentials.clientId &&
    credentials.clientSecret &&
    credentials.username
  );
}

async function testPipedriveConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch("https://api.pipedrive.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${credentials.apiToken}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testLinkedInConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  // LinkedIn requires OAuth flow, so we'll just validate the format
  return !!(credentials.clientId && credentials.clientSecret);
}

async function testWhatsAppConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.phoneNumberId}`,
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function testShopifyConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${credentials.shopDomain}.myshopify.com/admin/api/2023-10/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": credentials.accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function testWooCommerceConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const auth = Buffer.from(
      `${credentials.consumerKey}:${credentials.consumerSecret}`
    ).toString("base64");
    const response = await fetch(
      `${credentials.storeUrl}/wp-json/wc/v3/system_status`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function testMailchimpConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${credentials.serverPrefix}.api.mailchimp.com/3.0/ping`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `anystring:${credentials.apiKey}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function testSlackConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch("https://slack.com/api/auth.test", {
      headers: {
        Authorization: `Bearer ${credentials.botToken}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data.ok;
  } catch {
    return false;
  }
}
