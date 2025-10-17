import { NextRequest } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class MemoryStore {
  private store: RateLimitStore = {};

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const record = this.store[key];
    if (!record || record.resetTime < Date.now()) {
      delete this.store[key];
      return null;
    }
    return record;
  }

  async set(
    key: string,
    value: { count: number; resetTime: number }
  ): Promise<void> {
    this.store[key] = value;
  }

  async increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;

    const existing = await this.get(key);
    if (!existing) {
      const newRecord = { count: 1, resetTime };
      await this.set(key, newRecord);
      return newRecord;
    }

    existing.count++;
    await this.set(key, existing);
    return existing;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
}

const defaultStore = new MemoryStore();

// Cleanup expired entries every 10 minutes
setInterval(() => defaultStore.cleanup(), 10 * 60 * 1000);

export class RateLimit {
  private config: RateLimitConfig;
  private store: MemoryStore;

  constructor(config: RateLimitConfig, store?: MemoryStore) {
    this.config = config;
    this.store = store || defaultStore;
  }

  async check(
    req: NextRequest,
    userId: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(req)
      : `rate-limit:${userId}`;

    const result = await this.store.increment(key, this.config.windowMs);
    const allowed = result.count <= this.config.max;
    const remaining = Math.max(0, this.config.max - result.count);
    const retryAfter = allowed
      ? undefined
      : Math.ceil((result.resetTime - Date.now()) / 1000);

    return {
      allowed,
      remaining,
      resetTime: result.resetTime,
      retryAfter,
    };
  }
}

// Pre-configured rate limiters
export const marvinInsightsRateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  keyGenerator: (req) =>
    `marvin-insights:${
      new URL(req.url).searchParams.get("userId") || "anonymous"
    }`,
});

export const marvinChatRateLimit = new RateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 chat messages per minute
  keyGenerator: (req) =>
    `marvin-chat:${new URL(req.url).searchParams.get("userId") || "anonymous"}`,
});
