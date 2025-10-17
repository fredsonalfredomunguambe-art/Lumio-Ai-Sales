"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { HelpCenterModal } from "./HelpCenterModal";

interface HelpButtonProps {
  context:
    | "home"
    | "leads"
    | "campaigns"
    | "calendar"
    | "insights"
    | "settings";
}

export function HelpButton({ context }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut: ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        const target = e.target as HTMLElement;
        // Don't trigger if typing in input/textarea
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 group"
        title="Help Center (Press ? key)"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />

        {/* Tooltip */}
        <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Help Center
          <kbd className="ml-2 px-1.5 py-0.5 bg-gray-800 rounded text-xs">
            ?
          </kbd>
        </div>
      </button>

      {/* Help Center Modal */}
      <HelpCenterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={context}
      />
    </>
  );
}
