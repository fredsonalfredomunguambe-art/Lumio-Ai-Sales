import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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
}

export interface LeadFilterState {
  status: string;
  source: string;
  scoreRange: [number, number] | null;
  searchTerm: string;
  tags: string[];
  industry: string;
  companySize: string;
}

export interface LeadPaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface LeadStore {
  // State
  leads: Lead[];
  selectedLead: Lead | null;
  filters: LeadFilterState;
  pagination: LeadPaginationState;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string;

  // Actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setSelectedLead: (lead: Lead | null) => void;
  setFilters: (filters: Partial<LeadFilterState>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<LeadPaginationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: string) => void;

  // Computed
  getFilteredLeads: () => Lead[];
  getLeadsByStatus: (status: Lead["status"]) => Lead[];
  getHotLeads: () => Lead[];
  getQualifiedLeads: () => Lead[];
  getLeadsBySource: (source: string) => Lead[];
}

const defaultLeadFilters: LeadFilterState = {
  status: "all",
  source: "all",
  scoreRange: null,
  searchTerm: "",
  tags: [],
  industry: "all",
  companySize: "all",
};

const defaultLeadPagination: LeadPaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
};

export const useLeadStore = create<LeadStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        leads: [],
        selectedLead: null,
        filters: defaultLeadFilters,
        pagination: defaultLeadPagination,
        isLoading: false,
        error: null,
        lastSyncTime: "",

        // Actions
        setLeads: (leads) => set({ leads }),

        addLead: (lead) =>
          set((state) => ({
            leads: [lead, ...state.leads],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          })),

        updateLead: (id, updates) =>
          set((state) => ({
            leads: state.leads.map((lead) =>
              lead.id === id ? { ...lead, ...updates } : lead
            ),
          })),

        deleteLead: (id) =>
          set((state) => ({
            leads: state.leads.filter((lead) => lead.id !== id),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
          })),

        setSelectedLead: (lead) => set({ selectedLead: lead }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 },
          })),

        clearFilters: () => set({ filters: defaultLeadFilters }),

        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        setLastSyncTime: (time) => set({ lastSyncTime: time }),

        // Computed getters
        getFilteredLeads: () => {
          const { leads, filters } = get();

          return leads.filter((lead) => {
            // Status filter
            if (filters.status !== "all" && lead.status !== filters.status) {
              return false;
            }

            // Source filter
            if (filters.source !== "all" && lead.source !== filters.source) {
              return false;
            }

            // Score range filter
            if (filters.scoreRange && lead.score !== undefined) {
              const [min, max] = filters.scoreRange;
              if (lead.score < min || lead.score > max) {
                return false;
              }
            }

            // Search term filter
            if (filters.searchTerm) {
              const searchLower = filters.searchTerm.toLowerCase();
              const matchesSearch =
                lead.firstName.toLowerCase().includes(searchLower) ||
                lead.lastName.toLowerCase().includes(searchLower) ||
                lead.email.toLowerCase().includes(searchLower) ||
                lead.company?.toLowerCase().includes(searchLower) ||
                lead.jobTitle?.toLowerCase().includes(searchLower) ||
                lead.notes?.toLowerCase().includes(searchLower);

              if (!matchesSearch) return false;
            }

            // Tags filter
            if (filters.tags.length > 0) {
              const leadTags =
                lead.tags?.split(",").map((tag) => tag.trim()) || [];
              const hasMatchingTag = filters.tags.some((tag) =>
                leadTags.some((leadTag) =>
                  leadTag.toLowerCase().includes(tag.toLowerCase())
                )
              );
              if (!hasMatchingTag) return false;
            }

            // Industry filter
            if (
              filters.industry !== "all" &&
              lead.industry !== filters.industry
            ) {
              return false;
            }

            // Company size filter
            if (
              filters.companySize !== "all" &&
              lead.companySize !== filters.companySize
            ) {
              return false;
            }

            return true;
          });
        },

        getLeadsByStatus: (status) => {
          const { leads } = get();
          return leads.filter((lead) => lead.status === status);
        },

        getHotLeads: () => {
          const { leads } = get();
          return leads
            .filter(
              (lead) => lead.status === "QUALIFIED" && (lead.score || 0) >= 70
            )
            .sort((a, b) => (b.score || 0) - (a.score || 0));
        },

        getQualifiedLeads: () => {
          const { leads } = get();
          return leads.filter((lead) => lead.status === "QUALIFIED");
        },

        getLeadsBySource: (source) => {
          const { leads } = get();
          return leads.filter((lead) => lead.source === source);
        },
      }),
      {
        name: "lead-store",
        partialize: (state) => ({
          leads: state.leads,
          filters: state.filters,
          lastSyncTime: state.lastSyncTime,
        }),
      }
    ),
    {
      name: "lead-store",
    }
  )
);
