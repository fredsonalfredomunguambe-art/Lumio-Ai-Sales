import { Client } from "@hubspot/api-client";
import {
  BaseIntegration,
  IntegrationConfig,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface HubSpotConfig extends IntegrationConfig {
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

export interface HubSpotContact {
  id?: string;
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  phone?: string;
  lifecyclestage?: string;
  [key: string]: any;
}

export interface HubSpotDeal {
  id?: string;
  dealname: string;
  amount?: number;
  dealstage?: string;
  closedate?: string;
  pipeline?: string;
  [key: string]: any;
}

export interface HubSpotCompany {
  id?: string;
  name: string;
  domain?: string;
  industry?: string;
  phone?: string;
  city?: string;
  state?: string;
  [key: string]: any;
}

export class HubSpotClient extends BaseIntegration {
  private client: Client;
  private isInitialized: boolean = false;

  constructor(config: HubSpotConfig) {
    super({
      ...config,
      provider: "hubspot",
      enableCache: config.enableCache ?? true,
      cacheConfig: {
        defaultTTL: 15 * 60 * 1000, // 15 minutes
        l2TTL: 30 * 60, // 30 minutes
        ...config.cacheConfig,
      },
    });

    this.client = new Client({
      accessToken: config.credentials.accessToken,
    });

    this.isInitialized = true;
  }

  /**
   * Test connection to HubSpot
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.executeRequest(
        "testConnection",
        async () => {
          const response = await this.client.crm.contacts.basicApi.getPage(1);
          return response;
        },
        {
          skipCache: true,
          priority: 8,
        }
      );

      logInfo("HubSpot connection test successful");
      return true;
    } catch (error: any) {
      logError(error, { message: "HubSpot connection test failed" });
      return false;
    }
  }

  /**
   * Sync data from HubSpot
   */
  async sync(options?: {
    type?: "contacts" | "deals" | "companies" | "all";
  }): Promise<{
    contacts?: HubSpotContact[];
    deals?: HubSpotDeal[];
    companies?: HubSpotCompany[];
  }> {
    const type = options?.type || "all";
    const result: any = {};

    try {
      if (type === "contacts" || type === "all") {
        result.contacts = await this.syncContacts();
      }

      if (type === "deals" || type === "all") {
        result.deals = await this.syncDeals();
      }

      if (type === "companies" || type === "all") {
        result.companies = await this.syncCompanies();
      }

      logInfo("HubSpot sync completed", {
        type,
        contactsCount: result.contacts?.length || 0,
        dealsCount: result.deals?.length || 0,
        companiesCount: result.companies?.length || 0,
      });

      return result;
    } catch (error: any) {
      logError(error, { message: "HubSpot sync failed", type });
      throw error;
    }
  }

  // ==================== CONTACTS ====================

  /**
   * Get all contacts
   */
  async getContacts(limit: number = 100): Promise<HubSpotContact[]> {
    return await this.executeRequest(
      "getContacts",
      async () => {
        const response = await this.client.crm.contacts.basicApi.getPage(
          limit,
          undefined,
          [
            "email",
            "firstname",
            "lastname",
            "company",
            "phone",
            "lifecyclestage",
          ]
        );
        return response.results.map((contact) => contact.properties);
      },
      {
        cacheKey: this.cacheKey("contacts", "all", `limit-${limit}`),
        cacheTTL: 10 * 60 * 1000, // 10 minutes
      }
    );
  }

  /**
   * Get contact by email
   */
  async getContactByEmail(email: string): Promise<HubSpotContact | null> {
    try {
      return await this.executeRequest(
        "getContactByEmail",
        async () => {
          const response = await this.client.crm.contacts.basicApi.getById(
            email,
            [
              "email",
              "firstname",
              "lastname",
              "company",
              "phone",
              "lifecyclestage",
            ],
            undefined,
            undefined,
            false,
            "email"
          );
          return response.properties;
        },
        {
          cacheKey: this.cacheKey("contact", "email", email),
          cacheTTL: 15 * 60 * 1000,
        }
      );
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create contact
   */
  async createContact(contact: HubSpotContact): Promise<HubSpotContact> {
    return await this.executeRequest(
      "createContact",
      async () => {
        const response = await this.client.crm.contacts.basicApi.create({
          properties: contact,
        });

        // Invalidate contacts cache
        await this.invalidateCache("contacts:*");

        return response.properties;
      },
      {
        skipCache: true,
        priority: 7,
      }
    );
  }

  /**
   * Update contact
   */
  async updateContact(
    contactId: string,
    updates: Partial<HubSpotContact>
  ): Promise<HubSpotContact> {
    return await this.executeRequest(
      "updateContact",
      async () => {
        const response = await this.client.crm.contacts.basicApi.update(
          contactId,
          {
            properties: updates,
          }
        );

        // Invalidate contact cache
        await this.cacheManager.delete(
          this.cacheKey("contact", contactId),
          this.provider
        );
        if (updates.email) {
          await this.cacheManager.delete(
            this.cacheKey("contact", "email", updates.email),
            this.provider
          );
        }
        await this.invalidateCache("contacts:*");

        return response.properties;
      },
      {
        skipCache: true,
        priority: 7,
      }
    );
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId: string): Promise<void> {
    return await this.executeRequest(
      "deleteContact",
      async () => {
        await this.client.crm.contacts.basicApi.archive(contactId);

        // Invalidate cache
        await this.cacheManager.delete(
          this.cacheKey("contact", contactId),
          this.provider
        );
        await this.invalidateCache("contacts:*");
      },
      {
        skipCache: true,
        priority: 6,
      }
    );
  }

  /**
   * Batch create contacts
   */
  async batchCreateContacts(
    contacts: HubSpotContact[]
  ): Promise<HubSpotContact[]> {
    return await this.executeRequest(
      "batchCreateContacts",
      async () => {
        const batchSize = 100;
        const results: HubSpotContact[] = [];

        for (let i = 0; i < contacts.length; i += batchSize) {
          const batch = contacts.slice(i, i + batchSize);
          const response = await this.client.crm.contacts.batchApi.create({
            inputs: batch.map((c) => ({ properties: c })),
          });

          results.push(...response.results.map((r) => r.properties));
        }

        // Invalidate cache
        await this.invalidateCache("contacts:*");

        return results;
      },
      {
        skipCache: true,
        priority: 5,
      }
    );
  }

  // ==================== DEALS ====================

  /**
   * Get all deals
   */
  async getDeals(limit: number = 100): Promise<HubSpotDeal[]> {
    return await this.executeRequest(
      "getDeals",
      async () => {
        const response = await this.client.crm.deals.basicApi.getPage(
          limit,
          undefined,
          ["dealname", "amount", "dealstage", "closedate", "pipeline"]
        );
        return response.results.map((deal) => deal.properties);
      },
      {
        cacheKey: this.cacheKey("deals", "all", `limit-${limit}`),
        cacheTTL: 5 * 60 * 1000, // 5 minutes
      }
    );
  }

  /**
   * Create deal
   */
  async createDeal(deal: HubSpotDeal): Promise<HubSpotDeal> {
    return await this.executeRequest(
      "createDeal",
      async () => {
        const response = await this.client.crm.deals.basicApi.create({
          properties: deal,
        });

        await this.invalidateCache("deals:*");
        return response.properties;
      },
      {
        skipCache: true,
        priority: 7,
      }
    );
  }

  /**
   * Update deal
   */
  async updateDeal(
    dealId: string,
    updates: Partial<HubSpotDeal>
  ): Promise<HubSpotDeal> {
    return await this.executeRequest(
      "updateDeal",
      async () => {
        const response = await this.client.crm.deals.basicApi.update(dealId, {
          properties: updates,
        });

        await this.cacheManager.delete(
          this.cacheKey("deal", dealId),
          this.provider
        );
        await this.invalidateCache("deals:*");

        return response.properties;
      },
      {
        skipCache: true,
        priority: 7,
      }
    );
  }

  // ==================== COMPANIES ====================

  /**
   * Get all companies
   */
  async getCompanies(limit: number = 100): Promise<HubSpotCompany[]> {
    return await this.executeRequest(
      "getCompanies",
      async () => {
        const response = await this.client.crm.companies.basicApi.getPage(
          limit,
          undefined,
          ["name", "domain", "industry", "phone", "city", "state"]
        );
        return response.results.map((company) => company.properties);
      },
      {
        cacheKey: this.cacheKey("companies", "all", `limit-${limit}`),
        cacheTTL: 30 * 60 * 1000, // 30 minutes
      }
    );
  }

  /**
   * Create company
   */
  async createCompany(company: HubSpotCompany): Promise<HubSpotCompany> {
    return await this.executeRequest(
      "createCompany",
      async () => {
        const response = await this.client.crm.companies.basicApi.create({
          properties: company,
        });

        await this.invalidateCache("companies:*");
        return response.properties;
      },
      {
        skipCache: true,
        priority: 7,
      }
    );
  }

  // ==================== SYNC METHODS ====================

  private async syncContacts(): Promise<HubSpotContact[]> {
    const contacts = await this.getContacts(500);
    logInfo("Contacts synced from HubSpot", { count: contacts.length });
    return contacts;
  }

  private async syncDeals(): Promise<HubSpotDeal[]> {
    const deals = await this.getDeals(500);
    logInfo("Deals synced from HubSpot", { count: deals.length });
    return deals;
  }

  private async syncCompanies(): Promise<HubSpotCompany[]> {
    const companies = await this.getCompanies(500);
    logInfo("Companies synced from HubSpot", { count: companies.length });
    return companies;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (
      !this.credentials.refreshToken ||
      !this.credentials.clientId ||
      !this.credentials.clientSecret
    ) {
      throw new Error("Missing credentials for token refresh");
    }

    try {
      const response = await fetch("https://api.hubapi.com/oauth/v1/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          refresh_token: this.credentials.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();

      this.updateCredentials({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || this.credentials.refreshToken,
      });

      this.client = new Client({
        accessToken: data.access_token,
      });

      logInfo("HubSpot access token refreshed");
    } catch (error: any) {
      logError(error, { message: "Failed to refresh HubSpot access token" });
      throw error;
    }
  }
}

export default HubSpotClient;
