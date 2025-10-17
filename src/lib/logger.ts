import winston from "winston";
import path from "path";

// Log levels configuration
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colors for console output
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.stack ? "\n" + info.stack : ""
      }`
  )
);

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format: logFormat,
  defaultMeta: {
    service: "lumio-integrations",
    version: process.env.npm_package_version || "1.0.0",
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create specialized loggers for different modules
export const integrationLogger = logger.child({ module: "integrations" });
export const securityLogger = logger.child({ module: "security" });
export const syncLogger = logger.child({ module: "sync" });
export const webhookLogger = logger.child({ module: "webhooks" });

// Structured logging helpers
export interface LogContext {
  userId?: string;
  integrationId?: string;
  action?: string;
  requestId?: string;
  [key: string]: any;
}

/**
 * Log integration events with context
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context
 */
export function logIntegrationEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context: LogContext = {}
) {
  integrationLogger[level](message, {
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log security events
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context
 */
export function logSecurityEvent(
  level: "info" | "warn" | "error",
  message: string,
  context: LogContext = {}
) {
  securityLogger[level](message, {
    timestamp: new Date().toISOString(),
    severity: level === "error" ? "high" : level === "warn" ? "medium" : "low",
    ...context,
  });
}

/**
 * Log sync operations
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context
 */
export function logSyncEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context: LogContext = {}
) {
  syncLogger[level](message, {
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Log webhook events
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context
 */
export function logWebhookEvent(
  level: "info" | "warn" | "error" | "debug",
  message: string,
  context: LogContext = {}
) {
  webhookLogger[level](message, {
    timestamp: new Date().toISOString(),
    ...context,
  });
}

/**
 * Create request-scoped logger
 * @param requestId - Unique request identifier
 * @param userId - User identifier
 * @returns Scoped logger instance
 */
export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({
    requestId,
    userId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log performance metrics
 * @param operation - Operation name
 * @param duration - Duration in milliseconds
 * @param context - Additional context
 */
export function logPerformance(
  operation: string,
  duration: number,
  context: LogContext = {}
) {
  const level = duration > 5000 ? "warn" : duration > 1000 ? "info" : "debug";

  logger[level](`Performance: ${operation}`, {
    operation,
    duration,
    performance: {
      slow: duration > 1000,
      verySlow: duration > 5000,
    },
    ...context,
  });
}

/**
 * Log API requests and responses
 * @param method - HTTP method
 * @param url - Request URL
 * @param statusCode - Response status code
 * @param duration - Request duration
 * @param context - Additional context
 */
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context: LogContext = {}
) {
  const level = statusCode >= 400 ? "warn" : "info";

  logger[level](`API Request: ${method} ${url}`, {
    method,
    url,
    statusCode,
    duration,
    success: statusCode < 400,
    ...context,
  });
}

// Error logging with stack traces
export function logError(error: Error, context: LogContext = {}) {
  logger.error("Application Error", {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
}

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Application shutting down...");
  logger.end();
});

process.on("SIGTERM", () => {
  logger.info("Application terminating...");
  logger.end();
});

export default logger;
