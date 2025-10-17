import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Get all leads with filtering and pagination
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const segment = searchParams.get("segment") || "all";
    const status = searchParams.get("status") || "all";
    const source = searchParams.get("source") || "all"; // Integration source filter
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build Prisma query filters
    const where: any = {
      userId,
    };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ];
    }

    // Status filter
    if (status !== "all") {
      where.status = status;
    }

    // Source filter (INTEGRATION FILTERING)
    if (source !== "all") {
      where.source = source;
    }

    // Segment filter
    if (segment !== "all") {
      where.segmentId = segment;
    }

    // Get total count for pagination
    const total = await prisma.lead.count({ where });

    // Get leads with pagination and sorting
    const leads = await prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        segment: true,
        leadScores: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Format leads for frontend
    const formattedLeads = leads.map((lead) => ({
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      company: lead.company || "",
      jobTitle: lead.jobTitle || "",
      phone: lead.phone || "",
      source: lead.source || "lumio",
      externalId: lead.externalId,
      lastSyncedAt: lead.lastSyncedAt,
      score: lead.leadScores[0]?.score || lead.score || 0,
      status: lead.status,
      lastInteraction: lead.updatedAt,
      createdAt: lead.createdAt,
      tags: lead.tags?.split(",") || [],
      notes: lead.notes || "",
    }));

    return NextResponse.json({
      success: true,
      data: {
        leads: formattedLeads,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        filters: {
          search,
          segment,
          status,
          source,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const leadData = await request.json();

    // Validate required fields
    if (!leadData.email || !leadData.firstName || !leadData.lastName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: email, firstName, lastName",
        },
        { status: 400 }
      );
    }

    // Create new lead
    const newLead = await createLeadInDatabase({
      ...leadData,
      userId,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      score: calculateLeadScore(leadData),
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lead" },
      { status: 500 }
    );
  }
}

// PUT - Update lead
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
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Update lead in database
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        ...updateData,
        tags: updateData.tags?.join(","),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: "Lead updated successfully",
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lead
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
        { success: false, error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Delete lead from database
    await prisma.lead.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}

// Mock database functions - replace with actual database queries
async function getLeadsFromDatabase({
  userId,
  page,
  limit,
  search,
  segment,
  status,
  source,
  sortBy,
  sortOrder,
}: {
  userId: string;
  page: number;
  limit: number;
  search: string;
  segment: string;
  status: string;
  source: string;
  sortBy: string;
  sortOrder: string;
}) {
  // Mock data - replace with actual database query
  const mockLeads = [
    {
      id: "lead_1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@techcorp.com",
      company: "TechCorp",
      jobTitle: "CTO",
      phone: "+1-555-0123",
      source: "LinkedIn",
      score: 85,
      status: "QUALIFIED",
      lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      owner: "You",
      tags: ["High Value", "Tech"],
      notes: "Interested in enterprise solution",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@startup.io",
      company: "StartupIO",
      jobTitle: "CEO",
      phone: "+1-555-0124",
      source: "Website",
      score: 92,
      status: "NEW",
      lastInteraction: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      owner: "You",
      tags: ["Hot Lead", "Startup"],
      notes: "Requested demo",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "lead_3",
      firstName: "Mike",
      lastName: "Davis",
      email: "mike.davis@enterprise.com",
      company: "Enterprise Corp",
      jobTitle: "VP Sales",
      phone: "+1-555-0125",
      source: "Referral",
      score: 78,
      status: "CONTACTED",
      lastInteraction: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      owner: "You",
      tags: ["Enterprise", "Referral"],
      notes: "Follow up next week",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Apply filters
  let filteredLeads = mockLeads;

  if (search) {
    filteredLeads = filteredLeads.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(search.toLowerCase()) ||
        lead.lastName.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.company.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status !== "all") {
    filteredLeads = filteredLeads.filter((lead) => lead.status === status);
  }

  if (source !== "all") {
    filteredLeads = filteredLeads.filter(
      (lead) => lead.source.toLowerCase() === source.toLowerCase()
    );
  }

  // Apply sorting
  filteredLeads.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a];
    const bValue = b[sortBy as keyof typeof b];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    return 0;
  });

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  return {
    data: paginatedLeads,
    total: filteredLeads.length,
  };
}

async function createLeadInDatabase(leadData: any) {
  // TODO: Implement actual database insertion
  return leadData;
}

async function updateLeadInDatabase(id: string, updateData: any) {
  // TODO: Implement actual database update
  return { id, ...updateData };
}

async function deleteLeadFromDatabase(id: string, userId: string) {
  // TODO: Implement actual database deletion
  return true;
}

function calculateLeadScore(leadData: any): number {
  let score = 50; // Base score

  // Job title scoring
  const title = leadData.jobTitle?.toLowerCase() || "";
  if (title.includes("ceo") || title.includes("founder")) score += 30;
  else if (title.includes("vp") || title.includes("director")) score += 25;
  else if (title.includes("manager") || title.includes("head")) score += 20;
  else if (title.includes("senior") || title.includes("lead")) score += 15;

  // Company size scoring
  const company = leadData.company?.toLowerCase() || "";
  if (company.includes("corp") || company.includes("enterprise")) score += 20;
  else if (company.includes("inc") || company.includes("llc")) score += 10;

  // Source scoring
  const source = leadData.source?.toLowerCase() || "";
  if (source === "referral") score += 15;
  else if (source === "linkedin") score += 10;
  else if (source === "website") score += 5;

  return Math.min(100, Math.max(0, score));
}
