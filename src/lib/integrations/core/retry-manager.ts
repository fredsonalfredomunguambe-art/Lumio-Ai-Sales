import pRetry, { AbortError, FailedAttemptError } from "p-retry";
import { logInfo, logError } from "@/lib/logger";

export interface RetryConfig {
  retries?: number;
  minTimeout?: number;
  maxTimeout?: number;
  factor?: number;
  randomize?: boolean;
  onFailedAttempt?: (error: FailedAttemptError) => void | Promise<void>;
}

export interface RetryOptions extends RetryConfig {
  provider: string;
  operation: string;
  retryableErrors?: Array<number | string>;
  nonRetryableErrors?: Array<number | string>;
}

// Default retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  minTimeout: 1000,
  maxTimeout: 30000,
  factor: 2,
  randomize: true,
};

// Provider-specific retry configurations
export const PROVIDER_RETRY_CONFIGS: Record<string, RetryConfig> = {
  hubspot: {
    retries: 4,
    minTimeout: 1000,
    maxTimeout: 16000,
    factor: 2,
    randomize: true,
  },
  shopify: {
    retries: 3,
    minTimeout: 2000,
    maxTimeout: 30000,
    factor: 2,
    randomize: true,
  },
  salesforce: {
    retries: 5,
    minTimeout: 1000,
    maxTimeout: 32000,
    factor: 2,
    randomize: true,
  },
  whatsapp: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 8000,
    factor: 2,
    randomize: true,
  },
  mailchimp: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    factor: 2,
    randomize: true,
  },
  slack: {
    retries: 3,
    minTimeout: 1000,
    maxTimeout: 10000,
    factor: 2,
    randomize: true,
  },
  linkedin: {
    retries: 2,
    minTimeout: 2000,
    maxTimeout: 10000,
    factor: 2,
    randomize: true,
  },
};

// Common retryable HTTP status codes
export const RETRYABLE_STATUS_CODES = new Set([
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
  522, // Connection Timed Out
  524, // A Timeout Occurred
]);

// Network errors that should be retried
export const RETRYABLE_ERROR_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "EADDRINUSE",
  "ECONNREFUSED",
  "EPIPE",
  "ENOTFOUND",
  "ENETUNREACH",
  "EAI_AGAIN",
]);

export class RetryManager {
  private metrics: Map<string, RetryMetrics> = new Map();

  /**
   * Execute a function with retry logic
   */
  async execute<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
    const config = this.getConfig(options.provider);
    const startTime = Date.now();

    // Initialize metrics for this provider if not exists
    if (!this.metrics.has(options.provider)) {
      this.metrics.set(options.provider, {
        totalAttempts: 0,
        successfulRetries: 0,
        failedRetries: 0,
        averageAttempts: 0,
        lastExecutionTime: new Date(),
      });
    }

    const metrics = this.metrics.get(options.provider)!;
    let attemptCount = 0;

    try {
      const result = await pRetry(
        async () => {
          attemptCount++;
          metrics.totalAttempts++;

          try {
            return await fn();
          } catch (error: any) {
            // Check if error should be retried
            if (!this.shouldRetry(error, options)) {
              throw new AbortError(error);
            }

            // Log the retry attempt
            logInfo("Retry attempt", {
              provider: options.provider,
              operation: options.operation,
              attempt: attemptCount,
              error: error.message,
              statusCode: error.response?.status,
            });

            throw error;
          }
        },
        {
          retries:
            options.retries ?? config.retries ?? DEFAULT_RETRY_CONFIG.retries!,
          minTimeout:
            options.minTimeout ??
            config.minTimeout ??
            DEFAULT_RETRY_CONFIG.minTimeout!,
          maxTimeout:
            options.maxTimeout ??
            config.maxTimeout ??
            DEFAULT_RETRY_CONFIG.maxTimeout!,
          factor:
            options.factor ?? config.factor ?? DEFAULT_RETRY_CONFIG.factor!,
          randomize:
            options.randomize ??
            config.randomize ??
            DEFAULT_RETRY_CONFIG.randomize!,
          onFailedAttempt: async (error) => {
            // Calculate backoff with jitter
            const backoff = this.calculateBackoff(
              error.attemptNumber,
              config.minTimeout!,
              config.maxTimeout!,
              config.factor!,
              config.randomize!
            );

            logError(error, {
              provider: options.provider,
              operation: options.operation,
              attempt: error.attemptNumber,
              retriesLeft: error.retriesLeft,
              nextRetryIn: backoff,
            });

            // Call custom callback if provided
            if (options.onFailedAttempt) {
              await options.onFailedAttempt(error);
            }
          },
        }
      );

      // Update metrics on success
      const duration = Date.now() - startTime;
      metrics.successfulRetries++;
      metrics.averageAttempts =
        (metrics.averageAttempts * (metrics.successfulRetries - 1) +
          attemptCount) /
        metrics.successfulRetries;
      metrics.lastExecutionTime = new Date();

      if (attemptCount > 1) {
        logInfo("Operation succeeded after retries", {
          provider: options.provider,
          operation: options.operation,
          attempts: attemptCount,
          duration,
        });
      }

      return result;
    } catch (error: any) {
      metrics.failedRetries++;

      logError(error, {
        provider: options.provider,
        operation: options.operation,
        totalAttempts: attemptCount,
        duration: Date.now() - startTime,
      });

      throw error;
    }
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetry(error: any, options: RetryOptions): boolean {
    // Check explicit non-retryable errors first
    if (options.nonRetryableErrors) {
      if (this.matchesErrorCriteria(error, options.nonRetryableErrors)) {
        return false;
      }
    }

    // Check explicit retryable errors
    if (options.retryableErrors) {
      return this.matchesErrorCriteria(error, options.retryableErrors);
    }

    // Default retry logic
    // 1. Check HTTP status code
    if (error.response?.status) {
      if (RETRYABLE_STATUS_CODES.has(error.response.status)) {
        return true;
      }

      // Don't retry client errors (4xx) except 429
      if (error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
    }

    // 2. Check network error codes
    if (error.code && RETRYABLE_ERROR_CODES.has(error.code)) {
      return true;
    }

    // 3. Check error message for common network issues
    const errorMessage = error.message?.toLowerCase() || "";
    const networkKeywords = [
      "timeout",
      "network",
      "connection",
      "econnreset",
      "socket hang up",
      "connect etimedout",
    ];

    if (networkKeywords.some((keyword) => errorMessage.includes(keyword))) {
      return true;
    }

    // 4. Provider-specific retry logic
    return this.providerSpecificRetryLogic(error, options.provider);
  }

  /**
   * Check if error matches given criteria
   */
  private matchesErrorCriteria(
    error: any,
    criteria: Array<number | string>
  ): boolean {
    for (const criterion of criteria) {
      if (typeof criterion === "number") {
        if (error.response?.status === criterion) {
          return true;
        }
      } else if (typeof criterion === "string") {
        if (
          error.code === criterion ||
          error.message?.includes(criterion) ||
          error.name === criterion
        ) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Provider-specific retry logic
   */
  private providerSpecificRetryLogic(error: any, provider: string): boolean {
    switch (provider) {
      case "shopify":
        // Shopify has throttling responses
        if (error.message?.includes("Throttled")) {
          return true;
        }
        break;

      case "salesforce":
        // Salesforce has specific error codes
        if (error.errorCode === "REQUEST_LIMIT_EXCEEDED") {
          return true;
        }
        break;

      case "hubspot":
        // HubSpot rate limiting
        if (error.message?.includes("RATE_LIMIT")) {
          return true;
        }
        break;
    }

    return false;
  }

  /**
   * Calculate backoff time with exponential backoff and jitter
   */
  private calculateBackoff(
    attempt: number,
    minTimeout: number,
    maxTimeout: number,
    factor: number,
    randomize: boolean
  ): number {
    // Exponential backoff: min * (factor ^ attempt)
    let backoff = minTimeout * Math.pow(factor, attempt - 1);

    // Cap at max timeout
    backoff = Math.min(backoff, maxTimeout);

    // Add jitter to prevent thundering herd
    if (randomize) {
      // Random jitter between 0.5x and 1.5x
      const jitter = 0.5 + Math.random();
      backoff = backoff * jitter;
    }

    return Math.floor(backoff);
  }

  /**
   * Get retry configuration for a provider
   */
  private getConfig(provider: string): RetryConfig {
    return PROVIDER_RETRY_CONFIGS[provider] || DEFAULT_RETRY_CONFIG;
  }

  /**
   * Get metrics for a provider
   */
  getMetrics(provider: string): RetryMetrics | undefined {
    return this.metrics.get(provider);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, RetryMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Reset metrics for a provider
   */
  resetMetrics(provider: string): void {
    const metrics = this.metrics.get(provider);
    if (metrics) {
      metrics.totalAttempts = 0;
      metrics.successfulRetries = 0;
      metrics.failedRetries = 0;
      metrics.averageAttempts = 0;
      metrics.lastExecutionTime = new Date();
    }
  }

  /**
   * Create a retry wrapper for a function
   */
  wrap<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: RetryOptions
  ): T {
    return (async (...args: Parameters<T>) => {
      return this.execute(() => fn(...args), options);
    }) as T;
  }
}

export interface RetryMetrics {
  totalAttempts: number;
  successfulRetries: number;
  failedRetries: number;
  averageAttempts: number;
  lastExecutionTime: Date;
}

// Singleton instance
let retryManagerInstance: RetryManager | null = null;

export function getRetryManager(): RetryManager {
  if (!retryManagerInstance) {
    retryManagerInstance = new RetryManager();
  }
  return retryManagerInstance;
}

export default getRetryManager;
