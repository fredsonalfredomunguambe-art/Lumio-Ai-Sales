interface LeadScoringCriteria {
  jobTitle: {
    weight: number;
    scores: { [key: string]: number };
  };
  company: {
    weight: number;
    scores: { [key: string]: number };
  };
  industry: {
    weight: number;
    scores: { [key: string]: number };
  };
  location: {
    weight: number;
    scores: { [key: string]: number };
  };
  contactInfo: {
    weight: number;
    email: number;
    phone: number;
    linkedin: number;
  };
  engagement: {
    weight: number;
    emailOpens: number;
    emailClicks: number;
    websiteVisits: number;
    meetingBooked: number;
  };
  demographics: {
    weight: number;
    companySize: { [key: string]: number };
    experience: { [key: string]: number };
  };
}

export class LeadScoring {
  private criteria: LeadScoringCriteria;

  constructor() {
    this.criteria = {
      jobTitle: {
        weight: 25,
        scores: {
          ceo: 100,
          founder: 95,
          president: 90,
          vp: 85,
          director: 80,
          manager: 70,
          senior: 60,
          lead: 55,
          specialist: 50,
          coordinator: 40,
          assistant: 30,
          intern: 20,
        },
      },
      company: {
        weight: 20,
        scores: {
          "fortune 500": 100,
          enterprise: 90,
          startup: 80,
          "scale-up": 85,
          "small business": 60,
          freelancer: 30,
        },
      },
      industry: {
        weight: 15,
        scores: {
          technology: 90,
          saas: 95,
          fintech: 85,
          healthcare: 80,
          education: 75,
          manufacturing: 70,
          retail: 65,
          consulting: 60,
          "non-profit": 40,
        },
      },
      location: {
        weight: 10,
        scores: {
          "san francisco": 100,
          "new york": 95,
          london: 90,
          austin: 85,
          seattle: 80,
          boston: 75,
          chicago: 70,
          "los angeles": 65,
          remote: 60,
        },
      },
      contactInfo: {
        weight: 15,
        email: 50,
        phone: 30,
        linkedin: 20,
      },
      engagement: {
        weight: 10,
        emailOpens: 25,
        emailClicks: 50,
        websiteVisits: 30,
        meetingBooked: 100,
      },
      demographics: {
        weight: 5,
        companySize: {
          "1000+": 100,
          "500-999": 90,
          "200-499": 80,
          "100-199": 70,
          "50-99": 60,
          "10-49": 50,
          "1-9": 30,
        },
        experience: {
          "10+ years": 100,
          "5-9 years": 80,
          "3-4 years": 60,
          "1-2 years": 40,
          "less than 1 year": 20,
        },
      },
    };
  }

  calculateScore(
    lead: any,
    interactions: any[] = []
  ): {
    score: number;
    breakdown: any;
    recommendations: string[];
  } {
    const breakdown: any = {};
    let totalScore = 0;
    const recommendations: string[] = [];

    // Job Title Score
    const jobTitleScore = this.getJobTitleScore(lead.jobTitle || "");
    breakdown.jobTitle = {
      score: jobTitleScore,
      weight: this.criteria.jobTitle.weight,
      weightedScore: (jobTitleScore * this.criteria.jobTitle.weight) / 100,
    };
    totalScore += breakdown.jobTitle.weightedScore;

    // Company Score
    const companyScore = this.getCompanyScore(lead.company || "");
    breakdown.company = {
      score: companyScore,
      weight: this.criteria.company.weight,
      weightedScore: (companyScore * this.criteria.company.weight) / 100,
    };
    totalScore += breakdown.company.weightedScore;

    // Industry Score
    const industryScore = this.getIndustryScore(lead.industry || "");
    breakdown.industry = {
      score: industryScore,
      weight: this.criteria.industry.weight,
      weightedScore: (industryScore * this.criteria.industry.weight) / 100,
    };
    totalScore += breakdown.industry.weightedScore;

    // Location Score
    const locationScore = this.getLocationScore(lead.location || "");
    breakdown.location = {
      score: locationScore,
      weight: this.criteria.location.weight,
      weightedScore: (locationScore * this.criteria.location.weight) / 100,
    };
    totalScore += breakdown.location.weightedScore;

    // Contact Info Score
    const contactScore = this.getContactInfoScore(lead);
    breakdown.contactInfo = {
      score: contactScore,
      weight: this.criteria.contactInfo.weight,
      weightedScore: (contactScore * this.criteria.contactInfo.weight) / 100,
    };
    totalScore += breakdown.contactInfo.weightedScore;

    // Engagement Score
    const engagementScore = this.getEngagementScore(interactions);
    breakdown.engagement = {
      score: engagementScore,
      weight: this.criteria.engagement.weight,
      weightedScore: (engagementScore * this.criteria.engagement.weight) / 100,
    };
    totalScore += breakdown.engagement.weightedScore;

    // Demographics Score
    const demographicsScore = this.getDemographicsScore(lead);
    breakdown.demographics = {
      score: demographicsScore,
      weight: this.criteria.demographics.weight,
      weightedScore:
        (demographicsScore * this.criteria.demographics.weight) / 100,
    };
    totalScore += breakdown.demographics.weightedScore;

    // Generate recommendations
    if (breakdown.jobTitle.score < 50) {
      recommendations.push("Consider targeting higher-level decision makers");
    }
    if (breakdown.company.score < 50) {
      recommendations.push("Focus on enterprise or scale-up companies");
    }
    if (breakdown.contactInfo.score < 50) {
      recommendations.push("Gather more contact information (phone, LinkedIn)");
    }
    if (breakdown.engagement.score < 30) {
      recommendations.push("Increase engagement through personalized outreach");
    }
    if (totalScore >= 80) {
      recommendations.push("High-priority lead - schedule meeting immediately");
    } else if (totalScore >= 60) {
      recommendations.push("Qualified lead - add to nurture sequence");
    } else if (totalScore >= 40) {
      recommendations.push("Warm lead - continue nurturing");
    } else {
      recommendations.push(
        "Cold lead - consider disqualifying or long-term nurture"
      );
    }

    return {
      score: Math.round(totalScore),
      breakdown,
      recommendations,
    };
  }

  private getJobTitleScore(jobTitle: string): number {
    const title = jobTitle.toLowerCase();

    for (const [keyword, score] of Object.entries(
      this.criteria.jobTitle.scores
    )) {
      if (title.includes(keyword)) {
        return score;
      }
    }

    return 50; // Default score
  }

  private getCompanyScore(company: string): string {
    const companyName = company.toLowerCase();

    for (const [type, score] of Object.entries(this.criteria.company.scores)) {
      if (companyName.includes(type)) {
        return score;
      }
    }

    return 50; // Default score
  }

  private getIndustryScore(industry: string): number {
    const industryName = industry.toLowerCase();

    for (const [sector, score] of Object.entries(
      this.criteria.industry.scores
    )) {
      if (industryName.includes(sector)) {
        return score;
      }
    }

    return 50; // Default score
  }

  private getLocationScore(location: string): number {
    const locationName = location.toLowerCase();

    for (const [city, score] of Object.entries(this.criteria.location.scores)) {
      if (locationName.includes(city)) {
        return score;
      }
    }

    return 50; // Default score
  }

  private getContactInfoScore(lead: any): number {
    let score = 0;

    if (lead.email) score += this.criteria.contactInfo.email;
    if (lead.phone) score += this.criteria.contactInfo.phone;
    if (lead.linkedinUrl) score += this.criteria.contactInfo.linkedin;

    return Math.min(score, 100);
  }

  private getEngagementScore(interactions: any[]): number {
    let score = 0;

    const emailOpens = interactions.filter(
      (i) => i.type === "email_open"
    ).length;
    const emailClicks = interactions.filter(
      (i) => i.type === "email_click"
    ).length;
    const websiteVisits = interactions.filter(
      (i) => i.type === "website_visit"
    ).length;
    const meetingBooked = interactions.filter(
      (i) => i.type === "meeting_booked"
    ).length;

    score += Math.min(emailOpens * 5, this.criteria.engagement.emailOpens);
    score += Math.min(emailClicks * 10, this.criteria.engagement.emailClicks);
    score += Math.min(
      websiteVisits * 15,
      this.criteria.engagement.websiteVisits
    );
    score += Math.min(
      meetingBooked * 100,
      this.criteria.engagement.meetingBooked
    );

    return Math.min(score, 100);
  }

  private getDemographicsScore(lead: any): number {
    let score = 0;

    // Company size score
    if (lead.companySize) {
      const size = lead.companySize.toLowerCase();
      for (const [range, points] of Object.entries(
        this.criteria.demographics.companySize
      )) {
        if (size.includes(range)) {
          score += points * 0.7; // 70% weight for company size
          break;
        }
      }
    }

    // Experience score (if available)
    if (lead.experience) {
      const exp = lead.experience.toLowerCase();
      for (const [range, points] of Object.entries(
        this.criteria.demographics.experience
      )) {
        if (exp.includes(range)) {
          score += points * 0.3; // 30% weight for experience
          break;
        }
      }
    }

    return Math.min(score, 100);
  }

  async updateLeadScore(
    leadId: string,
    interactions: any[] = []
  ): Promise<number> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error("Lead not found");
      }

      const scoringResult = this.calculateScore(lead, interactions);

      await prisma.lead.update({
        where: { id: leadId },
        data: { score: scoringResult.score },
      });

      return scoringResult.score;
    } catch (error) {
      console.error("Error updating lead score:", error);
      throw error;
    }
  }

  async getHighValueLeads(
    userId: string,
    minScore: number = 80
  ): Promise<any[]> {
    try {
      const leads = await prisma.lead.findMany({
        where: {
          userId,
          score: {
            gte: minScore,
          },
        },
        orderBy: {
          score: "desc",
        },
      });

      return leads;
    } catch (error) {
      console.error("Error fetching high-value leads:", error);
      return [];
    }
  }

  async getScoringInsights(userId: string): Promise<any> {
    try {
      const leads = await prisma.lead.findMany({
        where: { userId },
      });

      const insights = {
        averageScore:
          leads.length > 0
            ? leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length
            : 0,
        scoreDistribution: {
          "80-100": leads.filter((l) => l.score >= 80).length,
          "60-79": leads.filter((l) => l.score >= 60 && l.score < 80).length,
          "40-59": leads.filter((l) => l.score >= 40 && l.score < 60).length,
          "0-39": leads.filter((l) => l.score < 40).length,
        },
        topIndustries: this.getTopIndustries(leads),
        topJobTitles: this.getTopJobTitles(leads),
        recommendations: this.generateInsights(leads),
      };

      return insights;
    } catch (error) {
      console.error("Error getting scoring insights:", error);
      return null;
    }
  }

  private getTopIndustries(leads: any[]): any[] {
    const industryCount: { [key: string]: number } = {};

    leads.forEach((lead) => {
      if (lead.industry) {
        industryCount[lead.industry] = (industryCount[lead.industry] || 0) + 1;
      }
    });

    return Object.entries(industryCount)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getTopJobTitles(leads: any[]): any[] {
    const titleCount: { [key: string]: number } = {};

    leads.forEach((lead) => {
      if (lead.jobTitle) {
        titleCount[lead.jobTitle] = (titleCount[lead.jobTitle] || 0) + 1;
      }
    });

    return Object.entries(titleCount)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private generateInsights(leads: any[]): string[] {
    const insights: string[] = [];

    const avgScore =
      leads.length > 0
        ? leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length
        : 0;

    if (avgScore < 50) {
      insights.push(
        "Consider refining your ideal customer profile to attract higher-quality leads"
      );
    }

    const highValueLeads = leads.filter((l) => l.score >= 80).length;
    if (highValueLeads < leads.length * 0.2) {
      insights.push(
        "Focus on targeting decision-makers and enterprise companies"
      );
    }

    const lowEngagement = leads.filter((l) => l.score < 40).length;
    if (lowEngagement > leads.length * 0.3) {
      insights.push("Review and update your lead qualification criteria");
    }

    return insights;
  }
}

export const leadScoring = new LeadScoring();
