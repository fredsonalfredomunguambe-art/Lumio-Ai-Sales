import Redis from "ioredis";

// Redis connection configuration
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: "Too many requests, please try again later",
};

// Predefined rate limits for different actions
export const RATE_LIMITS = {
  // Integration connections
  INTEGRATION_CONNECT: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    message: "Too many integration connection attempts, please wait 5 minutes",
  },

  // Integration tests
  INTEGRATION_TEST: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: "Too many integration tests, please wait 1 minute",
  },

  // API calls
  API_CALLS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: "API rate limit exceeded",
  },

  // Webhook processing
  WEBHOOK_PROCESSING: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: "Webhook processing rate limit exceeded",
  },
} as const;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (userId, IP, etc.)
 * @param action - Action being performed
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<RateLimitResult> {
  try {
    const key = `rate_limit:${action}:${identifier}`;
    const window = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${window}`;

    // Get current count for this window
    const current = await redis.get(windowKey);
    const count = current ? parseInt(current) : 0;

    if (count >= config.maxRequests) {
      const resetTime = (window + 1) * config.windowMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        message: config.message,
      };
    }

    // Increment counter
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(config.windowMs / 1000));

    const results = await pipeline.exec();
    const newCount = (results?.[0]?.[1] as number) || count + 1;

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetTime: (window + 1) * config.windowMs,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Middleware for Express/Next.js API routes
 * @param action - Action name for rate limiting
 * @param config - Custom rate limit configuration
 * @returns Middleware function
 */
export function createRateLimitMiddleware(
  action: string,
  config?: Partial<RateLimitConfig>
) {
  return async (req: any, res: any, next?: any) => {
    const identifier = req.user?.userId || req.ip || "anonymous";
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    const result = await checkRateLimit(identifier, action, fullConfig);

    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        error: result.message,
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      });
    }

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": fullConfig.maxRequests,
      "X-RateLimit-Remaining": result.remaining,
      "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
    });

    if (next) next();
  };
}

/**
 * Get rate limit status for a user
 * @param identifier - User identifier
 * @param action - Action to check
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  action: string
): Promise<{ current: number; limit: number; resetTime: number }> {
  try {
    const config =
      RATE_LIMITS[action as keyof typeof RATE_LIMITS] || DEFAULT_CONFIG;
    const key = `rate_limit:${action}:${identifier}`;
    const window = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${window}`;

    const current = await redis.get(windowKey);
    const count = current ? parseInt(current) : 0;

    return {
      current: count,
      limit: config.maxRequests,
      resetTime: (window + 1) * config.windowMs,
    };
  } catch (error) {
    console.error("Rate limit status error:", error);
    return {
      current: 0,
      limit: DEFAULT_CONFIG.maxRequests,
      resetTime: Date.now() + DEFAULT_CONFIG.windowMs,
    };
  }
}

/**
 * Reset rate limit for a specific identifier and action
 * @param identifier - User identifier
 * @param action - Action to reset
 */
export async function resetRateLimit(
  identifier: string,
  action: string
): Promise<void> {
  try {
    const key = `rate_limit:${action}:${identifier}`;
    const pattern = `${key}:*`;

    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Rate limit reset error:", error);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  redis.disconnect();
});

process.on("SIGTERM", () => {
  redis.disconnect();
});

export default redis;
