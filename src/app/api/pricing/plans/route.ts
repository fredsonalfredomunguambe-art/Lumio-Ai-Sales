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

    const pricingPlans = await prisma.pricingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ plans: pricingPlans });
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
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

    const { plans } = await req.json();

    if (!Array.isArray(plans)) {
      return NextResponse.json(
        { error: "Plans must be an array" },
        { status: 400 }
      );
    }

    // Delete existing plans
    await prisma.pricingPlan.deleteMany({
      where: { userId },
    });

    // Create new plans
    const createdPlans = await Promise.all(
      plans.map((plan: any) =>
        prisma.pricingPlan.create({
          data: {
            id: plan.id || undefined,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency || "USD",
            billingPeriod: plan.billingPeriod || "monthly",
            features: plan.features || [],
            isPopular: plan.isPopular || false,
            userId,
          },
        })
      )
    );

    return NextResponse.json({ plans: createdPlans });
  } catch (error) {
    console.error("Error updating pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to update pricing plans" },
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
    const {
      name,
      description,
      price,
      currency,
      billingPeriod,
      features,
      isPopular,
    } = body;

    const plan = await prisma.pricingPlan.create({
      data: {
        name,
        description,
        price,
        currency: currency || "USD",
        billingPeriod: billingPeriod || "monthly",
        features: features || [],
        isPopular: isPopular || false,
        userId,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Error creating pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to create pricing plan" },
      { status: 500 }
    );
  }
}
