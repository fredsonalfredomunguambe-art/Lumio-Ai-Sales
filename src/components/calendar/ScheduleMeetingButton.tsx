"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Video, Save } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { ActionButton } from "@/components/ui/ActionButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ScheduleMeetingButtonProps {
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadCompany?: string;
  onScheduled?: (eventId: string) => void;
  className?: string;
}

export function ScheduleMeetingButton({
  leadId,
  leadName,
  leadEmail,
  leadCompany,
  onScheduled,
  className = "",
}: ScheduleMeetingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: `Meeting with ${leadName}`,
    description: `Sales meeting with ${leadName}${
      leadCompany ? ` from ${leadCompany}` : ""
    }`,
    category: "SALES_CALL",
    duration: 30,
    meetingType: "video",
  });

  const handleOpen = async () => {
    setIsOpen(true);
    await loadAvailableSlots();
  };

  const loadAvailableSlots = async () => {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Next 7 days

      const response = await fetch(
        `/api/calendar/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&duration=${
          formData.duration
        }`
      );
      const data = await response.json();

      if (data.success) {
        setAvailableSlots(data.data.slice(0, 9)); // Show first 9 slots
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    }
  };

  const handleSchedule = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);

      const eventData = {
        title: formData.title,
        description: formData.description,
        startDate: selectedSlot.start,
        endDate: selectedSlot.end,
        category: formData.category,
        priority: "HIGH",
        linkedLeadId: leadId,
        attendees: [leadEmail],
        reminderMinutes: 15,
        meetingUrl:
          formData.meetingType === "video"
            ? `https://meet.google.com/new` // Placeholder
            : undefined,
      };

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (result.success) {
        onScheduled?.(result.data.id);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ActionButton
        variant="primary"
        size="sm"
        icon={<Calendar className="w-4 h-4" />}
        onClick={handleOpen}
        className={className}
      >
        Schedule
      </ActionButton>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Schedule Meeting</ModalTitle>
          <ModalDescription>
            Schedule a meeting with {leadName}
            {leadCompany && ` from ${leadCompany}`}
          </ModalDescription>
        </ModalHeader>

        <ModalContent>
          <div className="space-y-6">
            {/* Meeting Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      });
                      loadAvailableSlots();
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.meetingType}
                    onChange={(e) =>
                      setFormData({ ...formData, meetingType: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Available Time Slots */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Available Time Slots
              </h4>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                      selectedSlot === slot
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="font-medium">
                      {new Date(slot.start).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(slot.start).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Slot Preview */}
            {selectedSlot && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Meeting Scheduled For:
                    </h4>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(selectedSlot.start).toLocaleString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.meetingType === "video" ? (
                          <>
                            <Video className="w-4 h-4" />
                            Video call (Google Meet)
                          </>
                        ) : formData.meetingType === "phone" ? (
                          <>
                            <Users className="w-4 h-4" />
                            Phone call
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4" />
                            In person
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ModalContent>

        <ModalFooter>
          <ActionButton variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSchedule}
            loading={loading}
            disabled={!selectedSlot}
          >
            Schedule Meeting
          </ActionButton>
        </ModalFooter>
      </Modal>
    </>
  );
}

