/**
 * Recharts theme configuration for dark mode
 * Professional color palettes that work great in both light and dark modes
 */

export const getChartColors = (isDark: boolean) => ({
  primary: isDark ? "#60A5FA" : "#3B82F6", // blue-400 : blue-600
  secondary: isDark ? "#34D399" : "#10B981", // green-400 : green-600
  tertiary: isDark ? "#FBBF24" : "#F59E0B", // yellow-400 : yellow-600
  quaternary: isDark ? "#A78BFA" : "#8B5CF6", // purple-400 : purple-600
  quinary: isDark ? "#F87171" : "#EF4444", // red-400 : red-600

  // Text colors
  text: isDark ? "#F3F4F6" : "#1F2937", // gray-100 : gray-800
  textSecondary: isDark ? "#D1D5DB" : "#6B7280", // gray-300 : gray-500

  // Grid and axis colors
  grid: isDark ? "#374151" : "#E5E7EB", // gray-700 : gray-200
  axis: isDark ? "#9CA3AF" : "#6B7280", // gray-400 : gray-500

  // Tooltip colors
  tooltipBg: isDark ? "#1F2937" : "#FFFFFF", // gray-800 : white
  tooltipBorder: isDark ? "#374151" : "#E5E7EB", // gray-700 : gray-200
});

export const chartConfig = {
  light: {
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    gridColor: "#E5E7EB",
    tooltipBg: "#FFFFFF",
    tooltipBorder: "#E5E7EB",
  },
  dark: {
    backgroundColor: "#1F2937",
    textColor: "#F3F4F6",
    gridColor: "#374151",
    tooltipBg: "#1F2937",
    tooltipBorder: "#374151",
  },
};
