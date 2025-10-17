import Bull from "bull";
import { logInfo, logError } from "./logger";

// Follow-up Queue
export const followUpQueue = new Bull("follow-up", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
});

// Analytics Queue
export const analyticsQueue = new Bull("analytics", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
});

// Email Queue
export const emailQueue = new Bull("email", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
  },
});

// Processors
followUpQueue.process("send-follow-up", async (job) => {
  const {
    userId,
    customerMessage,
    marvinResponse,
    confidence,
    language,
    timestamp,
  } = job.data;

  try {
    logInfo("Processing follow-up job", { userId, confidence, language });

    // TODO: Send follow-up email
    // await sendFollowUpEmail({
    //   to: job.data.followUpEmail,
    //   customerMessage,
    //   marvinResponse,
    //   confidence,
    //   language
    // });

    logInfo("Follow-up job completed", { userId });
  } catch (error) {
    logError("Follow-up job failed", error);
    throw error;
  }
});

// Job Adders
export async function addFollowUpJob(data: any) {
  try {
    await followUpQueue.add("send-follow-up", data, {
      delay: 5000, // 5 second delay
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });
    logInfo("Follow-up job added to queue", { userId: data.userId });
  } catch (error) {
    logError("Failed to add follow-up job", error);
  }
}

export async function addAnalyticsJob(data: any) {
  try {
    await analyticsQueue.add("process-analytics", data);
    logInfo("Analytics job added to queue", { type: data.type });
  } catch (error) {
    logError("Failed to add analytics job", error);
  }
}
