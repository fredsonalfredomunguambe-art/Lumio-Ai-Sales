import Bottleneck from "bottleneck";
import { logInfo, logError } from "@/lib/logger";

export interface RateLimitConfig {
  provider: string;
  minTime: number; // Minimum time between requests (ms)
  maxConcurrent: number; // Max concurrent requests
  reservoir?: number; // Initial tokens
  reservoirRefreshAmount?: number; // Tokens to add on refresh
  reservoirRefreshInterval?: number; // Refresh interval (ms)
  highWater?: number; // Queue threshold
  strategy?: "leak" | "overflow";
}

// Provider-specific rate limit configurations
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  hubspot: {
    provider: "hubspot",
    minTime: 100, // 10 req/s for free tier
    maxConcurrent: 5,
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 10 * 1000, // 10 seconds
    highWater: 50,
    strategy: "leak",
  },
  "hubspot-paid": {
    provider: "hubspot",
    minTime: 7, // ~150 req/s for paid tier
    maxConcurrent: 10,
    reservoir: 150,
    reservoirRefreshAmount: 150,
    reservoirRefreshInterval: 1000,
    highWater: 100,
    strategy: "leak",
  },
  shopify: {
    provider: "shopify",
    minTime: 500, // 2 req/s for REST API
    maxConcurrent: 3,
    reservoir: 40, // Bucket size of 40
    reservoirRefreshAmount: 2,
    reservoirRefreshInterval: 1000,
    highWater: 20,
    strategy: "leak",
  },
  salesforce: {
    provider: "salesforce",
    minTime: 67, // ~15 req/s for SOAP
    maxConcurrent: 5,
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 10 * 1000,
    highWater: 50,
    strategy: "leak",
  },
  whatsapp: {
    provider: "whatsapp",
    minTime: 13, // ~80 msg/s
    maxConcurrent: 10,
    reservoir: 80,
    reservoirRefreshAmount: 80,
    reservoirRefreshInterval: 1000,
    highWater: 40,
    strategy: "leak",
  },
  mailchimp: {
    provider: "mailchimp",
    minTime: 100, // 10 req/s
    maxConcurrent: 5,
    reservoir: 10,
    reservoirRefreshAmount: 10,
    reservoirRefreshInterval: 1000,
    highWater: 20,
    strategy: "leak",
  },
  slack: {
    provider: "slack",
    minTime: 1000, // 1 req/s (Tier 1)
    maxConcurrent: 1,
    reservoir: 1,
    reservoirRefreshAmount: 1,
    reservoirRefreshInterval: 1000,
    highWater: 10,
    strategy: "leak",
  },
  "slack-tier4": {
    provider: "slack",
    minTime: 50, // 20 req/s (Tier 4)
    maxConcurrent: 5,
    reservoir: 20,
    reservoirRefreshAmount: 20,
    reservoirRefreshInterval: 1000,
    highWater: 50,
    strategy: "leak",
  },
  linkedin: {
    provider: "linkedin",
    minTime: 1000, // Very conservative for free tier
    maxConcurrent: 1,
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 24 * 60 * 60 * 1000, // Daily limit
    highWater: 10,
    strategy: "overflow",
  },
  pipedrive: {
    provider: "pipedrive",
    minTime: 100, // Conservative estimate
    maxConcurrent: 3,
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 10 * 1000,
    highWater: 30,
    strategy: "leak",
  },
};

export class RateLimiter {
  private limiters: Map<string, Bottleneck> = new Map();
  private metrics: Map<string, RateLimitMetrics> = new Map();

  constructor() {
    this.initializeLimiters();
  }

  private initializeLimiters(): void {
    for (const [key, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
      const limiter = new Bottleneck({
        minTime: config.minTime,
        maxConcurrent: config.maxConcurrent,
        reservoir: config.reservoir,
        reservoirRefreshAmount: config.reservoirRefreshAmount,
        reservoirRefreshInterval: config.reservoirRefreshInterval,
        highWater: config.highWater,
        strategy: config.strategy as any,
      });

      // Setup event listeners for monitoring
      this.setupLimiterEvents(limiter, config.provider);

      this.limiters.set(key, limiter);
      this.metrics.set(key, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        throttledRequests: 0,
        averageWaitTime: 0,
        lastResetTime: new Date(),
      });
    }

    logInfo("Rate limiters initialized", {
      providers: Array.from(this.limiters.keys()),
    });
  }

  private setupLimiterEvents(limiter: Bottleneck, provider: string): void {
    limiter.on("failed", async (error, jobInfo) => {
      logError(new Error(`Rate limit job failed: ${error.message}`), {
        provider,
        jobId: jobInfo.options.id,
        retries: jobInfo.retryCount,
      });
    });

    limiter.on("retry", (error, jobInfo) => {
      logInfo("Retrying rate-limited request", {
        provider,
        error: error.message,
        attempt: jobInfo.retryCount,
      });
    });

    limiter.on("depleted", () => {
      logInfo("Rate limiter reservoir depleted", { provider });
    });

    limiter.on("dropped", (dropped) => {
      logError(new Error("Rate limit job dropped"), {
        provider,
        dropped,
      });
    });
  }

  /**
   * Schedule a function with rate limiting
   */
  async schedule<T>(
    provider: string,
    fn: () => Promise<T>,
    options?: {
      priority?: number;
      id?: string;
      weight?: number;
    }
  ): Promise<T> {
    const limiter = this.getLimiter(provider);
    const metrics = this.metrics.get(provider);

    if (!limiter || !metrics) {
      throw new Error(`Rate limiter not found for provider: ${provider}`);
    }

    const startTime = Date.now();
    metrics.totalRequests++;

    try {
      const result = await limiter.schedule(
        {
          priority: options?.priority ?? 5,
          id: options?.id,
          weight: options?.weight ?? 1,
        },
        fn
      );

      metrics.successfulRequests++;
      const waitTime = Date.now() - startTime;

      // Update average wait time (exponential moving average)
      metrics.averageWaitTime = metrics.averageWaitTime * 0.9 + waitTime * 0.1;

      return result;
    } catch (error) {
      metrics.failedRequests++;
      throw error;
    }
  }

  /**
   * Wrap a function with rate limiting
   */
  wrap<T extends (...args: any[]) => Promise<any>>(provider: string, fn: T): T {
    const limiter = this.getLimiter(provider);

    if (!limiter) {
      throw new Error(`Rate limiter not found for provider: ${provider}`);
    }

    return limiter.wrap(fn) as T;
  }

  /**
   * Get limiter for a specific provider
   */
  private getLimiter(provider: string): Bottleneck | undefined {
    // Try exact match first
    let limiter = this.limiters.get(provider);

    // If not found, try base provider name (e.g., 'slack' instead of 'slack-tier4')
    if (!limiter) {
      const baseProvider = provider.split("-")[0];
      limiter = this.limiters.get(baseProvider);
    }

    return limiter;
  }

  /**
   * Update rate limit based on API response headers
   */
  updateFromHeaders(
    provider: string,
    headers: Record<string, string | string[] | undefined>
  ): void {
    const limiter = this.getLimiter(provider);
    if (!limiter) return;

    // Provider-specific header parsing
    switch (provider) {
      case "shopify":
        this.updateShopifyLimits(limiter, headers);
        break;
      case "hubspot":
        this.updateHubSpotLimits(limiter, headers);
        break;
      case "github":
        this.updateGitHubLimits(limiter, headers);
        break;
      // Add more providers as needed
    }
  }

  private updateShopifyLimits(
    limiter: Bottleneck,
    headers: Record<string, string | string[] | undefined>
  ): void {
    const bucketSize = headers["x-shopify-shop-api-call-limit"];
    if (typeof bucketSize === "string") {
      const [current, max] = bucketSize.split("/").map(Number);
      const remaining = max - current;

      // Update reservoir if significantly different
      if (remaining < max * 0.2) {
        logInfo("Shopify rate limit approaching", {
          current,
          max,
          remaining,
        });
      }
    }
  }

  private updateHubSpotLimits(
    limiter: Bottleneck,
    headers: Record<string, string | string[] | undefined>
  ): void {
    const remaining = headers["x-hubspot-ratelimit-remaining"];
    const dailyRemaining = headers["x-hubspot-ratelimit-daily-remaining"];

    if (typeof remaining === "string") {
      const remainingNum = parseInt(remaining, 10);
      if (remainingNum < 10) {
        logInfo("HubSpot rate limit low", { remaining: remainingNum });
      }
    }
  }

  private updateGitHubLimits(
    limiter: Bottleneck,
    headers: Record<string, string | string[] | undefined>
  ): void {
    const remaining = headers["x-ratelimit-remaining"];
    const reset = headers["x-ratelimit-reset"];

    if (typeof remaining === "string" && typeof reset === "string") {
      const remainingNum = parseInt(remaining, 10);
      const resetTime = parseInt(reset, 10) * 1000;

      if (remainingNum < 100) {
        const waitTime = resetTime - Date.now();
        logInfo("GitHub rate limit low", {
          remaining: remainingNum,
          resetIn: Math.ceil(waitTime / 1000 / 60),
        });
      }
    }
  }

  /**
   * Get current metrics for a provider
   */
  getMetrics(provider: string): RateLimitMetrics | undefined {
    return this.metrics.get(provider);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, RateLimitMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Reset metrics for a provider
   */
  resetMetrics(provider: string): void {
    const metrics = this.metrics.get(provider);
    if (metrics) {
      metrics.totalRequests = 0;
      metrics.successfulRequests = 0;
      metrics.failedRequests = 0;
      metrics.throttledRequests = 0;
      metrics.averageWaitTime = 0;
      metrics.lastResetTime = new Date();
    }
  }

  /**
   * Check if a provider is currently throttled
   */
  async isThrottled(provider: string): Promise<boolean> {
    const limiter = this.getLimiter(provider);
    if (!limiter) return false;

    const counts = await limiter.counts();
    return counts.EXECUTING >= (limiter as any)._maxConcurrent;
  }

  /**
   * Get queue status for a provider
   */
  async getQueueStatus(provider: string): Promise<QueueStatus | null> {
    const limiter = this.getLimiter(provider);
    if (!limiter) return null;

    const counts = await limiter.counts();

    return {
      provider,
      queued: counts.QUEUED || 0,
      executing: counts.EXECUTING || 0,
      done: counts.DONE || 0,
      failed: counts.FAILED || 0,
    };
  }

  /**
   * Disconnect all limiters (for cleanup)
   */
  async disconnect(): Promise<void> {
    const disconnectPromises: Promise<void>[] = [];

    for (const limiter of this.limiters.values()) {
      disconnectPromises.push(limiter.disconnect());
    }

    await Promise.all(disconnectPromises);
    logInfo("All rate limiters disconnected");
  }
}

export interface RateLimitMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  throttledRequests: number;
  averageWaitTime: number;
  lastResetTime: Date;
}

export interface QueueStatus {
  provider: string;
  queued: number;
  executing: number;
  done: number;
  failed: number;
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

export default getRateLimiter;
