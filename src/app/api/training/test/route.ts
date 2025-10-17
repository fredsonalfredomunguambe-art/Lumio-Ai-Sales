import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateMarvinResponse } from "@/lib/marvin";
import { knowledgeBase } from "@/lib/knowledge-base";

// POST - Testar resposta do Marvin com conhecimento
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, companyProfile } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Perfil da empresa é obrigatório" },
        { status: 400 }
      );
    }

    // Gerar resposta do Marvin com conhecimento
    const response = await generateMarvinResponse(
      message,
      companyProfile,
      undefined, // context
      undefined, // chatHistory
      userId // userId para buscar conhecimento
    );

    // Buscar conhecimento usado na resposta
    const knowledgeResponse = await knowledgeBase.searchKnowledge(
      userId,
      message
    );

    return NextResponse.json({
      success: true,
      data: {
        message,
        response,
        knowledgeUsed: {
          itemsCount: knowledgeResponse.knowledgeItems.length,
          confidence: knowledgeResponse.confidence,
          source: knowledgeResponse.source,
          reasoning: knowledgeResponse.reasoning,
        },
        knowledgeItems: knowledgeResponse.knowledgeItems.map((item) => ({
          id: item.id,
          content: item.content.substring(0, 200) + "...",
          category: item.category,
          confidence: item.confidence,
          context: item.context,
        })),
      },
    });
  } catch (error) {
    console.error("Error testing Marvin response:", error);
    return NextResponse.json(
      { error: "Falha ao testar resposta do Marvin" },
      { status: 500 }
    );
  }
}
