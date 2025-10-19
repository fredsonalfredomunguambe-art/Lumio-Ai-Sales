import dynamic from "next/dynamic";

/**
 * Lazy load heavy components
 */
export const LazyChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  {
    loading: () => null,
    ssr: false,
  }
);

export const LazyCommandPalette = dynamic(
  () => import("@/components/CommandPalette"),
  {
    ssr: false,
  }
);

export const LazyMarvinChat = dynamic(
  () => import("@/components/marvin/MarvinChatInterface"),
  {
    ssr: false,
  }
);

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
