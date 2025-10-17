"use client";

import React, { useState, useEffect } from "react";
import {
  Brain,
  Lightbulb,
  TrendingUp,
  Target,
  Users,
  Mail,
  BarChart3,
  ArrowRight,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface Suggestion {
  id: string;
  type: "insight" | "action" | "warning" | "tip";
  title: string;
  description: string;
  confidence: number;
  category: "leads" | "campaigns" | "insights" | "general";
  estimatedImpact?: string;
  action?: {
    label: string;
    onClick: () => void;
    priority: "high" | "medium" | "low";
  };
}

interface SmartSuggestionsProps {
  context: "leads" | "campaigns" | "insights" | "dashboard" | "settings";
  data?: any;
}

export function SmartSuggestions({ context, data }: SmartSuggestionsProps) {
  const toast = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [context, data]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);

      // Simular geração de sugestões baseadas no contexto
      const mockSuggestions = generateMockSuggestions(context, data);
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error("Error loading suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSuggestions = (
    context: string,
    data: any
  ): Suggestion[] => {
    const baseSuggestions: Suggestion[] = [];

    switch (context) {
      case "leads":
        baseSuggestions.push(
          {
            id: "1",
            type: "insight",
            title: "Time Pattern",
            description:
              "Leads respond 40% better between 2-4 PM. Consider adjusting campaign timing.",
            confidence: 85,
            category: "leads",
            estimatedImpact: "+25% resposta",
            action: {
              label: "Ajustar Timing",
              onClick: () => toast.info("Ação", "Timing ajustado para 14h-16h"),
              priority: "high",
            },
          },
          {
            id: "2",
            type: "action",
            title: "Segmentação Inteligente",
            description:
              "Marvin identificou 3 novos segmentos baseados no comportamento dos leads.",
            confidence: 92,
            category: "leads",
            estimatedImpact: "+15% conversão",
            action: {
              label: "Ver Segmentos",
              onClick: () =>
                toast.info("Ação", "Abrindo segmentação inteligente"),
              priority: "medium",
            },
          }
        );
        break;

      case "campaigns":
        baseSuggestions.push(
          {
            id: "3",
            type: "tip",
            title: "Otimização de Assunto",
            description:
              "Assuntos com emoji têm 23% mais abertura. Considere adicionar emojis relevantes.",
            confidence: 78,
            category: "campaigns",
            estimatedImpact: "+23% abertura",
          },
          {
            id: "4",
            type: "warning",
            title: "Taxa de Rejeição",
            description:
              "Campanha 'Black Friday' tem taxa de rejeição alta. Considere ajustar o tom.",
            confidence: 88,
            category: "campaigns",
            estimatedImpact: "-15% rejeição",
            action: {
              label: "Ajustar Tom",
              onClick: () => toast.info("Action", "Campaign tone adjusted"),
              priority: "high",
            },
          }
        );
        break;

      case "insights":
        baseSuggestions.push({
          id: "5",
          type: "insight",
          title: "Tendência Sazonal",
          description:
            "Sales increase 35% on Tuesdays. Consider scheduling campaigns for this day.",
          confidence: 91,
          category: "insights",
          estimatedImpact: "+35% vendas",
          action: {
            label: "Programar Campanha",
            onClick: () =>
              toast.info("Ação", "Campanha programada para terça-feira"),
            priority: "medium",
          },
        });
        break;

      default:
        baseSuggestions.push({
          id: "6",
          type: "tip",
          title: "Performance Geral",
          description:
            "Marvin está performando 15% acima da média. Continue com a estratégia atual.",
          confidence: 95,
          category: "general",
          estimatedImpact: "+15% performance",
        });
    }

    return baseSuggestions.slice(0, 3); // Limitar a 3 sugestões
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "insight":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "action":
        return <Target className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "tip":
        return <Lightbulb className="w-4 h-4 text-purple-600" />;
      default:
        return <Brain className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "insight":
        return "bg-blue-50 border-blue-200";
      case "action":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "tip":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">
            Marvin está analisando...
          </span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div
        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Sugestões do Marvin
              </h3>
              <p className="text-sm text-gray-500">
                {suggestions.length} sugestão
                {suggestions.length !== 1 ? "ões" : ""} inteligente
                {suggestions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {suggestions.filter((s) => s.confidence >= 80).length}/
              {suggestions.length} alta confiança
            </span>
            <ArrowRight
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-4 rounded-lg border ${getTypeColor(
                suggestion.type
              )}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {suggestion.title}
                      </h4>
                      {suggestion.action && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            suggestion.action.priority
                          )}`}
                        >
                          {suggestion.action.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {suggestion.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Brain className="w-3 h-3" />
                        <span>{suggestion.confidence}% confiança</span>
                      </div>
                      {suggestion.estimatedImpact && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{suggestion.estimatedImpact}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {suggestion.action && (
                    <button
                      onClick={suggestion.action.onClick}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <span>{suggestion.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSuggestions((prev) =>
                        prev.filter((s) => s.id !== suggestion.id)
                      );
                      toast.success("Removido", "Sugestão removida");
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Atualizado há 2 minutos</span>
              </div>
              <button
                onClick={loadSuggestions}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Zap className="w-3 h-3" />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
