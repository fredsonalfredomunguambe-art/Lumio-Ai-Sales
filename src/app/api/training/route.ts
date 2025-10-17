import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  learningEngine,
  CustomerInteractionSchema,
} from "@/lib/adaptive-learning";

// GET - Obter progresso de treinamento
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = learningEngine.getProgress(userId);
    const patterns = learningEngine.getPatterns();
    const interactions = learningEngine.getUserInteractions(userId);

    return NextResponse.json({
      success: true,
      data: {
        progress,
        patterns: patterns.slice(0, 10), // Últimos 10 padrões
        interactions: interactions.slice(-20), // Últimas 20 interações
        totalInteractions: interactions.length,
        totalPatterns: patterns.length,
        userId, // Incluir userId na resposta
      },
    });
  } catch (error) {
    console.error("Error getting training progress:", error);
    return NextResponse.json(
      { error: "Failed to get training progress" },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova interação e treinar
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const interactionData = {
      ...body,
      userId,
      timestamp: new Date().toISOString(),
    };

    // Validar dados da interação
    const validatedInteraction =
      CustomerInteractionSchema.parse(interactionData);

    // Adicionar interação ao motor de aprendizado
    await learningEngine.addInteraction(validatedInteraction);

    // Treinar modelo com novos dados
    await learningEngine.trainModel(userId);

    // Obter progresso atualizado
    const progress = learningEngine.getProgress(userId);
    const patterns = learningEngine.getPatterns();
    const interactions = learningEngine.getUserInteractions(userId);

    return NextResponse.json({
      success: true,
      message: "Interaction added and model trained successfully",
      data: {
        progress,
        patterns: patterns.slice(0, 10),
        interactions: interactions.slice(-20),
        totalInteractions: interactions.length,
        totalPatterns: patterns.length,
      },
    });
  } catch (error) {
    console.error("Error adding interaction:", error);
    return NextResponse.json(
      { error: "Failed to add interaction" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar progresso de treinamento
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "retrain":
        await learningEngine.trainModel(userId);
        break;
      case "reset":
        // Resetar dados de treinamento (implementar se necessário)
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const progress = learningEngine.getProgress(userId);
    const patterns = learningEngine.getPatterns();
    const interactions = learningEngine.getUserInteractions(userId);

    return NextResponse.json({
      success: true,
      message: "Training updated successfully",
      data: {
        progress,
        patterns: patterns.slice(0, 10),
        interactions: interactions.slice(-20),
        totalInteractions: interactions.length,
        totalPatterns: patterns.length,
      },
    });
  } catch (error) {
    console.error("Error updating training:", error);
    return NextResponse.json(
      { error: "Failed to update training" },
      { status: 500 }
    );
  }
}
