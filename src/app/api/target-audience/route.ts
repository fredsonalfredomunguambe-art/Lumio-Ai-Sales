import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const targetAudience = await db.targetAudience.findUnique({
      where: { userId: user.id },
    });

    if (!targetAudience) {
      return NextResponse.json({
        industry: [],
        companySize: [],
        jobTitles: [],
        painPoints: [],
        goals: [],
        budgetRange: "",
        decisionProcess: "",
      });
    }

    return NextResponse.json({
      industry: JSON.parse(targetAudience.industry || "[]"),
      companySize: JSON.parse(targetAudience.companySize || "[]"),
      jobTitles: JSON.parse(targetAudience.jobTitles || "[]"),
      painPoints: JSON.parse(targetAudience.painPoints || "[]"),
      goals: JSON.parse(targetAudience.goals || "[]"),
      budgetRange: targetAudience.budgetRange || "",
      decisionProcess: targetAudience.decisionProcess || "",
    });
  } catch (error) {
    console.error("Error fetching target audience:", error);
    return NextResponse.json(
      { error: "Failed to fetch target audience" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();

    await db.targetAudience.upsert({
      where: { userId: user.id },
      update: {
        industry: JSON.stringify(data.industry || []),
        companySize: JSON.stringify(data.companySize || []),
        jobTitles: JSON.stringify(data.jobTitles || []),
        painPoints: JSON.stringify(data.painPoints || []),
        goals: JSON.stringify(data.goals || []),
        budgetRange: data.budgetRange || "",
        decisionProcess: data.decisionProcess || "",
      },
      create: {
        userId: user.id,
        industry: JSON.stringify(data.industry || []),
        companySize: JSON.stringify(data.companySize || []),
        jobTitles: JSON.stringify(data.jobTitles || []),
        painPoints: JSON.stringify(data.painPoints || []),
        goals: JSON.stringify(data.goals || []),
        budgetRange: data.budgetRange || "",
        decisionProcess: data.decisionProcess || "",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating target audience:", error);
    return NextResponse.json(
      { error: "Failed to update target audience" },
      { status: 500 }
    );
  }
}

