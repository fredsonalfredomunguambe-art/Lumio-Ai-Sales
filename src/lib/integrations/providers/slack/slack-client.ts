import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_member: boolean;
  num_members: number;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
  username?: string;
  icon_emoji?: string;
  icon_url?: string;
}

export interface SlackUser {
  id: string;
  name: string;
  real_name: string;
  profile: {
    email: string;
    display_name: string;
    image_512: string;
  };
}

export default class SlackClient extends BaseIntegration {
  constructor(config: IntegrationConfig) {
    super(config);
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${(this.config.credentials as any).accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Post a message to a channel
   */
  async postMessage(
    message: SlackMessage
  ): Promise<{ ts: string; channel: string }> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(message),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new IntegrationError(
          `Slack API error: ${data.error}`,
          response.status,
          "slack"
        );
      }

      logInfo("Slack message posted", {
        channel: message.channel,
        ts: data.ts,
      });

      return {
        ts: data.ts,
        channel: data.channel,
      };
    });
  }

  /**
   * Post a rich message with blocks
   */
  async postRichMessage(
    channel: string,
    text: string,
    blocks: any[]
  ): Promise<{ ts: string }> {
    return this.postMessage({
      channel,
      text, // Fallback text
      blocks,
    });
  }

  /**
   * Get list of channels
   */
  async getChannels(): Promise<SlackChannel[]> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch(
        "https://slack.com/api/conversations.list?exclude_archived=true&types=public_channel,private_channel",
        {
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        throw new IntegrationError(
          `Slack API error: ${data.error}`,
          response.status,
          "slack"
        );
      }

      logInfo("Slack channels fetched", {
        count: data.channels.length,
      });

      return data.channels;
    });
  }

  /**
   * Get workspace members
   */
  async getUsers(): Promise<SlackUser[]> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const response = await fetch("https://slack.com/api/users.list", {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new IntegrationError(
          `Slack API error: ${data.error}`,
          response.status,
          "slack"
        );
      }

      logInfo("Slack users fetched", {
        count: data.members.length,
      });

      return data.members;
    });
  }

  /**
   * Send a notification with action buttons
   */
  async sendNotificationWithActions(
    channel: string,
    title: string,
    message: string,
    actions: Array<{ text: string; url?: string; value?: string }>
  ): Promise<{ ts: string }> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: title,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      {
        type: "actions",
        elements: actions.map((action) => ({
          type: "button",
          text: {
            type: "plain_text",
            text: action.text,
          },
          url: action.url,
          value: action.value,
        })),
      },
    ];

    return this.postRichMessage(channel, message, blocks);
  }

  /**
   * Send a daily digest
   */
  async sendDailyDigest(
    channel: string,
    metrics: {
      newLeads: number;
      conversions: number;
      revenue: number;
      topPerformers: Array<{ name: string; conversions: number }>;
    }
  ): Promise<{ ts: string }> {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "☀️ Good Morning! Daily Summary",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📈 Yesterday's Metrics*\n• ${metrics.newLeads} new leads\n• ${
            metrics.conversions
          } conversions\n• R$ ${metrics.revenue.toLocaleString(
            "pt-BR"
          )} in revenue`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*🎯 Top Performers*\n${metrics.topPerformers
            .map((p, i) => `${i + 1}. ${p.name} - ${p.conversions} conversions`)
            .join("\n")}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Full Report",
            },
            url: "https://app.lumio.com/dashboard",
            style: "primary",
          },
        ],
      },
    ];

    return this.postRichMessage(channel, "Daily Summary", blocks);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimiter.acquire();

      const response = await fetch("https://slack.com/api/auth.test", {
        headers: this.getHeaders(),
      });

      const data = await response.json();
      return data.ok;
    } catch (error) {
      logError(error as Error, { message: "Slack connection test failed" });
      return false;
    }
  }
}
