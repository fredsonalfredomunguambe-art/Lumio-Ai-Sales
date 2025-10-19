"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cardVariants, type CardVariants } from "@/lib/theme/variants";

interface CardProps extends CardVariants {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  hover = false,
  className = "",
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding, hover }),
        onClick && "cursor-pointer",
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
        "mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800",
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
        "text-lg font-semibold text-gray-900 dark:text-zinc-50 font-outfit",
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
        "text-sm text-gray-500 dark:text-zinc-400 mt-1 font-outfit",
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
        "mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800",
        className
      )}
    >
      {children}
    </div>
  );
}
