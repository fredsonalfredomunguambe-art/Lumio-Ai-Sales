"use client";

import React, { useState, useEffect } from "react";
import {
  Linkedin,
  Search,
  Users,
  Filter,
  Download,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Target,
  TrendingUp,
  Building2,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface LinkedInLead {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  industry: string;
  company: string;
  jobTitle: string;
  profileUrl: string;
  email?: string;
  phone?: string;
  connections: number;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  score: number;
  source: string;
  lastUpdated: string;
}

interface LinkedInIntegrationProps {
  onLeadsImported?: (leads: LinkedInLead[]) => void;
  onConnectionStatusChange?: (connected: boolean) => void;
}

export default function LinkedInIntegration({
  onLeadsImported,
  onConnectionStatusChange,
}: LinkedInIntegrationProps) {
  const toast = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LinkedInLead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState({
    keywords: "",
    location: "",
    industry: "",
    companySize: "",
    jobTitle: "",
    limit: 10,
  });

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/integrations/linkedin/connect");
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setIsConnected(true);
        onConnectionStatusChange?.(true);
      } else {
        setIsConnected(false);
        onConnectionStatusChange?.(false);
      }
    } catch (error) {
      console.error("Error checking LinkedIn connection:", error);
      setIsConnected(false);
      onConnectionStatusChange?.(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would redirect to LinkedIn OAuth
      // For now, we'll simulate a successful connection
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsConnected(true);
      onConnectionStatusChange?.(true);
      toast.success("Connected", "LinkedIn integration connected successfully");
    } catch (error) {
      console.error("Error connecting LinkedIn:", error);
      toast.error(
        "Connection Failed",
        "Failed to connect LinkedIn integration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!isConnected) {
      toast.error("Not Connected", "Please connect LinkedIn first");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/integrations/linkedin/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchParams,
          accessToken: "mock_access_token", // In real app, get from stored credentials
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.leads || []);
        toast.success(
          "Search Complete",
          `Found ${data.data.leads.length} leads`
        );
      } else {
        toast.error("Search Failed", data.error || "Failed to search LinkedIn");
      }
    } catch (error) {
      console.error("Error searching LinkedIn:", error);
      toast.error("Search Failed", "Failed to search LinkedIn");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    setSelectedLeads(
      selectedLeads.length === searchResults.length
        ? []
        : searchResults.map((lead) => lead.id)
    );
  };

  const handleImportLeads = async () => {
    if (selectedLeads.length === 0) {
      toast.error("No Selection", "Please select leads to import");
      return;
    }

    setIsLoading(true);
    try {
      const leadsToImport = searchResults.filter((lead) =>
        selectedLeads.includes(lead.id)
      );

      // Import leads to the main leads database
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leads: leadsToImport,
          source: "LinkedIn",
        }),
      });

      const data = await response.json();

      if (data.success) {
        onLeadsImported?.(leadsToImport);
        setSelectedLeads([]);
        toast.success(
          "Import Complete",
          `Imported ${leadsToImport.length} leads`
        );
      } else {
        toast.error("Import Failed", data.error || "Failed to import leads");
      }
    } catch (error) {
      console.error("Error importing leads:", error);
      toast.error("Import Failed", "Failed to import leads");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isConnected ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Linkedin
                  className={`w-6 h-6 ${
                    isConnected ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  LinkedIn Integration
                </h3>
                <p className="text-sm text-gray-500">
                  {isConnected
                    ? "Connected and ready to search for leads"
                    : "Connect to search and import LinkedIn leads"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Linkedin className="w-4 h-4" />
                  )}
                  <span>Connect LinkedIn</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isConnected && (
        <>
          {/* Search Form */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Search LinkedIn for Leads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={searchParams.keywords}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        keywords: e.target.value,
                      }))
                    }
                    placeholder="e.g., VP Sales, Marketing Director"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={searchParams.location}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., San Francisco, New York"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    value={searchParams.industry}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="SaaS">SaaS</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={searchParams.jobTitle}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        jobTitle: e.target.value,
                      }))
                    }
                    placeholder="e.g., CEO, VP Sales, Director"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={searchParams.companySize}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        companySize: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="startup">Startup (1-50)</option>
                    <option value="small">Small (51-200)</option>
                    <option value="medium">Medium (201-1000)</option>
                    <option value="large">Large (1000+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Results Limit
                  </label>
                  <select
                    value={searchParams.limit}
                    onChange={(e) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        limit: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10 results</option>
                    <option value={25}>25 results</option>
                    <option value={50}>50 results</option>
                    <option value={100}>100 results</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-3">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>
                    {isSearching ? "Searching..." : "Search LinkedIn"}
                  </span>
                </button>
                <button
                  onClick={() =>
                    setSearchParams({
                      keywords: "",
                      location: "",
                      industry: "",
                      companySize: "",
                      jobTitle: "",
                      limit: 10,
                    })
                  }
                  className="btn-ghost"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="card">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Search Results ({searchResults.length} leads found)
                  </h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSelectAll}
                      className="btn-ghost text-sm"
                    >
                      {selectedLeads.length === searchResults.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                    <button
                      onClick={handleImportLeads}
                      disabled={selectedLeads.length === 0 || isLoading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>Import Selected ({selectedLeads.length})</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {searchResults.map((lead) => (
                    <div
                      key={lead.id}
                      className={`p-4 border rounded-lg hover:shadow-md transition-all ${
                        selectedLeads.includes(lead.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {lead.firstName} {lead.lastName}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                                    lead.score
                                  )}`}
                                >
                                  Score: {lead.score}
                                </span>
                                <a
                                  href={lead.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                              <p className="text-gray-600 mb-2">
                                {lead.headline}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{lead.company}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Target className="w-4 h-4" />
                                  <span>{lead.jobTitle}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{lead.connections} connections</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
