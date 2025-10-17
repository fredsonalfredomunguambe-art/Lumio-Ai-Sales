import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { gatherUnifiedContext } from "@/lib/marvin-context";

// Simple in-memory cache for unified context
const contextCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

/**
 * GET - Get unified Marvin context
 * Returns complete cross-context data for elite SDR intelligence
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    const cacheKey = `marvin_unified_context:${user.id}`;

    // Try cache first (unless refresh requested)
    if (!refresh) {
      const cached = contextCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
        });
      }
    }

    // Generate fresh context
    const context = await gatherUnifiedContext(user.id);

    // Cache for 2 minutes
    contextCache.set(cacheKey, {
      data: context,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: context,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching unified context:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch context",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
