"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { badgeVariants, type BadgeVariants } from "@/lib/theme/variants";

interface BadgeProps extends BadgeVariants {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  icon,
  dot = false,
}: BadgeProps) {
  const dotColors = {
    default: "bg-gray-500 dark:bg-zinc-500",
    primary: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-purple-500",
    ghost: "bg-gray-400 dark:bg-zinc-400",
  };

  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        ></span>
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
