import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/training/documents/[id]
 * Get single document status
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const document = await prisma.trainingDocument.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        status: document.status,
        chunks: document.chunks,
        uploadedAt: document.createdAt,
        processedAt: document.processedAt,
      },
    });
  } catch (error) {
    console.error("Error getting document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/training/documents/[id]
 * Delete training document
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Verify ownership
    const document = await prisma.trainingDocument.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete from database
    await prisma.trainingDocument.delete({
      where: { id },
    });

    // In production, also:
    // - Delete file from cloud storage
    // - Remove from vector database
    // - Update AI knowledge base

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
