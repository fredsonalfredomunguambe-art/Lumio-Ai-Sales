import { getRateLimiter } from "./rate-limiter";
import { getRetryManager, RetryOptions } from "./retry-manager";
import { getCacheManager } from "./cache-manager";
import { logInfo, logError } from "@/lib/logger";

export interface IntegrationConfig {
  provider: string;
  credentials: Record<string, any>;
  rateLimitTier?: string; // e.g., 'hubspot-paid', 'slack-tier4'
  enableCache?: boolean;
  cacheConfig?: {
    defaultTTL?: number;
    l2TTL?: number;
  };
  retryConfig?: {
    maxRetries?: number;
    retryableErrors?: Array<number | string>;
  };
}

export interface IntegrationMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: Date | null;
}

export abstract class BaseIntegration {
  protected provider: string;
  protected credentials: Record<string, any>;
  protected rateLimiter = getRateLimiter();
  protected retryManager = getRetryManager();
  protected cacheManager = getCacheManager();
  protected metrics: IntegrationMetrics;
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.provider = config.provider;
    this.credentials = config.credentials;
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
    };

    this.initialize();
  }

  /**
   * Initialize integration (override in subclasses if needed)
   */
  protected initialize(): void {
    logInfo("Integration initialized", {
      provider: this.provider,
      enableCache: this.config.enableCache ?? true,
    });
  }

  /**
   * Execute API request with rate limiting, retry, and caching
   */
  protected async executeRequest<T>(
    operation: string,
    requestFn: () => Promise<T>,
    options?: {
      skipCache?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
      priority?: number;
      retryConfig?: Partial<RetryOptions>;
    }
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Try cache first if enabled
      if (
        this.config.enableCache !== false &&
        !options?.skipCache &&
        options?.cacheKey
      ) {
        const cached = await this.cacheManager.get<T>(
          options.cacheKey,
          this.provider
        );
        if (cached !== null) {
          logInfo("Request served from cache", {
            provider: this.provider,
            operation,
            cacheKey: options.cacheKey,
          });
          return cached;
        }
      }

      // Execute with rate limiting and retry
      const result = await this.rateLimiter.schedule(
        this.config.rateLimitTier || this.provider,
        () =>
          this.retryManager.execute(requestFn, {
            provider: this.provider,
            operation,
            retries:
              options?.retryConfig?.retries ||
              this.config.retryConfig?.maxRetries,
            retryableErrors:
              options?.retryConfig?.retryableErrors ||
              this.config.retryConfig?.retryableErrors,
            ...options?.retryConfig,
          }),
        {
          priority: options?.priority,
        }
      );

      // Cache result if enabled
      if (
        this.config.enableCache !== false &&
        !options?.skipCache &&
        options?.cacheKey
      ) {
        await this.cacheManager.set(options.cacheKey, result, this.provider, {
          ttl: options?.cacheTTL || this.config.cacheConfig?.defaultTTL,
          l2TTL: this.config.cacheConfig?.l2TTL,
        });
      }

      // Update metrics
      const duration = Date.now() - startTime;
      this.metrics.successfulRequests++;
      this.metrics.averageResponseTime =
        (this.metrics.averageResponseTime *
          (this.metrics.successfulRequests - 1) +
          duration) /
        this.metrics.successfulRequests;
      this.metrics.lastRequestTime = new Date();

      logInfo("Request completed successfully", {
        provider: this.provider,
        operation,
        duration,
      });

      return result;
    } catch (error: any) {
      this.metrics.failedRequests++;

      logError(error, {
        provider: this.provider,
        operation,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Test connection to the integration
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Sync data from the integration
   */
  abstract sync(options?: any): Promise<any>;

  /**
   * Get integration health status
   */
  async getHealth(): Promise<{
    healthy: boolean;
    provider: string;
    lastCheck: Date;
    details?: any;
  }> {
    const lastCheck = new Date();

    try {
      const isHealthy = await this.testConnection();

      return {
        healthy: isHealthy,
        provider: this.provider,
        lastCheck,
        details: {
          metrics: this.metrics,
          rateLimiter: await this.rateLimiter.getQueueStatus(this.provider),
          cache: this.cacheManager.getStats(this.provider),
        },
      };
    } catch (error: any) {
      return {
        healthy: false,
        provider: this.provider,
        lastCheck,
        details: {
          error: error.message,
          metrics: this.metrics,
        },
      };
    }
  }

  /**
   * Get integration metrics
   */
  getMetrics(): IntegrationMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: null,
    };

    // Also reset rate limiter and retry manager metrics
    this.rateLimiter.resetMetrics(this.provider);
    this.retryManager.resetMetrics(this.provider);
    this.cacheManager.resetStats(this.provider);

    logInfo("Metrics reset", { provider: this.provider });
  }

  /**
   * Generate cache key helper
   */
  protected cacheKey(...parts: string[]): string {
    return this.cacheManager.generateKey(this.provider, ...parts);
  }

  /**
   * Invalidate cache by pattern
   */
  protected async invalidateCache(pattern: string): Promise<number> {
    return await this.cacheManager.clearByPattern(
      `${this.provider}:${pattern}`,
      this.provider
    );
  }

  /**
   * Clear all cache for this integration
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clearProvider(this.provider);
    logInfo("Cache cleared", { provider: this.provider });
  }

  /**
   * Update credentials
   */
  updateCredentials(credentials: Record<string, any>): void {
    this.credentials = { ...this.credentials, ...credentials };
    logInfo("Credentials updated", { provider: this.provider });
  }

  /**
   * Get provider name
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.clearCache();
    logInfo("Integration cleaned up", { provider: this.provider });
  }
}

export default BaseIntegration;
