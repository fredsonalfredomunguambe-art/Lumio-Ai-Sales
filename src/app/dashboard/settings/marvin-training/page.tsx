"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Bot,
  Search,
  FileCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ActionButton } from "@/components/ui/ActionButton";
import { HelpButton } from "@/components/HelpCenter/HelpButton";

interface TrainingDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  status: "processing" | "ready" | "failed";
  uploadedAt: Date;
  chunks?: number;
  error?: string;
}

export default function MarvinTrainingPage() {
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [testQuestion, setTestQuestion] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch("/api/training/documents");
      const data = await response.json();
      if (data.success) {
        setDocuments(
          data.data.documents.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
          }))
        );
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    // Validate files
    const validFiles = files.filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        alert(
          `${file.name} is not a supported file type. Please upload PDF, DOCX, TXT, or MD files.`
        );
        return false;
      }

      if (file.size > maxSize) {
        alert(`${file.name} exceeds 10MB limit.`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "category",
          selectedCategory === "all" ? "general" : selectedCategory
        );

        const response = await fetch("/api/training/documents", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // Add document to list with processing status
          setDocuments((prev) => [
            {
              id: data.data.documentId,
              name: file.name,
              type: file.type,
              size: file.size,
              category:
                selectedCategory === "all" ? "general" : selectedCategory,
              status: "processing",
              uploadedAt: new Date(),
            },
            ...prev,
          ]);

          // Poll for processing status
          pollDocumentStatus(data.data.documentId);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
  };

  const pollDocumentStatus = async (documentId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/training/documents/${documentId}`);
        const data = await response.json();

        if (data.success && data.data.status !== "processing") {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === documentId
                ? { ...doc, status: data.data.status, chunks: data.data.chunks }
                : doc
            )
          );
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error("Error checking document status:", error);
      }
    };

    checkStatus();
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? Marvin will forget this knowledge."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/training/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    }
  };

  const handleTestKnowledge = async () => {
    if (!testQuestion.trim()) return;

    setTesting(true);
    setTestResponse("");

    try {
      const response = await fetch("/api/marvin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testQuestion,
          context: "training_test",
          useTrainingData: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResponse(data.data.response);
      } else {
        setTestResponse("Error: Unable to get response from Marvin");
      }
    } catch (error) {
      console.error("Error testing knowledge:", error);
      setTestResponse("Error: Failed to communicate with Marvin");
    } finally {
      setTesting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word")) return "📝";
    if (type.includes("text")) return "📃";
    return "📎";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const categories = [
    { id: "all", label: "All Documents" },
    { id: "products", label: "Products & Services" },
    { id: "sales", label: "Sales Process" },
    { id: "company", label: "Company Info" },
    { id: "faqs", label: "FAQs" },
    { id: "general", label: "General" },
  ];

  const filteredDocs =
    selectedCategory === "all"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
            Marvin Training
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 mt-1">
            Teach Marvin about your business with documents and knowledge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" icon={<FileCheck className="w-3 h-3" />}>
            {documents.filter((d) => d.status === "ready").length} Documents
            Trained
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <Card>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-2">
                  Upload Training Documents
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileInput}
                  disabled={uploading}
                />
                <label htmlFor="file-upload">
                  <ActionButton
                    variant="primary"
                    icon={<Upload className="w-4 h-4" />}
                    loading={uploading}
                    as="span"
                  >
                    {uploading ? "Uploading..." : "Browse Files"}
                  </ActionButton>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200 mt-3">
                  Supported formats: PDF, DOCX, TXT, MD • Max 10MB per file
                </p>
              </div>
            </div>
          </Card>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-200"
                }`}
              >
                {cat.label}
                {cat.id !== "all" && (
                  <span className="ml-2 text-xs opacity-75">
                    ({documents.filter((d) => d.category === cat.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Documents List */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                Training Documents
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                {filteredDocs.length} document
                {filteredDocs.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-200">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No documents uploaded yet</p>
                <p className="text-sm mt-1">
                  Upload documents to train Marvin about your business
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 truncate">
                            {doc.name}
                          </h4>
                          {doc.status === "ready" && (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          )}
                          {doc.status === "processing" && (
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                          )}
                          {doc.status === "failed" && (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span>{formatFileSize(doc.size)}</span>
                          <span>•</span>
                          <Badge variant="ghost" size="sm">
                            {doc.category}
                          </Badge>
                          <span>•</span>
                          <span>{doc.uploadedAt.toLocaleDateString()}</span>
                          {doc.chunks && (
                            <>
                              <span>•</span>
                              <span>{doc.chunks} chunks</span>
                            </>
                          )}
                        </div>
                        {doc.status === "processing" && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4" />
                            </div>
                          </div>
                        )}
                        {doc.status === "failed" && doc.error && (
                          <div className="mt-2 text-xs text-red-600">
                            Error: {doc.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        className="p-2 hover:bg-gray-100 dark:bg-gray-800 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400 transition-colors duration-200" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Test Panel */}
        <div className="space-y-6">
          {/* Training Stats */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  Marvin's Knowledge
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Current training status
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Total Documents
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                  {documents.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Ready
                </span>
                <span className="text-lg font-bold text-green-600">
                  {documents.filter((d) => d.status === "ready").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Processing
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {documents.filter((d) => d.status === "processing").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                  Total Chunks
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Test Panel */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                Test Marvin's Knowledge
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-4">
              Ask Marvin questions to see how well he learned from your
              documents
            </p>

            <div className="space-y-4">
              <div>
                <textarea
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Ask Marvin a question about your business...&#10;e.g., 'What are the main features of our premium plan?'"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <ActionButton
                variant="primary"
                onClick={handleTestKnowledge}
                loading={testing}
                disabled={
                  !testQuestion.trim() ||
                  documents.filter((d) => d.status === "ready").length === 0
                }
                className="w-full"
              >
                {testing ? "Thinking..." : "Ask Marvin"}
              </ActionButton>

              {testResponse && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-1">
                        Marvin's Response:
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 whitespace-pre-wrap">
                        {testResponse}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {documents.filter((d) => d.status === "ready").length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    Upload and process at least one document before testing
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Tips */}
          <Card
            variant="bordered"
            className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 mb-2">
                  Training Tips
                </h4>
                <ul className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200 space-y-1">
                  <li>
                    • Upload product documentation for better recommendations
                  </li>
                  <li>• Include sales playbooks for objection handling</li>
                  <li>• Add FAQs to help Marvin answer common questions</li>
                  <li>• Update documents regularly with new information</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Help Center Button */}
      <HelpButton context="settings" />
    </div>
  );
}
