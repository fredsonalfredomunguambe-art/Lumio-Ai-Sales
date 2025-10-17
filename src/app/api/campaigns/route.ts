import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Get all campaigns
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
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const source = searchParams.get("source") || "all"; // Integration source filter

    // Build where clause for Prisma
    const where: any = { userId };

    if (status !== "all") {
      where.status = status;
    }

    if (type !== "all") {
      where.type = type;
    }

    // Get campaigns from database
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        sequences: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format campaigns for frontend
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      mode: campaign.mode,
      targetSegment: campaign.targetSegment || "",
      recipients: (campaign.metrics as any)?.recipients || 0,
      openRate: (campaign.metrics as any)?.openRate || 0,
      clickRate: (campaign.metrics as any)?.clickRate || 0,
      replyRate: (campaign.metrics as any)?.replyRate || 0,
      conversionRate: (campaign.metrics as any)?.conversionRate || 0,
      createdAt: campaign.createdAt,
      lastSent: (campaign.metrics as any)?.lastSent || campaign.updatedAt,
      nextSend: (campaign.schedule as any)?.nextSend || null,
      sequences: campaign.sequences,
    }));

    return NextResponse.json({
      success: true,
      data: { campaigns: formattedCampaigns },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const campaignData = await request.json();

    // Validate required fields
    if (!campaignData.name || !campaignData.type) {
      return NextResponse.json(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Create new campaign
    const newCampaign = await createCampaignInDatabase({
      ...campaignData,
      userId,
      id: `campaign_${Date.now()}`,
      status: "DRAFT",
      recipients: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      lastSent: new Date().toISOString(),
      nextSend: new Date().toISOString(),
      sequences: [],
    });

    return NextResponse.json({
      success: true,
      data: newCampaign,
      message: "Campaign created successfully",
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// PUT - Update campaign
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Update campaign
    const updatedCampaign = await updateCampaignInDatabase(id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

// DELETE - Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Delete campaign
    await deleteCampaignFromDatabase(id, userId);

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}

// Mock database functions - replace with actual database queries
async function getCampaignsFromDatabase(
  userId: string,
  filters: { status: string; type: string }
) {
  try {
    // TODO: Replace with actual database query
    // For now, return calculated campaigns based on user data

    const mockCampaigns = [
      {
        id: "campaign_1",
        name: "Welcome Series",
        type: "EMAIL_SEQUENCE",
        status: "RUNNING",
        mode: "AUTOPILOT",
        targetSegment: "New Leads",
        recipients: 1234,
        openRate: 24.5,
        clickRate: 8.2,
        replyRate: 3.1,
        conversionRate: 1.8,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastSent: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        nextSend: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        sequences: [
          {
            id: "seq_1",
            step: 1,
            delay: 0,
            type: "EMAIL",
            subject: "Welcome to Lumio!",
            content: "Welcome email content...",
            status: "SENT",
          },
          {
            id: "seq_2",
            step: 2,
            delay: 24,
            type: "EMAIL",
            subject: "Getting Started Guide",
            content: "Guide content...",
            status: "SCHEDULED",
          },
          {
            id: "seq_3",
            step: 3,
            delay: 72,
            type: "EMAIL",
            subject: "Success Stories",
            content: "Success stories...",
            status: "DRAFT",
          },
        ],
        userId,
      },
      {
        id: "campaign_2",
        name: "Cart Recovery",
        type: "CART_RECOVERY",
        status: "RUNNING",
        mode: "COPILOT",
        targetSegment: "Cart Abandoners",
        recipients: 567,
        openRate: 18.3,
        clickRate: 12.1,
        replyRate: 2.4,
        conversionRate: 4.2,
        createdAt: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        lastSent: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        nextSend: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        sequences: [
          {
            id: "seq_4",
            step: 1,
            delay: 1,
            type: "EMAIL",
            subject: "Your cart is waiting!",
            content: "Cart recovery email...",
            status: "SENT",
          },
          {
            id: "seq_5",
            step: 2,
            delay: 24,
            type: "EMAIL",
            subject: "Special discount inside",
            content: "Discount email...",
            status: "SCHEDULED",
          },
        ],
        userId,
      },
      {
        id: "campaign_3",
        name: "Product Launch",
        type: "NURTURE",
        status: "SCHEDULED",
        mode: "COPILOT",
        targetSegment: "Qualified Leads",
        recipients: 2100,
        openRate: 0,
        clickRate: 0,
        replyRate: 0,
        conversionRate: 0,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        lastSent: new Date().toISOString(),
        nextSend: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        sequences: [
          {
            id: "seq_6",
            step: 1,
            delay: 0,
            type: "EMAIL",
            subject: "Exciting news!",
            content: "Product launch email...",
            status: "DRAFT",
          },
        ],
        userId,
      },
    ];

    // Apply filters
    let filteredCampaigns = mockCampaigns;

    if (filters.status !== "all") {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) => campaign.status === filters.status
      );
    }

    if (filters.type !== "all") {
      filteredCampaigns = filteredCampaigns.filter(
        (campaign) => campaign.type === filters.type
      );
    }

    return filteredCampaigns;
  } catch (error) {
    console.error("Error getting campaigns from database:", error);
    return [];
  }
}

async function createCampaignInDatabase(campaignData: any) {
  try {
    // TODO: Implement actual database insertion
    return campaignData;
  } catch (error) {
    console.error("Error creating campaign in database:", error);
    throw error;
  }
}

async function updateCampaignInDatabase(id: string, updateData: any) {
  try {
    // TODO: Implement actual database update
    return { id, ...updateData };
  } catch (error) {
    console.error("Error updating campaign in database:", error);
    throw error;
  }
}

async function deleteCampaignFromDatabase(id: string, userId: string) {
  try {
    // TODO: Implement actual database deletion
    return true;
  } catch (error) {
    console.error("Error deleting campaign from database:", error);
    throw error;
  }
}
