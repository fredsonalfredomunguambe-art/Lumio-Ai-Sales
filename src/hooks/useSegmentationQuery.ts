"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSegmentationStore } from "@/stores/segmentationStore";
import {
  CustomerSegment,
  CreateSegmentData,
  UpdateSegmentData,
  SegmentAnalytics,
  SegmentInsight,
} from "@/types/segmentation";

// Query keys
export const segmentationKeys = {
  all: ["segments"] as const,
  lists: () => [...segmentationKeys.all, "list"] as const,
  list: (filters: any) => [...segmentationKeys.lists(), { filters }] as const,
  details: () => [...segmentationKeys.all, "detail"] as const,
  detail: (id: string) => [...segmentationKeys.details(), id] as const,
  analytics: (id: string) =>
    [...segmentationKeys.all, "analytics", id] as const,
  insights: (id: string) => [...segmentationKeys.all, "insights", id] as const,
};

// API functions
const fetchSegments = async (): Promise<CustomerSegment[]> => {
  const response = await fetch("/api/segments");
  if (!response.ok) {
    throw new Error("Failed to fetch segments");
  }
  return response.json();
};

const fetchSegment = async (id: string): Promise<CustomerSegment> => {
  const response = await fetch(`/api/segments/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch segment");
  }
  return response.json();
};

const createSegment = async (
  data: CreateSegmentData
): Promise<CustomerSegment> => {
  const response = await fetch("/api/segments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create segment");
  }
  return response.json();
};

const updateSegment = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateSegmentData;
}): Promise<CustomerSegment> => {
  const response = await fetch(`/api/segments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update segment");
  }
  return response.json();
};

const deleteSegment = async (id: string): Promise<void> => {
  const response = await fetch(`/api/segments/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete segment");
  }
};

const fetchSegmentAnalytics = async (id: string): Promise<SegmentAnalytics> => {
  const response = await fetch(`/api/segments/${id}/analytics`);
  if (!response.ok) {
    throw new Error("Failed to fetch segment analytics");
  }
  return response.json();
};

const fetchSegmentInsights = async (id: string): Promise<SegmentInsight[]> => {
  const response = await fetch(`/api/segments/${id}/insights`);
  if (!response.ok) {
    throw new Error("Failed to fetch segment insights");
  }
  return response.json();
};

const applySegmentToLeads = async (
  segmentId: string,
  leadIds: string[]
): Promise<void> => {
  const response = await fetch(`/api/segments/${segmentId}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ leadIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to apply segment to leads");
  }
};

// Hooks
export const useSegments = () => {
  const { setSegments, setLoading, setError } = useSegmentationStore();

  return useQuery({
    queryKey: segmentationKeys.lists(),
    queryFn: fetchSegments,
    onSuccess: (data) => {
      setSegments(data);
      setLoading(false);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      setLoading(false);
    },
  });
};

export const useSegment = (id: string) => {
  return useQuery({
    queryKey: segmentationKeys.detail(id),
    queryFn: () => fetchSegment(id),
    enabled: !!id,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  const { addSegment } = useSegmentationStore();

  return useMutation({
    mutationFn: createSegment,
    onSuccess: (data) => {
      addSegment(data);
      queryClient.invalidateQueries({ queryKey: segmentationKeys.lists() });
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();
  const { updateSegment: updateSegmentStore } = useSegmentationStore();

  return useMutation({
    mutationFn: updateSegment,
    onSuccess: (data) => {
      updateSegmentStore(data.id, data);
      queryClient.invalidateQueries({ queryKey: segmentationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.detail(data.id),
      });
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();
  const { deleteSegment: deleteSegmentStore } = useSegmentationStore();

  return useMutation({
    mutationFn: deleteSegment,
    onSuccess: (_, id) => {
      deleteSegmentStore(id);
      queryClient.invalidateQueries({ queryKey: segmentationKeys.lists() });
    },
  });
};

export const useSegmentAnalytics = (id: string) => {
  const { setAnalytics } = useSegmentationStore();

  return useQuery({
    queryKey: segmentationKeys.analytics(id),
    queryFn: () => fetchSegmentAnalytics(id),
    enabled: !!id,
    onSuccess: (data) => {
      setAnalytics(id, data);
    },
  });
};

export const useSegmentInsights = (id: string) => {
  const { setInsights } = useSegmentationStore();

  return useQuery({
    queryKey: segmentationKeys.insights(id),
    queryFn: () => fetchSegmentInsights(id),
    enabled: !!id,
    onSuccess: (data) => {
      setInsights(data);
    },
  });
};

export const useApplySegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      segmentId,
      leadIds,
    }: {
      segmentId: string;
      leadIds: string[];
    }) => applySegmentToLeads(segmentId, leadIds),
    onSuccess: (_, { segmentId }) => {
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.analytics(segmentId),
      });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

// Utility hooks
export const useSegmentStats = () => {
  const { segments, getFilteredSegments } = useSegmentationStore();
  const filteredSegments = getFilteredSegments();

  const stats = {
    totalSegments: segments.length,
    activeSegments: filteredSegments.length,
    totalLeads: segments.reduce((sum, segment) => sum + segment.leadCount, 0),
    totalRevenue: segments.reduce(
      (sum, segment) => sum + segment.totalRevenue,
      0
    ),
    averageConversionRate:
      segments.length > 0
        ? segments.reduce((sum, segment) => sum + segment.conversionRate, 0) /
          segments.length
        : 0,
    topPerformingSegment:
      segments.length > 0
        ? segments.reduce((top, segment) =>
            segment.conversionRate > top.conversionRate ? segment : top
          )
        : null,
  };

  return stats;
};
