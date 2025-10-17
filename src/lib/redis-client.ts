import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true, // Don't connect immediately
      connectTimeout: 1000, // 1 second timeout
    });
  }
  return redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    console.error("Redis get error:", error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds: number = 3600
): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, value);
    return true;
  } catch (error) {
    console.error("Redis set error:", error);
    return false;
  }
}

export async function cacheDelete(key: string): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error("Redis delete error:", error);
    return false;
  }
}
