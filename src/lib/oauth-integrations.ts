import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export interface OAuthIntegration {
  id: string;
  name: string;
  provider: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export const OAUTH_INTEGRATIONS: Record<string, OAuthIntegration> = {
  hubspot: {
    id: "hubspot",
    name: "HubSpot",
    provider: "hubspot",
    clientId: process.env.HUBSPOT_CLIENT_ID || "",
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET || "",
    redirectUri: process.env.HUBSPOT_REDIRECT_URI || "",
    scopes: [
      "contacts",
      "deals",
      "companies",
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
    ],
    authUrl: "https://app.hubspot.com/oauth/authorize",
    tokenUrl: "https://api.hubapi.com/oauth/v1/token",
    userInfoUrl: "https://api.hubapi.com/oauth/v1/access-tokens",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    provider: "linkedin",
    clientId: process.env.LINKEDIN_CLIENT_ID || "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || "",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social"],
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    userInfoUrl: "https://api.linkedin.com/v2/people/~",
  },
  shopify: {
    id: "shopify",
    name: "Shopify",
    provider: "shopify",
    clientId: process.env.SHOPIFY_CLIENT_ID || "",
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET || "",
    redirectUri: process.env.SHOPIFY_REDIRECT_URI || "",
    scopes: ["read_products", "read_orders", "read_customers", "write_orders"],
    authUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
    tokenUrl: "https://{shop}.myshopify.com/admin/oauth/access_token",
    userInfoUrl: "https://{shop}.myshopify.com/admin/api/2023-10/shop.json",
  },
  salesforce: {
    id: "salesforce",
    name: "Salesforce",
    provider: "salesforce",
    clientId: process.env.SALESFORCE_CLIENT_ID || "",
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
    redirectUri: process.env.SALESFORCE_REDIRECT_URI || "",
    scopes: ["api", "refresh_token", "offline_access"],
    authUrl: "https://login.salesforce.com/services/oauth2/authorize",
    tokenUrl: "https://login.salesforce.com/services/oauth2/token",
    userInfoUrl: "https://login.salesforce.com/services/oauth2/userinfo",
  },
  mailchimp: {
    id: "mailchimp",
    name: "Mailchimp",
    provider: "mailchimp",
    clientId: process.env.MAILCHIMP_CLIENT_ID || "",
    clientSecret: process.env.MAILCHIMP_CLIENT_SECRET || "",
    redirectUri: process.env.MAILCHIMP_REDIRECT_URI || "",
    scopes: ["read", "write"],
    authUrl: "https://login.mailchimp.com/oauth2/authorize",
    tokenUrl: "https://login.mailchimp.com/oauth2/token",
    userInfoUrl: "https://login.mailchimp.com/oauth2/metadata",
  },
  slack: {
    id: "slack",
    name: "Slack",
    provider: "slack",
    clientId: process.env.SLACK_CLIENT_ID || "",
    clientSecret: process.env.SLACK_CLIENT_SECRET || "",
    redirectUri: process.env.SLACK_REDIRECT_URI || "",
    scopes: ["chat:write", "channels:read", "users:read"],
    authUrl: "https://slack.com/oauth/v2/authorize",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
    userInfoUrl: "https://slack.com/api/users.identity",
  },
  pipedrive: {
    id: "pipedrive",
    name: "Pipedrive",
    provider: "pipedrive",
    clientId: process.env.PIPEDRIVE_CLIENT_ID || "",
    clientSecret: process.env.PIPEDRIVE_CLIENT_SECRET || "",
    redirectUri: process.env.PIPEDRIVE_REDIRECT_URI || "",
    scopes: ["read", "write"],
    authUrl: "https://oauth.pipedrive.com/oauth/authorize",
    tokenUrl: "https://oauth.pipedrive.com/oauth/token",
    userInfoUrl: "https://api.pipedrive.com/v1/users/me",
  },
};

export function generateOAuthUrl(
  integrationId: string,
  userId: string,
  state?: string
): string {
  const integration = OAUTH_INTEGRATIONS[integrationId];
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }

  const params = new URLSearchParams({
    client_id: integration.clientId,
    redirect_uri: integration.redirectUri,
    response_type: "code",
    scope: integration.scopes.join(" "),
    state: state || `${userId}-${integrationId}-${Date.now()}`,
  });

  return `${integration.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  integrationId: string,
  code: string,
  state: string
): Promise<{ accessToken: string; refreshToken?: string; expiresIn?: number }> {
  const integration = OAUTH_INTEGRATIONS[integrationId];
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }

  const response = await fetch(integration.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: integration.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to exchange code for token: ${response.statusText}`
    );
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function refreshAccessToken(
  integrationId: string,
  refreshToken: string
): Promise<{ accessToken: string; expiresIn?: number }> {
  const integration = OAUTH_INTEGRATIONS[integrationId];
  if (!integration) {
    throw new Error(`Integration ${integrationId} not found`);
  }

  const response = await fetch(integration.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: integration.clientId,
      client_secret: integration.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export async function saveOAuthConnection(
  userId: string,
  integrationId: string,
  accessToken: string,
  refreshToken?: string,
  expiresIn?: number
): Promise<void> {
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

  await prisma.integrationConnection.upsert({
    where: {
      userId_integrationId: {
        userId,
        integrationId,
      },
    },
    update: {
      credentials: JSON.stringify({
        accessToken,
        refreshToken,
        expiresAt: expiresAt?.toISOString(),
      }),
      status: "connected",
      connectedAt: new Date(),
    },
    create: {
      userId,
      integrationId,
      credentials: JSON.stringify({
        accessToken,
        refreshToken,
        expiresAt: expiresAt?.toISOString(),
      }),
      status: "connected",
      connectedAt: new Date(),
    },
  });
}

export async function getValidAccessToken(
  userId: string,
  integrationId: string
): Promise<string> {
  const connection = await prisma.integrationConnection.findFirst({
    where: {
      userId,
      integrationId,
      status: "connected",
    },
  });

  if (!connection) {
    throw new Error("Integration not connected");
  }

  const credentials = JSON.parse(connection.credentials);
  const { accessToken, refreshToken, expiresAt } = credentials;

  // Check if token is expired
  if (expiresAt && new Date(expiresAt) <= new Date()) {
    if (!refreshToken) {
      throw new Error("Token expired and no refresh token available");
    }

    // Refresh the token
    const newTokenData = await refreshAccessToken(integrationId, refreshToken);

    // Update the connection with new token
    await saveOAuthConnection(
      userId,
      integrationId,
      newTokenData.accessToken,
      refreshToken,
      newTokenData.expiresIn
    );

    return newTokenData.accessToken;
  }

  return accessToken;
}
