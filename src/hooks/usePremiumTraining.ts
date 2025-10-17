import { useState, useEffect } from "react";
import { useApi, useApiMutation } from "./useApi";
import {
  SDRTrainingModule,
  SDRTrainingSession,
  SDRPerformanceMetrics,
} from "@/lib/premium-sdr-training";

interface PremiumTrainingState {
  modules: SDRTrainingModule[];
  currentSession: SDRTrainingSession | null;
  progress: SDRPerformanceMetrics | null;
  loading: boolean;
  error: string | null;
}

export function usePremiumTraining() {
  const [state, setState] = useState<PremiumTrainingState>({
    modules: [],
    currentSession: null,
    progress: null,
    loading: true,
    error: null,
  });

  // API calls
  const { data: modulesData, loading: modulesLoading } = useApi<{
    modules: SDRTrainingModule[];
  }>("/api/training/premium?action=modules");
  const { data: progressData, loading: progressLoading } = useApi<{
    progress: SDRPerformanceMetrics;
  }>("/api/training/premium?action=progress");

  const startSessionMutation = useApiMutation<SDRTrainingSession>(
    "/api/training/premium",
    {
      method: "POST",
    }
  );

  const completeExerciseMutation = useApiMutation<{ success: boolean }>(
    "/api/training/premium",
    {
      method: "POST",
    }
  );

  // Load initial data
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      loading: modulesLoading || progressLoading,
      error: null,
    }));
  }, [modulesLoading, progressLoading]);

  // Update modules when data loads
  useEffect(() => {
    if (modulesData?.modules) {
      setState((prev) => ({
        ...prev,
        modules: modulesData.modules,
      }));
    }
  }, [modulesData]);

  // Update progress when data loads
  useEffect(() => {
    if (progressData?.progress) {
      setState((prev) => ({
        ...prev,
        progress: progressData.progress,
      }));
    }
  }, [progressData]);

  // Start a training session
  const startTrainingSession = async (
    moduleId: string
  ): Promise<SDRTrainingSession | null> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await startSessionMutation.mutate({
        action: "start-session",
        moduleId,
      });

      if (result) {
        setState((prev) => ({
          ...prev,
          currentSession: result,
          loading: false,
        }));
        return result;
      }

      return null;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start training session";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      return null;
    }
  };

  // Complete an exercise
  const completeExercise = async (
    sessionId: string,
    exerciseId: string,
    score: number
  ): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const result = await completeExerciseMutation.mutate({
        action: "complete-exercise",
        sessionId,
        exerciseId,
        score,
      });

      if (result?.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
        }));
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to complete exercise";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      return false;
    }
  };

  // Get module by ID
  const getModule = (moduleId: string): SDRTrainingModule | undefined => {
    return state.modules.find((m) => m.id === moduleId);
  };

  // Get exercises for a module
  const getModuleExercises = (moduleId: string) => {
    const module = getModule(moduleId);
    return module?.exercises || [];
  };

  // Check if module is available (prerequisites met)
  const isModuleAvailable = (moduleId: string): boolean => {
    const module = getModule(moduleId);
    if (!module) return false;

    if (!module.prerequisites || module.prerequisites.length === 0) {
      return true;
    }

    const completedModuleIds = state.modules
      .filter((m) => m.isCompleted)
      .map((m) => m.id);

    return module.prerequisites.every((prereq) =>
      completedModuleIds.includes(prereq)
    );
  };

  // Get next recommended module
  const getNextRecommendedModule = (): SDRTrainingModule | undefined => {
    if (!state.progress?.nextRecommendedModule) return undefined;

    return state.modules.find(
      (m) => m.name === state.progress?.nextRecommendedModule
    );
  };

  // Get training statistics
  const getTrainingStats = () => {
    if (!state.progress) return null;

    return {
      overallScore: state.progress.overallScore,
      modulesCompleted: state.progress.modulesCompleted,
      totalTimeSpent: state.progress.totalTimeSpent,
      skillLevel: state.progress.skillLevel,
      strengths: state.progress.strengths,
      weaknesses: state.progress.weaknesses,
      recommendations: state.progress.recommendations,
    };
  };

  return {
    // State
    modules: state.modules,
    currentSession: state.currentSession,
    progress: state.progress,
    loading: state.loading,
    error: state.error,

    // Actions
    startTrainingSession,
    completeExercise,

    // Utilities
    getModule,
    getModuleExercises,
    isModuleAvailable,
    getNextRecommendedModule,
    getTrainingStats,
  };
}
