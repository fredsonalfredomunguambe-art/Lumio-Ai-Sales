import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const faqItems = await prisma.fAQItem.findMany({
      where: { userId },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ items: faqItems });
  } catch (error) {
    console.error("Error fetching FAQ items:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ items" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items must be an array" },
        { status: 400 }
      );
    }

    // Delete existing FAQ items
    await prisma.fAQItem.deleteMany({
      where: { userId },
    });

    // Create new FAQ items
    const createdItems = await Promise.all(
      items.map((item: any) =>
        prisma.fAQItem.create({
          data: {
            id: item.id || undefined,
            category: item.category,
            question: item.question,
            answer: item.answer,
            tags: item.tags || [],
            priority: item.priority || 1,
            userId,
          },
        })
      )
    );

    return NextResponse.json({ items: createdItems });
  } catch (error) {
    console.error("Error updating FAQ items:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, question, answer, tags, priority } = body;

    const item = await prisma.fAQItem.create({
      data: {
        category,
        question,
        answer,
        tags: tags || [],
        priority: priority || 1,
        userId,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error creating FAQ item:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ item" },
      { status: 500 }
    );
  }
}
