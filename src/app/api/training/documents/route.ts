import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { logInfo, logError } from "@/lib/logger";

/**
 * GET /api/training/documents
 * List all training documents for user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = { userId };
    if (category && category !== "all") {
      where.category = category;
    }

    const documents = await prisma.trainingDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        documents: documents.map((doc) => ({
          id: doc.id,
          name: doc.name,
          type: doc.mimeType,
          size: doc.size,
          category: doc.category,
          status: doc.status,
          uploadedAt: doc.createdAt,
          chunks: doc.chunks || 0,
          error: doc.error,
        })),
      },
    });
  } catch (error) {
    logError(error as Error, {
      message: "Failed to get training documents",
    });

    return NextResponse.json(
      { success: false, error: "Failed to get documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/training/documents
 * Upload and process training document
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File exceeds 10MB limit" },
        { status: 400 }
      );
    }

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Use PDF, DOCX, TXT, or MD",
        },
        { status: 400 }
      );
    }

    // Create document record
    const document = await prisma.trainingDocument.create({
      data: {
        userId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        category,
        status: "processing",
        fileUrl: "", // Will be updated after upload
      },
    });

    logInfo("Training document uploaded", {
      userId,
      documentId: document.id,
      fileName: file.name,
      size: file.size,
    });

    // In production, this would:
    // 1. Upload file to cloud storage (Cloudinary, S3)
    // 2. Extract text using pdf-parse, mammoth, etc.
    // 3. Chunk text into manageable pieces
    // 4. Generate embeddings using OpenAI
    // 5. Store in vector database
    // 6. Update document status to "ready"

    // For now, simulate processing
    setTimeout(async () => {
      try {
        await prisma.trainingDocument.update({
          where: { id: document.id },
          data: {
            status: "ready",
            chunks: Math.floor(file.size / 1000), // Approximate chunks
            processedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Error updating document status:", error);
      }
    }, 5000); // Simulate 5 second processing

    return NextResponse.json({
      success: true,
      data: {
        documentId: document.id,
        status: "processing",
        message: "Document uploaded and processing",
      },
    });
  } catch (error) {
    logError(error as Error, {
      message: "Failed to upload training document",
    });

    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
