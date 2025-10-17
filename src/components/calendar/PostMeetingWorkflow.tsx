"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  Mail,
  Calendar,
  FileText,
  Sparkles,
  X,
} from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";

interface PostMeetingWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onComplete: () => void;
}

export function PostMeetingWorkflow({
  isOpen,
  onClose,
  event,
  onComplete,
}: PostMeetingWorkflowProps) {
  const [meetingNotes, setMeetingNotes] = useState("");
  const [outcome, setOutcome] = useState<
    "positive" | "neutral" | "negative" | ""
  >("neutral");
  const [scheduleFollowUp, setScheduleFollowUp] = useState(true);
  const [sendThankYou, setSendThankYou] = useState(true);
  const [createTasks, setCreateTasks] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const handleGenerateAISummary = async () => {
    if (!meetingNotes.trim()) {
      alert("Please add some meeting notes first");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/marvin/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: meetingNotes,
          context: "meeting_notes",
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAiSummary(data.data.summary);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    setProcessing(true);

    try {
      // Save meeting notes and mark complete
      const response = await fetch(`/api/calendar/${event.id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "complete",
          data: {
            meetingNotes,
            outcome,
            aiSummary,
            scheduleFollowUp,
            sendThankYou,
            createTasks,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete workflow");
      }

      onComplete();
      onClose();
    } catch (error) {
      console.error("Error completing workflow:", error);
      alert("Failed to complete workflow. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <ModalTitle>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Complete Meeting: {event.title}
          </div>
        </ModalTitle>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-6">
          {/* Meeting Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Outcome
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "positive", label: "Positive", color: "green" },
                { value: "neutral", label: "Neutral", color: "gray" },
                { value: "negative", label: "Negative", color: "red" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOutcome(option.value as any)}
                  className={`p-3 border-2 rounded-lg font-medium transition-all ${
                    outcome === option.value
                      ? `border-${option.color}-600 bg-${option.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Meeting Notes
              </label>
              <button
                onClick={handleGenerateAISummary}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                disabled={processing}
              >
                <Sparkles className="w-4 h-4" />
                AI Summary
              </button>
            </div>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              rows={6}
              placeholder="What was discussed?&#10;- Key points&#10;- Action items&#10;- Next steps&#10;- Decisions made"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* AI Summary (if generated) */}
          {aiSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">AI Summary</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {aiSummary}
              </p>
            </div>
          )}

          {/* Post-Meeting Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Automatic Actions
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={scheduleFollowUp}
                  onChange={(e) => setScheduleFollowUp(e.target.checked)}
                  className="rounded"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    Schedule follow-up meeting (1 week from now)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={sendThankYou}
                  onChange={(e) => setSendThankYou(e.target.checked)}
                  className="rounded"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Send thank you email (using SDR template)
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={createTasks}
                  onChange={(e) => setCreateTasks(e.target.checked)}
                  className="rounded"
                />
                <div className="flex items-center gap-2 flex-1">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-700">
                    Create action items as tasks
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <ActionButton variant="secondary" onClick={onClose}>
          Cancel
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={handleComplete}
          loading={processing}
          icon={<CheckCircle className="w-4 h-4" />}
        >
          Complete Meeting
        </ActionButton>
      </ModalFooter>
    </Modal>
  );
}
