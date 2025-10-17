import { useState } from "react";
import { useApiMutation } from "./useApi";

interface MarvinRequest {
  type: "chat" | "analyze_campaign" | "suggest_segments";
  prompt?: string;
  context?: string;
  chatHistory?: string;
  data?: any;
  isTestMode?: boolean;
  userId?: string;
}

interface MarvinResponse {
  response: string;
}

export function useMarvin() {
  const { mutate, loading, error } = useApiMutation<
    MarvinResponse,
    MarvinRequest
  >("/api/marvin");

  const chat = async (
    prompt: string,
    context?: string,
    chatHistory?: string,
    isTestMode = false,
    userId?: string
  ) => {
    return await mutate({
      type: "chat",
      prompt,
      context,
      chatHistory,
      isTestMode,
      userId,
    });
  };

  const analyzeCampaign = async (campaignData: any) => {
    return await mutate({
      type: "analyze_campaign",
      data: campaignData,
    });
  };

  const suggestSegments = async () => {
    return await mutate({
      type: "suggest_segments",
    });
  };

  return {
    chat,
    analyzeCampaign,
    suggestSegments,
    loading,
    error,
  };
}
