import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectPremiumIntegration } from "@/lib/premium-integrations";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";
import { logApiRequest, logIntegrationEvent, logError } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  const startTime = Date.now();
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      logApiRequest("POST", request.url, 401, Date.now() - startTime, {
        integrationId: params.integrationId,
      });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { integrationId } = params;

    // Check rate limit for integration connections
    const rateLimitResult = await checkRateLimit(
      userId,
      "INTEGRATION_CONNECT",
      RATE_LIMITS.INTEGRATION_CONNECT
    );

    if (!rateLimitResult.allowed) {
      logApiRequest("POST", request.url, 429, Date.now() - startTime, {
        userId,
        integrationId,
        rateLimited: true,
      });
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.message,
          retryAfter: Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          ),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { credentials } = body;

    if (!credentials) {
      logApiRequest("POST", request.url, 400, Date.now() - startTime, {
        userId,
        integrationId,
        error: "Missing credentials",
      });
      return NextResponse.json(
        { success: false, error: "Credentials are required" },
        { status: 400 }
      );
    }

    logIntegrationEvent("info", "API: Starting integration connection", {
      userId,
      integrationId,
      requestId: request.headers.get("x-request-id"),
    });

    // Connect the premium integration
    const success = await connectPremiumIntegration(
      userId,
      integrationId,
      credentials
    );

    const duration = Date.now() - startTime;

    if (success) {
      logApiRequest("POST", request.url, 200, duration, {
        userId,
        integrationId,
        success: true,
      });

      return NextResponse.json({
        success: true,
        message: "Integration connected successfully",
      });
    } else {
      logApiRequest("POST", request.url, 400, duration, {
        userId,
        integrationId,
        error: "Connection failed",
      });

      return NextResponse.json(
        { success: false, error: "Failed to connect integration" },
        { status: 400 }
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    logError(error as Error, {
      userId,
      integrationId: params.integrationId,
      action: "connect_integration",
      duration,
    });

    logApiRequest("POST", request.url, 500, duration, {
      userId,
      integrationId: params.integrationId,
      error: "Internal server error",
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
