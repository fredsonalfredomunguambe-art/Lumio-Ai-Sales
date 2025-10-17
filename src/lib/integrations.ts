import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export interface IntegrationConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  connectedAt?: Date;
  lastSync?: Date;
  icon: string;
  features: string[];
  setupUrl?: string;
  docsUrl?: string;
  setupSteps?: string[];
  benefits?: string[];
  credentials?: Record<string, any>;
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

export const INTEGRATION_TYPES = {
  // Email Services
  SENDGRID: {
    id: "sendgrid",
    name: "SendGrid",
    category: "email",
    description: "High-volume transactional email delivery",
    icon: "📧",
    features: [
      "Transactional emails",
      "Email templates",
      "Analytics",
      "Deliverability",
    ],
    setupSteps: [
      "Create a SendGrid account",
      "Generate an API key",
      "Copy the API key to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Send emails automatically",
      "Track email performance",
      "Improve deliverability",
      "Professional email templates",
    ],
    docsUrl: "https://docs.sendgrid.com",
    requiredCredentials: ["apiKey"],
  },

  MAILCHIMP: {
    id: "mailchimp",
    name: "Mailchimp",
    category: "email",
    description: "Marketing automation and email campaigns",
    icon: "🐵",
    features: ["Email campaigns", "Automation", "Segmentation", "Analytics"],
    setupSteps: [
      "Create a Mailchimp account",
      "Generate an API key",
      "Copy the API key to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Create email campaigns",
      "Automate email sequences",
      "Segment your audience",
      "Track campaign performance",
    ],
    docsUrl: "https://mailchimp.com/developer",
    requiredCredentials: ["apiKey", "serverPrefix"],
  },

  // Communication
  WHATSAPP: {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "communication",
    description: "WhatsApp Business API for messaging",
    icon: "💬",
    features: [
      "Automated messages",
      "Media sharing",
      "Template messages",
      "Read receipts",
    ],
    setupSteps: [
      "Create a WhatsApp Business account",
      "Get your phone number verified",
      "Generate an access token",
      "Connect to Lumio",
    ],
    benefits: [
      "Send WhatsApp messages automatically",
      "Share images and documents",
      "Track message status",
      "Professional messaging templates",
    ],
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
    requiredCredentials: ["accessToken", "phoneNumberId", "businessAccountId"],
  },

  LINKEDIN: {
    id: "linkedin",
    name: "LinkedIn",
    category: "communication",
    description: "Professional networking and lead generation",
    icon: "💼",
    features: [
      "Lead generation",
      "Profile search",
      "Connection requests",
      "Messaging",
    ],
    setupSteps: [
      "Create a LinkedIn Developer account",
      "Create a LinkedIn app",
      "Get your API credentials",
      "Connect to Lumio",
    ],
    benefits: [
      "Find leads on LinkedIn",
      "Import contact information",
      "Track LinkedIn interactions",
      "Automate LinkedIn outreach",
    ],
    docsUrl: "https://docs.microsoft.com/en-us/linkedin/",
    requiredCredentials: ["clientId", "clientSecret", "redirectUri"],
  },

  SLACK: {
    id: "slack",
    name: "Slack",
    category: "communication",
    description: "Team communication and notifications",
    icon: "💬",
    features: [
      "Notifications",
      "Team alerts",
      "Channel updates",
      "Bot integration",
    ],
    setupSteps: [
      "Create a Slack app",
      "Get your bot token",
      "Copy the token to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Get notifications in Slack",
      "Send team alerts",
      "Update channels automatically",
      "Integrate with your workflow",
    ],
    docsUrl: "https://api.slack.com",
    requiredCredentials: ["botToken", "appToken"],
  },

  // CRM Systems
  HUBSPOT: {
    id: "hubspot",
    name: "HubSpot",
    category: "crm",
    description: "All-in-one CRM and marketing platform",
    icon: "🟠",
    features: [
      "Contact sync",
      "Deal tracking",
      "Marketing automation",
      "Analytics",
    ],
    setupSteps: [
      "Create a HubSpot account",
      "Generate a private app token",
      "Copy the token to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Sync contacts automatically",
      "Track deal progress",
      "Automate marketing workflows",
      "Get comprehensive analytics",
    ],
    docsUrl: "https://developers.hubspot.com",
    requiredCredentials: ["privateAppToken"],
  },

  SALESFORCE: {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Enterprise CRM and sales management",
    icon: "☁️",
    features: [
      "Lead management",
      "Opportunity tracking",
      "Custom objects",
      "Reports",
    ],
    setupSteps: [
      "Create a Salesforce Developer account",
      "Create a Connected App",
      "Get your OAuth credentials",
      "Connect to Lumio",
    ],
    benefits: [
      "Manage leads efficiently",
      "Track opportunities",
      "Create custom objects",
      "Generate detailed reports",
    ],
    docsUrl: "https://developer.salesforce.com",
    requiredCredentials: [
      "clientId",
      "clientSecret",
      "username",
      "password",
      "securityToken",
    ],
  },

  PIPEDRIVE: {
    id: "pipedrive",
    name: "Pipedrive",
    category: "crm",
    description: "Sales-focused CRM and pipeline management",
    icon: "🔴",
    features: [
      "Pipeline management",
      "Activity tracking",
      "Deal forecasting",
      "Reports",
    ],
    setupSteps: [
      "Create a Pipedrive account",
      "Generate an API token",
      "Copy the token to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Manage sales pipelines",
      "Track activities",
      "Forecast deals",
      "Generate sales reports",
    ],
    docsUrl: "https://developers.pipedrive.com",
    requiredCredentials: ["apiToken"],
  },

  // E-commerce
  SHOPIFY: {
    id: "shopify",
    name: "Shopify",
    category: "ecommerce",
    description: "E-commerce platform integration",
    icon: "🛍️",
    features: ["Product sync", "Order tracking", "Customer data", "Inventory"],
    setupSteps: [
      "Create a Shopify Partner account",
      "Create a private app",
      "Get your API credentials",
      "Connect to Lumio",
    ],
    benefits: [
      "Sync products automatically",
      "Track orders",
      "Access customer data",
      "Monitor inventory",
    ],
    docsUrl: "https://shopify.dev",
    requiredCredentials: ["shopDomain", "accessToken"],
  },

  WOOCOMMERCE: {
    id: "woocommerce",
    name: "WooCommerce",
    category: "ecommerce",
    description: "WordPress e-commerce integration",
    icon: "🛒",
    features: ["Product sync", "Order management", "Customer data", "Reports"],
    setupSteps: [
      "Install WooCommerce on your WordPress site",
      "Generate API keys",
      "Copy the keys to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Sync products",
      "Manage orders",
      "Access customer data",
      "Generate reports",
    ],
    docsUrl: "https://woocommerce.github.io/woocommerce-rest-api-docs",
    requiredCredentials: ["consumerKey", "consumerSecret", "storeUrl"],
  },

  // Analytics
  GOOGLE_ANALYTICS: {
    id: "google-analytics",
    name: "Google Analytics",
    category: "analytics",
    description: "Website and user behavior analytics",
    icon: "📊",
    features: [
      "Website analytics",
      "User behavior",
      "Conversion tracking",
      "Reports",
    ],
    setupSteps: [
      "Create a Google Analytics account",
      "Create a service account",
      "Get your credentials",
      "Connect to Lumio",
    ],
    benefits: [
      "Track website performance",
      "Analyze user behavior",
      "Measure conversions",
      "Generate insights",
    ],
    docsUrl: "https://developers.google.com/analytics",
    requiredCredentials: [
      "clientId",
      "clientSecret",
      "refreshToken",
      "propertyId",
    ],
  },

  GOOGLE_CALENDAR: {
    id: "google-calendar",
    name: "Google Calendar",
    category: "productivity",
    description: "Bi-directional calendar sync with Google Calendar",
    icon: "📅",
    features: [
      "Two-way sync",
      "Real-time updates",
      "Event management",
      "Meeting scheduling",
      "Automated invites",
    ],
    setupSteps: [
      "Click 'Connect' to start OAuth flow",
      "Authorize Lumio to access your Google Calendar",
      "Events will sync automatically",
      "Use 'Sync Google' button for manual sync",
    ],
    benefits: [
      "Keep calendars in sync automatically",
      "Schedule meetings from Lumio",
      "Never miss an event",
      "Manage everything in one place",
      "Real-time webhook updates",
    ],
    docsUrl: "https://developers.google.com/calendar",
    requiredCredentials: [],
    testIntegrationConnection: async (credentials: any) => {
      // OAuth-based, connection tested during callback
      return {
        success: true,
        data: { status: "OAuth flow required" },
      };
    },
  },

  MIXPANEL: {
    id: "mixpanel",
    name: "Mixpanel",
    category: "analytics",
    description: "Event tracking and user analytics",
    icon: "📈",
    features: [
      "Event tracking",
      "Funnel analysis",
      "Cohort analysis",
      "A/B testing",
    ],
    setupSteps: [
      "Create a Mixpanel account",
      "Get your project token",
      "Copy the token to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Track user events",
      "Analyze funnels",
      "Study cohorts",
      "Run A/B tests",
    ],
    docsUrl: "https://developer.mixpanel.com",
    requiredCredentials: ["projectToken"],
  },

  // Payment Processing
  STRIPE: {
    id: "stripe",
    name: "Stripe",
    category: "payment",
    description: "Online payment processing",
    icon: "💳",
    features: [
      "Payment processing",
      "Subscription billing",
      "Invoicing",
      "Analytics",
    ],
    setupSteps: [
      "Create a Stripe account",
      "Get your API keys",
      "Copy the keys to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Process payments",
      "Manage subscriptions",
      "Send invoices",
      "Track revenue",
    ],
    docsUrl: "https://stripe.com/docs",
    requiredCredentials: ["publishableKey", "secretKey"],
  },

  // File Storage
  AWS_S3: {
    id: "aws-s3",
    name: "AWS S3",
    category: "storage",
    description: "Cloud file storage and CDN",
    icon: "☁️",
    features: ["File storage", "CDN", "Backup", "Scalability"],
    setupSteps: [
      "Create an AWS account",
      "Create an S3 bucket",
      "Generate access keys",
      "Connect to Lumio",
    ],
    benefits: [
      "Store files securely",
      "Use CDN for fast delivery",
      "Backup important data",
      "Scale automatically",
    ],
    docsUrl: "https://docs.aws.amazon.com/s3",
    requiredCredentials: [
      "accessKeyId",
      "secretAccessKey",
      "bucketName",
      "region",
    ],
  },

  CLOUDINARY: {
    id: "cloudinary",
    name: "Cloudinary",
    category: "storage",
    description: "Image and video management",
    icon: "🖼️",
    features: [
      "Image optimization",
      "Video processing",
      "CDN",
      "Transformations",
    ],
    setupSteps: [
      "Create a Cloudinary account",
      "Get your cloud credentials",
      "Copy the credentials to Lumio",
      "Test your connection",
    ],
    benefits: [
      "Optimize images",
      "Process videos",
      "Use global CDN",
      "Transform media",
    ],
    docsUrl: "https://cloudinary.com/documentation",
    requiredCredentials: ["cloudName", "apiKey", "apiSecret"],
  },
};

export async function getIntegrationsForUser(
  userId: string
): Promise<IntegrationConfig[]> {
  try {
    // Get user's connected integrations from database
    const connections = await prisma.integrationConnection.findMany({
      where: { userId },
    });

    // Map to integration configs
    const integrations = Object.values(INTEGRATION_TYPES).map((integration) => {
      const connection = connections.find(
        (conn) => conn.integrationId === integration.id
      );

      return {
        id: integration.id,
        name: integration.name,
        category: integration.category,
        description: integration.description,
        status: connection?.status || "disconnected",
        connectedAt: connection?.connectedAt,
        lastSync: connection?.lastSync,
        icon: integration.icon,
        features: integration.features,
        setupUrl: `/api/integrations/${integration.id}/connect`,
        docsUrl: integration.docsUrl,
        setupSteps: integration.setupSteps,
        benefits: integration.benefits,
        credentials: connection?.credentials,
      };
    });

    return integrations;
  } catch (error) {
    console.error("Error getting integrations for user:", error);
    return [];
  }
}

export async function connectIntegration(
  userId: string,
  integrationId: string,
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const integration = Object.values(INTEGRATION_TYPES).find(
      (i) => i.id === integrationId
    );
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
    const isValid = await testIntegrationConnection(integrationId, credentials);
    if (!isValid) {
      throw new Error("Invalid credentials or connection failed");
    }

    // Save connection to database
    await prisma.integrationConnection.upsert({
      where: {
        userId_integrationId: {
          userId,
          integrationId,
        },
      },
      update: {
        credentials,
        status: "connected",
        connectedAt: new Date(),
        settings: {},
      },
      create: {
        userId,
        integrationId,
        credentials,
        status: "connected",
        connectedAt: new Date(),
        settings: {},
      },
    });

    return true;
  } catch (error) {
    console.error("Error connecting integration:", error);
    return false;
  }
}

export async function disconnectIntegration(
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
    console.error("Error disconnecting integration:", error);
    return false;
  }
}

export async function testIntegrationConnection(
  integrationId: string,
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    // Implement specific connection tests for each integration
    switch (integrationId) {
      case "sendgrid":
        return await testSendGridConnection(credentials);
      case "mailchimp":
        return await testMailchimpConnection(credentials);
      case "whatsapp":
        return await testWhatsAppConnection(credentials);
      case "linkedin":
        return await testLinkedInConnection(credentials);
      case "slack":
        return await testSlackConnection(credentials);
      case "hubspot":
        return await testHubSpotConnection(credentials);
      case "salesforce":
        return await testSalesforceConnection(credentials);
      case "pipedrive":
        return await testPipedriveConnection(credentials);
      case "shopify":
        return await testShopifyConnection(credentials);
      case "woocommerce":
        return await testWooCommerceConnection(credentials);
      case "google-analytics":
        return await testGoogleAnalyticsConnection(credentials);
      case "mixpanel":
        return await testMixpanelConnection(credentials);
      case "stripe":
        return await testStripeConnection(credentials);
      case "aws-s3":
        return await testAWSS3Connection(credentials);
      case "cloudinary":
        return await testCloudinaryConnection(credentials);
      default:
        return false;
    }
  } catch (error) {
    console.error("Error testing integration connection:", error);
    return false;
  }
}

// Individual connection test functions
async function testSendGridConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/user/account", {
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
        "Content-Type": "application/json",
      },
    });
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

async function testLinkedInConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  // LinkedIn requires OAuth flow, so we'll just validate the format
  return !!(credentials.clientId && credentials.clientSecret);
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

async function testHubSpotConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts?limit=1",
      {
        headers: {
          Authorization: `Bearer ${credentials.privateAppToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.ok;
  } catch {
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

async function testGoogleAnalyticsConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  // Google Analytics requires OAuth flow, so we'll just validate the format
  return !!(
    credentials.clientId &&
    credentials.clientSecret &&
    credentials.refreshToken
  );
}

async function testMixpanelConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch("https://mixpanel.com/api/2.0/engage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: credentials.projectToken,
        distinct_id: "test",
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testStripeConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch("https://api.stripe.com/v1/balance", {
      headers: {
        Authorization: `Bearer ${credentials.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testAWSS3Connection(
  credentials: Record<string, any>
): Promise<boolean> {
  // AWS S3 requires AWS SDK, so we'll just validate the format
  return !!(
    credentials.accessKeyId &&
    credentials.secretAccessKey &&
    credentials.bucketName
  );
}

async function testCloudinaryConnection(
  credentials: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${credentials.cloudName}/resources/image`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${credentials.apiKey}:${credentials.apiSecret}`
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
