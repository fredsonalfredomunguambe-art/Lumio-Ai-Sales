import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface SalesforceLead {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Company: string;
  Title: string;
  Phone: string;
  Status: string;
  LeadSource: string;
  Industry: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceContact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Title: string;
  Phone: string;
  AccountId: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  AccountId: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
  Probability: number;
  Type: string;
  CreatedDate: string;
  LastModifiedDate: string;
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Industry: string;
  Website: string;
  Phone: string;
  NumberOfEmployees: number;
  AnnualRevenue: number;
  CreatedDate: string;
  LastModifiedDate: string;
}

export default class SalesforceClient extends BaseIntegration {
  private instanceUrl: string;
  private apiVersion = "v59.0";

  constructor(config: IntegrationConfig) {
    super(config);

    const credentials = config.credentials as any;
    this.instanceUrl =
      credentials.instanceUrl || "https://login.salesforce.com";
  }

  private getBaseUrl(): string {
    return `${this.instanceUrl}/services/data/${this.apiVersion}`;
  }

  /**
   * Execute SOQL query
   */
  async query<T = any>(soql: string): Promise<T[]> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const encodedQuery = encodeURIComponent(soql);
      const response = await fetch(
        `${this.getBaseUrl()}/query?q=${encodedQuery}`,
        {
          headers: {
            Authorization: `Bearer ${
              (this.config.credentials as any).accessToken
            }`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Salesforce API error: ${error[0]?.message || response.statusText}`,
          response.status,
          "salesforce"
        );
      }

      const data = await response.json();
      return data.records as T[];
    });
  }

  /**
   * Get all leads
   */
  async getLeads(limit = 200): Promise<SalesforceLead[]> {
    const soql = `
      SELECT Id, FirstName, LastName, Email, Company, Title, Phone, 
             Status, LeadSource, Industry, CreatedDate, LastModifiedDate
      FROM Lead
      WHERE IsDeleted = false
      ORDER BY LastModifiedDate DESC
      LIMIT ${limit}
    `;

    const leads = await this.query<SalesforceLead>(soql);

    logInfo("Salesforce leads fetched", {
      count: leads.length,
    });

    return leads;
  }

  /**
   * Get all contacts
   */
  async getContacts(limit = 200): Promise<SalesforceContact[]> {
    const soql = `
      SELECT Id, FirstName, LastName, Email, Title, Phone, AccountId,
             CreatedDate, LastModifiedDate
      FROM Contact
      WHERE IsDeleted = false
      ORDER BY LastModifiedDate DESC
      LIMIT ${limit}
    `;

    const contacts = await this.query<SalesforceContact>(soql);

    logInfo("Salesforce contacts fetched", {
      count: contacts.length,
    });

    return contacts;
  }

  /**
   * Get all opportunities
   */
  async getOpportunities(limit = 200): Promise<SalesforceOpportunity[]> {
    const soql = `
      SELECT Id, Name, AccountId, Amount, StageName, CloseDate, 
             Probability, Type, CreatedDate, LastModifiedDate
      FROM Opportunity
      WHERE IsDeleted = false AND IsClosed = false
      ORDER BY LastModifiedDate DESC
      LIMIT ${limit}
    `;

    const opportunities = await this.query<SalesforceOpportunity>(soql);

    logInfo("Salesforce opportunities fetched", {
      count: opportunities.length,
    });

    return opportunities;
  }

  /**
   * Get all accounts
   */
  async getAccounts(limit = 200): Promise<SalesforceAccount[]> {
    const soql = `
      SELECT Id, Name, Industry, Website, Phone, NumberOfEmployees,
             AnnualRevenue, CreatedDate, LastModifiedDate
      FROM Account
      WHERE IsDeleted = false
      ORDER BY LastModifiedDate DESC
      LIMIT ${limit}
    `;

    const accounts = await this.query<SalesforceAccount>(soql);

    logInfo("Salesforce accounts fetched", {
      count: accounts.length,
    });

    return accounts;
  }

  /**
   * Create a lead in Salesforce
   */
  async createLead(lead: Partial<SalesforceLead>): Promise<string> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(`${this.getBaseUrl()}/sobjects/Lead`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Salesforce API error: ${error[0]?.message || response.statusText}`,
          response.status,
          "salesforce"
        );
      }

      const data = await response.json();

      logInfo("Salesforce lead created", {
        leadId: data.id,
        email: lead.Email,
      });

      return data.id;
    });
  }

  /**
   * Update a lead in Salesforce
   */
  async updateLead(
    leadId: string,
    updates: Partial<SalesforceLead>
  ): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(
        `${this.getBaseUrl()}/sobjects/Lead/${leadId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${
              (this.config.credentials as any).accessToken
            }`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Salesforce API error: ${error[0]?.message || response.statusText}`,
          response.status,
          "salesforce"
        );
      }

      logInfo("Salesforce lead updated", {
        leadId,
      });
    });
  }

  /**
   * Get recently modified records
   */
  async getRecentlyModified(
    objectType: "Lead" | "Contact" | "Opportunity" | "Account",
    since: Date,
    limit = 200
  ): Promise<any[]> {
    const sinceIso = since.toISOString();

    const soql = `
      SELECT Id, LastModifiedDate
      FROM ${objectType}
      WHERE LastModifiedDate >= ${sinceIso}
      ORDER BY LastModifiedDate DESC
      LIMIT ${limit}
    `;

    return await this.query(soql);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const soql = "SELECT Id FROM User LIMIT 1";
      await this.query(soql);
      return true;
    } catch (error) {
      logError(error as Error, {
        message: "Salesforce connection test failed",
      });
      return false;
    }
  }
}
