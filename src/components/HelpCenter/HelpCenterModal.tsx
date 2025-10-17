"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BookOpen,
  Video,
  ExternalLink,
  ChevronRight,
  Home,
  Users,
  Mail,
  Calendar,
  BarChart3,
  Settings,
  Lightbulb,
} from "lucide-react";
import { helpContent, HelpArticle } from "./content";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  context:
    | "home"
    | "leads"
    | "campaigns"
    | "calendar"
    | "insights"
    | "settings";
}

export function HelpCenterModal({
  isOpen,
  onClose,
  context,
}: HelpCenterModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null
  );
  const [selectedContext, setSelectedContext] = useState(context);

  const contextIcons: Record<string, any> = {
    home: Home,
    leads: Users,
    campaigns: Mail,
    calendar: Calendar,
    insights: BarChart3,
    settings: Settings,
  };

  // Get content for current context
  const currentContent = helpContent[selectedContext];

  // Filter articles based on search
  const filteredArticles = useMemo(() => {
    if (!currentContent) return [];

    if (!searchTerm) return currentContent.articles;

    const term = searchTerm.toLowerCase();
    return currentContent.articles.filter(
      (article) =>
        article.title.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.tags?.some((tag) => tag.toLowerCase().includes(term))
    );
  }, [currentContent, searchTerm]);

  // Group articles by category
  const articlesByCategory = useMemo(() => {
    const grouped: Record<string, HelpArticle[]> = {};
    filteredArticles.forEach((article) => {
      if (!grouped[article.category]) {
        grouped[article.category] = [];
      }
      grouped[article.category].push(article);
    });
    return grouped;
  }, [filteredArticles]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Help Center</h2>
              <p className="text-sm text-blue-100">
                {currentContent?.title || "Get help and learn"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Context Switcher */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Sections
              </div>
              <div className="space-y-1">
                {Object.keys(helpContent).map((key) => {
                  const Icon = contextIcons[key] || BookOpen;
                  const isActive = selectedContext === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedContext(key);
                        setSelectedArticle(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium capitalize">{key}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Links */}
              {currentContent?.quickLinks &&
                currentContent.quickLinks.length > 0 && (
                  <div className="mt-6">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Quick Links
                    </div>
                    <div className="space-y-1">
                      {currentContent.quickLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              /* Article View */
              <div className="p-6">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to articles
                </button>

                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedArticle.title}
                  </h1>
                  {selectedArticle.tags && (
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video if available */}
                {selectedArticle.video && (
                  <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden aspect-video">
                    <video
                      controls
                      className="w-full h-full"
                      poster="/images/video-placeholder.jpg"
                    >
                      <source src={selectedArticle.video} type="video/mp4" />
                      Your browser does not support video.
                    </video>
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-blue max-w-none mb-6">
                  {selectedArticle.content.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-gray-700 mb-4 whitespace-pre-wrap"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Steps if available */}
                {selectedArticle.steps && selectedArticle.steps.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Step by Step
                    </h3>
                    <ol className="space-y-3">
                      {selectedArticle.steps.map((step, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : (
              /* Articles List */
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentContent?.title}
                  </h2>
                  <p className="text-gray-600">{currentContent?.description}</p>
                </div>

                {filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      No articles found for "{searchTerm}"
                    </p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(articlesByCategory).map(
                      ([category, articles]) => (
                        <div key={category}>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            {category}
                          </h3>
                          <div className="space-y-2">
                            {articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => setSelectedArticle(article)}
                                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600">
                                        {article.title}
                                      </h4>
                                      {article.video && (
                                        <Video className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                      {article.content.substring(0, 150)}...
                                    </p>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Press{" "}
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">
                Esc
              </kbd>{" "}
              to close
            </div>
            <div className="flex items-center gap-4">
              <a
                href="mailto:support@lumio.com"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Contact Support
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
