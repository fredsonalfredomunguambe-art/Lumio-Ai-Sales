"use client";

import React, { useState } from "react";
import { Plus, Calendar, Sparkles } from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";

interface EventQuickCreateProps {
  suggestedTitle?: string;
  suggestedDescription?: string;
  suggestedTime?: Date;
  linkedLeadId?: string;
  linkedCampaignId?: string;
  category?: string;
  onCreated?: (event: any) => void;
}

export function EventQuickCreate({
  suggestedTitle = "",
  suggestedDescription = "",
  suggestedTime,
  linkedLeadId,
  linkedCampaignId,
  category = "MEETING",
  onCreated,
}: EventQuickCreateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: suggestedTitle,
    description: suggestedDescription,
    startDate: suggestedTime || new Date(),
    duration: 30,
    category,
  });

  const handleCreate = async () => {
    try {
      setLoading(true);

      const endDate = new Date(formData.startDate);
      endDate.setMinutes(endDate.getMinutes() + formData.duration);

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: endDate,
        category: formData.category,
        priority: "MEDIUM",
        linkedLeadId,
        linkedCampaignId,
      };

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        onCreated?.(result.data);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasAISuggestion =
    suggestedTitle || suggestedDescription || suggestedTime;

  return (
    <>
      <ActionButton
        variant="secondary"
        size="sm"
        icon={<Calendar className="w-4 h-4" />}
        onClick={() => setIsOpen(true)}
      >
        {hasAISuggestion ? (
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Quick Schedule
          </span>
        ) : (
          "Schedule"
        )}
      </ActionButton>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalHeader>
          <ModalTitle>Quick Schedule Event</ModalTitle>
        </ModalHeader>

        <ModalContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Meeting title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                When
              </label>
              <input
                type="datetime-local"
                value={formData.startDate.toISOString().slice(0, 16)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    startDate: new Date(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <ActionButton variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={<Calendar className="w-4 h-4" />}
            onClick={handleCreate}
            loading={loading}
          >
            Create Event
          </ActionButton>
        </ModalFooter>
      </Modal>
    </>
  );
}

