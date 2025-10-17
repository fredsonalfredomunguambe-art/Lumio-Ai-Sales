import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { getRedisClient } from "@/lib/redis-client";

const prisma = new PrismaClient();

export async function GET() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
    services: {
      database: "unknown",
      redis: "unknown",
      queue: "unknown",
    },
  };

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = "healthy";
  } catch (error) {
    health.services.database = "unhealthy";
    health.status = "degraded";
  }

  try {
    // Test Redis connection
    const redis = getRedisClient();
    await redis.ping();
    health.services.redis = "healthy";
  } catch (error) {
    health.services.redis = "unhealthy";
    health.status = "degraded";
  }

  try {
    // Test queue connection
    // TODO: Add queue health check
    health.services.queue = "healthy";
  } catch (error) {
    health.services.queue = "unhealthy";
    health.status = "degraded";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
