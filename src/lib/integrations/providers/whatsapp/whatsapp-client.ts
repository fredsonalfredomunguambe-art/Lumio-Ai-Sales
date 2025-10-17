import {
  BaseIntegration,
  IntegrationConfig,
  IntegrationError,
} from "../../core/base-integration";
import { logInfo, logError } from "@/lib/logger";

export interface WhatsAppMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "text" | "image" | "document" | "template";
  text?: {
    body: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
  document?: {
    link: string;
    caption?: string;
    filename?: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

export interface WhatsAppIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
  };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename: string;
  };
}

export interface WhatsAppContact {
  wa_id: string;
  profile: {
    name: string;
  };
}

export default class WhatsAppClient extends BaseIntegration {
  private phoneNumberId: string;
  private businessAccountId: string;
  private apiVersion = "v18.0";

  constructor(config: IntegrationConfig) {
    super(config);

    const credentials = config.credentials as any;
    this.phoneNumberId = credentials.phoneNumberId;
    this.businessAccountId = credentials.businessAccountId;
  }

  private getBaseUrl(): string {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  }

  /**
   * Send a text message
   */
  async sendTextMessage(
    to: string,
    text: string
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const message: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""), // Remove non-digits
        type: "text",
        text: {
          body: text,
        },
      };

      const response = await fetch(`${this.getBaseUrl()}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `WhatsApp API error: ${error.error?.message || response.statusText}`,
          response.status,
          "whatsapp"
        );
      }

      const data = await response.json();

      logInfo("WhatsApp text message sent", {
        to,
        messageId: data.messages[0].id,
      });

      return {
        messageId: data.messages[0].id,
      };
    });
  }

  /**
   * Send an image message
   */
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const message: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "image",
        image: {
          link: imageUrl,
          caption,
        },
      };

      const response = await fetch(`${this.getBaseUrl()}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `WhatsApp API error: ${error.error?.message || response.statusText}`,
          response.status,
          "whatsapp"
        );
      }

      const data = await response.json();

      logInfo("WhatsApp image message sent", {
        to,
        messageId: data.messages[0].id,
        imageUrl,
      });

      return {
        messageId: data.messages[0].id,
      };
    });
  }

  /**
   * Send a document message
   */
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename?: string,
    caption?: string
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const message: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "document",
        document: {
          link: documentUrl,
          filename,
          caption,
        },
      };

      const response = await fetch(`${this.getBaseUrl()}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `WhatsApp API error: ${error.error?.message || response.statusText}`,
          response.status,
          "whatsapp"
        );
      }

      const data = await response.json();

      logInfo("WhatsApp document message sent", {
        to,
        messageId: data.messages[0].id,
        filename,
      });

      return {
        messageId: data.messages[0].id,
      };
    });
  }

  /**
   * Send a template message
   */
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string,
    components?: any[]
  ): Promise<{ messageId: string }> {
    return this.executeWithRetry(async () => {
      await this.rateLimiter.acquire();

      const message: WhatsAppMessage = {
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      };

      const response = await fetch(`${this.getBaseUrl()}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new IntegrationError(
          `WhatsApp API error: ${error.error?.message || response.statusText}`,
          response.status,
          "whatsapp"
        );
      }

      const data = await response.json();

      logInfo("WhatsApp template message sent", {
        to,
        messageId: data.messages[0].id,
        template: templateName,
      });

      return {
        messageId: data.messages[0].id,
      };
    });
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    await this.rateLimiter.acquire();

    const response = await fetch(`${this.getBaseUrl()}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${(this.config.credentials as any).accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new IntegrationError(
        `WhatsApp API error: ${error.error?.message || response.statusText}`,
        response.status,
        "whatsapp"
      );
    }

    logInfo("WhatsApp message marked as read", { messageId });
  }

  /**
   * Get media URL from media ID
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    await this.rateLimiter.acquire();

    const response = await fetch(
      `https://graph.facebook.com/${this.apiVersion}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${
            (this.config.credentials as any).accessToken
          }`,
        },
      }
    );

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to get media URL: ${response.statusText}`,
        response.status,
        "whatsapp"
      );
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * Download media from WhatsApp
   */
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    await this.rateLimiter.acquire();

    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${(this.config.credentials as any).accessToken}`,
      },
    });

    if (!response.ok) {
      throw new IntegrationError(
        `Failed to download media: ${response.statusText}`,
        response.status,
        "whatsapp"
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test by fetching business profile
      await this.rateLimiter.acquire();

      const response = await fetch(
        `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${
              (this.config.credentials as any).accessToken
            }`,
          },
        }
      );

      return response.ok;
    } catch (error) {
      logError(error as Error, { message: "WhatsApp connection test failed" });
      return false;
    }
  }
}
