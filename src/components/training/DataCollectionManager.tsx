"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Download,
  FileText,
  Database,
  Trash2,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Calendar,
  Tag,
  MessageSquare,
  Mail,
  Phone,
  Shield,
  Trophy,
} from "lucide-react";
import { useTraining } from "@/hooks/useTraining";

interface TrainingData {
  id: string;
  type:
    | "conversation"
    | "email"
    | "call_transcript"
    | "objection_handling"
    | "success_story";
  title: string;
  content: string;
  tags: string[];
  quality: "high" | "medium" | "low";
  uploadDate: string;
  size: number;
  status: "processed" | "processing" | "pending" | "error";
  insights: string[];
  metrics: {
    engagement: number;
    conversion: number;
    personalization: number;
  };
}

interface DataCollectionManagerProps {
  onDataUpload?: (data: TrainingData[]) => void;
  onDataSelect?: (data: TrainingData) => void;
}

export default function DataCollectionManager({
  onDataUpload,
  onDataSelect,
}: DataCollectionManagerProps) {
  const {
    addInteraction,
    trainingData: realTrainingData,
    loading,
  } = useTraining();
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    const newData: TrainingData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await readFileContent(file);

      const dataItem: TrainingData = {
        id: Date.now().toString() + i,
        type: getFileType(file.name),
        title: file.name,
        content,
        tags: generateTags(content),
        quality: "medium",
        uploadDate: new Date().toISOString(),
        size: file.size,
        status: "processing",
        insights: [],
        metrics: {
          engagement: Math.random() * 100,
          conversion: Math.random() * 100,
          personalization: Math.random() * 100,
        },
      };

      newData.push(dataItem);

      // Adicionar como interação real para treinamento
      try {
        await addInteraction({
          interactionType: "chat",
          customerInput: content.substring(0, 500), // Limitar tamanho
          marvinResponse: "Data uploaded for training",
          outcome: "success",
          context: {
            source: "file_upload",
            filename: file.name,
            fileType: getFileType(file.name),
          },
        });
      } catch (error) {
        console.error("Error adding interaction:", error);
      }
    }

    setTrainingData((prev) => [...prev, ...newData]);
    onDataUpload?.(newData);

    // Simulate processing
    setTimeout(() => {
      setTrainingData((prev) =>
        prev.map((item) =>
          newData.some((newItem) => newItem.id === item.id)
            ? { ...item, status: "processed" as const }
            : item
        )
      );
    }, 2000);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.readAsText(file);
    });
  };

  const getFileType = (filename: string): TrainingData["type"] => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "txt" || ext === "md") return "conversation";
    if (ext === "eml" || ext === "html") return "email";
    if (ext === "csv" || ext === "json") return "call_transcript";
    return "conversation";
  };

  const generateTags = (content: string): string[] => {
    const tags = [];
    if (content.toLowerCase().includes("objection"))
      tags.push("objection-handling");
    if (content.toLowerCase().includes("success")) tags.push("success-story");
    if (content.toLowerCase().includes("follow-up")) tags.push("follow-up");
    if (content.toLowerCase().includes("demo")) tags.push("demo");
    if (content.toLowerCase().includes("pricing")) tags.push("pricing");
    return tags;
  };

  const filteredData = trainingData.filter((item) => {
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesType && matchesSearch;
  });

  const getStatusIcon = (status: TrainingData["status"]) => {
    switch (status) {
      case "processed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "processing":
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  const getQualityColor = (quality: TrainingData["quality"]) => {
    switch (quality) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
    }
  };

  const getTypeIcon = (type: TrainingData["type"]) => {
    switch (type) {
      case "conversation":
        return <MessageSquare className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "call_transcript":
        return <Phone className="w-4 h-4" />;
      case "objection_handling":
        return <Shield className="w-4 h-4" />;
      case "success_story":
        return <Trophy className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 font-outfit">
          Training Data Collection
        </h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-outfit"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-outfit"
          >
            <option value="all">All Types</option>
            <option value="conversation">Conversations</option>
            <option value="email">Emails</option>
            <option value="call_transcript">Call Transcripts</option>
            <option value="objection_handling">Objection Handling</option>
            <option value="success_story">Success Stories</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search training data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-outfit focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onDataSelect(item)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 font-outfit truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-outfit capitalize">
                    {item.type.replace("_", " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(item.status)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-outfit">
                  Quality
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(
                    item.quality
                  )}`}
                >
                  {item.quality}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-outfit">Size</span>
                <span className="text-xs text-gray-900 font-outfit">
                  {(item.size / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-outfit">
                  Upload Date
                </span>
                <span className="text-xs text-gray-900 font-outfit">
                  {new Date(item.uploadDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-outfit"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-outfit">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2 font-outfit">
            No training data found
          </h3>
          <p className="text-gray-500 font-outfit">
            Upload some data to get started with training your SDR agent.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-outfit">
              Upload Training Data
            </h3>

            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-outfit">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 font-outfit mt-1">
                  Supports: TXT, MD, EML, HTML, CSV, JSON
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.eml,.html,.csv,.json"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files);
                    setShowUploadModal(false);
                  }
                }}
                className="hidden"
              />

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-outfit">
                      Uploading...
                    </span>
                    <span className="text-gray-900 font-outfit">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-outfit"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
