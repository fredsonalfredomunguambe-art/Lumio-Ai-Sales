import mammoth from "mammoth";
import pdf from "pdf-parse";
import { z } from "zod";

// Schema para documentos de treinamento
export const TrainingDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  filename: z.string(),
  fileType: z.enum(["txt", "docx", "pdf"]),
  content: z.string(),
  extractedText: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    createdAt: z.string(),
    fileSize: z.number(),
    wordCount: z.number(),
    topics: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
  }),
  processedAt: z.string(),
  status: z.enum(["processing", "completed", "failed"]),
});

export type TrainingDocument = z.infer<typeof TrainingDocumentSchema>;

export class DocumentParser {
  // Extrair texto de arquivo TXT
  async parseTxt(file: Buffer): Promise<string> {
    return file.toString("utf-8");
  }

  // Extrair texto de arquivo DOCX
  async parseDocx(file: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: file });
      return result.value;
    } catch (error) {
      throw new Error(`Erro ao processar arquivo DOCX: ${error}`);
    }
  }

  // Extrair texto de arquivo PDF
  async parsePdf(file: Buffer): Promise<string> {
    try {
      const data = await pdf(file);
      return data.text;
    } catch (error) {
      throw new Error(`Erro ao processar arquivo PDF: ${error}`);
    }
  }

  // Extrair texto baseado no tipo de arquivo
  async extractText(file: Buffer, fileType: string): Promise<string> {
    switch (fileType.toLowerCase()) {
      case "txt":
        return this.parseTxt(file);
      case "docx":
        return this.parseDocx(file);
      case "pdf":
        return this.parsePdf(file);
      default:
        throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
    }
  }

  // Extrair metadados do documento
  extractMetadata(content: string, filename: string, fileSize: number) {
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;

    // Extrair tópicos baseados em palavras-chave comuns
    const topics = this.extractTopics(content);

    // Extrair palavras-chave importantes
    const keywords = this.extractKeywords(content);

    return {
      title: this.extractTitle(content, filename),
      author: this.extractAuthor(content),
      createdAt: new Date().toISOString(),
      fileSize,
      wordCount,
      topics,
      keywords,
    };
  }

  // Extrair tópicos do conteúdo
  private extractTopics(content: string): string[] {
    const topicKeywords = {
      Vendas: [
        "vendas",
        "vender",
        "cliente",
        "proposta",
        "negociação",
        "fechamento",
      ],
      Marketing: [
        "marketing",
        "campanha",
        "promoção",
        "publicidade",
        "branding",
      ],
      Produto: [
        "produto",
        "serviço",
        "funcionalidade",
        "característica",
        "benefício",
      ],
      Suporte: ["suporte", "ajuda", "problema", "solução", "atendimento"],
      Financeiro: ["preço", "custo", "orçamento", "pagamento", "financeiro"],
      Técnico: [
        "técnico",
        "implementação",
        "integração",
        "configuração",
        "setup",
      ],
    };

    const topics: string[] = [];
    const lowerContent = content.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matchCount = keywords.filter((keyword) =>
        lowerContent.includes(keyword)
      ).length;

      if (matchCount >= 2) {
        topics.push(topic);
      }
    }

    return topics;
  }

  // Extrair palavras-chave importantes
  private extractKeywords(content: string): string[] {
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 4);

    // Contar frequência das palavras
    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Filtrar palavras comuns
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
      "isso",
      "aqui",
      "onde",
      "quando",
      "como",
      "porque",
      "então",
      "mas",
      "porém",
      "também",
      "muito",
      "mais",
      "menos",
      "bem",
      "mal",
      "sempre",
      "nunca",
      "sempre",
      "nunca",
      "hoje",
      "ontem",
      "amanhã",
      "agora",
      "depois",
      "antes",
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
    ];

    return Object.entries(wordCount)
      .filter(([word, count]) => count > 2 && !stopWords.includes(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  // Extrair título do documento
  private extractTitle(content: string, filename: string): string {
    // Tentar extrair título das primeiras linhas
    const lines = content.split("\n").filter((line) => line.trim().length > 0);

    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length > 10 && firstLine.length < 100) {
        return firstLine;
      }
    }

    // Usar nome do arquivo como fallback
    return filename.replace(/\.[^/.]+$/, "");
  }

  // Extrair autor do documento
  private extractAuthor(content: string): string | undefined {
    // Procurar por padrões comuns de autor
    const authorPatterns = [
      /autor[:\s]+(.+)/i,
      /author[:\s]+(.+)/i,
      /por[:\s]+(.+)/i,
      /by[:\s]+(.+)/i,
    ];

    for (const pattern of authorPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  // Processar documento completo
  async processDocument(
    file: Buffer,
    filename: string,
    userId: string
  ): Promise<TrainingDocument> {
    const fileType = filename.split(".").pop()?.toLowerCase() || "txt";
    const fileSize = file.length;

    try {
      const extractedText = await this.extractText(file, fileType);
      const metadata = this.extractMetadata(extractedText, filename, fileSize);

      const document: TrainingDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        filename,
        fileType: fileType as "txt" | "docx" | "pdf",
        content: extractedText,
        extractedText,
        metadata,
        processedAt: new Date().toISOString(),
        status: "completed",
      };

      return document;
    } catch (error) {
      throw new Error(`Erro ao processar documento: ${error}`);
    }
  }
}

export const documentParser = new DocumentParser();
