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

    const company = await prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      // Return default company data if none exists
      return NextResponse.json({
        name: "",
        website: "",
        industry: "",
        logo: "",
        settings: {},
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company data" },
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
    const { name, website, industry, logo, settings } = body;

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
          logo,
          settings: settings ? JSON.parse(settings) : null,
        },
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          name,
          website,
          industry,
          logo,
          settings: settings ? JSON.parse(settings) : null,
          userId,
        },
      });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error saving company:", error);
    return NextResponse.json(
      { error: "Failed to save company data" },
      { status: 500 }
    );
  }
}
