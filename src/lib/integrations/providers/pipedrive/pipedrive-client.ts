import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface PipedrivePerson {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: Array<{ value: string; primary: boolean }>;
  phone: Array<{ value: string; primary: boolean }>;
  org_id: number;
  owner_id: number;
  add_time: string;
  update_time: string;
  visible_to: string;
  label: number;
}

export interface PipedriveDeal {
  id: number;
  title: string;
  value: number;
  currency: string;
  status: string;
  stage_id: number;
  person_id: number;
  org_id: number;
  user_id: number;
  add_time: string;
  update_time: string;
  close_time: string;
  won_time: string;
  lost_time: string;
  probability: number;
  expected_close_date: string;
}

export interface PipedriveOrganization {
  id: number;
  name: string;
  address: string;
  owner_id: number;
  add_time: string;
  update_time: string;
  visible_to: string;
  people_count: number;
  activities_count: number;
  done_activities_count: number;
  open_deals_count: number;
  won_deals_count: number;
}

export interface PipedriveActivity {
  id: number;
  subject: string;
  type: string;
  done: boolean;
  due_date: string;
  due_time: string;
  person_id: number;
  deal_id: number;
  org_id: number;
  user_id: number;
  add_time: string;
  update_time: string;
}

export default class PipedriveClient extends BaseIntegration {
  private companyDomain: string;

  constructor(config: IntegrationConfig) {
    super(config);

    const credentials = config.credentials as any;
    this.companyDomain = credentials.companyDomain || "api";
  }

  private getBaseUrl(): string {
    return `https://${this.companyDomain}.pipedrive.com/v1`;
  }

  private getApiToken(): string {
    return (
      (this.config.credentials as any).apiToken ||
      (this.config.credentials as any).accessToken
    );
  }

  /**
   * Get all persons (contacts)
   */
  async getPersons(limit = 500): Promise<PipedrivePerson[]> {
    return this.executeWithRetry(async () => {
      const persons: PipedrivePerson[] = [];
      let start = 0;
      const perPage = 100; // Pipedrive max

      while (start < limit) {
        await this.rateLimiter.acquire();

        const response = await fetch(
          `${this.getBaseUrl()}/persons?api_token=${this.getApiToken()}&start=${start}&limit=${perPage}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new IntegrationError(
            `Pipedrive API error: ${error.error || response.statusText}`,
            response.status,
            "pipedrive"
          );
        }

        const data = await response.json();

        if (!data.success || !data.data) break;

        persons.push(...data.data);

        if (data.data.length < perPage) break;
        start += perPage;
      }

      logInfo("Pipedrive persons fetched", {
        count: persons.length,
      });

      return persons;
    });
  }

  /**
   * Get all deals
   */
  async getDeals(
    limit = 500,
    status: "open" | "won" | "lost" | "all" = "all"
  ): Promise<PipedriveDeal[]> {
    return this.executeWithRetry(async () => {
      const deals: PipedriveDeal[] = [];
      let start = 0;
      const perPage = 100;

      while (start < limit) {
        await this.rateLimiter.acquire();

        const statusParam = status !== "all" ? `&status=${status}` : "";
        const response = await fetch(
          `${this.getBaseUrl()}/deals?api_token=${this.getApiToken()}&start=${start}&limit=${perPage}${statusParam}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new IntegrationError(
            `Pipedrive API error: ${error.error || response.statusText}`,
            response.status,
            "pipedrive"
          );
        }

        const data = await response.json();

        if (!data.success || !data.data) break;

        deals.push(...data.data);

        if (data.data.length < perPage) break;
        start += perPage;
      }

      logInfo("Pipedrive deals fetched", {
        count: deals.length,
        status,
      });

      return deals;
    });
  }

  /**
   * Get all organizations
   */
  async getOrganizations(limit = 500): Promise<PipedriveOrganization[]> {
    return this.executeWithRetry(async () => {
      const orgs: PipedriveOrganization[] = [];
      let start = 0;
      const perPage = 100;

      while (start < limit) {
        await this.rateLimiter.acquire();

        const response = await fetch(
          `${this.getBaseUrl()}/organizations?api_token=${this.getApiToken()}&start=${start}&limit=${perPage}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new IntegrationError(
            `Pipedrive API error: ${error.error || response.statusText}`,
            response.status,
            "pipedrive"
          );
        }

        const data = await response.json();

        if (!data.success || !data.data) break;

        orgs.push(...data.data);

        if (data.data.length < perPage) break;
        start += perPage;
      }

      logInfo("Pipedrive organizations fetched", {
        count: orgs.length,
      });

      return orgs;
    });
  }

  /**
   * Create a person (contact)
   */
  async createPerson(person: {
    name: string;
    email: string;
    phone?: string;
    org_id?: number;
  }): Promise<PipedrivePerson> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(
        `${this.getBaseUrl()}/persons?api_token=${this.getApiToken()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Pipedrive API error: ${error.error || response.statusText}`,
          response.status,
          "pipedrive"
        );
      }

      const data = await response.json();

      logInfo("Pipedrive person created", {
        personId: data.data.id,
        email: person.email,
      });

      return data.data;
    });
  }

  /**
   * Create a deal
   */
  async createDeal(deal: {
    title: string;
    value: number;
    currency: string;
    person_id?: number;
    org_id?: number;
    stage_id?: number;
  }): Promise<PipedriveDeal> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(
        `${this.getBaseUrl()}/deals?api_token=${this.getApiToken()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deal),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Pipedrive API error: ${error.error || response.statusText}`,
          response.status,
          "pipedrive"
        );
      }

      const data = await response.json();

      logInfo("Pipedrive deal created", {
        dealId: data.data.id,
        title: deal.title,
        value: deal.value,
      });

      return data.data;
    });
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimiter.acquire();

      const response = await fetch(
        `${this.getBaseUrl()}/users/me?api_token=${this.getApiToken()}`
      );

      const data = await response.json();
      return data.success;
    } catch (error) {
      logError(error as Error, { message: "Pipedrive connection test failed" });
      return false;
    }
  }
}
