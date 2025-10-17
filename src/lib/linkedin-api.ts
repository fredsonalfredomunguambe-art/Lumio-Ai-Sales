interface LinkedInLead {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  industry: string;
  company: string;
  jobTitle: string;
  profileUrl: string;
  email?: string;
  phone?: string;
  connections: number;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
}

interface LinkedInSearchParams {
  keywords: string;
  location: string;
  industry: string;
  companySize: string;
  jobTitle: string;
  limit: number;
}

export class LinkedInAPI {
  private accessToken: string;
  private baseUrl = "https://api.linkedin.com/v2";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async searchPeople(params: LinkedInSearchParams): Promise<LinkedInLead[]> {
    try {
      // In a real implementation, this would use the actual LinkedIn API
      // For now, we'll return mock data that simulates LinkedIn search results
      const mockLeads: LinkedInLead[] = [
        {
          id: "linkedin_1",
          firstName: "John",
          lastName: "Smith",
          headline: "VP of Sales at TechCorp | Driving Revenue Growth",
          location: "San Francisco, CA",
          industry: "Technology",
          company: "TechCorp Inc",
          jobTitle: "VP of Sales",
          profileUrl: "https://linkedin.com/in/johnsmith",
          email: "john.smith@techcorp.com",
          connections: 500,
          experience: [
            {
              title: "VP of Sales",
              company: "TechCorp Inc",
              duration: "2 years",
            },
            {
              title: "Sales Director",
              company: "Previous Corp",
              duration: "3 years",
            },
          ],
          education: [
            { school: "Stanford University", degree: "MBA", year: "2015" },
          ],
        },
        {
          id: "linkedin_2",
          firstName: "Sarah",
          lastName: "Johnson",
          headline: "Director of Marketing | SaaS Growth Expert",
          location: "New York, NY",
          industry: "SaaS",
          company: "Innovate Solutions",
          jobTitle: "Director of Marketing",
          profileUrl: "https://linkedin.com/in/sarahjohnson",
          email: "sarah.j@innovate.com",
          connections: 750,
          experience: [
            {
              title: "Director of Marketing",
              company: "Innovate Solutions",
              duration: "1 year",
            },
            {
              title: "Marketing Manager",
              company: "Growth Co",
              duration: "4 years",
            },
          ],
          education: [{ school: "NYU", degree: "Marketing", year: "2018" }],
        },
        {
          id: "linkedin_3",
          firstName: "Mike",
          lastName: "Chen",
          headline: "CEO & Founder | Fintech Innovation",
          location: "Austin, TX",
          industry: "Fintech",
          company: "StartupIO",
          jobTitle: "CEO",
          profileUrl: "https://linkedin.com/in/mikechen",
          email: "mike.chen@startup.io",
          connections: 1200,
          experience: [
            {
              title: "CEO & Founder",
              company: "StartupIO",
              duration: "3 years",
            },
            {
              title: "Product Manager",
              company: "BigTech",
              duration: "5 years",
            },
          ],
          education: [
            { school: "MIT", degree: "Computer Science", year: "2012" },
          ],
        },
      ];

      // Filter results based on search parameters
      let filteredLeads = mockLeads;

      if (params.keywords) {
        filteredLeads = filteredLeads.filter(
          (lead) =>
            lead.headline
              .toLowerCase()
              .includes(params.keywords.toLowerCase()) ||
            lead.jobTitle.toLowerCase().includes(params.keywords.toLowerCase())
        );
      }

      if (params.location) {
        filteredLeads = filteredLeads.filter((lead) =>
          lead.location.toLowerCase().includes(params.location.toLowerCase())
        );
      }

      if (params.industry) {
        filteredLeads = filteredLeads.filter(
          (lead) =>
            lead.industry.toLowerCase() === params.industry.toLowerCase()
        );
      }

      if (params.jobTitle) {
        filteredLeads = filteredLeads.filter((lead) =>
          lead.jobTitle.toLowerCase().includes(params.jobTitle.toLowerCase())
        );
      }

      return filteredLeads.slice(0, params.limit || 10);
    } catch (error) {
      console.error("LinkedIn API error:", error);
      throw new Error("Failed to search LinkedIn");
    }
  }

  async getProfile(profileId: string): Promise<LinkedInLead | null> {
    try {
      // In a real implementation, this would fetch the actual profile
      // For now, return mock data
      const mockProfile: LinkedInLead = {
        id: profileId,
        firstName: "John",
        lastName: "Doe",
        headline: "Senior Sales Manager",
        location: "San Francisco, CA",
        industry: "Technology",
        company: "Tech Company",
        jobTitle: "Senior Sales Manager",
        profileUrl: `https://linkedin.com/in/${profileId}`,
        email: "john.doe@techcompany.com",
        connections: 500,
        experience: [],
        education: [],
      };

      return mockProfile;
    } catch (error) {
      console.error("LinkedIn profile fetch error:", error);
      return null;
    }
  }

  async sendConnectionRequest(
    profileId: string,
    message: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would send an actual connection request
      console.log(
        `Sending connection request to ${profileId} with message: ${message}`
      );
      return true;
    } catch (error) {
      console.error("LinkedIn connection request error:", error);
      return false;
    }
  }

  async sendMessage(profileId: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would send an actual message
      console.log(`Sending message to ${profileId}: ${message}`);
      return true;
    } catch (error) {
      console.error("LinkedIn message error:", error);
      return false;
    }
  }

  async getCompanyInfo(companyName: string): Promise<any> {
    try {
      // In a real implementation, this would fetch company data from LinkedIn
      return {
        name: companyName,
        industry: "Technology",
        size: "100-500 employees",
        location: "San Francisco, CA",
        description: "Leading technology company",
        website: `https://${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
      };
    } catch (error) {
      console.error("LinkedIn company info error:", error);
      return null;
    }
  }
}

export const linkedinSearch = async (
  params: LinkedInSearchParams
): Promise<LinkedInLead[]> => {
  // In a real implementation, you would get the access token from your database
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN || "mock_token";
  const linkedinAPI = new LinkedInAPI(accessToken);
  return await linkedinAPI.searchPeople(params);
};
