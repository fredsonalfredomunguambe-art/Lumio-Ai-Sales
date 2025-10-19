"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * Theme Provider with optimized configuration
 * - Prevents FOUC (Flash of Unstyled Content)
 * - Respects system preferences
 * - Persists user choice in localStorage
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={true}
      storageKey="lumio-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
