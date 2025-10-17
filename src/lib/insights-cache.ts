import { createHash } from "crypto";

interface CachedInsight {
  content: string;
  timestamp: number;
  boardHash: string;
  userId: string;
  mode: string;
}

interface CacheStore {
  [key: string]: CachedInsight;
}

class InsightsCache {
  private store: CacheStore = {};
  private readonly TTL = 30 * 60 * 1000; // 30 minutes

  private generateBoardHash(tasks: any[]): string {
    // Create a hash based on task content that changes when board structure changes
    const boardData = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      order: task.order,
      // Include creation time to detect new tasks
      createdAt: task.createdAt,
    }));

    const dataString = JSON.stringify(
      boardData.sort((a, b) => a.id.localeCompare(b.id))
    );
    return createHash("md5").update(dataString).digest("hex");
  }

  private generateCacheKey(
    userId: string,
    mode: string,
    boardHash: string
  ): string {
    return `insights:${userId}:${mode}:${boardHash}`;
  }

  async get(
    userId: string,
    mode: string,
    tasks: any[]
  ): Promise<string | null> {
    const boardHash = this.generateBoardHash(tasks);
    const cacheKey = this.generateCacheKey(userId, mode, boardHash);

    const cached = this.store[cacheKey];
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.TTL) {
      delete this.store[cacheKey];
      return null;
    }

    // Check if board has changed significantly
    if (cached.boardHash !== boardHash) {
      delete this.store[cacheKey];
      return null;
    }

    console.log(`✅ Cache hit for user ${userId}, mode ${mode}`);
    return cached.content;
  }

  async set(
    userId: string,
    mode: string,
    tasks: any[],
    content: string
  ): Promise<void> {
    const boardHash = this.generateBoardHash(tasks);
    const cacheKey = this.generateCacheKey(userId, mode, boardHash);

    this.store[cacheKey] = {
      content,
      timestamp: Date.now(),
      boardHash,
      userId,
      mode,
    };

    console.log(`💾 Cached insights for user ${userId}, mode ${mode}`);
  }

  // Invalidate cache for a specific user (useful when they make changes)
  invalidateUser(userId: string): void {
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].userId === userId) {
        delete this.store[key];
      }
    });
    console.log(`🗑️ Invalidated cache for user ${userId}`);
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now - this.store[key].timestamp > this.TTL) {
        delete this.store[key];
      }
    });
    console.log(`🧹 Cleaned up expired cache entries`);
  }

  // Get cache stats for monitoring
  getStats(): {
    totalEntries: number;
    memoryUsage: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const entries = Object.values(this.store);
    const timestamps = entries.map((e) => e.timestamp);

    return {
      totalEntries: entries.length,
      memoryUsage: JSON.stringify(this.store).length, // Rough estimate
      oldestEntry: Math.min(...timestamps) || 0,
      newestEntry: Math.max(...timestamps) || 0,
    };
  }
}

// Singleton instance
export const insightsCache = new InsightsCache();

// Cleanup every 15 minutes
setInterval(() => insightsCache.cleanup(), 15 * 60 * 1000);

// Helper function to check if board has changed significantly
export function shouldRefreshInsights(
  lastInsightTime: number,
  tasks: any[],
  threshold: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  // If last insight was more than threshold ago, refresh
  if (Date.now() - lastInsightTime > threshold) {
    return true;
  }

  // If there are tasks created/updated recently, refresh
  const recentChanges = tasks.some((task) => {
    const updatedAt = new Date(task.updatedAt || task.createdAt).getTime();
    return updatedAt > lastInsightTime;
  });

  return recentChanges;
}
