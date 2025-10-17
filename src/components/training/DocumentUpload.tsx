"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface DocumentUploadProps {
  onDocumentUploaded: (document: any) => void;
}

export function DocumentUpload({ onDocumentUploaded }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus("Tipo de arquivo não suportado. Use TXT, PDF ou DOCX.");
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus("Arquivo muito grande. Tamanho máximo: 10MB");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Processando documento...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/training/documents", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadStatus(`✅ Documento "${file.name}" processado com sucesso!`);
        onDocumentUploaded(result.data);

        // Limpar input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setUploadStatus(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      setUploadStatus("❌ Erro ao processar documento");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="space-y-2">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Clique para fazer upload
              </span>{" "}
              ou arraste e solte
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
          <p className="text-xs text-gray-500">TXT, PDF ou DOCX até 10MB</p>
        </div>
      </div>

      {isUploading && (
        <div className="flex items-center justify-center space-x-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-600">Processando...</span>
        </div>
      )}

      {uploadStatus && (
        <div
          className={`text-sm p-3 rounded-md ${
            uploadStatus.includes("✅")
              ? "bg-green-50 text-green-700 border border-green-200"
              : uploadStatus.includes("❌")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
          }`}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
}
