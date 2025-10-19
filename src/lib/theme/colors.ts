/**
 * Elite Premium Dark Mode Color System
 * Zinc-based palette for world-class dark mode experience
 * Inspired by Linear, Notion, and Vercel design systems
 */

export const colors = {
  // Base backgrounds
  background: {
    primary: "#09090b", // zinc-950 - true premium dark base
    secondary: "#18181b", // zinc-900 - elevated surfaces
    tertiary: "#27272a", // zinc-800 - cards and components
  },

  // Borders
  border: {
    primary: "#27272a", // zinc-800 - main borders
    secondary: "#3f3f46", // zinc-700 - secondary borders
    subtle: "#52525b", // zinc-600 - very subtle dividers
  },

  // Text colors
  text: {
    primary: "#fafafa", // zinc-50 - high contrast text
    secondary: "#e4e4e7", // zinc-200 - body text
    tertiary: "#a1a1aa", // zinc-400 - muted text
    quaternary: "#71717a", // zinc-500 - disabled/placeholder
  },

  // Accent colors optimized for dark mode
  accent: {
    blue: {
      primary: "#3b82f6", // blue-500
      secondary: "#60a5fa", // blue-400
      dark: "#2563eb", // blue-600
      bg: "#1e3a8a", // blue-900 for backgrounds
      subtle: "#1e3a8a20", // blue-900/20 for subtle highlights
    },
    green: {
      primary: "#10b981", // green-500
      secondary: "#34d399", // green-400
      dark: "#059669", // green-600
      bg: "#064e3b", // green-900
      subtle: "#064e3b30",
    },
    yellow: {
      primary: "#f59e0b", // yellow-500
      secondary: "#fbbf24", // yellow-400
      dark: "#d97706", // yellow-600
      bg: "#78350f", // yellow-900
      subtle: "#78350f30",
    },
    red: {
      primary: "#ef4444", // red-500
      secondary: "#f87171", // red-400
      dark: "#dc2626", // red-600
      bg: "#7f1d1d", // red-900
      subtle: "#7f1d1d30",
    },
    purple: {
      primary: "#8b5cf6", // purple-500
      secondary: "#a78bfa", // purple-400
      dark: "#7c3aed", // purple-600
      bg: "#581c87", // purple-900
      subtle: "#581c8730",
    },
  },

  // Status colors
  status: {
    success: "#10b981", // green-500
    warning: "#f59e0b", // yellow-500
    error: "#ef4444", // red-500
    info: "#3b82f6", // blue-500
  },

  // Interactive states
  interactive: {
    hover: "#27272a", // zinc-800
    active: "#3f3f46", // zinc-700
    disabled: "#52525b", // zinc-600
    focus: "#3b82f6", // blue-500
  },
} as const;

/**
 * Semantic color tokens for components
 */
export const semanticColors = {
  card: {
    background: colors.background.secondary,
    border: colors.border.primary,
    hover: colors.interactive.hover,
  },

  input: {
    background: colors.background.secondary,
    border: colors.border.primary,
    focus: colors.accent.blue.primary,
    text: colors.text.primary,
    placeholder: colors.text.quaternary,
  },

  button: {
    primary: {
      bg: colors.accent.blue.primary,
      text: colors.text.primary,
      hover: colors.accent.blue.secondary,
    },
    secondary: {
      bg: colors.background.tertiary,
      text: colors.text.primary,
      hover: colors.interactive.hover,
    },
    ghost: {
      bg: "transparent",
      text: colors.text.secondary,
      hover: colors.interactive.hover,
    },
  },

  badge: {
    default: {
      bg: colors.background.tertiary,
      text: colors.text.primary,
      border: colors.border.primary,
    },
    success: {
      bg: colors.accent.green.subtle,
      text: colors.accent.green.secondary,
      border: colors.accent.green.bg,
    },
    warning: {
      bg: colors.accent.yellow.subtle,
      text: colors.accent.yellow.secondary,
      border: colors.accent.yellow.bg,
    },
    error: {
      bg: colors.accent.red.subtle,
      text: colors.accent.red.secondary,
      border: colors.accent.red.bg,
    },
  },
} as const;

/**
 * Chart colors optimized for dark mode
 */
export const chartColors = {
  primary: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"],
  categorical: [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#8b5cf6", // purple
    "#ef4444", // red
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#84cc16", // lime
  ],
  grid: colors.border.primary,
  axis: colors.text.tertiary,
  tooltip: {
    background: colors.background.secondary,
    border: colors.border.primary,
    text: colors.text.primary,
  },
} as const;

/**
 * Elevation system with shadows for dark mode
 */
export const elevation = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
  glow: "0 0 20px rgba(59, 130, 246, 0.3)", // blue glow for focus
} as const;

export type ColorTheme = typeof colors;
export type SemanticColors = typeof semanticColors;
export type ChartColors = typeof chartColors;
