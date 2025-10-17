import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  linkedinUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  status:
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "UNQUALIFIED"
    | "CONVERTED"
    | "LOST";
  source?: string;
  score?: number;
  notes?: string;
  tags?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  interactions?: LeadInteraction[];
  meetings?: Meeting[];
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type:
    | "EMAIL"
    | "LINKEDIN_MESSAGE"
    | "PHONE_CALL"
    | "MEETING"
    | "FOLLOW_UP"
    | "NURTURE";
  channel: string;
  subject?: string;
  content: string;
  direction: "INBOUND" | "OUTBOUND";
  status:
    | "DRAFT"
    | "SCHEDULED"
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "CLICKED"
    | "REPLIED"
    | "BOUNCED"
    | "FAILED";
  scheduledAt?: string;
  completedAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  linkedinUrl?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  source?: string;
  score?: number;
  notes?: string;
  tags?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  status?: Lead["status"];
}

export function useLeads() {
  const { user, isLoaded } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/leads");

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      const data = await response.json();
      setLeads(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  };

  const createLead = async (leadData: CreateLeadData): Promise<Lead> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create lead");
    }

    const newLead = await response.json();
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = async (
    id: string,
    leadData: UpdateLeadData
  ): Promise<Lead> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update lead");
    }

    const updatedLead = await response.json();
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? updatedLead : lead))
    );
    return updatedLead;
  };

  const deleteLead = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const response = await fetch(`/api/leads/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete lead");
    }

    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  };

  const getLeadById = (id: string): Lead | undefined => {
    return leads.find((lead) => lead.id === id);
  };

  const getLeadsByStatus = (status: Lead["status"]): Lead[] => {
    return leads.filter((lead) => lead.status === status);
  };

  const getQualifiedLeads = (): Lead[] => {
    return leads.filter((lead) => lead.status === "QUALIFIED");
  };

  const getHotLeads = (): Lead[] => {
    return leads.filter((lead) => (lead.score || 0) >= 70);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchLeads();
    }
  }, [isLoaded, user]);

  return {
    leads,
    isLoading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    getLeadById,
    getLeadsByStatus,
    getQualifiedLeads,
    getHotLeads,
  };
}
