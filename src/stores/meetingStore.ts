import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

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

export interface FilterState {
  status: string;
  type: string;
  dateRange: [Date, Date] | null;
  searchTerm: string;
  leadId?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface MeetingStore {
  // State
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  filters: FilterState;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string;

  // Actions
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  setSelectedMeeting: (meeting: Meeting | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastSyncTime: (time: string) => void;

  // Computed
  getFilteredMeetings: () => Meeting[];
  getTodaysMeetings: () => Meeting[];
  getUpcomingMeetings: () => Meeting[];
  getMeetingsByStatus: (status: Meeting["status"]) => Meeting[];
  getMeetingsByType: (type: Meeting["type"]) => Meeting[];
}

const defaultFilters: FilterState = {
  status: "all",
  type: "all",
  dateRange: null,
  searchTerm: "",
  leadId: undefined,
};

const defaultPagination: PaginationState = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
};

export const useMeetingStore = create<MeetingStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        meetings: [],
        selectedMeeting: null,
        filters: defaultFilters,
        pagination: defaultPagination,
        isLoading: false,
        error: null,
        lastSyncTime: "",

        // Actions
        setMeetings: (meetings) => set({ meetings }),

        addMeeting: (meeting) =>
          set((state) => ({
            meetings: [meeting, ...state.meetings],
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          })),

        updateMeeting: (id, updates) =>
          set((state) => ({
            meetings: state.meetings.map((meeting) =>
              meeting.id === id ? { ...meeting, ...updates } : meeting
            ),
          })),

        deleteMeeting: (id) =>
          set((state) => ({
            meetings: state.meetings.filter((meeting) => meeting.id !== id),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - 1),
            },
          })),

        setSelectedMeeting: (meeting) => set({ selectedMeeting: meeting }),

        setFilters: (filters) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
            pagination: { ...state.pagination, page: 1 }, // Reset to first page
          })),

        clearFilters: () => set({ filters: defaultFilters }),

        setPagination: (pagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...pagination },
          })),

        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        setLastSyncTime: (time) => set({ lastSyncTime: time }),

        // Computed getters
        getFilteredMeetings: () => {
          const { meetings, filters } = get();

          return meetings.filter((meeting) => {
            // Status filter
            if (filters.status !== "all" && meeting.status !== filters.status) {
              return false;
            }

            // Type filter
            if (filters.type !== "all" && meeting.type !== filters.type) {
              return false;
            }

            // Search term filter
            if (filters.searchTerm) {
              const searchLower = filters.searchTerm.toLowerCase();
              const matchesSearch =
                meeting.title.toLowerCase().includes(searchLower) ||
                meeting.description?.toLowerCase().includes(searchLower) ||
                meeting.location?.toLowerCase().includes(searchLower) ||
                meeting.lead?.firstName.toLowerCase().includes(searchLower) ||
                meeting.lead?.lastName.toLowerCase().includes(searchLower) ||
                meeting.lead?.company?.toLowerCase().includes(searchLower);

              if (!matchesSearch) return false;
            }

            // Lead filter
            if (filters.leadId && meeting.leadId !== filters.leadId) {
              return false;
            }

            // Date range filter
            if (filters.dateRange) {
              const meetingDate = new Date(meeting.startDate);
              const [startDate, endDate] = filters.dateRange;

              if (meetingDate < startDate || meetingDate > endDate) {
                return false;
              }
            }

            return true;
          });
        },

        getTodaysMeetings: () => {
          const { meetings } = get();
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          return meetings
            .filter((meeting) => {
              const meetingDate = new Date(meeting.startDate);
              return meetingDate >= today && meetingDate < tomorrow;
            })
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );
        },

        getUpcomingMeetings: () => {
          const { meetings } = get();
          const now = new Date();

          return meetings
            .filter(
              (meeting) =>
                new Date(meeting.startDate) > now &&
                meeting.status !== "CANCELLED"
            )
            .sort(
              (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
            );
        },

        getMeetingsByStatus: (status) => {
          const { meetings } = get();
          return meetings.filter((meeting) => meeting.status === status);
        },

        getMeetingsByType: (type) => {
          const { meetings } = get();
          return meetings.filter((meeting) => meeting.type === type);
        },
      }),
      {
        name: "meeting-store",
        partialize: (state) => ({
          meetings: state.meetings,
          filters: state.filters,
          lastSyncTime: state.lastSyncTime,
        }),
      }
    ),
    {
      name: "meeting-store",
    }
  )
);
