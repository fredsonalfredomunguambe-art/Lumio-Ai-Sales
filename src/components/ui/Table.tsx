"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = "" }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        "bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800",
        className
      )}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = "" }: TableBodyProps) {
  return (
    <tbody
      className={cn("divide-y divide-gray-200 dark:divide-zinc-800", className)}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function TableRow({
  children,
  className = "",
  onClick,
  hover = true,
}: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        hover && "hover:bg-gray-50 dark:hover:bg-zinc-800/50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: "asc" | "desc" | null;
  onSort?: () => void;
}

export function TableHead({
  children,
  className = "",
  sortable = false,
  sortDirection = null,
  onSort,
}: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider font-outfit",
        sortable &&
          "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-zinc-800",
        className
      )}
      onClick={sortable ? onSort : undefined}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <span className="text-gray-400 dark:text-zinc-500">
            {sortDirection === "asc" ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : sortDirection === "desc" ? (
              <ArrowDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronsUpDown className="w-3.5 h-3.5" />
            )}
          </span>
        )}
      </div>
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-sm text-gray-900 dark:text-zinc-100 font-outfit",
        className
      )}
    >
      {children}
    </td>
  );
}
