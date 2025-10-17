import { z } from "zod";
import { TrainingDocument } from "./document-parser";

// Schema para conhecimento extraído
export const KnowledgeItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sourceDocumentId: z.string(),
  content: z.string(),
  context: z.string(),
  category: z.enum([
    "product",
    "service",
    "process",
    "faq",
    "policy",
    "technical",
  ]),
  confidence: z.number().min(0).max(1),
  keywords: z.array(z.string()),
  createdAt: z.string(),
  lastUsed: z.string().optional(),
  usageCount: z.number().default(0),
});

export type KnowledgeItem = z.infer<typeof KnowledgeItemSchema>;

// Schema para resposta contextual
export const ContextualResponseSchema = z.object({
  knowledgeItems: z.array(KnowledgeItemSchema),
  confidence: z.number(),
  source: z.string(),
  reasoning: z.string(),
});

export type ContextualResponse = z.infer<typeof ContextualResponseSchema>;

export class KnowledgeBase {
  private knowledgeItems: KnowledgeItem[] = [];
  private documentIndex: Map<string, TrainingDocument> = new Map();

  // Adicionar documento à base de conhecimento
  async addDocument(document: TrainingDocument): Promise<void> {
    this.documentIndex.set(document.id, document);

    // Extrair itens de conhecimento do documento
    const knowledgeItems = await this.extractKnowledgeFromDocument(document);

    // Adicionar itens à base de conhecimento
    this.knowledgeItems.push(...knowledgeItems);

    console.log(
      `Documento ${document.filename} processado: ${knowledgeItems.length} itens de conhecimento extraídos`
    );
  }

  // Extrair itens de conhecimento de um documento
  private async extractKnowledgeFromDocument(
    document: TrainingDocument
  ): Promise<KnowledgeItem[]> {
    const items: KnowledgeItem[] = [];
    const content = document.extractedText;

    // Dividir conteúdo em seções
    const sections = this.splitIntoSections(content);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.trim().length < 50) continue; // Pular seções muito pequenas

      const knowledgeItem: KnowledgeItem = {
        id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: document.userId,
        sourceDocumentId: document.id,
        content: section,
        context: this.extractContext(section, document),
        category: this.categorizeContent(section),
        confidence: this.calculateConfidence(section),
        keywords: this.extractKeywords(section),
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };

      items.push(knowledgeItem);
    }

    return items;
  }

  // Dividir conteúdo em seções
  private splitIntoSections(content: string): string[] {
    // Dividir por parágrafos, títulos, ou seções
    const sections = content
      .split(/\n\s*\n/) // Dividir por parágrafos duplos
      .map((section) => section.trim())
      .filter((section) => section.length > 0);

    // Se não há seções claras, dividir por sentenças
    if (sections.length < 3) {
      return content
        .split(/[.!?]+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 20)
        .slice(0, 10); // Limitar a 10 seções
    }

    return sections;
  }

  // Extrair contexto da seção
  private extractContext(section: string, document: TrainingDocument): string {
    const context = [];

    if (document.metadata.title) {
      context.push(`Documento: ${document.metadata.title}`);
    }

    if (document.metadata.topics && document.metadata.topics.length > 0) {
      context.push(`Tópicos: ${document.metadata.topics.join(", ")}`);
    }

    // Adicionar palavras-chave relevantes
    const relevantKeywords = document.metadata.keywords?.slice(0, 3) || [];
    if (relevantKeywords.length > 0) {
      context.push(`Palavras-chave: ${relevantKeywords.join(", ")}`);
    }

    return context.join(" | ");
  }

  // Categorizar conteúdo
  private categorizeContent(
    content: string
  ): "product" | "service" | "process" | "faq" | "policy" | "technical" {
    const lowerContent = content.toLowerCase();

    // Padrões para cada categoria
    const patterns = {
      product: [
        "produto",
        "funcionalidade",
        "característica",
        "benefício",
        "recurso",
      ],
      service: [
        "serviço",
        "atendimento",
        "suporte",
        "consultoria",
        "implementação",
      ],
      process: ["processo", "passo", "procedimento", "workflow", "metodologia"],
      faq: ["pergunta", "resposta", "como", "por que", "quando", "onde"],
      policy: ["política", "regra", "norma", "procedimento", "compliance"],
      technical: [
        "técnico",
        "configuração",
        "integração",
        "api",
        "código",
        "implementação",
      ],
    };

    const scores = Object.entries(patterns).map(([category, keywords]) => {
      const score = keywords.filter((keyword) =>
        lowerContent.includes(keyword)
      ).length;
      return { category, score };
    });

    const bestMatch = scores.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    return bestMatch.score > 0 ? (bestMatch.category as any) : "process";
  }

  // Calcular confiança do item
  private calculateConfidence(content: string): number {
    let confidence = 0.5; // Base

    // Aumentar confiança baseado no comprimento
    if (content.length > 100) confidence += 0.1;
    if (content.length > 300) confidence += 0.1;

    // Aumentar confiança baseado em palavras-chave técnicas
    const technicalWords = [
      "implementação",
      "configuração",
      "integração",
      "solução",
      "método",
    ];
    const technicalCount = technicalWords.filter((word) =>
      content.toLowerCase().includes(word)
    ).length;
    confidence += technicalCount * 0.05;

    // Aumentar confiança baseado em estrutura (listas, números)
    if (
      content.includes("1.") ||
      content.includes("•") ||
      content.includes("-")
    ) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  // Extrair palavras-chave da seção
  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    // Contar frequência
    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Filtrar palavras comuns e retornar as mais frequentes
    const stopWords = [
      "para",
      "com",
      "que",
      "uma",
      "dos",
      "das",
      "pelo",
      "pela",
      "este",
      "esta",
    ];

    return Object.entries(wordCount)
      .filter(([word, count]) => count > 1 && !stopWords.includes(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Buscar conhecimento relevante para uma pergunta
  async searchKnowledge(
    userId: string,
    query: string
  ): Promise<ContextualResponse> {
    const userKnowledge = this.knowledgeItems.filter(
      (item) => item.userId === userId
    );

    if (userKnowledge.length === 0) {
      return {
        knowledgeItems: [],
        confidence: 0,
        source: "none",
        reasoning: "Nenhum conhecimento encontrado para este usuário",
      };
    }

    // Buscar itens relevantes
    const relevantItems = this.findRelevantItems(userKnowledge, query);

    if (relevantItems.length === 0) {
      return {
        knowledgeItems: [],
        confidence: 0,
        source: "none",
        reasoning:
          "Nenhum item de conhecimento relevante encontrado para a consulta",
      };
    }

    // Calcular confiança geral
    const avgConfidence =
      relevantItems.reduce((sum, item) => sum + item.confidence, 0) /
      relevantItems.length;

    // Atualizar contador de uso
    relevantItems.forEach((item) => {
      item.usageCount += 1;
      item.lastUsed = new Date().toISOString();
    });

    return {
      knowledgeItems: relevantItems,
      confidence: avgConfidence,
      source: "knowledge_base",
      reasoning: `Encontrados ${relevantItems.length} itens de conhecimento relevantes`,
    };
  }

  // Encontrar itens relevantes para uma consulta
  private findRelevantItems(
    knowledgeItems: KnowledgeItem[],
    query: string
  ): KnowledgeItem[] {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const scoredItems = knowledgeItems.map((item) => {
      let score = 0;

      // Busca por palavras-chave
      queryWords.forEach((queryWord) => {
        if (item.keywords.includes(queryWord)) {
          score += 2;
        }
        if (item.content.toLowerCase().includes(queryWord)) {
          score += 1;
        }
        if (item.context.toLowerCase().includes(queryWord)) {
          score += 1.5;
        }
      });

      // Ajustar por confiança do item
      score *= item.confidence;

      // Ajustar por frequência de uso (itens mais usados são mais relevantes)
      score *= 1 + item.usageCount * 0.1;

      return { item, score };
    });

    // Ordenar por relevância e retornar os melhores
    return scoredItems
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ item }) => item);
  }

  // Obter estatísticas da base de conhecimento
  getKnowledgeStats(userId: string) {
    const userKnowledge = this.knowledgeItems.filter(
      (item) => item.userId === userId
    );
    const documents = Array.from(this.documentIndex.values()).filter(
      (doc) => doc.userId === userId
    );

    const categoryStats = userKnowledge.reduce((stats, item) => {
      stats[item.category] = (stats[item.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);

    return {
      totalDocuments: documents.length,
      totalKnowledgeItems: userKnowledge.length,
      categoryStats,
      averageConfidence:
        userKnowledge.reduce((sum, item) => sum + item.confidence, 0) /
          userKnowledge.length || 0,
      mostUsedItems: userKnowledge
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          content: item.content.substring(0, 100) + "...",
          usageCount: item.usageCount,
        })),
    };
  }

  // Limpar conhecimento de um usuário
  clearUserKnowledge(userId: string): void {
    this.knowledgeItems = this.knowledgeItems.filter(
      (item) => item.userId !== userId
    );
    const userDocuments = Array.from(this.documentIndex.entries())
      .filter(([, doc]) => doc.userId === userId)
      .map(([id]) => id);

    userDocuments.forEach((id) => this.documentIndex.delete(id));
  }
}

export const knowledgeBase = new KnowledgeBase();
