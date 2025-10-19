/**
 * Elite Chart Theme Configuration - DEPRECATED
 * Please use @/lib/theme/charts instead
 * This file is kept for backward compatibility
 */

import {
  getChartColors as getNewChartColors,
  chartConfig as newChartConfig,
} from "@/lib/theme/charts";

export const getChartColors = getNewChartColors;
export const chartConfig = newChartConfig;
