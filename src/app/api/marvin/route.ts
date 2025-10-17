import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const marvinSettings = await prisma.marvinSettings.findUnique({
      where: { userId },
    });

    if (!marvinSettings) {
      // Return default Marvin settings if none exist
      return NextResponse.json({
        voice: "Professional",
        guidelines: "Always be helpful and accurate",
        faqs: [],
        examples: [],
        policies: {},
      });
    }

    return NextResponse.json(marvinSettings);
  } catch (error) {
    console.error("Error fetching Marvin settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch Marvin settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voice, guidelines, faqs, examples, policies } = body;

    // Check if Marvin settings already exist
    const existingSettings = await prisma.marvinSettings.findUnique({
      where: { userId },
    });

    let marvinSettings;
    if (existingSettings) {
      // Update existing settings
      marvinSettings = await prisma.marvinSettings.update({
        where: { userId },
        data: {
          voice: voice ? JSON.parse(voice) : null,
          guidelines: guidelines ? JSON.parse(guidelines) : null,
          faqs: faqs ? JSON.parse(faqs) : null,
          examples: examples ? JSON.parse(examples) : null,
          policies: policies ? JSON.parse(policies) : null,
        },
      });
    } else {
      // Create new settings
      marvinSettings = await prisma.marvinSettings.create({
        data: {
          voice: voice ? JSON.parse(voice) : null,
          guidelines: guidelines ? JSON.parse(guidelines) : null,
          faqs: faqs ? JSON.parse(faqs) : null,
          examples: examples ? JSON.parse(examples) : null,
          policies: policies ? JSON.parse(policies) : null,
          userId,
        },
      });
    }

    return NextResponse.json(marvinSettings);
  } catch (error) {
    console.error("Error saving Marvin settings:", error);
    return NextResponse.json(
      { error: "Failed to save Marvin settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { voice, guidelines, faqs, examples, policies } = body;

    // Check if Marvin settings exist
    const existingSettings = await prisma.marvinSettings.findUnique({
      where: { userId },
    });

    if (!existingSettings) {
      return NextResponse.json(
        { error: "Marvin settings not found" },
        { status: 404 }
      );
    }

    // Update settings
    const marvinSettings = await prisma.marvinSettings.update({
      where: { userId },
      data: {
        voice: voice ? JSON.parse(voice) : existingSettings.voice,
        guidelines: guidelines
          ? JSON.parse(guidelines)
          : existingSettings.guidelines,
        faqs: faqs ? JSON.parse(faqs) : existingSettings.faqs,
        examples: examples ? JSON.parse(examples) : existingSettings.examples,
        policies: policies ? JSON.parse(policies) : existingSettings.policies,
      },
    });

    return NextResponse.json(marvinSettings);
  } catch (error) {
    console.error("Error updating Marvin settings:", error);
    return NextResponse.json(
      { error: "Failed to update Marvin settings" },
      { status: 500 }
    );
  }
}
