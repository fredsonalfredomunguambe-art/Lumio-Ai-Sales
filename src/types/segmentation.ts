export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  color: string;
  criteria: SegmentCriteria;
  leadCount: number;
  meetingCount: number;
  conversionRate: number;
  averageDealSize: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  // Demographics
  companySize?: {
    min?: number;
    max?: number;
  };
  industry?: string[];
  location?: string[];

  // Behavioral
  leadSource?: string[];
  engagementLevel?: "LOW" | "MEDIUM" | "HIGH";
  lastActivity?: {
    days: number;
    operator: "LESS_THAN" | "GREATER_THAN" | "EQUAL";
  };

  // Sales metrics
  leadScore?: {
    min?: number;
    max?: number;
  };
  meetingFrequency?: {
    min?: number;
    max?: number;
  };
  dealSize?: {
    min?: number;
    max?: number;
  };

  // Custom fields
  customFields?: Record<string, any>;
}

export interface SegmentRule {
  id: string;
  field: string;
  operator:
    | "EQUALS"
    | "NOT_EQUALS"
    | "CONTAINS"
    | "NOT_CONTAINS"
    | "GREATER_THAN"
    | "LESS_THAN"
    | "BETWEEN"
    | "IN"
    | "NOT_IN";
  value: any;
  value2?: any; // For BETWEEN operator
}

export interface SegmentAnalytics {
  segmentId: string;
  totalLeads: number;
  qualifiedLeads: number;
  meetingsScheduled: number;
  meetingsCompleted: number;
  dealsClosed: number;
  totalRevenue: number;
  averageDealSize: number;
  conversionRate: number;
  timeToClose: number; // in days
  lastUpdated: Date;
}

export interface SegmentInsight {
  id: string;
  segmentId: string;
  type: "TREND" | "OPPORTUNITY" | "WARNING" | "SUCCESS";
  title: string;
  description: string;
  metric: string;
  value: number;
  change: number;
  changeType: "INCREASE" | "DECREASE" | "STABLE";
  recommendation?: string;
  createdAt: Date;
}

export interface CreateSegmentData {
  name: string;
  description: string;
  color: string;
  criteria: SegmentCriteria;
}

export interface UpdateSegmentData {
  name?: string;
  description?: string;
  color?: string;
  criteria?: SegmentCriteria;
}

export interface SegmentFilter {
  search?: string;
  color?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  leadCountMin?: number;
  leadCountMax?: number;
  conversionRateMin?: number;
  conversionRateMax?: number;
}

export interface SegmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
