import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { learningEngine } from "@/lib/adaptive-learning";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      interactionId,
      satisfaction,
      outcome,
      feedback = "",
      context = {},
    } = body;

    if (!interactionId || !satisfaction || !outcome) {
      return NextResponse.json(
        { error: "interactionId, satisfaction, and outcome are required" },
        { status: 400 }
      );
    }

    // Buscar interação existente
    const interactions = learningEngine.getUserInteractions(userId);
    const interaction = interactions.find((i) => i.id === interactionId);

    if (!interaction) {
      return NextResponse.json(
        { error: "Interaction not found" },
        { status: 404 }
      );
    }

    // Atualizar interação com feedback
    const updatedInteraction = {
      ...interaction,
      customerSatisfaction: satisfaction,
      outcome,
      context: {
        ...interaction.context,
        feedback,
        ...context,
      },
    };

    // Adicionar interação atualizada
    await learningEngine.addInteraction(updatedInteraction);

    // Treinar modelo com feedback
    await learningEngine.trainModel(userId);

    // Obter progresso atualizado
    const progress = learningEngine.getProgress(userId);

    return NextResponse.json({
      success: true,
      message: "Feedback recorded and model updated",
      data: {
        progress,
        improvements: progress?.improvements || [],
      },
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    return NextResponse.json(
      { error: "Failed to record feedback" },
      { status: 500 }
    );
  }
}
