/**
 * Advanced Cache Manager with TTL, Stale-While-Revalidate, and LRU Eviction
 * World-class caching strategy for optimal performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
  maxSize?: number; // Maximum number of entries (LRU eviction)
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_SIZE = 100;

export class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>>;
  private accessOrder: Map<string, number>; // Track access for LRU
  private maxSize: number;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.memoryCache = new Map();
    this.accessOrder = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Get data from cache
   */
  async get<T>(
    key: string,
    fetchFn?: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T | null> {
    const cached = this.memoryCache.get(key);
    const now = Date.now();

    if (cached) {
      // Update access order for LRU
      this.accessOrder.set(key, now);

      // Check if cache is still fresh
      const age = now - cached.timestamp;
      if (age < cached.ttl) {
        return cached.data;
      }

      // Cache is stale
      if (options.staleWhileRevalidate && fetchFn) {
        // Return stale data immediately, fetch fresh in background
        this.revalidateInBackground(key, fetchFn, options);
        return cached.data;
      }
    }

    // Cache miss or stale without revalidation - fetch fresh data
    if (fetchFn) {
      const freshData = await fetchFn();
      this.set(key, freshData, options.ttl);
      return freshData;
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    const now = Date.now();

    // Check if we need to evict (LRU)
    if (this.memoryCache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.memoryCache.set(key, {
      data,
      timestamp: now,
      ttl,
      stale: false,
    });

    this.accessOrder.set(key, now);
  }

  /**
   * Check if key exists and is fresh
   */
  has(key: string): boolean {
    const cached = this.memoryCache.get(key);
    if (!cached) return false;

    const age = Date.now() - cached.timestamp;
    return age < cached.ttl;
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * Invalidate by pattern (e.g., "leads/*")
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    const keysToDelete: string[] = [];

    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.invalidate(key));
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.memoryCache.clear();
    this.accessOrder.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      size: this.memoryCache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * Private: Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.invalidate(oldestKey);
    }
  }

  /**
   * Private: Revalidate in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions
  ): Promise<void> {
    try {
      const freshData = await fetchFn();
      this.set(key, freshData, options.ttl);
    } catch (error) {
      console.error(`Background revalidation failed for key: ${key}`, error);
      // Keep stale data on error
    }
  }
}

// Global cache instance
export const globalCache = new CacheManager(200);

/**
 * Cached fetch wrapper with automatic key generation
 */
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit & CacheOptions
): Promise<T> {
  const { ttl, staleWhileRevalidate, ...fetchOptions } = options || {};
  const cacheKey = `fetch:${url}:${JSON.stringify(fetchOptions)}`;

  return (await globalCache.get(
    cacheKey,
    async () => {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
    { ttl, staleWhileRevalidate }
  )) as T;
}

/**
 * React hook for cached data
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await globalCache.get(key, fetchFn, {
          ...options,
          staleWhileRevalidate: true,
        });
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key]);

  return { data, loading, error };
}

// For React import
import React from "react";

