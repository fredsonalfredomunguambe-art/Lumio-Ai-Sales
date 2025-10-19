"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Command,
  ArrowRight,
  Users,
  Mail,
  BarChart3,
  Settings,
  Plus,
  Target,
  Download,
  Upload,
  Filter,
  Calendar,
  TrendingUp,
  Lightbulb,
  Zap,
  Clock,
  Star,
} from "lucide-react";

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "navigation" | "actions" | "data" | "settings" | "marvin";
  keywords: string[];
  action: () => void;
  shortcut?: string;
  badge?: string;
  isNew?: boolean;
  isPro?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      description: "View your main dashboard with KPIs and insights",
      icon: BarChart3,
      category: "navigation",
      keywords: ["dashboard", "home", "main", "overview"],
      action: () => onNavigate?.("/dashboard"),
      shortcut: "⌘ + 1",
    },
    {
      id: "nav-leads",
      title: "Go to Leads",
      description: "Manage your leads and contacts",
      icon: Users,
      category: "navigation",
      keywords: ["leads", "contacts", "prospects", "people"],
      action: () => onNavigate?.("/dashboard/leads"),
      shortcut: "⌘ + 2",
    },
    {
      id: "nav-campaigns",
      title: "Go to Campaigns",
      description: "Create and manage email campaigns",
      icon: Mail,
      category: "navigation",
      keywords: ["campaigns", "emails", "sequences", "marketing"],
      action: () => onNavigate?.("/dashboard/campaigns"),
      shortcut: "⌘ + 3",
    },
    {
      id: "nav-insights",
      title: "Go to Insights",
      description: "View analytics and performance metrics",
      icon: TrendingUp,
      category: "navigation",
      keywords: ["insights", "analytics", "metrics", "reports"],
      action: () => onNavigate?.("/dashboard/insights"),
      shortcut: "⌘ + 4",
    },
    {
      id: "nav-settings",
      title: "Go to Settings",
      description: "Configure your account and preferences",
      icon: Settings,
      category: "navigation",
      keywords: ["settings", "preferences", "config", "account"],
      action: () => onNavigate?.("/dashboard/settings"),
      shortcut: "⌘ + ,",
    },

    // Actions
    {
      id: "create-lead",
      title: "Create New Lead",
      description: "Add a new lead to your database",
      icon: Plus,
      category: "actions",
      keywords: ["create", "add", "new", "lead", "contact"],
      action: () => console.log("Create lead"),
      badge: "Popular",
    },
    {
      id: "create-campaign",
      title: "Create New Campaign",
      description: "Start a new email marketing campaign",
      icon: Mail,
      category: "actions",
      keywords: ["create", "campaign", "email", "sequence", "marketing"],
      action: () => console.log("Create campaign"),
      badge: "Popular",
    },
    {
      id: "import-data",
      title: "Import Data",
      description: "Import leads from CSV or other sources",
      icon: Upload,
      category: "actions",
      keywords: ["import", "upload", "csv", "data", "leads"],
      action: () => console.log("Import data"),
    },
    {
      id: "export-data",
      title: "Export Data",
      description: "Export your leads and campaign data",
      icon: Download,
      category: "actions",
      keywords: ["export", "download", "csv", "data", "leads"],
      action: () => console.log("Export data"),
    },

    // Data & Analytics
    {
      id: "view-reports",
      title: "View Reports",
      description: "Generate and view performance reports",
      icon: BarChart3,
      category: "data",
      keywords: ["reports", "analytics", "performance", "metrics"],
      action: () => console.log("View reports"),
    },
    {
      id: "filter-leads",
      title: "Filter Leads",
      description: "Apply filters to your lead database",
      icon: Filter,
      category: "data",
      keywords: ["filter", "search", "leads", "segment"],
      action: () => console.log("Filter leads"),
    },
    {
      id: "schedule-campaign",
      title: "Schedule Campaign",
      description: "Schedule a campaign for later sending",
      icon: Calendar,
      category: "data",
      keywords: ["schedule", "campaign", "send", "later", "time"],
      action: () => console.log("Schedule campaign"),
    },

    // Marvin AI
    {
      id: "ask-marvin",
      title: "Ask Marvin",
      description: "Get AI-powered insights and suggestions",
      icon: Lightbulb,
      category: "marvin",
      keywords: ["marvin", "ai", "ask", "help", "suggestions", "insights"],
      action: () => console.log("Ask Marvin"),
      isNew: true,
    },
    {
      id: "marvin-optimize",
      title: "Optimize with Marvin",
      description: "Let Marvin optimize your campaigns automatically",
      icon: Zap,
      category: "marvin",
      keywords: ["marvin", "optimize", "ai", "auto", "improve"],
      action: () => console.log("Marvin optimize"),
      isPro: true,
    },
    {
      id: "marvin-insights",
      title: "Get Marvin Insights",
      description: "View AI-generated insights about your performance",
      icon: Star,
      category: "marvin",
      keywords: ["marvin", "insights", "ai", "analysis", "performance"],
      action: () => console.log("Marvin insights"),
    },
  ];

  const filteredCommands = commands.filter((command) => {
    const searchTerms = query.toLowerCase().split(" ");
    return searchTerms.every(
      (term) =>
        command.title.toLowerCase().includes(term) ||
        command.description.toLowerCase().includes(term) ||
        command.keywords.some((keyword) => keyword.includes(term))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  const categoryOrder = ["navigation", "actions", "data", "marvin", "settings"];
  const categoryLabels = {
    navigation: "Navigation",
    actions: "Quick Actions",
    data: "Data & Analytics",
    marvin: "Marvin AI",
    settings: "Settings",
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredCommands.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const executeCommand = (command: Command) => {
    command.action();
    setRecentCommands((prev) =>
      [command.id, ...prev.filter((id) => id !== command.id)].slice(0, 5)
    );
    onClose();
    setQuery("");
    setSelectedIndex(0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "navigation":
        return <ArrowRight className="w-4 h-4" />;
      case "actions":
        return <Zap className="w-4 h-4" />;
      case "data":
        return <BarChart3 className="w-4 h-4" />;
      case "marvin":
        return <Lightbulb className="w-4 h-4" />;
      case "settings":
        return <Settings className="w-4 h-4" />;
      default:
        return <Command className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands, actions, or ask Marvin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-lg outline-none placeholder-gray-400 font-outfit"
            />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 font-outfit">
                No commands found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-outfit">
                Try a different search term or ask Marvin for help
              </p>
            </div>
          ) : (
            <div className="p-2">
              {categoryOrder.map((category) => {
                const categoryCommands = groupedCommands[category];
                if (!categoryCommands) return null;

                return (
                  <div key={category} className="mb-4">
                    <div className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {getCategoryIcon(category)}
                      <span>
                        {
                          categoryLabels[
                            category as keyof typeof categoryLabels
                          ]
                        }
                      </span>
                    </div>
                    <div className="space-y-1">
                      {categoryCommands.map((command, index) => {
                        const globalIndex = filteredCommands.indexOf(command);
                        const isSelected = globalIndex === selectedIndex;
                        const isRecent = recentCommands.includes(command.id);

                        return (
                          <button
                            key={command.id}
                            onClick={() => executeCommand(command)}
                            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                              isSelected
                                ? "bg-blue-50 border border-blue-200"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <command.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate font-outfit">
                                  {command.title}
                                </h4>
                                {command.badge && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {command.badge}
                                  </span>
                                )}
                                {command.isNew && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    NEW
                                  </span>
                                )}
                                {command.isPro && (
                                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    PRO
                                  </span>
                                )}
                                {isRecent && (
                                  <Clock className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-outfit">
                                {command.description}
                              </p>
                            </div>
                            <div className="flex-shrink-0 flex items-center space-x-2">
                              {command.shortcut && (
                                <span className="text-xs text-gray-400 font-mono">
                                  {command.shortcut}
                                </span>
                              )}
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>⎋ Close</span>
            </div>
            <div className="flex items-center space-x-2">
              <Command className="w-3 h-3" />
              <span>Command Palette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
