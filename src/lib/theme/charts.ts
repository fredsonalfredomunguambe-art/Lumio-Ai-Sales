/**
 * Elite Chart Theme Configuration
 * Enhanced Recharts styling for premium dark mode
 */

import { colors, chartColors } from "./colors";

/**
 * Get chart colors based on theme
 */
export const getChartColors = (isDark: boolean) => ({
  // Primary data series colors
  primary: isDark ? "#60a5fa" : "#3b82f6", // blue-400 : blue-500
  secondary: isDark ? "#34d399" : "#10b981", // green-400 : green-500
  tertiary: isDark ? "#fbbf24" : "#f59e0b", // yellow-400 : yellow-500
  quaternary: isDark ? "#a78bfa" : "#8b5cf6", // purple-400 : purple-500
  quinary: isDark ? "#f87171" : "#ef4444", // red-400 : red-500

  // Additional categorical colors
  categorical: isDark
    ? [
        "#60a5fa", // blue
        "#34d399", // green
        "#fbbf24", // yellow
        "#a78bfa", // purple
        "#f87171", // red
        "#22d3ee", // cyan
        "#f472b6", // pink
        "#a3e635", // lime
      ]
    : [
        "#3b82f6", // blue
        "#10b981", // green
        "#f59e0b", // yellow
        "#8b5cf6", // purple
        "#ef4444", // red
        "#06b6d4", // cyan
        "#ec4899", // pink
        "#84cc16", // lime
      ],

  // Text colors
  text: isDark ? "#fafafa" : "#1f2937", // zinc-50 : gray-800
  textSecondary: isDark ? "#a1a1aa" : "#6b7280", // zinc-400 : gray-500
  textMuted: isDark ? "#71717a" : "#9ca3af", // zinc-500 : gray-400

  // Grid and axis
  grid: isDark ? "#27272a" : "#e5e7eb", // zinc-800 : gray-200
  axis: isDark ? "#52525b" : "#6b7280", // zinc-600 : gray-500

  // Tooltip
  tooltipBg: isDark ? "#18181b" : "#ffffff", // zinc-900 : white
  tooltipBorder: isDark ? "#27272a" : "#e5e7eb", // zinc-800 : gray-200
  tooltipText: isDark ? "#fafafa" : "#1f2937", // zinc-50 : gray-800

  // Background
  background: isDark ? "transparent" : "#ffffff",
  cardBackground: isDark ? "#18181b" : "#ffffff", // zinc-900 : white
});

/**
 * Chart configuration for Recharts
 */
export const chartConfig = {
  light: {
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    gridColor: "#e5e7eb",
    axisColor: "#6b7280",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e5e7eb",
  },
  dark: {
    backgroundColor: "transparent",
    textColor: "#fafafa",
    gridColor: "#27272a",
    axisColor: "#52525b",
    tooltipBg: "#18181b",
    tooltipBorder: "#27272a",
  },
};

/**
 * Default chart margins for consistent spacing
 */
export const defaultMargins = {
  top: 10,
  right: 10,
  bottom: 5,
  left: 0,
};

/**
 * Responsive chart container styles
 */
export const chartContainerStyles = {
  width: "100%",
  height: "100%",
  minHeight: "300px",
};

/**
 * Tooltip style configuration
 */
export const getTooltipStyle = (isDark: boolean) => ({
  contentStyle: {
    backgroundColor: isDark ? "#18181b" : "#ffffff",
    border: `1px solid ${isDark ? "#27272a" : "#e5e7eb"}`,
    borderRadius: "8px",
    padding: "12px",
    boxShadow: isDark
      ? "0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)"
      : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  labelStyle: {
    color: isDark ? "#fafafa" : "#1f2937",
    fontWeight: 600,
    marginBottom: "4px",
  },
  itemStyle: {
    color: isDark ? "#a1a1aa" : "#6b7280",
    fontSize: "13px",
  },
});

/**
 * Legend style configuration
 */
export const getLegendStyle = (isDark: boolean) => ({
  wrapperStyle: {
    paddingTop: "20px",
  },
  iconType: "circle" as const,
});

/**
 * Axis style configuration
 */
export const getAxisStyle = (isDark: boolean) => ({
  tick: {
    fill: isDark ? "#a1a1aa" : "#6b7280",
    fontSize: 12,
  },
  axisLine: {
    stroke: isDark ? "#27272a" : "#e5e7eb",
  },
  tickLine: {
    stroke: isDark ? "#27272a" : "#e5e7eb",
  },
});

/**
 * Grid style configuration
 */
export const getGridStyle = (isDark: boolean) => ({
  stroke: isDark ? "#27272a" : "#e5e7eb",
  strokeWidth: 1,
  strokeDasharray: "3 3",
});

/**
 * Area chart gradient definitions
 */
export const getAreaGradients = (isDark: boolean) => [
  {
    id: "colorBlue",
    color1: isDark ? "rgba(96, 165, 250, 0.3)" : "rgba(59, 130, 246, 0.3)",
    color2: isDark ? "rgba(96, 165, 250, 0)" : "rgba(59, 130, 246, 0)",
  },
  {
    id: "colorGreen",
    color1: isDark ? "rgba(52, 211, 153, 0.3)" : "rgba(16, 185, 129, 0.3)",
    color2: isDark ? "rgba(52, 211, 153, 0)" : "rgba(16, 185, 129, 0)",
  },
  {
    id: "colorYellow",
    color1: isDark ? "rgba(251, 191, 36, 0.3)" : "rgba(245, 158, 11, 0.3)",
    color2: isDark ? "rgba(251, 191, 36, 0)" : "rgba(245, 158, 11, 0)",
  },
  {
    id: "colorPurple",
    color1: isDark ? "rgba(167, 139, 250, 0.3)" : "rgba(139, 92, 246, 0.3)",
    color2: isDark ? "rgba(167, 139, 250, 0)" : "rgba(139, 92, 246, 0)",
  },
];

/**
 * Custom dot configuration for line charts
 */
export const getDotConfig = (isDark: boolean) => ({
  fill: isDark ? "#18181b" : "#ffffff",
  stroke: isDark ? "#60a5fa" : "#3b82f6",
  strokeWidth: 2,
  r: 4,
});

/**
 * Active dot configuration (hover state)
 */
export const getActiveDotConfig = (isDark: boolean) => ({
  fill: isDark ? "#60a5fa" : "#3b82f6",
  stroke: isDark ? "#18181b" : "#ffffff",
  strokeWidth: 2,
  r: 6,
});

/**
 * Bar chart configuration
 */
export const getBarConfig = (isDark: boolean) => ({
  radius: [6, 6, 0, 0] as [number, number, number, number],
  maxBarSize: 60,
});

/**
 * Pie/Donut chart label configuration
 */
export const getPieLabel = (isDark: boolean) => ({
  fill: isDark ? "#fafafa" : "#1f2937",
  fontSize: 12,
  fontWeight: 600,
});

/**
 * Export all configurations as a unified theme object
 */
export const createChartTheme = (isDark: boolean) => ({
  colors: getChartColors(isDark),
  config: isDark ? chartConfig.dark : chartConfig.light,
  margins: defaultMargins,
  tooltip: getTooltipStyle(isDark),
  legend: getLegendStyle(isDark),
  axis: getAxisStyle(isDark),
  grid: getGridStyle(isDark),
  gradients: getAreaGradients(isDark),
  dot: getDotConfig(isDark),
  activeDot: getActiveDotConfig(isDark),
  bar: getBarConfig(isDark),
  pieLabel: getPieLabel(isDark),
});

export type ChartTheme = ReturnType<typeof createChartTheme>;
