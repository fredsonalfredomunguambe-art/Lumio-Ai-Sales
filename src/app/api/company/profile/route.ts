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

    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      return NextResponse.json({
        name: "",
        website: "",
        industry: "",
        companySize: "",
        mission: "",
        uniqueValueProp: "",
        keyProducts: [],
        brandVoice: "professional",
        conversionGoals: [],
        commonObjections: [],
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
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

    const body = await req.json();
    const {
      name,
      website,
      industry,
      companySize,
      mission,
      uniqueValueProp,
      keyProducts,
      brandVoice,
      conversionGoals,
      commonObjections,
    } = body;

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId },
    });

    let company;
    if (existingCompany) {
      // Update existing company
      company = await prisma.company.update({
        where: { userId },
        data: {
          name,
          website,
          industry,
          logo: existingCompany.logo, // Keep existing logo
          settings: {
            companySize,
            mission,
            uniqueValueProp,
            keyProducts: keyProducts || [],
            brandVoice: brandVoice || "professional",
            conversionGoals: conversionGoals || [],
            commonObjections: commonObjections || [],
          },
        },
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          name,
          website,
          industry,
          logo: "",
          settings: {
            companySize,
            mission,
            uniqueValueProp,
            keyProducts: keyProducts || [],
            brandVoice: brandVoice || "professional",
            conversionGoals: conversionGoals || [],
            commonObjections: commonObjections || [],
          },
          userId,
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Failed to update company profile" },
      { status: 500 }
    );
  }
}
