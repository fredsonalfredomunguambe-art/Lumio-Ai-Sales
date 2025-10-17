/**
 * useMarvinContext Hook
 * Manages unified Marvin context with real-time updates
 */

import { useState, useEffect, useCallback } from "react";
import type { MarvinUnifiedContext } from "@/types/marvin-context";

interface UseMarvinContextOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function useMarvinContext(options: UseMarvinContextOptions = {}) {
  const { autoRefresh = true, refreshInterval = 120000 } = options; // 2 min default

  const [context, setContext] = useState<MarvinUnifiedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchContext = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/marvin/context${refresh ? "?refresh=true" : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setContext(data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || "Failed to fetch context");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch context";
      setError(errorMessage);
      console.error("Error fetching Marvin context:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshContext = useCallback(() => {
    return fetchContext(true);
  }, [fetchContext]);

  // Initial load
  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchContext();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchContext]);

  return {
    context,
    loading,
    error,
    lastUpdated,
    refreshContext,
  };
}

/**
 * Get insight count from context for a specific category
 */
export function getInsightCount(
  context: MarvinUnifiedContext | null,
  category?: string
): number {
  if (!context) return 0;

  const opportunities = context.crossInsights.urgentOpportunities;

  if (!category) {
    return opportunities.length;
  }

  return opportunities.filter((opp) => opp.type === category).length;
}

/**
 * Get priority count from context
 */
export function getPriorityCount(
  context: MarvinUnifiedContext | null,
  priority: "critical" | "high" | "medium"
): number {
  if (!context) return 0;

  return context.crossInsights.urgentOpportunities.filter(
    (opp) => opp.priority === priority
  ).length;
}

/**
 * Check if context has critical issues
 */
export function hasCriticalIssues(
  context: MarvinUnifiedContext | null
): boolean {
  if (!context) return false;

  return (
    context.crossInsights.urgentOpportunities.some(
      (opp) => opp.priority === "critical"
    ) || context.crossInsights.pipelineHealth.overall < 50
  );
}







