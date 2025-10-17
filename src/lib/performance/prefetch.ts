/**
 * Smart Prefetch - Only prefetch when truly needed
 * Reduces unnecessary prefetching on initial load
 */

let prefetchedRoutes = new Set<string>();
let hoverTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Prefetch on hover with delay (300ms)
 * Cancels if mouse leaves before delay
 */
export function prefetchOnHover(path: string, delay: number = 300) {
  if (typeof window === "undefined") return;
  if (prefetchedRoutes.has(path)) return;

  // Clear existing timeout for this path
  const existingTimeout = hoverTimeouts.get(path);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    prefetchRoute(path);
    hoverTimeouts.delete(path);
  }, delay);

  hoverTimeouts.set(path, timeout);
}

/**
 * Cancel hover prefetch (on mouse leave)
 */
export function cancelHoverPrefetch(path: string) {
  const timeout = hoverTimeouts.get(path);
  if (timeout) {
    clearTimeout(timeout);
    hoverTimeouts.delete(path);
  }
}

/**
 * Prefetch single route immediately
 */
function prefetchRoute(route: string) {
  if (typeof window === "undefined") return;
  if (prefetchedRoutes.has(route)) return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = route;
  document.head.appendChild(link);

  prefetchedRoutes.add(route);
}

/**
 * Prefetch dashboard routes - only call when user shows intent
 */
export function prefetchDashboardRoutes() {
  if (typeof window === "undefined") return;

  const routes = [
    "/dashboard",
    "/dashboard/leads",
    "/dashboard/campaigns",
    "/dashboard/insights",
    "/dashboard/calendar",
    "/dashboard/settings",
  ];

  routes.forEach((route) => prefetchRoute(route));
}

/**
 * Prefetch API data for faster page loads
 */
export async function prefetchAPIData(endpoints: string[]) {
  if (typeof window === "undefined") return;

  const promises = endpoints.map(async (endpoint) => {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      // Store in sessionStorage for instant access
      sessionStorage.setItem(`prefetch:${endpoint}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to prefetch ${endpoint}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * Get prefetched data from cache
 */
export function getPrefetchedData<T = any>(endpoint: string): T | null {
  if (typeof window === "undefined") return null;

  const cached = sessionStorage.getItem(`prefetch:${endpoint}`);
  if (!cached) return null;

  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * Clear prefetch cache
 */
export function clearPrefetchCache() {
  if (typeof window === "undefined") return;

  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.startsWith("prefetch:")) {
      sessionStorage.removeItem(key);
    }
  });
}
