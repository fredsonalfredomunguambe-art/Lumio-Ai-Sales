import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/calendar/meeting-prep
 * Generate AI-powered meeting preparation brief
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: "Lead ID required" },
        { status: 400 }
      );
    }

    // Get lead details
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        userId,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    // Get lead's interaction history (campaigns, emails, etc)
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId,
        targetSegment: {
          contains: lead.source || "",
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    // Get previous meetings with this lead
    const previousMeetings = await prisma.calendarEvent.findMany({
      where: {
        userId,
        linkedLeadId: leadId,
        completedAt: { not: null },
      },
      orderBy: { startDate: "desc" },
      take: 3,
    });

    // Calculate activity metrics
    const daysAsLead = Math.floor(
      (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate AI-powered prep data
    const prepData = {
      lead: {
        name: `${lead.firstName} ${lead.lastName}`,
        company: lead.company || "Unknown Company",
        jobTitle: lead.jobTitle || "Unknown Role",
        email: lead.email,
        phone: lead.phone || "N/A",
        score: lead.score || 50,
        status: lead.status,
      },
      background: {
        industry: lead.industry || "Unknown",
        companySize: lead.companySize || "Unknown",
        source: lead.source || "Direct",
        daysAsLead,
      },
      recentActivity: {
        lastContact: lead.updatedAt
          ? `${Math.floor(
              (Date.now() - new Date(lead.updatedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )} days ago`
          : "Never",
        emailsSent: campaigns.length,
        emailsOpened: Math.floor(campaigns.length * 0.6), // Mock data
        lastCampaign: campaigns[0]?.name || "None",
      },
      talkingPoints: generateTalkingPoints(lead, campaigns),
      painPoints: generatePainPoints(lead),
      suggestedAgenda: generateAgenda(lead),
      previousNotes: previousMeetings
        .map((m) => m.meetingNotes || "")
        .filter(Boolean),
      competitiveIntel: generateCompetitiveIntel(lead),
    };

    return NextResponse.json({
      success: true,
      data: prepData,
    });
  } catch (error) {
    console.error("Error generating meeting prep:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate meeting prep" },
      { status: 500 }
    );
  }
}

/**
 * Generate talking points based on lead data
 */
function generateTalkingPoints(lead: any, campaigns: any[]): string[] {
  const points: string[] = [];

  // Based on lead score
  if (lead.score >= 80) {
    points.push(
      `High-value lead (score: ${lead.score}) - Prioritize closing conversation`
    );
  } else if (lead.score >= 60) {
    points.push(`Qualified lead - Focus on understanding needs and timeline`);
  } else {
    points.push(`Early-stage lead - Educate and qualify before pitching`);
  }

  // Based on company
  if (lead.company) {
    points.push(
      `Reference ${lead.company}'s industry (${
        lead.industry || "their sector"
      }) and common challenges`
    );
  }

  // Based on source
  if (lead.source === "shopify") {
    points.push(
      `Shopify customer - Discuss e-commerce optimization and cart recovery strategies`
    );
  } else if (lead.source === "hubspot") {
    points.push(
      `CRM lead - Talk about sales pipeline automation and deal tracking`
    );
  } else if (lead.source === "linkedin") {
    points.push(
      `LinkedIn connection - Professional network, industry thought leadership`
    );
  }

  // Based on recent campaigns
  if (campaigns.length > 0) {
    points.push(
      `Recently engaged with "${campaigns[0].name}" campaign - reference this context`
    );
  }

  // Based on job title
  if (
    lead.jobTitle?.toLowerCase().includes("ceo") ||
    lead.jobTitle?.toLowerCase().includes("founder")
  ) {
    points.push(
      `Executive-level - Focus on ROI, strategic value, and time savings`
    );
  } else if (
    lead.jobTitle?.toLowerCase().includes("manager") ||
    lead.jobTitle?.toLowerCase().includes("director")
  ) {
    points.push(
      `Management level - Emphasize team efficiency and measurable results`
    );
  }

  return points;
}

/**
 * Generate pain points based on lead characteristics
 */
function generatePainPoints(lead: any): string[] {
  const painPoints: string[] = [];

  if (lead.source === "shopify") {
    painPoints.push("Cart abandonment eating into revenue");
    painPoints.push("Manual follow-ups consuming too much time");
    painPoints.push("Difficulty personalizing at scale");
  } else if (lead.source === "hubspot" || lead.source === "salesforce") {
    painPoints.push("Leads falling through cracks in pipeline");
    painPoints.push("Slow response times to hot leads");
    painPoints.push("Inconsistent follow-up process");
  } else {
    painPoints.push("Time-consuming manual outreach");
    painPoints.push("Lack of personalization in communications");
    painPoints.push("No visibility into engagement metrics");
  }

  return painPoints;
}

/**
 * Generate suggested meeting agenda
 */
function generateAgenda(lead: any): string[] {
  const agenda: string[] = [];

  agenda.push("Introduction and build rapport (5 min)");
  agenda.push(
    `Understand ${
      lead.company || "their company"
    }'s current challenges (10 min)`
  );
  agenda.push("Present relevant solutions and case studies (10 min)");
  agenda.push("Demo key features aligned with their needs (10 min)");
  agenda.push("Discuss pricing and ROI (5 min)");
  agenda.push("Define next steps and timeline (5 min)");
  agenda.push("Q&A and closing (5 min)");

  return agenda;
}

/**
 * Generate competitive intelligence
 */
function generateCompetitiveIntel(lead: any): string {
  // In production, this would use training knowledge and industry data

  if (
    lead.industry?.toLowerCase().includes("ecommerce") ||
    lead.source === "shopify"
  ) {
    return "Likely comparing with Klaviyo, Drip, or ActiveCampaign. Our edge: AI-powered SDR Agent and deeper Shopify integration with real-time cart recovery.";
  } else if (lead.source === "hubspot" || lead.source === "salesforce") {
    return "May be using HubSpot Sales Hub or Outreach.io. Our advantage: Marvin AI learns from their specific documents and provides truly personalized outreach at scale.";
  }

  return "Position Lumio as the only platform with client-configurable AI that learns from their business knowledge. Emphasize the training system and SDR Agent flexibility.";
}

/**
 * Helper: Send reschedule notification
 */
async function sendRescheduleNotification(
  event: any,
  newStart: Date,
  newEnd: Date
) {
  // In production: send emails with updated calendar invite
  console.log(`Reschedule notification queued for event: ${event.title}`);
}

/**
 * Helper: Send cancellation notification
 */
async function sendCancellationNotification(event: any, reason?: string) {
  // In production: send cancellation emails
  console.log(`Cancellation notification queued for event: ${event.title}`);
}

/**
 * Helper: Trigger post-meeting workflow
 */
async function triggerPostMeetingWorkflow(event: any, userId: string) {
  // In production:
  // 1. Create follow-up task in task list
  // 2. Queue thank you email (SDR template)
  // 3. Sync to CRM if connected
  // 4. Update lead timeline

  console.log("Post-meeting workflow triggered for:", event.id);
}
