"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse";
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  className = "",
}: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("animate-pulse space-y-4", className)}>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
      </div>
    );
  }

  return null;
}

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "", count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200 dark:bg-zinc-800 rounded-lg",
            className
          )}
        />
      ))}
    </>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 dark:bg-zinc-800 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/3" />
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded" />
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
