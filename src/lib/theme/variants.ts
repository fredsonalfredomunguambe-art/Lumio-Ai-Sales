/**
 * Class Variance Authority (CVA) Component Variants
 * Unified component styling system for elite dark mode
 */

import { cva, type VariantProps } from "class-variance-authority";

/**
 * Card variants - Premium zinc-based styling
 */
export const cardVariants = cva("rounded-xl transition-all", {
  variants: {
    variant: {
      default:
        "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800",
      elevated:
        "bg-white dark:bg-zinc-900 shadow-lg border border-gray-100 dark:border-zinc-800",
      bordered:
        "bg-white dark:bg-zinc-900 border-2 border-gray-300 dark:border-zinc-700",
      ghost: "bg-transparent",
      premium:
        "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-zinc-950/50",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
      xl: "p-8",
    },
    hover: {
      true: "cursor-pointer hover:shadow-md dark:hover:shadow-zinc-900/50 hover:border-gray-300 dark:hover:border-zinc-700",
      false: "",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
    hover: false,
  },
});

/**
 * Button variants - Enhanced for dark mode
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50 transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
        outline:
          "border border-gray-300 bg-white hover:bg-gray-50 dark:border-zinc-700 dark:bg-transparent dark:text-zinc-100 dark:hover:bg-zinc-800",
        ghost: "hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-zinc-100",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-sm",
        link: "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
        premium:
          "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-md",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Badge variants - Status and category indicators
 */
export const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700",
        primary:
          "bg-blue-100 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
        success:
          "bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/20",
        warning:
          "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20",
        danger:
          "bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20",
        info: "bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
        ghost:
          "bg-transparent text-gray-600 dark:text-zinc-400 border border-gray-300 dark:border-zinc-600",
      },
      size: {
        sm: "text-xs px-2 py-0.5 gap-1",
        md: "text-sm px-2.5 py-1 gap-1.5",
        lg: "text-base px-3 py-1.5 gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Input variants - Form controls
 */
export const inputVariants = cva(
  "flex w-full rounded-lg border text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 focus:border-blue-500 dark:focus:border-blue-400",
        filled:
          "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100",
        ghost:
          "bg-transparent border-transparent hover:border-gray-300 dark:hover:border-zinc-700 text-gray-900 dark:text-zinc-100",
      },
      size: {
        sm: "h-8 px-3 py-1",
        md: "h-10 px-3 py-2",
        lg: "h-12 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Table variants - Data tables
 */
export const tableVariants = {
  wrapper:
    "w-full overflow-auto rounded-lg border border-gray-200 dark:border-zinc-800",
  table: "w-full border-collapse",
  header:
    "bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800",
  headerCell:
    "px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider",
  body: "divide-y divide-gray-200 dark:divide-zinc-800",
  row: "transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50",
  cell: "px-4 py-3 text-sm text-gray-900 dark:text-zinc-100",
  cellSecondary: "px-4 py-3 text-sm text-gray-500 dark:text-zinc-400",
} as const;

/**
 * Modal/Dialog variants
 */
export const modalVariants = {
  overlay:
    "fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity",
  content:
    "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl transition-all",
  header:
    "flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 px-6 py-4",
  title: "text-lg font-semibold text-gray-900 dark:text-zinc-50",
  description: "text-sm text-gray-500 dark:text-zinc-400 mt-1",
  body: "px-6 py-4",
  footer:
    "flex items-center justify-end gap-3 border-t border-gray-200 dark:border-zinc-800 px-6 py-4",
  close:
    "rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors",
} as const;

/**
 * Tabs variants
 */
export const tabsVariants = {
  list: "inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-zinc-900 p-1 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-800",
  trigger:
    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-gray-900 data-[state=active]:dark:text-zinc-50 data-[state=active]:shadow-sm",
  content: "mt-4",
} as const;

/**
 * Toast/Notification variants
 */
export const toastVariants = cva(
  "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100",
        success:
          "bg-white dark:bg-zinc-900 border-green-500 dark:border-green-500/50 text-gray-900 dark:text-zinc-100",
        warning:
          "bg-white dark:bg-zinc-900 border-yellow-500 dark:border-yellow-500/50 text-gray-900 dark:text-zinc-100",
        error:
          "bg-white dark:bg-zinc-900 border-red-500 dark:border-red-500/50 text-gray-900 dark:text-zinc-100",
        info: "bg-white dark:bg-zinc-900 border-blue-500 dark:border-blue-500/50 text-gray-900 dark:text-zinc-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Status indicator variants
 */
export const statusVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      status: {
        active:
          "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400",
        inactive:
          "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-400",
        pending:
          "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        error: "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400",
      },
    },
    defaultVariants: {
      status: "active",
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type ToastVariants = VariantProps<typeof toastVariants>;
export type StatusVariants = VariantProps<typeof statusVariants>;
