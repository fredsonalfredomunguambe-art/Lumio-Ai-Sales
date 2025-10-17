import { z } from "zod";

// Schema para dados de treinamento do cliente
export const CustomerInteractionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.string(),
  interactionType: z.enum(["chat", "email", "call", "feedback"]),
  customerInput: z.string(),
  marvinResponse: z.string(),
  customerSatisfaction: z.number().min(1).max(5).optional(),
  outcome: z.enum(["success", "objection", "no_response", "not_interested"]),
  context: z.record(z.any()).optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  painPoints: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
});

export type CustomerInteraction = z.infer<typeof CustomerInteractionSchema>;

// Schema para padrões de aprendizado
export const LearningPatternSchema = z.object({
  id: z.string(),
  pattern: z.string(),
  frequency: z.number(),
  successRate: z.number(),
  context: z.record(z.any()),
  lastUpdated: z.string(),
  confidence: z.number().min(0).max(1),
});

export type LearningPattern = z.infer<typeof LearningPatternSchema>;

// Schema para progresso de treinamento
export const TrainingProgressSchema = z.object({
  userId: z.string(),
  totalInteractions: z.number(),
  successfulInteractions: z.number(),
  learningPatterns: z.array(LearningPatternSchema),
  adaptationScore: z.number().min(0).max(100),
  lastTraining: z.string(),
  nextTraining: z.string(),
  improvements: z.array(z.string()),
  performanceMetrics: z.object({
    responseAccuracy: z.number(),
    customerSatisfaction: z.number(),
    adaptationSpeed: z.number(),
    contextUnderstanding: z.number(),
  }),
});

export type TrainingProgress = z.infer<typeof TrainingProgressSchema>;

export class AdaptiveLearningEngine {
  private interactions: CustomerInteraction[] = [];
  private patterns: LearningPattern[] = [];
  private progress: Map<string, TrainingProgress> = new Map();

  // Adicionar nova interação do cliente
  async addInteraction(interaction: CustomerInteraction): Promise<void> {
    this.interactions.push(interaction);
    await this.analyzePatterns(interaction);
    await this.updateProgress(interaction.userId);
  }

  // Analisar padrões na interação
  private async analyzePatterns(
    interaction: CustomerInteraction
  ): Promise<void> {
    const { customerInput, marvinResponse, outcome, context } = interaction;

    // Extrair palavras-chave e sentimentos
    const keywords = this.extractKeywords(customerInput);
    const sentiment = this.analyzeSentiment(customerInput);
    const responseEffectiveness = this.analyzeResponseEffectiveness(
      marvinResponse,
      outcome
    );

    // Criar ou atualizar padrão
    const patternId = this.generatePatternId(keywords, sentiment, context);
    const existingPattern = this.patterns.find((p) => p.id === patternId);

    if (existingPattern) {
      existingPattern.frequency += 1;
      existingPattern.successRate =
        (existingPattern.successRate + responseEffectiveness) / 2;
      existingPattern.lastUpdated = new Date().toISOString();
      existingPattern.confidence = Math.min(
        1,
        existingPattern.confidence + 0.1
      );
    } else {
      this.patterns.push({
        id: patternId,
        pattern: keywords.join(" "),
        frequency: 1,
        successRate: responseEffectiveness,
        context: { sentiment, ...context },
        lastUpdated: new Date().toISOString(),
        confidence: 0.5,
      });
    }
  }

  // Atualizar progresso do usuário
  private async updateProgress(userId: string): Promise<void> {
    const userInteractions = this.interactions.filter(
      (i) => i.userId === userId
    );
    const successfulInteractions = userInteractions.filter(
      (i) => i.outcome === "success"
    );
    const userPatterns = this.patterns.filter((p) =>
      userInteractions.some((i) => this.matchesPattern(i, p))
    );

    const adaptationScore = this.calculateAdaptationScore(
      userInteractions,
      userPatterns
    );
    const performanceMetrics =
      this.calculatePerformanceMetrics(userInteractions);

    this.progress.set(userId, {
      userId,
      totalInteractions: userInteractions.length,
      successfulInteractions: successfulInteractions.length,
      learningPatterns: userPatterns,
      adaptationScore,
      lastTraining: new Date().toISOString(),
      nextTraining: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      improvements: this.generateImprovements(userInteractions, userPatterns),
      performanceMetrics,
    });
  }

  // Extrair palavras-chave do input do cliente
  private extractKeywords(input: string): string[] {
    const words = input
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    // Filtrar palavras comuns
    const stopWords = [
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "its",
      "may",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "man",
      "oil",
      "sit",
      "try",
      "use",
      "she",
      "put",
      "end",
      "why",
      "let",
      "ask",
      "ran",
      "eat",
      "yes",
      "hot",
      "far",
      "sea",
      "draw",
      "left",
      "late",
      "run",
      "dont",
      "while",
      "press",
      "close",
      "night",
      "real",
      "life",
      "few",
      "north",
      "open",
      "seem",
      "together",
      "next",
      "white",
      "children",
      "begin",
      "got",
      "walk",
      "example",
      "ease",
      "paper",
      "group",
      "always",
      "music",
      "those",
      "both",
      "mark",
      "often",
      "letter",
      "until",
      "mile",
      "river",
      "car",
      "feet",
      "care",
      "second",
      "book",
      "carry",
      "took",
      "science",
      "eat",
      "room",
      "friend",
      "began",
      "idea",
      "fish",
      "mountain",
      "stop",
      "once",
      "base",
      "hear",
      "horse",
      "cut",
      "sure",
      "watch",
      "color",
      "face",
      "wood",
      "main",
      "enough",
      "plain",
      "girl",
      "usual",
      "young",
      "ready",
      "above",
      "ever",
      "red",
      "list",
      "though",
      "feel",
      "talk",
      "bird",
      "soon",
      "body",
      "dog",
      "family",
      "direct",
      "leave",
      "song",
      "measure",
      "door",
      "product",
      "black",
      "short",
      "numeral",
      "class",
      "wind",
      "question",
      "happen",
      "complete",
      "ship",
      "area",
      "half",
      "rock",
      "order",
      "fire",
      "south",
      "problem",
      "piece",
      "told",
      "knew",
      "pass",
      "since",
      "top",
      "whole",
      "king",
      "space",
      "heard",
      "best",
      "hour",
      "better",
      "during",
      "hundred",
      "five",
      "remember",
      "step",
      "early",
      "hold",
      "west",
      "ground",
      "interest",
      "reach",
      "fast",
      "verb",
      "sing",
      "listen",
      "six",
      "table",
      "travel",
      "less",
      "morning",
      "ten",
      "simple",
      "several",
      "vowel",
      "toward",
      "war",
      "lay",
      "against",
      "pattern",
      "slow",
      "center",
      "love",
      "person",
      "money",
      "serve",
      "appear",
      "road",
      "map",
      "rain",
      "rule",
      "govern",
      "pull",
      "cold",
      "notice",
      "voice",
      "unit",
      "power",
      "town",
      "fine",
      "certain",
      "fly",
      "fall",
      "lead",
      "cry",
      "dark",
      "machine",
      "note",
      "wait",
      "plan",
      "figure",
      "star",
      "box",
      "noun",
      "field",
      "rest",
      "correct",
      "able",
      "pound",
      "done",
      "beauty",
      "drive",
      "stood",
      "contain",
      "front",
      "teach",
      "week",
      "final",
      "gave",
      "green",
      "oh",
      "quick",
      "develop",
      "ocean",
      "warm",
      "free",
      "minute",
      "strong",
      "special",
      "mind",
      "behind",
      "clear",
      "tail",
      "produce",
      "fact",
      "street",
      "inch",
      "multiply",
      "nothing",
      "course",
      "stay",
      "wheel",
      "full",
      "force",
      "blue",
      "object",
      "decide",
      "surface",
      "deep",
      "moon",
      "island",
      "foot",
      "system",
      "busy",
      "test",
      "record",
      "boat",
      "common",
      "gold",
      "possible",
      "plane",
      "stead",
      "dry",
      "wonder",
      "laugh",
      "thousand",
      "ago",
      "ran",
      "check",
      "game",
      "shape",
      "equate",
      "miss",
      "brought",
      "heat",
      "snow",
      "tire",
      "bring",
      "yes",
      "distant",
      "fill",
      "east",
      "paint",
      "language",
      "among",
    ];

    return words.filter((word) => !stopWords.includes(word));
  }

  // Analisar sentimento do input
  private analyzeSentiment(input: string): "positive" | "negative" | "neutral" {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "love",
      "like",
      "happy",
      "satisfied",
      "perfect",
      "awesome",
      "brilliant",
      "outstanding",
      "impressive",
      "helpful",
      "useful",
      "effective",
      "efficient",
      "fast",
      "quick",
      "easy",
      "simple",
      "clear",
      "understand",
      "solution",
      "resolve",
      "fix",
      "improve",
      "better",
      "best",
      "recommend",
      "suggest",
      "advice",
      "support",
      "assist",
      "help",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "angry",
      "frustrated",
      "disappointed",
      "upset",
      "confused",
      "difficult",
      "hard",
      "complex",
      "complicated",
      "slow",
      "problem",
      "issue",
      "error",
      "bug",
      "broken",
      "wrong",
      "incorrect",
      "fail",
      "failure",
      "waste",
      "useless",
      "pointless",
      "stupid",
      "dumb",
      "annoying",
      "irritating",
      "boring",
      "tired",
      "exhausted",
      "stressed",
      "worried",
      "concerned",
      "scared",
      "afraid",
      "nervous",
      "anxious",
    ];

    const words = input.toLowerCase().split(/\s+/);
    const positiveCount = words.filter((word) =>
      positiveWords.includes(word)
    ).length;
    const negativeCount = words.filter((word) =>
      negativeWords.includes(word)
    ).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  // Analisar efetividade da resposta
  private analyzeResponseEffectiveness(
    response: string,
    outcome: string
  ): number {
    let score = 0.5; // Base score

    // Ajustar baseado no outcome
    switch (outcome) {
      case "success":
        score += 0.4;
        break;
      case "objection":
        score -= 0.2;
        break;
      case "no_response":
        score -= 0.3;
        break;
      case "not_interested":
        score -= 0.1;
        break;
    }

    // Ajustar baseado no comprimento e qualidade da resposta
    if (response.length > 50 && response.length < 500) score += 0.1;
    if (response.includes("?")) score += 0.05; // Perguntas são boas
    if (response.includes("!")) score += 0.02; // Entusiasmo é bom

    return Math.max(0, Math.min(1, score));
  }

  // Gerar ID único para padrão
  private generatePatternId(
    keywords: string[],
    sentiment: string,
    context: any
  ): string {
    const contextStr = JSON.stringify(context);
    return btoa(
      keywords.join("|") + "|" + sentiment + "|" + contextStr
    ).replace(/[^a-zA-Z0-9]/g, "");
  }

  // Verificar se interação corresponde ao padrão
  private matchesPattern(
    interaction: CustomerInteraction,
    pattern: LearningPattern
  ): boolean {
    const keywords = this.extractKeywords(interaction.customerInput);
    const sentiment = this.analyzeSentiment(interaction.customerInput);

    return (
      keywords.some((keyword) => pattern.pattern.includes(keyword)) &&
      pattern.context.sentiment === sentiment
    );
  }

  // Calcular score de adaptação
  private calculateAdaptationScore(
    interactions: CustomerInteraction[],
    patterns: LearningPattern[]
  ): number {
    if (interactions.length === 0) return 0;

    const recentInteractions = interactions.slice(-10); // Últimas 10 interações
    const successRate =
      recentInteractions.filter((i) => i.outcome === "success").length /
      recentInteractions.length;
    const patternUtilization =
      patterns.length / Math.max(1, interactions.length / 5);
    const improvementTrend = this.calculateImprovementTrend(interactions);

    return Math.round(
      successRate * 40 + patternUtilization * 30 + improvementTrend * 30
    );
  }

  // Calcular tendência de melhoria
  private calculateImprovementTrend(
    interactions: CustomerInteraction[]
  ): number {
    if (interactions.length < 5) return 0.5;

    const recent = interactions.slice(-5);
    const older = interactions.slice(-10, -5);

    const recentSuccess =
      recent.filter((i) => i.outcome === "success").length / recent.length;
    const olderSuccess =
      older.filter((i) => i.outcome === "success").length / older.length;

    return Math.max(0, Math.min(1, recentSuccess - olderSuccess + 0.5));
  }

  // Calcular métricas de performance
  private calculatePerformanceMetrics(interactions: CustomerInteraction[]) {
    const total = interactions.length;
    const successful = interactions.filter(
      (i) => i.outcome === "success"
    ).length;
    const withSatisfaction = interactions.filter(
      (i) => i.customerSatisfaction
    ).length;

    const avgSatisfaction =
      withSatisfaction > 0
        ? interactions.reduce(
            (sum, i) => sum + (i.customerSatisfaction || 3),
            0
          ) / withSatisfaction
        : 3;

    const responseAccuracy = total > 0 ? (successful / total) * 100 : 0;
    const customerSatisfaction = (avgSatisfaction / 5) * 100;
    const adaptationSpeed = this.calculateAdaptationSpeed(interactions);
    const contextUnderstanding =
      this.calculateContextUnderstanding(interactions);

    return {
      responseAccuracy: Math.round(responseAccuracy),
      customerSatisfaction: Math.round(customerSatisfaction),
      adaptationSpeed: Math.round(adaptationSpeed),
      contextUnderstanding: Math.round(contextUnderstanding),
    };
  }

  // Calcular velocidade de adaptação
  private calculateAdaptationSpeed(
    interactions: CustomerInteraction[]
  ): number {
    if (interactions.length < 3) return 50;

    const recent = interactions.slice(-3);
    const successRate =
      recent.filter((i) => i.outcome === "success").length / recent.length;
    return successRate * 100;
  }

  // Calcular entendimento de contexto
  private calculateContextUnderstanding(
    interactions: CustomerInteraction[]
  ): number {
    const withContext = interactions.filter(
      (i) => i.context && Object.keys(i.context).length > 0
    ).length;
    return (withContext / interactions.length) * 100;
  }

  // Gerar melhorias baseadas nos dados
  private generateImprovements(
    interactions: CustomerInteraction[],
    patterns: LearningPattern[]
  ): string[] {
    const improvements: string[] = [];

    // Analisar padrões de sucesso
    const successfulPatterns = patterns.filter((p) => p.successRate > 0.7);
    if (successfulPatterns.length > 0) {
      improvements.push(
        `Continue using successful patterns: ${successfulPatterns
          .map((p) => p.pattern)
          .join(", ")}`
      );
    }

    // Analisar padrões problemáticos
    const problematicPatterns = patterns.filter((p) => p.successRate < 0.3);
    if (problematicPatterns.length > 0) {
      improvements.push(
        `Improve responses for: ${problematicPatterns
          .map((p) => p.pattern)
          .join(", ")}`
      );
    }

    // Analisar sentimentos
    const negativeInteractions = interactions.filter(
      (i) => this.analyzeSentiment(i.customerInput) === "negative"
    );
    if (negativeInteractions.length > interactions.length * 0.3) {
      improvements.push(
        "Focus on improving customer satisfaction and addressing concerns"
      );
    }

    // Analisar tipos de interação
    const chatInteractions = interactions.filter(
      (i) => i.interactionType === "chat"
    );
    if (chatInteractions.length > 0) {
      const chatSuccessRate =
        chatInteractions.filter((i) => i.outcome === "success").length /
        chatInteractions.length;
      if (chatSuccessRate < 0.6) {
        improvements.push(
          "Improve chat conversation quality and response timing"
        );
      }
    }

    return improvements.slice(0, 5); // Máximo 5 melhorias
  }

  // Obter progresso do usuário
  getProgress(userId: string): TrainingProgress | null {
    return this.progress.get(userId) || null;
  }

  // Obter todos os padrões de aprendizado
  getPatterns(): LearningPattern[] {
    return this.patterns;
  }

  // Obter interações do usuário
  getUserInteractions(userId: string): CustomerInteraction[] {
    return this.interactions.filter((i) => i.userId === userId);
  }

  // Treinar modelo com novos dados
  async trainModel(userId: string): Promise<void> {
    const userInteractions = this.getUserInteractions(userId);
    const patterns = this.patterns.filter((p) =>
      userInteractions.some((i) => this.matchesPattern(i, p))
    );

    // Simular treinamento (em produção, aqui seria a integração com o modelo de IA)
    console.log(
      `Training model for user ${userId} with ${userInteractions.length} interactions and ${patterns.length} patterns`
    );

    // Atualizar progresso após treinamento
    await this.updateProgress(userId);
  }

  // Gerar resposta adaptada baseada no aprendizado
  async generateAdaptedResponse(
    userId: string,
    customerInput: string,
    context: any
  ): Promise<string> {
    const userProgress = this.getProgress(userId);
    const userPatterns = this.patterns.filter((p) =>
      userProgress?.learningPatterns.some((lp) => lp.id === p.id)
    );

    // Encontrar padrão mais similar
    const keywords = this.extractKeywords(customerInput);
    const sentiment = this.analyzeSentiment(customerInput);

    const similarPattern = userPatterns.find(
      (p) =>
        keywords.some((keyword) => p.pattern.includes(keyword)) &&
        p.context.sentiment === sentiment
    );

    if (similarPattern && similarPattern.successRate > 0.7) {
      // Usar padrão de sucesso conhecido
      return this.generateResponseFromPattern(
        similarPattern,
        customerInput,
        context
      );
    }

    // Gerar resposta baseada no contexto e aprendizado geral
    return this.generateContextualResponse(
      customerInput,
      context,
      userProgress
    );
  }

  // Gerar resposta baseada em padrão
  private generateResponseFromPattern(
    pattern: LearningPattern,
    input: string,
    context: any
  ): string {
    // Em produção, aqui seria a geração real de resposta baseada no padrão
    const baseResponse = `Based on similar successful interactions, I understand you're looking for help with ${pattern.pattern}. `;

    if (pattern.context.sentiment === "positive") {
      return (
        baseResponse +
        "I'm excited to help you with this! Let me provide you with the best solution."
      );
    } else if (pattern.context.sentiment === "negative") {
      return (
        baseResponse +
        "I understand your concerns. Let me address them directly and find a solution that works for you."
      );
    }

    return baseResponse + "Let me help you with this step by step.";
  }

  // Gerar resposta contextual
  private generateContextualResponse(
    input: string,
    context: any,
    progress: TrainingProgress | null
  ): string {
    const sentiment = this.analyzeSentiment(input);
    const keywords = this.extractKeywords(input);

    let response = "I understand you're asking about ";

    if (keywords.length > 0) {
      response += keywords.slice(0, 3).join(", ") + ". ";
    }

    if (sentiment === "negative") {
      response += "I want to help resolve any issues you're experiencing. ";
    } else if (sentiment === "positive") {
      response += "I'm glad to help you with this! ";
    }

    if (progress && progress.performanceMetrics.contextUnderstanding > 70) {
      response +=
        "Based on our previous interactions, I can provide you with a personalized solution. ";
    }

    response +=
      "Let me provide you with the most relevant information and assistance.";

    return response;
  }
}

// Instância global do motor de aprendizado
export const learningEngine = new AdaptiveLearningEngine();
