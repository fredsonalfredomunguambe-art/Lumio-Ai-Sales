"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "ghost" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
  hover = false,
}: CardProps) {
  const baseStyles = "rounded-xl transition-all duration-200";

  const variants = {
    default:
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    ghost: "bg-transparent",
    bordered:
      "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600",
    elevated:
      "bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const hoverStyles = hover
    ? "cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5"
    : "";

  const clickableStyles = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverStyles,
        clickableStyles,
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 pb-4 border-b border-gray-100 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors",
        className
      )}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = "",
}: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors",
        className
      )}
    >
      {children}
    </p>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-gray-100 dark:border-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}
