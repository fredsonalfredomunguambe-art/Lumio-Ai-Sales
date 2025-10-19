"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  MapPin,
  Link as LinkIcon,
  Bell,
  Repeat,
  Target,
  Video,
  Mail,
  Phone,
  Briefcase,
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
import { RecurrenceSelector } from "./RecurrenceSelector";
import { useToast } from "@/components/ui/Toast";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  existingEvent?: any;
  prefilledData?: {
    leadId?: string;
    campaignId?: string;
    suggestedTime?: Date;
    category?: string;
  };
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  existingEvent,
  prefilledData,
}: CreateEventModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("MEETING");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [allDay, setAllDay] = useState(false);
  const [linkedLeadId, setLinkedLeadId] = useState("");
  const [linkedCampaignId, setLinkedCampaignId] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [location, setLocation] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState(15);
  const [priority, setPriority] = useState("MEDIUM");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<any>(null);
  const [autoGenerateMeetingUrl, setAutoGenerateMeetingUrl] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLeads();
      loadCampaigns();

      // Prefill from existing event or prefilled data
      if (editMode && existingEvent) {
        populateFromEvent(existingEvent);
      } else if (prefilledData) {
        applyPrefilledData(prefilledData);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editMode, existingEvent, prefilledData]);

  const loadLeads = async () => {
    try {
      const response = await fetch("/api/leads?limit=100");
      const data = await response.json();
      if (data.success) {
        setLeads(data.data.leads || []);
      }
    } catch (error) {
      console.error("Error loading leads:", error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns?limit=50");
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.data.campaigns || []);
      }
    } catch (error) {
      console.error("Error loading campaigns:", error);
    }
  };

  const populateFromEvent = (event: any) => {
    setTitle(event.title || "");
    setDescription(event.description || "");
    setCategory(event.category || "MEETING");

    const start = new Date(event.startDate);
    setStartDate(start.toISOString().split("T")[0]);
    setStartTime(start.toTimeString().slice(0, 5));

    const durationMs = new Date(event.endDate).getTime() - start.getTime();
    setDuration(Math.round(durationMs / (1000 * 60)));

    setAllDay(event.allDay || false);
    setLinkedLeadId(event.linkedLeadId || "");
    setLinkedCampaignId(event.linkedCampaignId || "");
    setMeetingUrl(event.meetingUrl || "");
    setLocation(event.location || "");
    setReminderMinutes(event.reminderMinutes || 15);
    setPriority(event.priority || "MEDIUM");

    if (event.attendees) {
      try {
        const parsed =
          typeof event.attendees === "string"
            ? JSON.parse(event.attendees)
            : event.attendees;
        setAttendees(Array.isArray(parsed) ? parsed : []);
      } catch {
        setAttendees([]);
      }
    }
  };

  const applyPrefilledData = (data: any) => {
    if (data.leadId) setLinkedLeadId(data.leadId);
    if (data.campaignId) setLinkedCampaignId(data.campaignId);
    if (data.category) setCategory(data.category);
    if (data.suggestedTime) {
      const time = new Date(data.suggestedTime);
      setStartDate(time.toISOString().split("T")[0]);
      setStartTime(time.toTimeString().slice(0, 5));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("MEETING");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM tomorrow

    setStartDate(tomorrow.toISOString().split("T")[0]);
    setStartTime("14:00");
    setDuration(30);
    setAllDay(false);
    setLinkedLeadId("");
    setLinkedCampaignId("");
    setAttendees([]);
    setAttendeeInput("");
    setMeetingUrl("");
    setLocation("");
    setReminderMinutes(15);
    setPriority("MEDIUM");
    setIsRecurring(false);
    setRecurrencePattern(null);
    setAutoGenerateMeetingUrl(false);
  };

  const handleAddAttendee = () => {
    if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
      setAttendees([...attendees, attendeeInput.trim()]);
      setAttendeeInput("");
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const generateMeetingUrl = () => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    setMeetingUrl(`https://meet.google.com/${meetingId}`);
  };

  const handleSubmit = async () => {
    if (!title || !startDate || !startTime) {
      showToast("Please fill in title, date, and time", "error");
      return;
    }

    setLoading(true);

    try {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(start.getTime() + duration * 60 * 1000);

      // Auto-generate meeting URL if requested
      let finalMeetingUrl = meetingUrl;
      if (autoGenerateMeetingUrl && !meetingUrl) {
        const meetingId = Math.random().toString(36).substring(2, 15);
        finalMeetingUrl = `https://meet.google.com/${meetingId}`;
      }

      const eventData = {
        title,
        description,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        allDay,
        category,
        priority,
        linkedLeadId: linkedLeadId || undefined,
        linkedCampaignId: linkedCampaignId || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
        meetingUrl: finalMeetingUrl || undefined,
        location: location || undefined,
        reminderMinutes,
        recurrence: isRecurring ? recurrencePattern : undefined,
      };

      const url = editMode && existingEvent ? "/api/calendar" : "/api/calendar";

      const method = editMode && existingEvent ? "PUT" : "POST";

      const body =
        editMode && existingEvent
          ? { id: existingEvent.id, ...eventData }
          : eventData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to ${editMode ? "update" : "create"} event`
        );
      }

      showToast(
        `Event ${editMode ? "updated" : "created"} successfully!`,
        "success"
      );
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${
              editMode ? "update" : "create"
            } event. Please try again.`;
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const categoryOptions = [
    { value: "MEETING", label: "General Meeting", icon: Users },
    { value: "SALES_CALL", label: "Sales Call", icon: Phone },
    { value: "DEMO", label: "Product Demo", icon: Video },
    { value: "FOLLOW_UP", label: "Follow-up", icon: Mail },
    { value: "PLANNING", label: "Planning", icon: Calendar },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalHeader>
        <ModalTitle>{editMode ? "Edit Event" : "Create New Event"}</ModalTitle>
      </ModalHeader>

      <ModalContent>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sales call with John Doe"
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Event Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-all ${
                    category === cat.value
                      ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={allDay}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Duration (min)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                disabled={allDay}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50 disabled:bg-gray-100 dark:disabled:bg-gray-800"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300">
                All-day event
              </span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add event details, agenda, or notes..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
            />
          </div>

          {/* Link to Lead/Campaign */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Link to Lead
              </label>
              <select
                value={linkedLeadId}
                onChange={(e) => setLinkedLeadId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              >
                <option value="">None</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName} (
                    {lead.company || "No company"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Link to Campaign
              </label>
              <select
                value={linkedCampaignId}
                onChange={(e) => setLinkedCampaignId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              >
                <option value="">None</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
              Attendees
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={attendeeInput}
                  onChange={(e) => setAttendeeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAttendee();
                    }
                  }}
                  placeholder="email@example.com"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
                />
                <ActionButton
                  variant="secondary"
                  onClick={handleAddAttendee}
                  disabled={!attendeeInput.trim()}
                >
                  Add
                </ActionButton>
              </div>
              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attendees.map((email) => (
                    <Badge
                      key={email}
                      variant="ghost"
                      className="flex items-center gap-1"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveAttendee(email)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Meeting URL & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Meeting URL
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
                />
                <button
                  onClick={generateMeetingUrl}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Generate Google Meet link
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Office, Zoom, or address"
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              />
            </div>
          </div>

          {/* Reminder & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Reminder
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              >
                <option value={0}>No reminder</option>
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-50"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Repeat this event
              </span>
            </label>
            {isRecurring && (
              <RecurrenceSelector
                value={recurrencePattern}
                onChange={setRecurrencePattern}
              />
            )}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <ActionButton variant="secondary" onClick={handleClose}>
          Cancel
        </ActionButton>
        <ActionButton
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          {editMode ? "Save Changes" : "Create Event"}
        </ActionButton>
      </ModalFooter>
    </Modal>
  );
}
