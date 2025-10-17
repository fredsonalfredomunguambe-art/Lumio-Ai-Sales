export interface Meeting {
  id: string;
  title: string;
  description?: string;
  leadId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  meetingUrl?: string;
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  type:
    | "SALES_CALL"
    | "DEMO"
    | "DISCOVERY"
    | "FOLLOW_UP"
    | "NEGOTIATION"
    | "CLOSING";
  outcome?: string;
  notes?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
  };
}

export interface CreateMeetingData {
  title: string;
  description?: string;
  leadId?: string;
  startDate: string;
  endDate: string;
  location?: string;
  meetingUrl?: string;
  type?: Meeting["type"];
  notes?: string;
}

export interface UpdateMeetingData extends Partial<CreateMeetingData> {
  status?: Meeting["status"];
  outcome?: string;
}

export interface MeetingFilters {
  status: string;
  type: string;
  dateRange: [Date, Date] | null;
  searchTerm: string;
  leadId?: string;
}

export interface MeetingStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  inProgress: number;
  todaysMeetings: number;
  upcomingMeetings: number;
}

export interface MeetingPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
