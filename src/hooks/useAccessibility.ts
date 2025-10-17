"use client";

import { useEffect, useCallback, useRef } from "react";

export interface AccessibilityConfig {
  enableKeyboardNavigation?: boolean;
  enableScreenReader?: boolean;
  enableFocusManagement?: boolean;
  enableARIALabels?: boolean;
}

export function useAccessibility(config: AccessibilityConfig = {}) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableFocusManagement = true,
    enableARIALabels = true,
  } = config;

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Arrow keys for navigation
      if (e.ctrlKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            // Trigger previous step
            break;
          case "ArrowRight":
            e.preventDefault();
            // Trigger next step
            break;
        }
      }

      // Enter key for form submission
      if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
        e.preventDefault();
        // Trigger form submission
      }

      // Escape key for closing modals
      if (e.key === "Escape") {
        e.preventDefault();
        // Close any open modals
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardNavigation]);

  // Focus management
  const focusElement = useCallback(
    (selector: string) => {
      if (!enableFocusManagement) return;

      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
      }
    },
    [enableFocusManagement]
  );

  // ARIA labels
  const getARIALabel = useCallback(
    (field: string, error?: string) => {
      if (!enableARIALabels) return undefined;

      let label = field;
      if (error) {
        label += `. Erro: ${error}`;
      }

      return label;
    },
    [enableARIALabels]
  );

  return {
    focusElement,
    getARIALabel,
  };
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N - New item
      if (e.ctrlKey && e.key === "n") {
        e.preventDefault();
        // Trigger new item action
      }

      // Ctrl + M - Open Marvin
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault();
        // Trigger Marvin action
      }

      // Ctrl + S - Save
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        // Trigger save action
      }

      // Ctrl + 1/2/3 - Quick actions
      if (e.ctrlKey && ["1", "2", "3"].includes(e.key)) {
        e.preventDefault();
        // Trigger quick actions
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}
