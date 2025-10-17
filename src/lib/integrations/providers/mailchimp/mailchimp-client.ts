import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface MailchimpAudience {
  id: string;
  web_id: number;
  name: string;
  stats: {
    member_count: number;
    unsubscribe_count: number;
    cleaned_count: number;
    member_count_since_send: number;
    open_rate: number;
    click_rate: number;
  };
  date_created: string;
}

export interface MailchimpMember {
  id: string;
  email_address: string;
  unique_email_id: string;
  status: "subscribed" | "unsubscribed" | "cleaned" | "pending";
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    [key: string]: any;
  };
  tags: MailchimpTag[];
  timestamp_signup: string;
  timestamp_opt: string;
}

export interface MailchimpTag {
  id: number;
  name: string;
}

export interface MailchimpCampaign {
  id: string;
  web_id: number;
  type: string;
  create_time: string;
  archive_url: string;
  status: string;
  emails_sent: number;
  send_time: string;
  settings: {
    subject_line: string;
    title: string;
    from_name: string;
    reply_to: string;
  };
  report_summary: {
    opens: number;
    unique_opens: number;
    open_rate: number;
    clicks: number;
    subscriber_clicks: number;
    click_rate: number;
  };
}

export default class MailchimpClient extends BaseIntegration {
  private server: string;
  private apiVersion = "3.0";

  constructor(config: IntegrationConfig) {
    super(config);

    // Extract server from API key (e.g., us1, us2, etc.)
    const credentials = config.credentials as any;
    const apiKey = credentials.apiKey || credentials.accessToken;
    this.server = apiKey.split("-")[1] || "us1";
  }

  private getBaseUrl(): string {
    return `https://${this.server}.api.mailchimp.com/${this.apiVersion}`;
  }

  private getAuthHeader(): string {
    const credentials = this.config.credentials as any;
    const apiKey = credentials.apiKey || credentials.accessToken;
    return `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`;
  }

  /**
   * Get all audiences (lists)
   */
  async getAudiences(): Promise<MailchimpAudience[]> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(`${this.getBaseUrl()}/lists`, {
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Mailchimp API error: ${error.title || response.statusText}`,
          response.status,
          "mailchimp"
        );
      }

      const data = await response.json();

      logInfo("Mailchimp audiences fetched", {
        count: data.lists.length,
      });

      return data.lists;
    });
  }

  /**
   * Get members of an audience
   */
  async getAudienceMembers(
    audienceId: string,
    count = 1000
  ): Promise<MailchimpMember[]> {
    return this.executeWithRetry(async () => {
      const members: MailchimpMember[] = [];
      let offset = 0;
      const limit = 1000; // Mailchimp max

      while (offset < count) {
        await this.rateLimiter.acquire();

        const response = await fetch(
          `${this.getBaseUrl()}/lists/${audienceId}/members?count=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: this.getAuthHeader(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new IntegrationError(
            `Mailchimp API error: ${error.title || response.statusText}`,
            response.status,
            "mailchimp"
          );
        }

        const data = await response.json();
        members.push(...data.members);

        if (data.members.length < limit) break;
        offset += limit;
      }

      logInfo("Mailchimp audience members fetched", {
        audienceId,
        count: members.length,
      });

      return members;
    });
  }

  /**
   * Add or update a member in an audience
   */
  async addOrUpdateMember(
    audienceId: string,
    email: string,
    mergeFields: Record<string, any>,
    tags: string[] = [],
    status: "subscribed" | "pending" = "subscribed"
  ): Promise<MailchimpMember> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const subscriberHash = require("crypto")
        .createHash("md5")
        .update(email.toLowerCase())
        .digest("hex");

      const response = await fetch(
        `${this.getBaseUrl()}/lists/${audienceId}/members/${subscriberHash}`,
        {
          method: "PUT",
          headers: {
            Authorization: this.getAuthHeader(),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email_address: email,
            status_if_new: status,
            merge_fields: mergeFields,
            tags: tags.map((tag) => ({ name: tag, status: "active" })),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `Mailchimp API error: ${error.title || response.statusText}`,
          response.status,
          "mailchimp"
        );
      }

      const member = await response.json();

      logInfo("Mailchimp member added/updated", {
        audienceId,
        email,
        status: member.status,
      });

      return member;
    });
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(count = 100): Promise<MailchimpCampaign[]> {
    return this.executeWithRetry(async () => {
      const campaigns: MailchimpCampaign[] = [];
      let offset = 0;
      const limit = 1000; // Mailchimp max

      while (offset < count) {
        await this.rateLimiter.acquire();

        const response = await fetch(
          `${this.getBaseUrl()}/campaigns?count=${limit}&offset=${offset}&status=sent`,
          {
            headers: {
              Authorization: this.getAuthHeader(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new IntegrationError(
            `Mailchimp API error: ${error.title || response.statusText}`,
            response.status,
            "mailchimp"
          );
        }

        const data = await response.json();
        campaigns.push(...data.campaigns);

        if (data.campaigns.length < limit) break;
        offset += limit;
      }

      logInfo("Mailchimp campaigns fetched", {
        count: campaigns.length,
      });

      return campaigns;
    });
  }

  /**
   * Get campaign report
   */
  async getCampaignReport(campaignId: string): Promise<any> {
    await this.rateLimiter.acquire();

    const response = await fetch(`${this.getBaseUrl()}/reports/${campaignId}`, {
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new IntegrationError(
        `Mailchimp API error: ${error.title || response.statusText}`,
        response.status,
        "mailchimp"
      );
    }

    return await response.json();
  }

  /**
   * Remove member from audience
   */
  async removeMember(audienceId: string, email: string): Promise<void> {
    await this.rateLimiter.acquire();

    const subscriberHash = require("crypto")
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    const response = await fetch(
      `${this.getBaseUrl()}/lists/${audienceId}/members/${subscriberHash}`,
      {
        method: "DELETE",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const error = await response.json();
      throw new IntegrationError(
        `Mailchimp API error: ${error.title || response.statusText}`,
        response.status,
        "mailchimp"
      );
    }

    logInfo("Mailchimp member removed", {
      audienceId,
      email,
    });
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimiter.acquire();

      const response = await fetch(`${this.getBaseUrl()}/ping`, {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      });

      return response.ok;
    } catch (error) {
      logError(error as Error, { message: "Mailchimp connection test failed" });
      return false;
    }
  }
}
