import crypto from "crypto";
import { logInfo, logError } from "@/lib/logger";

export interface WebhookVerification {
  isValid: boolean;
  error?: string;
  provider: string;
  timestamp?: number;
}

export interface WebhookConfig {
  provider: string;
  secret: string;
  algorithm?: string;
  timestampTolerance?: number; // in seconds
  headerName?: string;
  timestampHeaderName?: string;
}

export class WebhookSecurity {
  private replayCache: Map<string, number> = new Map();
  private readonly REPLAY_CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Periodic cleanup of replay cache
    setInterval(() => this.cleanupReplayCache(), this.CLEANUP_INTERVAL);
  }

  /**
   * Verify webhook signature
   */
  verify(
    payload: string | Buffer,
    signature: string,
    config: WebhookConfig
  ): WebhookVerification {
    try {
      const result = this.verifyByProvider(payload, signature, config);

      if (result.isValid) {
        logInfo("Webhook signature verified", {
          provider: config.provider,
        });
      } else {
        logError(new Error("Webhook signature verification failed"), {
          provider: config.provider,
          error: result.error,
        });
      }

      return result;
    } catch (error: any) {
      logError(error, {
        provider: config.provider,
        message: "Webhook verification error",
      });

      return {
        isValid: false,
        error: error.message,
        provider: config.provider,
      };
    }
  }

  /**
   * Provider-specific verification
   */
  private verifyByProvider(
    payload: string | Buffer,
    signature: string,
    config: WebhookConfig
  ): WebhookVerification {
    const payloadString =
      typeof payload === "string" ? payload : payload.toString();

    switch (config.provider) {
      case "hubspot":
        return this.verifyHubSpot(payloadString, signature, config.secret);

      case "shopify":
        return this.verifyShopify(payloadString, signature, config.secret);

      case "stripe":
        return this.verifyStripe(payloadString, signature, config.secret);

      case "whatsapp":
        return this.verifyWhatsApp(payloadString, signature, config.secret);

      case "slack":
        return this.verifySlack(payloadString, signature, config.secret);

      case "mailchimp":
        return this.verifyMailchimp(payloadString, signature, config.secret);

      case "salesforce":
        return this.verifySalesforce(payloadString, signature, config.secret);

      case "github":
        return this.verifyGitHub(payloadString, signature, config.secret);

      default:
        return this.verifyGenericHMAC(payloadString, signature, config);
    }
  }

  /**
   * HubSpot webhook verification
   */
  private verifyHubSpot(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const isValid = this.secureCompare(hash, signature);

    return {
      isValid,
      provider: "hubspot",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Shopify webhook verification
   */
  private verifyShopify(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload, "utf8")
      .digest("base64");

    const isValid = this.secureCompare(hash, signature);

    return {
      isValid,
      provider: "shopify",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Stripe webhook verification
   */
  private verifyStripe(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    try {
      // Stripe signature format: t=timestamp,v1=signature
      const elements = signature.split(",");
      const timestampElement = elements.find((e) => e.startsWith("t="));
      const signatureElement = elements.find((e) => e.startsWith("v1="));

      if (!timestampElement || !signatureElement) {
        return {
          isValid: false,
          provider: "stripe",
          error: "Invalid signature format",
        };
      }

      const timestamp = parseInt(timestampElement.split("=")[1], 10);
      const providedSignature = signatureElement.split("=")[1];

      // Check timestamp tolerance (5 minutes)
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - timestamp) > 300) {
        return {
          isValid: false,
          provider: "stripe",
          error: "Timestamp outside tolerance",
          timestamp,
        };
      }

      // Calculate expected signature
      const signedPayload = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(signedPayload, "utf8")
        .digest("hex");

      const isValid = this.secureCompare(expectedSignature, providedSignature);

      // Check for replay attacks
      if (
        isValid &&
        !this.checkReplayAttack(`stripe-${timestamp}`, timestamp)
      ) {
        return {
          isValid: false,
          provider: "stripe",
          error: "Possible replay attack detected",
          timestamp,
        };
      }

      return {
        isValid,
        provider: "stripe",
        error: isValid ? undefined : "Signature mismatch",
        timestamp,
      };
    } catch (error: any) {
      return {
        isValid: false,
        provider: "stripe",
        error: error.message,
      };
    }
  }

  /**
   * WhatsApp webhook verification
   */
  private verifyWhatsApp(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    // WhatsApp uses sha256 HMAC
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Signature comes with 'sha256=' prefix
    const providedSignature = signature.replace("sha256=", "");
    const isValid = this.secureCompare(expectedSignature, providedSignature);

    return {
      isValid,
      provider: "whatsapp",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Slack webhook verification
   */
  private verifySlack(
    payload: string,
    signature: string,
    secret: string,
    timestamp?: string
  ): WebhookVerification {
    if (!timestamp) {
      return {
        isValid: false,
        provider: "slack",
        error: "Timestamp required for Slack verification",
      };
    }

    // Check timestamp (5 minutes tolerance)
    const currentTime = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);

    if (Math.abs(currentTime - requestTime) > 300) {
      return {
        isValid: false,
        provider: "slack",
        error: "Timestamp outside tolerance",
        timestamp: requestTime,
      };
    }

    // Calculate signature
    const signatureBaseString = `v0:${timestamp}:${payload}`;
    const expectedSignature =
      "v0=" +
      crypto
        .createHmac("sha256", secret)
        .update(signatureBaseString)
        .digest("hex");

    const isValid = this.secureCompare(expectedSignature, signature);

    // Check replay attack
    if (isValid && !this.checkReplayAttack(`slack-${timestamp}`, requestTime)) {
      return {
        isValid: false,
        provider: "slack",
        error: "Possible replay attack detected",
        timestamp: requestTime,
      };
    }

    return {
      isValid,
      provider: "slack",
      error: isValid ? undefined : "Signature mismatch",
      timestamp: requestTime,
    };
  }

  /**
   * Mailchimp webhook verification
   */
  private verifyMailchimp(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    // Mailchimp doesn't use signature verification by default
    // Instead, it uses a webhook URL with a secret parameter
    // We'll implement basic HMAC verification if needed
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    const isValid = this.secureCompare(hash, signature);

    return {
      isValid,
      provider: "mailchimp",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Salesforce webhook verification
   */
  private verifySalesforce(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    const isValid = this.secureCompare(hash, signature);

    return {
      isValid,
      provider: "salesforce",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * GitHub webhook verification
   */
  private verifyGitHub(
    payload: string,
    signature: string,
    secret: string
  ): WebhookVerification {
    const expectedSignature =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isValid = this.secureCompare(expectedSignature, signature);

    return {
      isValid,
      provider: "github",
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Generic HMAC verification
   */
  private verifyGenericHMAC(
    payload: string,
    signature: string,
    config: WebhookConfig
  ): WebhookVerification {
    const algorithm = config.algorithm || "sha256";

    const hash = crypto
      .createHmac(algorithm, config.secret)
      .update(payload)
      .digest("hex");

    const isValid = this.secureCompare(hash, signature);

    return {
      isValid,
      provider: config.provider,
      error: isValid ? undefined : "Signature mismatch",
    };
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(a, "utf8"),
        Buffer.from(b, "utf8")
      );
    } catch {
      return false;
    }
  }

  /**
   * Check for replay attacks using timestamp
   */
  private checkReplayAttack(key: string, timestamp: number): boolean {
    // Check if we've seen this request before
    if (this.replayCache.has(key)) {
      return false; // Replay attack detected
    }

    // Add to cache
    this.replayCache.set(key, timestamp);

    // Limit cache size
    if (this.replayCache.size > this.REPLAY_CACHE_SIZE) {
      const oldestKey = this.replayCache.keys().next().value;
      this.replayCache.delete(oldestKey);
    }

    return true;
  }

  /**
   * Clean up old entries from replay cache
   */
  private cleanupReplayCache(): void {
    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = 600; // 10 minutes

    for (const [key, timestamp] of this.replayCache.entries()) {
      if (currentTime - timestamp > maxAge) {
        this.replayCache.delete(key);
      }
    }

    logInfo("Replay cache cleaned up", {
      remainingEntries: this.replayCache.size,
    });
  }

  /**
   * Validate IP address against whitelist (optional additional security)
   */
  validateIP(ip: string, whitelist: string[]): boolean {
    return whitelist.includes(ip);
  }

  /**
   * Validate webhook timestamp
   */
  validateTimestamp(
    timestamp: number,
    toleranceSeconds: number = 300
  ): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.abs(currentTime - timestamp) <= toleranceSeconds;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.replayCache.size,
      maxSize: this.REPLAY_CACHE_SIZE,
    };
  }

  /**
   * Clear replay cache (for testing)
   */
  clearCache(): void {
    this.replayCache.clear();
    logInfo("Replay cache cleared");
  }
}

// Singleton instance
let webhookSecurityInstance: WebhookSecurity | null = null;

export function getWebhookSecurity(): WebhookSecurity {
  if (!webhookSecurityInstance) {
    webhookSecurityInstance = new WebhookSecurity();
  }
  return webhookSecurityInstance;
}

export default getWebhookSecurity;
