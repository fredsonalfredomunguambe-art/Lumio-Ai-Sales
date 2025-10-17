import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// POST - Search LinkedIn for leads
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      keywords,
      location,
      industry,
      companySize,
      jobTitle,
      limit = 10,
      accessToken,
    } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "LinkedIn access token required" },
        { status: 400 }
      );
    }

    // Search LinkedIn for people
    const searchResults = await searchLinkedInPeople({
      accessToken,
      keywords,
      location,
      industry,
      companySize,
      jobTitle,
      limit,
    });

    if (!searchResults.success) {
      return NextResponse.json(
        { success: false, error: searchResults.error },
        { status: 400 }
      );
    }

    // Process and format results
    const leads = searchResults.data.map((person: any) => ({
      id: person.id,
      firstName: person.firstName?.localized || "",
      lastName: person.lastName?.localized || "",
      headline: person.headline?.localized || "",
      location: person.location?.name || "",
      industry: person.industry || "",
      company: person.companyName || "",
      jobTitle: person.jobTitle || "",
      profileUrl: `https://linkedin.com/in/${person.vanityName || person.id}`,
      connections: person.connections || 0,
      experience: person.experience || [],
      education: person.education || [],
      score: calculateLeadScore(person),
      source: "LinkedIn",
      lastUpdated: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        leads,
        total: leads.length,
        searchParams: {
          keywords,
          location,
          industry,
          companySize,
          jobTitle,
        },
      },
    });
  } catch (error) {
    console.error("Error searching LinkedIn:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search LinkedIn" },
      { status: 500 }
    );
  }
}

async function searchLinkedInPeople({
  accessToken,
  keywords,
  location,
  industry,
  companySize,
  jobTitle,
  limit,
}: {
  accessToken: string;
  keywords?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  jobTitle?: string;
  limit: number;
}) {
  try {
    // Build search query
    let searchQuery = "";
    
    if (keywords) searchQuery += `"${keywords}"`;
    if (jobTitle) searchQuery += ` AND "${jobTitle}"`;
    if (location) searchQuery += ` AND "${location}"`;
    if (industry) searchQuery += ` AND "${industry}"`;

    // LinkedIn People Search API
    const searchResponse = await fetch(
      `https://api.linkedin.com/v2/peopleSearch?q=${encodeURIComponent(searchQuery)}&count=${limit}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json();
      return {
        success: false,
        error: `LinkedIn search API error: ${searchResponse.status} - ${
          errorData.message || "Unknown error"
        }`,
      };
    }

    const searchData = await searchResponse.json();

    // For demo purposes, return mock data that simulates LinkedIn search
    // In production, you would process the actual LinkedIn API response
    const mockResults = [
      {
        id: "linkedin_1",
        firstName: { localized: "John" },
        lastName: { localized: "Smith" },
        headline: { localized: "VP of Sales at TechCorp | Driving Revenue Growth" },
        location: { name: "San Francisco, CA" },
        industry: "Technology",
        companyName: "TechCorp Inc",
        jobTitle: "VP of Sales",
        vanityName: "johnsmith",
        connections: 500,
        experience: [
          {
            title: "VP of Sales",
            company: "TechCorp Inc",
            duration: "2 years",
          },
        ],
        education: [
          {
            school: "Stanford University",
            degree: "MBA",
            year: "2015",
          },
        ],
      },
      {
        id: "linkedin_2",
        firstName: { localized: "Sarah" },
        lastName: { localized: "Johnson" },
        headline: { localized: "Director of Marketing | SaaS Growth Expert" },
        location: { name: "New York, NY" },
        industry: "SaaS",
        companyName: "Innovate Solutions",
        jobTitle: "Director of Marketing",
        vanityName: "sarahjohnson",
        connections: 750,
        experience: [
          {
            title: "Director of Marketing",
            company: "Innovate Solutions",
            duration: "1 year",
          },
        ],
        education: [
          {
            school: "NYU",
            degree: "Marketing",
            year: "2018",
          },
        ],
      },
      {
        id: "linkedin_3",
        firstName: { localized: "Mike" },
        lastName: { localized: "Chen" },
        headline: { localized: "CEO & Founder | Fintech Innovation" },
        location: { name: "Austin, TX" },
        industry: "Fintech",
        companyName: "StartupIO",
        jobTitle: "CEO",
        vanityName: "mikechen",
        connections: 1200,
        experience: [
          {
            title: "CEO & Founder",
            company: "StartupIO",
            duration: "3 years",
          },
        ],
        education: [
          {
            school: "MIT",
            degree: "Computer Science",
            year: "2012",
          },
        ],
      },
    ];

    // Filter results based on search criteria
    let filteredResults = mockResults;

    if (keywords) {
      filteredResults = filteredResults.filter(
        (person) =>
          person.headline.localized
            .toLowerCase()
            .includes(keywords.toLowerCase()) ||
          person.jobTitle.toLowerCase().includes(keywords.toLowerCase())
      );
    }

    if (location) {
      filteredResults = filteredResults.filter((person) =>
        person.location.name.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (industry) {
      filteredResults = filteredResults.filter(
        (person) =>
          person.industry.toLowerCase() === industry.toLowerCase()
      );
    }

    if (jobTitle) {
      filteredResults = filteredResults.filter((person) =>
        person.jobTitle.toLowerCase().includes(jobTitle.toLowerCase())
      );
    }

    return {
      success: true,
      data: filteredResults.slice(0, limit),
    };
  } catch (error) {
    return {
      success: false,
      error: `LinkedIn search failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

function calculateLeadScore(person: any): number {
  let score = 50; // Base score

  // Job title scoring
  const title = person.jobTitle?.toLowerCase() || "";
  if (title.includes("ceo") || title.includes("founder")) score += 30;
  else if (title.includes("vp") || title.includes("director")) score += 25;
  else if (title.includes("manager") || title.includes("head")) score += 20;
  else if (title.includes("senior") || title.includes("lead")) score += 15;

  // Industry scoring
  const industry = person.industry?.toLowerCase() || "";
  if (industry.includes("technology") || industry.includes("saas")) score += 20;
  else if (industry.includes("finance") || industry.includes("fintech")) score += 15;
  else if (industry.includes("healthcare") || industry.includes("education")) score += 10;

  // Connection count scoring
  const connections = person.connections || 0;
  if (connections > 1000) score += 15;
  else if (connections > 500) score += 10;
  else if (connections > 200) score += 5;

  // Experience scoring
  const experience = person.experience || [];
  if (experience.length > 5) score += 10;
  else if (experience.length > 3) score += 5;

  // Education scoring
  const education = person.education || [];
  const hasTopSchool = education.some((edu: any) =>
    ["stanford", "mit", "harvard", "berkeley", "nyu"].some(school =>
      edu.school?.toLowerCase().includes(school)
    )
  );
  if (hasTopSchool) score += 10;

  return Math.min(100, Math.max(0, score));
}
