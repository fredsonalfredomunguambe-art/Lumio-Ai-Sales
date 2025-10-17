import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MarvinSDREngine, MarvinProfile } from "@/lib/marvin-sdr-engine";

// GET - Retrieve Marvin profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, return a default profile (in production, fetch from database)
    const defaultProfile: MarvinProfile = {
      id: `marvin-${userId}`,
      name: "Sales Representative",
      role: "Sales Representative",
      company: "Your Company",
      industry: "Technology",
      personality: "Professional, helpful, and results-oriented",
      tone: "Friendly but professional",
      expertise: ["Product knowledge", "Customer service", "Sales"],
      goals: ["Generate qualified leads", "Schedule demos", "Close deals"],
      guidelines: [
        "Always be helpful and accurate",
        "Never mention being an AI",
        "Focus on customer value",
        "Move conversations toward conversion",
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const profile: MarvinProfile = defaultProfile;

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching Marvin profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update Marvin profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profileData = await request.json();

    // Validate required fields
    const requiredFields = ["name", "role", "company", "industry"];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Save to database
    const updatedProfile: MarvinProfile = {
      ...profileData,
      id: `marvin-${userId}`,
      updatedAt: new Date(),
    };

    // For now, just validate the profile (in production, save to database)
    // TODO: Implement database saving in production

    // Initialize Marvin engine with updated profile
    const marvinEngine = new MarvinSDREngine(updatedProfile);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating Marvin profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE - Delete Marvin profile
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real implementation, this would delete from database
    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Marvin profile:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
