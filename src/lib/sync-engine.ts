import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@/generated/prisma";
import { logSyncEvent, logError } from "./logger";
import { decryptCredentials } from "./encryption";

const prisma = new PrismaClient();

// Redis connection for BullMQ
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
});

// Job queue configuration
export const syncQueue = new Queue("integration-sync", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export interface SyncJobData {
  userId: string;
  integrationId: string;
  syncType: "full" | "incremental" | "manual";
  priority?: "low" | "normal" | "high" | "critical";
  metadata?: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsDeleted: number;
  errors: string[];
  duration: number;
  nextSync?: Date;
}

// Integration-specific sync handlers
const syncHandlers = {
  hubspot: async (credentials: any, syncType: string): Promise<SyncResult> => {
    // HubSpot sync implementation
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      errors: [],
      duration: 0,
    };

    try {
      // Implement HubSpot API calls
      logSyncEvent("info", "Starting HubSpot sync", { syncType });

      // Simulate sync process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      result.recordsProcessed = 100;
      result.recordsCreated = 10;
      result.recordsUpdated = 85;
      result.recordsDeleted = 5;
      result.duration = Date.now() - startTime;

      logSyncEvent("info", "HubSpot sync completed", {
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
      logError(error as Error, { integration: "hubspot" });
    }

    return result;
  },

  salesforce: async (
    credentials: any,
    syncType: string
  ): Promise<SyncResult> => {
    // Salesforce sync implementation
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      errors: [],
      duration: 0,
    };

    try {
      logSyncEvent("info", "Starting Salesforce sync", { syncType });

      // Implement Salesforce API calls
      await new Promise((resolve) => setTimeout(resolve, 1500));

      result.recordsProcessed = 200;
      result.recordsCreated = 25;
      result.recordsUpdated = 170;
      result.recordsDeleted = 5;
      result.duration = Date.now() - startTime;

      logSyncEvent("info", "Salesforce sync completed", {
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
      logError(error as Error, { integration: "salesforce" });
    }

    return result;
  },

  shopify: async (credentials: any, syncType: string): Promise<SyncResult> => {
    // Shopify sync implementation
    const startTime = Date.now();
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsDeleted: 0,
      errors: [],
      duration: 0,
    };

    try {
      logSyncEvent("info", "Starting Shopify sync", { syncType });

      // Implement Shopify API calls
      await new Promise((resolve) => setTimeout(resolve, 800));

      result.recordsProcessed = 50;
      result.recordsCreated = 5;
      result.recordsUpdated = 40;
      result.recordsDeleted = 5;
      result.duration = Date.now() - startTime;

      logSyncEvent("info", "Shopify sync completed", {
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });
    } catch (error) {
      result.success = false;
      result.errors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
      logError(error as Error, { integration: "shopify" });
    }

    return result;
  },
};

// Worker to process sync jobs
export const syncWorker = new Worker(
  "integration-sync",
  async (job: Job<SyncJobData>) => {
    const { userId, integrationId, syncType, priority = "normal" } = job.data;

    logSyncEvent("info", "Processing sync job", {
      userId,
      integrationId,
      syncType,
      priority,
      jobId: job.id,
    });

    try {
      // Get integration connection
      const connection = await prisma.integrationConnection.findFirst({
        where: {
          userId,
          integrationId,
          status: "connected",
        },
      });

      if (!connection) {
        throw new Error(
          `Integration ${integrationId} not found or not connected`
        );
      }

      // Decrypt credentials
      const credentials = decryptCredentials(connection.credentials);

      // Get sync handler
      const handler = syncHandlers[integrationId as keyof typeof syncHandlers];
      if (!handler) {
        throw new Error(`No sync handler found for ${integrationId}`);
      }

      // Perform sync
      const result = await handler(credentials, syncType);

      // Update last sync time
      await prisma.integrationConnection.update({
        where: { id: connection.id },
        data: {
          lastSync: new Date(),
          settings: JSON.stringify({
            ...JSON.parse(connection.settings || "{}"),
            lastSyncResult: result,
          }),
        },
      });

      // Schedule next sync if successful
      if (result.success && syncType === "full") {
        await scheduleNextSync(userId, integrationId, 30); // 30 minutes
      }

      logSyncEvent("info", "Sync job completed", {
        userId,
        integrationId,
        success: result.success,
        recordsProcessed: result.recordsProcessed,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      logError(error as Error, {
        userId,
        integrationId,
        syncType,
        jobId: job.id,
      });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5, // Process up to 5 sync jobs concurrently
  }
);

// Schedule a sync job
export async function scheduleSync(
  userId: string,
  integrationId: string,
  syncType: SyncJobData["syncType"] = "incremental",
  priority: SyncJobData["priority"] = "normal",
  delay: number = 0,
  metadata?: Record<string, any>
): Promise<string> {
  const job = await syncQueue.add(
    "sync-integration",
    {
      userId,
      integrationId,
      syncType,
      priority,
      metadata,
    },
    {
      delay,
      priority: priority === "critical" ? 10 : priority === "high" ? 5 : 1,
    }
  );

  logSyncEvent("info", "Sync job scheduled", {
    userId,
    integrationId,
    syncType,
    priority,
    jobId: job.id,
    delay,
  });

  return job.id!;
}

// Schedule next automatic sync
export async function scheduleNextSync(
  userId: string,
  integrationId: string,
  intervalMinutes: number = 30
): Promise<void> {
  const delay = intervalMinutes * 60 * 1000; // Convert to milliseconds

  await scheduleSync(userId, integrationId, "incremental", "normal", delay, {
    automatic: true,
  });
}

// Cancel scheduled syncs for an integration
export async function cancelScheduledSyncs(
  userId: string,
  integrationId: string
): Promise<void> {
  const jobs = await syncQueue.getJobs(["waiting", "delayed"]);

  for (const job of jobs) {
    if (
      job.data.userId === userId &&
      job.data.integrationId === integrationId
    ) {
      await job.remove();
      logSyncEvent("info", "Scheduled sync cancelled", {
        userId,
        integrationId,
        jobId: job.id,
      });
    }
  }
}

// Get sync status for an integration
export async function getSyncStatus(
  userId: string,
  integrationId: string
): Promise<{
  lastSync?: Date;
  nextSync?: Date;
  isRunning: boolean;
  queuePosition?: number;
}> {
  const connection = await prisma.integrationConnection.findFirst({
    where: { userId, integrationId },
  });

  const waitingJobs = await syncQueue.getJobs(["waiting", "delayed"]);
  const runningJobs = await syncQueue.getJobs(["active"]);

  const userWaitingJob = waitingJobs.find(
    (job) =>
      job.data.userId === userId && job.data.integrationId === integrationId
  );

  const userRunningJob = runningJobs.find(
    (job) =>
      job.data.userId === userId && job.data.integrationId === integrationId
  );

  return {
    lastSync: connection?.lastSync || undefined,
    nextSync: userWaitingJob?.opts.delay
      ? new Date(Date.now() + userWaitingJob.opts.delay)
      : undefined,
    isRunning: !!userRunningJob,
    queuePosition: userWaitingJob
      ? waitingJobs.indexOf(userWaitingJob) + 1
      : undefined,
  };
}

// Get queue statistics
export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    syncQueue.getWaiting(),
    syncQueue.getActive(),
    syncQueue.getCompleted(),
    syncQueue.getFailed(),
    syncQueue.getDelayed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
  };
}

// Health check for sync engine
export async function healthCheck(): Promise<{
  healthy: boolean;
  queue: boolean;
  redis: boolean;
  stats: any;
}> {
  const stats = await getQueueStats();

  let queue = true;
  let redis = true;

  try {
    await redis.ping();
  } catch {
    redis = false;
  }

  try {
    await syncQueue.isPaused();
  } catch {
    queue = false;
  }

  return {
    healthy: queue && redis,
    queue,
    redis,
    stats,
  };
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logSyncEvent("info", "Shutting down sync engine...");
  await syncWorker.close();
  await syncQueue.close();
  await redis.disconnect();
});

process.on("SIGTERM", async () => {
  logSyncEvent("info", "Terminating sync engine...");
  await syncWorker.close();
  await syncQueue.close();
  await redis.disconnect();
});

