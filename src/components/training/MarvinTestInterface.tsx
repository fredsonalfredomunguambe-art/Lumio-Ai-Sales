"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface KnowledgeItem {
  id: string;
  content: string;
  category: string;
  confidence: number;
  context: string;
}

interface TestResult {
  message: string;
  response: string;
  knowledgeUsed: {
    itemsCount: number;
    confidence: number;
    source: string;
    reasoning: string;
  };
  knowledgeItems: KnowledgeItem[];
}

interface MarvinTestInterfaceProps {
  companyProfile: {
    name: string;
    industry: string;
    product: string;
    targetAudience: string;
    goals: string[];
    marvinConfig: {
      tone: string;
      style: string;
      focus: string;
      useHumor: boolean;
      useExamples: boolean;
      maxLength: string;
    };
  };
}

export function MarvinTestInterface({
  companyProfile,
}: MarvinTestInterfaceProps) {
  const [testMessage, setTestMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [knowledgeStats, setKnowledgeStats] = useState<any>(null);

  // Carregar estatísticas de conhecimento
  useEffect(() => {
    loadKnowledgeStats();
  }, []);

  const loadKnowledgeStats = async () => {
    try {
      const response = await fetch("/api/training/documents");
      const result = await response.json();
      if (result.success) {
        setKnowledgeStats(result.data);
      }
    } catch (error) {
      console.error("Error loading knowledge stats:", error);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/training/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testMessage,
          companyProfile,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setTestResult(result.data);
      } else {
        console.error("Test failed:", result.error);
      }
    } catch (error) {
      console.error("Error testing Marvin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearKnowledge = async () => {
    try {
      const response = await fetch("/api/training/documents", {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setKnowledgeStats(null);
        setTestResult(null);
        loadKnowledgeStats();
      }
    } catch (error) {
      console.error("Error clearing knowledge:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de Conhecimento */}
      {knowledgeStats && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Base de Conhecimento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Documentos</div>
              <div className="font-semibold">
                {knowledgeStats.totalDocuments}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Itens de Conhecimento</div>
              <div className="font-semibold">
                {knowledgeStats.totalKnowledgeItems}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Confiança Média</div>
              <div className="font-semibold">
                {Math.round(knowledgeStats.averageConfidence * 100)}%
              </div>
            </div>
            <div>
              <div className="text-gray-600">Categorias</div>
              <div className="font-semibold">
                {Object.keys(knowledgeStats.categoryStats || {}).length}
              </div>
            </div>
          </div>

          {knowledgeStats.categoryStats && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-2">
                Distribuição por Categoria:
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(knowledgeStats.categoryStats).map(
                  ([category, count]) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {category}: {count}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Button
              onClick={clearKnowledge}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Limpar Conhecimento
            </Button>
          </div>
        </div>
      )}

      {/* Interface de Teste */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">
          Teste o Marvin com Conhecimento
        </h3>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="test-message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Digite uma pergunta para testar o Marvin:
            </label>
            <textarea
              id="test-message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Ex: Como funciona o processo de vendas da empresa?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <Button
            onClick={handleTest}
            disabled={!testMessage.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Testando...
              </>
            ) : (
              "Testar Resposta do Marvin"
            )}
          </Button>
        </div>
      </div>

      {/* Resultado do Teste */}
      {testResult && (
        <div className="space-y-4">
          {/* Resposta do Marvin */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Resposta do Marvin:
            </h4>
            <div
              className="text-blue-800 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: testResult.response }}
            />
          </div>

          {/* Informações sobre Conhecimento Usado */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Conhecimento Utilizado:
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-600">Itens Encontrados</div>
                <div className="font-semibold">
                  {testResult.knowledgeUsed.itemsCount}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Confiança</div>
                <div className="font-semibold">
                  {Math.round(testResult.knowledgeUsed.confidence * 100)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Fonte</div>
                <div className="font-semibold capitalize">
                  {testResult.knowledgeUsed.source}
                </div>
              </div>
              <div>
                <div className="text-gray-600">Status</div>
                <div className="font-semibold text-green-600">
                  {testResult.knowledgeUsed.itemsCount > 0
                    ? "Conhecimento Aplicado"
                    : "Sem Conhecimento"}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              {testResult.knowledgeUsed.reasoning}
            </div>

            {/* Itens de Conhecimento Detalhados */}
            {testResult.knowledgeItems.length > 0 && (
              <div>
                <h5 className="font-medium text-gray-900 mb-2">
                  Itens de Conhecimento Encontrados:
                </h5>
                <div className="space-y-2">
                  {testResult.knowledgeItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white border border-gray-200 rounded p-3"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Confiança: {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        {item.content}
                      </div>
                      {item.context && (
                        <div className="text-xs text-gray-500">
                          Contexto: {item.context}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
