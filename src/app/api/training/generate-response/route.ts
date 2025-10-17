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
    const { customerInput, context = {}, interactionType = "chat" } = body;

    if (!customerInput) {
      return NextResponse.json(
        { error: "Customer input is required" },
        { status: 400 }
      );
    }

    // Gerar resposta adaptada baseada no aprendizado
    const adaptedResponse = await learningEngine.generateAdaptedResponse(
      userId,
      customerInput,
      context
    );

    // Registrar a interação para aprendizado
    const interaction = {
      id: `interaction_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      interactionType,
      customerInput,
      marvinResponse: adaptedResponse,
      outcome: "pending", // Será atualizado quando soubermos o resultado
      context,
    };

    await learningEngine.addInteraction(interaction);

    return NextResponse.json({
      success: true,
      data: {
        response: adaptedResponse,
        interactionId: interaction.id,
        learningApplied: true,
      },
    });
  } catch (error) {
    console.error("Error generating adapted response:", error);
    return NextResponse.json(
      { error: "Failed to generate adapted response" },
      { status: 500 }
    );
  }
}
