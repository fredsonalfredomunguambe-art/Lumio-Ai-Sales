"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  CustomerSegment,
  SegmentCriteria,
  SegmentFilter,
  SegmentPagination,
  SegmentAnalytics,
  SegmentInsight,
} from "@/types/segmentation";

interface SegmentationState {
  // Data
  segments: CustomerSegment[];
  analytics: Record<string, SegmentAnalytics>;
  insights: SegmentInsight[];

  // UI State
  filters: SegmentFilter;
  pagination: SegmentPagination;
  selectedSegment: CustomerSegment | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSegments: (segments: CustomerSegment[]) => void;
  addSegment: (segment: CustomerSegment) => void;
  updateSegment: (id: string, updates: Partial<CustomerSegment>) => void;
  deleteSegment: (id: string) => void;
  setSelectedSegment: (segment: CustomerSegment | null) => void;

  // Filters
  setFilters: (filters: Partial<SegmentFilter>) => void;
  clearFilters: () => void;

  // Pagination
  setPagination: (pagination: Partial<SegmentPagination>) => void;
  nextPage: () => void;
  prevPage: () => void;

  // Analytics
  setAnalytics: (segmentId: string, analytics: SegmentAnalytics) => void;
  setInsights: (insights: SegmentInsight[]) => void;

  // Loading & Error
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  getFilteredSegments: () => CustomerSegment[];
  getSegmentById: (id: string) => CustomerSegment | undefined;
  getSegmentAnalytics: (segmentId: string) => SegmentAnalytics | undefined;
  getSegmentInsights: (segmentId: string) => SegmentInsight[];
  getTopPerformingSegments: (limit?: number) => CustomerSegment[];
  getUnderperformingSegments: (limit?: number) => CustomerSegment[];
}

const defaultFilters: SegmentFilter = {
  search: "",
  color: "",
  leadCountMin: undefined,
  leadCountMax: undefined,
  conversionRateMin: undefined,
  conversionRateMax: undefined,
};

const defaultPagination: SegmentPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

export const useSegmentationStore = create<SegmentationState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        segments: [],
        analytics: {},
        insights: [],
        filters: defaultFilters,
        pagination: defaultPagination,
        selectedSegment: null,
        isLoading: false,
        error: null,

        // Actions
        setSegments: (segments) => set({ segments }),

        addSegment: (segment) =>
          set((state) => ({
            segments: [...state.segments, segment],
          })),

        updateSegment: (id, updates) =>
          set((state) => ({
            segments: state.segments.map((segment) =>
              segment.id === id ? { ...segment, ...updates } : segment
            ),
          })),

        deleteSegment: (id) =>
          set((state) => ({
            segments: state.segments.filter((segment) => segment.id !== id),
            selectedSegment:
              state.selectedSegment?.id === id ? null : state.selectedSegment,
          })),

        setSelectedSegment: (segment) => set({ selectedSegment: segment }),

        // Filters
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
            pagination: { ...state.pagination, page: 1 }, // Reset to first page
          })),

        clearFilters: () =>
          set({
            filters: defaultFilters,
            pagination: { ...defaultPagination, total: get().pagination.total },
          }),

        // Pagination
        setPagination: (newPagination) =>
          set((state) => ({
            pagination: { ...state.pagination, ...newPagination },
          })),

        nextPage: () =>
          set((state) => {
            const { page, totalPages } = state.pagination;
            if (page < totalPages) {
              return {
                pagination: { ...state.pagination, page: page + 1 },
              };
            }
            return state;
          }),

        prevPage: () =>
          set((state) => {
            const { page } = state.pagination;
            if (page > 1) {
              return {
                pagination: { ...state.pagination, page: page - 1 },
              };
            }
            return state;
          }),

        // Analytics
        setAnalytics: (segmentId, analytics) =>
          set((state) => ({
            analytics: { ...state.analytics, [segmentId]: analytics },
          })),

        setInsights: (insights) => set({ insights }),

        // Loading & Error
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        // Computed getters
        getFilteredSegments: () => {
          const { segments, filters } = get();
          let filtered = [...segments];

          // Search filter
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(
              (segment) =>
                segment.name.toLowerCase().includes(searchLower) ||
                segment.description.toLowerCase().includes(searchLower)
            );
          }

          // Color filter
          if (filters.color) {
            filtered = filtered.filter(
              (segment) => segment.color === filters.color
            );
          }

          // Lead count filters
          if (filters.leadCountMin !== undefined) {
            filtered = filtered.filter(
              (segment) => segment.leadCount >= filters.leadCountMin!
            );
          }
          if (filters.leadCountMax !== undefined) {
            filtered = filtered.filter(
              (segment) => segment.leadCount <= filters.leadCountMax!
            );
          }

          // Conversion rate filters
          if (filters.conversionRateMin !== undefined) {
            filtered = filtered.filter(
              (segment) => segment.conversionRate >= filters.conversionRateMin!
            );
          }
          if (filters.conversionRateMax !== undefined) {
            filtered = filtered.filter(
              (segment) => segment.conversionRate <= filters.conversionRateMax!
            );
          }

          return filtered;
        },

        getSegmentById: (id) => {
          const { segments } = get();
          return segments.find((segment) => segment.id === id);
        },

        getSegmentAnalytics: (segmentId) => {
          const { analytics } = get();
          return analytics[segmentId];
        },

        getSegmentInsights: (segmentId) => {
          const { insights } = get();
          return insights.filter((insight) => insight.segmentId === segmentId);
        },

        getTopPerformingSegments: (limit = 5) => {
          const { segments } = get();
          return [...segments]
            .sort((a, b) => b.conversionRate - a.conversionRate)
            .slice(0, limit);
        },

        getUnderperformingSegments: (limit = 5) => {
          const { segments } = get();
          return [...segments]
            .sort((a, b) => a.conversionRate - b.conversionRate)
            .slice(0, limit);
        },
      }),
      {
        name: "segmentation-store",
        partialize: (state) => ({
          segments: state.segments,
          filters: state.filters,
          selectedSegment: state.selectedSegment,
        }),
      }
    ),
    {
      name: "segmentation-store",
    }
  )
);
