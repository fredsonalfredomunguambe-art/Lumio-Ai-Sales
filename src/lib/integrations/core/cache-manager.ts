import { LRUCache } from "lru-cache";
import Redis from "ioredis";
import { logInfo, logError } from "@/lib/logger";

export interface CacheConfig {
  provider: string;
  l1MaxSize?: number; // L1 cache max items
  l1TTL?: number; // L1 TTL in ms
  l2TTL?: number; // L2 (Redis) TTL in seconds
  enableL3?: boolean; // Database cache
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  source: "l1" | "l2" | "l3";
}

export interface CacheStats {
  l1: {
    size: number;
    maxSize: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
  l2: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  totalHits: number;
  totalMisses: number;
  overallHitRate: number;
}

// Default cache configurations by data type
export const CACHE_TTL_CONFIGS = {
  "user-profile": {
    l1TTL: 30 * 60 * 1000, // 30 minutes
    l2TTL: 60 * 60, // 1 hour
  },
  "contact-list": {
    l1TTL: 15 * 60 * 1000, // 15 minutes
    l2TTL: 30 * 60, // 30 minutes
  },
  products: {
    l1TTL: 5 * 60 * 1000, // 5 minutes
    l2TTL: 15 * 60, // 15 minutes
  },
  orders: {
    l1TTL: 1 * 60 * 1000, // 1 minute
    l2TTL: 5 * 60, // 5 minutes
  },
  "real-time": {
    l1TTL: 0, // No cache
    l2TTL: 0,
  },
  "long-term": {
    l1TTL: 60 * 60 * 1000, // 1 hour
    l2TTL: 24 * 60 * 60, // 24 hours
  },
};

export class CacheManager {
  private l1Cache: LRUCache<string, any>;
  private l2Cache: Redis | null = null;
  private stats: Map<string, CacheStats> = new Map();
  private readonly DEFAULT_L1_MAX_SIZE = 500;
  private readonly DEFAULT_L1_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(redisUrl?: string) {
    // Initialize L1 (in-memory) cache
    this.l1Cache = new LRUCache({
      max: this.DEFAULT_L1_MAX_SIZE,
      ttl: this.DEFAULT_L1_TTL,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // Initialize L2 (Redis) cache if URL provided
    if (redisUrl || process.env.REDIS_URL) {
      try {
        this.l2Cache = new Redis(redisUrl || process.env.REDIS_URL!, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });

        this.l2Cache.on("error", (error) => {
          logError(error, { message: "Redis cache error" });
        });

        this.l2Cache.on("connect", () => {
          logInfo("Redis cache connected");
        });

        logInfo("Cache manager initialized with Redis");
      } catch (error: any) {
        logError(error, { message: "Failed to initialize Redis cache" });
      }
    } else {
      logInfo("Cache manager initialized without Redis (L1 only)");
    }
  }

  /**
   * Get value from cache (checks L1, then L2)
   */
  async get<T>(key: string, provider: string): Promise<T | null> {
    this.initializeStats(provider);
    const stats = this.stats.get(provider)!;

    // Try L1 cache first (in-memory)
    const l1Value = this.l1Cache.get(key);
    if (l1Value !== undefined) {
      stats.l1.hits++;
      stats.totalHits++;
      this.updateHitRates(stats);

      logInfo("Cache hit (L1)", { provider, key });
      return l1Value as T;
    }

    stats.l1.misses++;

    // Try L2 cache (Redis) if available
    if (this.l2Cache) {
      try {
        const l2Value = await this.l2Cache.get(key);
        if (l2Value) {
          stats.l2.hits++;
          stats.totalHits++;
          this.updateHitRates(stats);

          // Populate L1 cache from L2
          const parsed = JSON.parse(l2Value);
          this.l1Cache.set(key, parsed);

          logInfo("Cache hit (L2)", { provider, key });
          return parsed as T;
        }
        stats.l2.misses++;
      } catch (error: any) {
        logError(error, {
          message: "Error reading from L2 cache",
          provider,
          key,
        });
      }
    }

    stats.totalMisses++;
    this.updateHitRates(stats);

    logInfo("Cache miss", { provider, key });
    return null;
  }

  /**
   * Set value in cache (L1 and optionally L2)
   */
  async set<T>(
    key: string,
    value: T,
    provider: string,
    options?: {
      ttl?: number; // TTL in milliseconds
      l2TTL?: number; // L2 TTL in seconds
      skipL2?: boolean;
    }
  ): Promise<void> {
    try {
      // Set in L1 cache
      const l1TTL = options?.ttl || this.DEFAULT_L1_TTL;
      this.l1Cache.set(key, value, { ttl: l1TTL });

      // Set in L2 cache (Redis) if available and not skipped
      if (this.l2Cache && !options?.skipL2) {
        const l2TTL = options?.l2TTL || Math.floor(l1TTL / 1000);
        await this.l2Cache.setex(key, l2TTL, JSON.stringify(value));
      }

      logInfo("Cache set", {
        provider,
        key,
        l1TTL,
        l2TTL: options?.l2TTL,
      });
    } catch (error: any) {
      logError(error, {
        message: "Error setting cache",
        provider,
        key,
      });
    }
  }

  /**
   * Delete value from cache (both L1 and L2)
   */
  async delete(key: string, provider: string): Promise<void> {
    try {
      // Delete from L1
      this.l1Cache.delete(key);

      // Delete from L2
      if (this.l2Cache) {
        await this.l2Cache.del(key);
      }

      logInfo("Cache deleted", { provider, key });
    } catch (error: any) {
      logError(error, {
        message: "Error deleting from cache",
        provider,
        key,
      });
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string, provider: string): Promise<number> {
    let deletedCount = 0;

    try {
      // Clear from L1 cache
      const l1Keys = Array.from(this.l1Cache.keys());
      const regex = new RegExp(pattern);

      for (const key of l1Keys) {
        if (regex.test(key)) {
          this.l1Cache.delete(key);
          deletedCount++;
        }
      }

      // Clear from L2 cache
      if (this.l2Cache) {
        const l2Keys = await this.l2Cache.keys(pattern);
        if (l2Keys.length > 0) {
          const deleted = await this.l2Cache.del(...l2Keys);
          deletedCount += deleted;
        }
      }

      logInfo("Cache cleared by pattern", {
        provider,
        pattern,
        deletedCount,
      });

      return deletedCount;
    } catch (error: any) {
      logError(error, {
        message: "Error clearing cache by pattern",
        provider,
        pattern,
      });
      return deletedCount;
    }
  }

  /**
   * Clear all cache for a provider
   */
  async clearProvider(provider: string): Promise<void> {
    await this.clearByPattern(`${provider}:*`, provider);
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    try {
      // Clear L1
      this.l1Cache.clear();

      // Clear L2
      if (this.l2Cache) {
        await this.l2Cache.flushdb();
      }

      logInfo("All caches cleared");
    } catch (error: any) {
      logError(error, { message: "Error clearing all caches" });
    }
  }

  /**
   * Get or set pattern (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    provider: string,
    fetchFn: () => Promise<T>,
    options?: {
      ttl?: number;
      l2TTL?: number;
    }
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key, provider);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and set
    try {
      const value = await fetchFn();
      await this.set(key, value, provider, options);
      return value;
    } catch (error: any) {
      logError(error, {
        message: "Error in getOrSet",
        provider,
        key,
      });
      throw error;
    }
  }

  /**
   * Warm cache with data
   */
  async warm<T>(
    items: Array<{ key: string; value: T }>,
    provider: string,
    options?: {
      ttl?: number;
      l2TTL?: number;
    }
  ): Promise<void> {
    try {
      const promises = items.map(({ key, value }) =>
        this.set(key, value, provider, options)
      );

      await Promise.all(promises);

      logInfo("Cache warmed", {
        provider,
        count: items.length,
      });
    } catch (error: any) {
      logError(error, {
        message: "Error warming cache",
        provider,
      });
    }
  }

  /**
   * Generate cache key
   */
  generateKey(provider: string, ...parts: string[]): string {
    return `${provider}:${parts.join(":")}`;
  }

  /**
   * Get cache statistics
   */
  getStats(provider?: string): CacheStats | Map<string, CacheStats> {
    if (provider) {
      return this.stats.get(provider) || this.createEmptyStats();
    }
    return new Map(this.stats);
  }

  /**
   * Get L1 cache info
   */
  getL1Info(): { size: number; maxSize: number } {
    return {
      size: this.l1Cache.size,
      maxSize: this.l1Cache.max,
    };
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.l2Cache?.status === "ready";
  }

  /**
   * Initialize stats for a provider
   */
  private initializeStats(provider: string): void {
    if (!this.stats.has(provider)) {
      this.stats.set(provider, this.createEmptyStats());
    }
  }

  /**
   * Create empty stats object
   */
  private createEmptyStats(): CacheStats {
    return {
      l1: {
        size: 0,
        maxSize: this.DEFAULT_L1_MAX_SIZE,
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
      l2: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
      totalHits: 0,
      totalMisses: 0,
      overallHitRate: 0,
    };
  }

  /**
   * Update hit rates
   */
  private updateHitRates(stats: CacheStats): void {
    // L1 hit rate
    const l1Total = stats.l1.hits + stats.l1.misses;
    stats.l1.hitRate = l1Total > 0 ? stats.l1.hits / l1Total : 0;

    // L2 hit rate
    const l2Total = stats.l2.hits + stats.l2.misses;
    stats.l2.hitRate = l2Total > 0 ? stats.l2.hits / l2Total : 0;

    // Overall hit rate
    const overallTotal = stats.totalHits + stats.totalMisses;
    stats.overallHitRate =
      overallTotal > 0 ? stats.totalHits / overallTotal : 0;

    // Update L1 size
    stats.l1.size = this.l1Cache.size;
  }

  /**
   * Reset stats for a provider
   */
  resetStats(provider: string): void {
    this.stats.set(provider, this.createEmptyStats());
    logInfo("Cache stats reset", { provider });
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.l2Cache) {
      await this.l2Cache.quit();
      logInfo("Cache manager disconnected from Redis");
    }
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(redisUrl?: string): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager(redisUrl);
  }
  return cacheManagerInstance;
}

export default getCacheManager;
