"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeProvider() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return {
    theme,
    setTheme,
    resolvedTheme,
    mounted,
    toggleTheme,
    isDark,
  };
}
