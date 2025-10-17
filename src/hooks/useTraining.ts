"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApiMutation } from "./useApi";

interface TrainingProgress {
  userId: string;
  totalInteractions: number;
  successfulInteractions: number;
  learningPatterns: LearningPattern[];
  adaptationScore: number;
  lastTraining: string;
  nextTraining: string;
  improvements: string[];
  performanceMetrics: {
    responseAccuracy: number;
    customerSatisfaction: number;
    adaptationSpeed: number;
    contextUnderstanding: number;
  };
}

interface LearningPattern {
  id: string;
  pattern: string;
  frequency: number;
  successRate: number;
  context: Record<string, unknown>;
  lastUpdated: string;
  confidence: number;
}

interface CustomerInteraction {
  id: string;
  userId: string;
  timestamp: string;
  interactionType: "chat" | "email" | "call" | "feedback";
  customerInput: string;
  marvinResponse: string;
  customerSatisfaction?: number;
  outcome: "success" | "objection" | "no_response" | "not_interested";
  context?: Record<string, unknown>;
  industry?: string;
  companySize?: string;
  painPoints?: string[];
  solutions?: string[];
}

interface TrainingData {
  progress: TrainingProgress | null;
  patterns: LearningPattern[];
  interactions: CustomerInteraction[];
  totalInteractions: number;
  totalPatterns: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function useTraining() {
  const {
    mutate: getTrainingData,
    loading: getLoading,
    error: getError,
  } = useApiMutation("/api/training", { method: "GET" });
  const {
    mutate: addInteractionMutation,
    loading: addLoading,
    error: addError,
  } = useApiMutation("/api/training", { method: "POST" });
  const {
    mutate: generateResponseMutation,
    loading: generateLoading,
    error: generateError,
  } = useApiMutation("/api/training/generate-response", { method: "POST" });
  const {
    mutate: sendFeedbackMutation,
    loading: feedbackLoading,
    error: feedbackError,
  } = useApiMutation("/api/training/feedback", { method: "POST" });
  const {
    mutate: retrainMutation,
    loading: retrainLoading,
    error: retrainError,
  } = useApiMutation("/api/training", { method: "PUT" });

  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [manualTrainingEnabled, setManualTrainingEnabled] = useState(false);
  const autoTrainingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTrainingTimeRef = useRef<number>(0);

  // Load training data - only when manually requested
  const loadTrainingData = useCallback(
    async (force = false) => {
      // Only loads if forced or if not yet initialized
      if (!force && isInitialized) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await getTrainingData();

        if (response) {
          const apiResponse = response as ApiResponse<TrainingData>;
          if (apiResponse?.success) {
            setTrainingData(apiResponse.data);
            lastTrainingTimeRef.current = Date.now();
          }
        }
      } catch (error) {
        console.error("Error loading training data:", error);
      } finally {
        setIsLoading(false);
        if (!isInitialized) {
          setIsInitialized(true);
        }
      }
    },
    [getTrainingData, isInitialized]
  );

  // Start manual training
  const startManualTraining = useCallback(async () => {
    setManualTrainingEnabled(true);
    await loadTrainingData(true);
  }, [loadTrainingData]);

  // Stop auto training
  const stopAutoTraining = useCallback(() => {
    if (autoTrainingIntervalRef.current) {
      clearInterval(autoTrainingIntervalRef.current);
      autoTrainingIntervalRef.current = null;
    }
    setManualTrainingEnabled(false);
  }, []);

  // Setup auto training every hour
  const setupAutoTraining = useCallback(() => {
    if (autoTrainingIntervalRef.current) {
      clearInterval(autoTrainingIntervalRef.current);
    }

    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    autoTrainingIntervalRef.current = setInterval(() => {
      const now = Date.now();

      // Only trains automatically if more than 1 hour has passed since last training
      if (now - lastTrainingTimeRef.current > oneHour) {
        console.log("Auto-training triggered after 1 hour");
        loadTrainingData(true);
      }
    }, oneHour); // Check every hour
  }, [loadTrainingData]);

  // Add new interaction
  const addInteraction = useCallback(
    async (
      interaction: Omit<CustomerInteraction, "id" | "userId" | "timestamp">
    ) => {
      try {
        const response = await addInteractionMutation(interaction);
        const apiResponse = response as ApiResponse<TrainingData>;

        if (apiResponse?.success) {
          setTrainingData(apiResponse.data);
          return apiResponse.data;
        }
      } catch (error) {
        console.error("Error adding interaction:", error);
        throw error;
      }
    },
    [addInteractionMutation]
  );

  // Generate adapted response
  const generateAdaptedResponse = useCallback(
    async (customerInput: string, context: Record<string, unknown> = {}) => {
      try {
        const response = await generateResponseMutation({
          customerInput,
          context,
        });
        const apiResponse = response as ApiResponse<{ response: string }>;

        if (apiResponse?.success) {
          return apiResponse.data.response;
        }
      } catch (error) {
        console.error("Error generating adapted response:", error);
        throw error;
      }
    },
    [generateResponseMutation]
  );

  // Send feedback
  const sendFeedback = useCallback(
    async (feedback: {
      interactionId: string;
      satisfaction: number;
      outcome: "success" | "objection" | "no_response" | "not_interested";
      feedback?: string;
      context?: Record<string, unknown>;
    }) => {
      try {
        const response = await sendFeedbackMutation(feedback);
        const apiResponse = response as ApiResponse<TrainingData>;

        if (apiResponse?.success) {
          setTrainingData(apiResponse.data);
          return apiResponse.data;
        }
      } catch (error) {
        console.error("Error sending feedback:", error);
        throw error;
      }
    },
    [sendFeedbackMutation]
  );

  // Retrain model
  const retrainModel = useCallback(async () => {
    try {
      const response = await retrainMutation({ action: "retrain" });
      const apiResponse = response as ApiResponse<TrainingData>;

      if (apiResponse?.success) {
        setTrainingData(apiResponse.data);
        return apiResponse.data;
      }
    } catch (error) {
      console.error("Error retraining model:", error);
      throw error;
    }
  }, [retrainMutation]);

  // Load initial data only once
  useEffect(() => {
    if (!isInitialized) {
      loadTrainingData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally no dependencies to avoid infinite loops

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (autoTrainingIntervalRef.current) {
        clearInterval(autoTrainingIntervalRef.current);
      }
    };
  }, []);

  return {
    trainingData,
    isLoading,
    loading:
      isLoading ||
      getLoading ||
      addLoading ||
      generateLoading ||
      feedbackLoading ||
      retrainLoading,
    error:
      getError || addError || generateError || feedbackError || retrainError,
    loadTrainingData,
    addInteraction,
    generateAdaptedResponse,
    sendFeedback,
    retrainModel,
    // New functions for manual training control
    startManualTraining,
    stopAutoTraining,
    setupAutoTraining,
    manualTrainingEnabled,
    isInitialized,
  };
}
