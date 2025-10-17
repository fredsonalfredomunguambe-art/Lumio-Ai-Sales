import { useEffect, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === event.ctrlKey;
        const shiftMatch = !!shortcut.shift === event.shiftKey;
        const altMatch = !!shortcut.alt === event.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return {
    shortcuts: shortcutsRef.current,
  };
}

// Hook specifically for Kanban shortcuts
export function useKanbanShortcuts({
  onCreateTask,
  onOptimizeBoard,
  onSelectAll,
  onClearSelection,
  onBulkMoveNew,
  onBulkMoveContacted,
  onBulkMoveQualified,
  onBulkMoveConverted,
  onBulkDelete,
  onCloseModal,
  enabled = true,
}: {
  onCreateTask?: () => void;
  onOptimizeBoard?: () => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkMoveNew?: () => void;
  onBulkMoveContacted?: () => void;
  onBulkMoveQualified?: () => void;
  onBulkMoveConverted?: () => void;
  onBulkDelete?: () => void;
  onCloseModal?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      ctrl: true,
      action: () => onCreateTask?.(),
      description: "Create new task",
    },
    {
      key: "m",
      ctrl: true,
      action: () => onOptimizeBoard?.(),
      description: "Open Marvin insights",
    },
    {
      key: "a",
      ctrl: true,
      action: () => onSelectAll?.(),
      description: "Select all tasks",
    },
    {
      key: "Escape",
      action: () => {
        onClearSelection?.();
        onCloseModal?.();
      },
      description: "Clear selection / Close modal",
    },
    {
      key: "1",
      ctrl: true,
      action: () => onBulkMoveNew?.(),
      description: "Move selected to NEW",
    },
    {
      key: "2",
      ctrl: true,
      action: () => onBulkMoveContacted?.(),
      description: "Move selected to CONTACTED",
    },
    {
      key: "3",
      ctrl: true,
      action: () => onBulkMoveQualified?.(),
      description: "Move selected to QUALIFIED",
    },
    {
      key: "4",
      ctrl: true,
      action: () => onBulkMoveConverted?.(),
      description: "Move selected to CONVERTED",
    },
    {
      key: "Delete",
      action: () => onBulkDelete?.(),
      description: "Delete selected tasks",
    },
    {
      key: "Backspace",
      action: () => onBulkDelete?.(),
      description: "Delete selected tasks",
    },
  ];

  return useKeyboardShortcuts({ shortcuts, enabled });
}

// Export interface for the component
export interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}
