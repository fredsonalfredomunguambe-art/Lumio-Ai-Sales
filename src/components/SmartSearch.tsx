"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Calendar, User, MapPin, Clock, Filter } from "lucide-react";
import { useMeetingStore } from "@/stores/meetingStore";
import { useLeadStore } from "@/stores/leadStore";
import { Meeting } from "@/types/meeting";

interface SmartSearchProps {
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
}

interface SearchResult {
  id: string;
  type: "meeting" | "lead" | "action";
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  data: any;
  category: string;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
  onResultSelect,
  placeholder = "Search meetings, leads, or ask Marvin...",
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { meetings } = useMeetingStore();
  const { leads } = useLeadStore();

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    // Search meetings
    meetings.forEach((meeting) => {
      const matchesTitle = meeting.title.toLowerCase().includes(queryLower);
      const matchesDescription = meeting.description
        ?.toLowerCase()
        .includes(queryLower);
      const matchesLocation = meeting.location
        ?.toLowerCase()
        .includes(queryLower);
      const matchesLead =
        meeting.lead?.firstName.toLowerCase().includes(queryLower) ||
        meeting.lead?.lastName.toLowerCase().includes(queryLower) ||
        meeting.lead?.company?.toLowerCase().includes(queryLower);

      if (
        matchesTitle ||
        matchesDescription ||
        matchesLocation ||
        matchesLead
      ) {
        results.push({
          id: `meeting-${meeting.id}`,
          type: "meeting",
          title: meeting.title,
          subtitle: `${
            meeting.lead
              ? `${meeting.lead.firstName} ${meeting.lead.lastName}`
              : "No lead"
          } • ${new Date(meeting.startDate).toLocaleDateString()}`,
          icon: Calendar,
          data: meeting,
          category: "Meetings",
        });
      }
    });

    // Search leads
    leads.forEach((lead) => {
      const matchesName = `${lead.firstName} ${lead.lastName}`
        .toLowerCase()
        .includes(queryLower);
      const matchesEmail = lead.email.toLowerCase().includes(queryLower);
      const matchesCompany = lead.company?.toLowerCase().includes(queryLower);

      if (matchesName || matchesEmail || matchesCompany) {
        results.push({
          id: `lead-${lead.id}`,
          type: "lead",
          title: `${lead.firstName} ${lead.lastName}`,
          subtitle: `${lead.company || "No company"} • ${lead.email}`,
          icon: User,
          data: lead,
          category: "Leads",
        });
      }
    });

    // Quick actions
    const quickActions = [
      {
        id: "action-create-meeting",
        type: "action" as const,
        title: "Create New Meeting",
        subtitle: "Schedule a meeting with a lead",
        icon: Calendar,
        data: { action: "create-meeting" },
        category: "Actions",
      },
      {
        id: "action-add-lead",
        type: "action" as const,
        title: "Add New Lead",
        subtitle: "Add a new lead to your pipeline",
        icon: User,
        data: { action: "add-lead" },
        category: "Actions",
      },
      {
        id: "action-view-today",
        type: "action" as const,
        title: "Today's Meetings",
        subtitle: "View all meetings scheduled for today",
        icon: Clock,
        data: { action: "view-today" },
        category: "Actions",
      },
    ];

    // Add quick actions if query matches
    if (
      queryLower.includes("create") ||
      queryLower.includes("new") ||
      queryLower.includes("add")
    ) {
      results.push(...quickActions);
    }

    // Group results by category
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {} as Record<string, SearchResult[]>);

    return groupedResults;
  }, [query, meetings, leads]);

  const allResults = useMemo(() => {
    return Object.values(searchResults).flat();
  }, [searchResults]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleResultSelect(allResults[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setQuery("");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allResults, selectedIndex]);

  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(0);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(0);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 font-inter text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && Object.keys(searchResults).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {Object.entries(searchResults).map(([category, results]) => (
              <div key={category} className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </div>
                {results.map((result, index) => {
                  const globalIndex = allResults.findIndex(
                    (r) => r.id === result.id
                  );
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <motion.button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50 border border-blue-200" : ""
                      }`}
                      whileHover={{ x: 2 }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.type === "meeting"
                            ? "bg-blue-100 text-blue-600"
                            : result.type === "lead"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <result.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {result.subtitle}
                        </div>
                      </div>
                      {result.type === "action" && (
                        <div className="text-xs text-gray-400">Action</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {isOpen &&
          query.length > 0 &&
          Object.keys(searchResults).length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-6 text-center"
            >
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">No results found</p>
              <p className="text-xs text-gray-500">
                Try searching for meetings, leads, or use quick actions
              </p>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
