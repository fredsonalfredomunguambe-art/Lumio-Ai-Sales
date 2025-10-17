"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Bell,
  CheckCircle,
  Mail,
  Sparkles,
  ExternalLink,
  FileText,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { MeetingPrepPanel } from "./MeetingPrepPanel";

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onReschedule: () => void;
}

export function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  onComplete,
  onReschedule,
}: EventDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (event?.meetingNotes) {
      setMeetingNotes(event.meetingNotes);
    }
  }, [event]);

  if (!event) return null;

  const handleCopyMeetingLink = () => {
    if (event.meetingUrl) {
      navigator.clipboard.writeText(event.meetingUrl);
      alert("Meeting link copied to clipboard!");
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const response = await fetch("/api/calendar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: event.id,
          meetingNotes,
        }),
      });

      if (response.ok) {
        alert("Notes saved successfully!");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleJoinMeeting = () => {
    if (event.meetingUrl) {
      window.open(event.meetingUrl, "_blank");
    }
  };

  const handleSendReminder = async () => {
    try {
      const response = await fetch(`/api/calendar/${event.id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "send-reminder" }),
      });

      if (response.ok) {
        alert("Reminder sent to all attendees!");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  const attendeesList = event.attendees
    ? typeof event.attendees === "string"
      ? JSON.parse(event.attendees)
      : event.attendees
    : [];

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "SALES_CALL":
        return "success";
      case "DEMO":
        return "info";
      case "FOLLOW_UP":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center justify-between w-full pr-8">
          <div>
            <ModalTitle>{event.title}</ModalTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getCategoryBadgeVariant(event.category)}>
                {event.category}
              </Badge>
              <Badge variant={event.priority === "HIGH" ? "danger" : "ghost"}>
                {event.priority}
              </Badge>
              {event.externalProvider && (
                <Badge variant="info" size="sm">
                  Synced with {event.externalProvider}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {event.meetingUrl && (
              <ActionButton
                variant="primary"
                size="sm"
                icon={<Video className="w-4 h-4" />}
                onClick={handleJoinMeeting}
              >
                Join
              </ActionButton>
            )}
            <ActionButton
              variant="secondary"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={onEdit}
            >
              Edit
            </ActionButton>
          </div>
        </div>
      </ModalHeader>

      <ModalContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prep">
              <Sparkles className="w-4 h-4 mr-2" />
              Meeting Prep
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Time & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Start</div>
                  <div className="font-medium text-gray-900">
                    {formatDateTime(event.startDate)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">End</div>
                  <div className="font-medium text-gray-900">
                    {formatDateTime(event.endDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Attendees */}
            {attendeesList.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Attendees ({attendeesList.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {attendeesList.map((email: string) => (
                    <Badge key={email} variant="ghost">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting URL */}
            {event.meetingUrl && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Video className="w-4 h-4" />
                    {event.meetingUrl}
                  </a>
                  <button
                    onClick={handleCopyMeetingLink}
                    className="text-gray-600 hover:text-gray-700"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Location
                  </div>
                  <div className="text-gray-600">{event.location}</div>
                </div>
              </div>
            )}

            {/* Linked Lead */}
            {event.lead && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Linked Lead
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {event.lead.firstName} {event.lead.lastName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.lead.company || event.lead.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reminder */}
            {event.reminderMinutes && event.reminderMinutes > 0 && (
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  Reminder: {event.reminderMinutes} minutes before
                </span>
              </div>
            )}
          </TabsContent>

          {/* Meeting Prep Tab */}
          <TabsContent value="prep">
            {event.linkedLeadId ? (
              <MeetingPrepPanel leadId={event.linkedLeadId} event={event} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>
                  Link a lead to this event to see AI-generated meeting prep
                </p>
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Notes
              </label>
              <textarea
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                rows={10}
                placeholder="Take notes during or after the meeting...&#10;&#10;- Key discussion points&#10;- Action items&#10;- Next steps&#10;- Decisions made"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <ActionButton
              variant="primary"
              onClick={handleSaveNotes}
              loading={savingNotes}
              icon={<FileText className="w-4 h-4" />}
            >
              Save Notes
            </ActionButton>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <ActionButton
                variant="secondary"
                icon={<Calendar className="w-4 h-4" />}
                onClick={onReschedule}
                className="justify-start"
              >
                Reschedule Event
              </ActionButton>
              <ActionButton
                variant="secondary"
                icon={<Copy className="w-4 h-4" />}
                onClick={async () => {
                  try {
                    await fetch(`/api/calendar/${event.id}/actions`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "duplicate" }),
                    });
                    onClose();
                  } catch (error) {
                    console.error("Error duplicating:", error);
                  }
                }}
                className="justify-start"
              >
                Duplicate Event
              </ActionButton>
              <ActionButton
                variant="secondary"
                icon={<Bell className="w-4 h-4" />}
                onClick={handleSendReminder}
                className="justify-start"
              >
                Send Reminder
              </ActionButton>
              <ActionButton
                variant="secondary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={onComplete}
                className="justify-start"
              >
                Mark as Complete
              </ActionButton>
              {event.meetingUrl && (
                <ActionButton
                  variant="secondary"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={handleCopyMeetingLink}
                  className="justify-start"
                >
                  Copy Meeting Link
                </ActionButton>
              )}
              <ActionButton
                variant="secondary"
                icon={<Mail className="w-4 h-4" />}
                onClick={async () => {
                  // Create follow-up email
                  if (event.linkedLeadId) {
                    window.location.href = `/dashboard/leads?action=email&leadId=${event.linkedLeadId}`;
                  }
                }}
                className="justify-start"
              >
                Send Follow-up Email
              </ActionButton>
            </div>

            {/* Quick Stats */}
            {event.completedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Completed on{" "}
                    {new Date(event.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ModalContent>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <ActionButton
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              if (confirm("Are you sure you want to delete this event?")) {
                onDelete();
                onClose();
              }
            }}
          >
            Delete Event
          </ActionButton>
          <div className="flex items-center gap-2">
            <ActionButton variant="secondary" onClick={onClose}>
              Close
            </ActionButton>
            {!event.completedAt && (
              <ActionButton
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => {
                  onComplete();
                  onClose();
                }}
              >
                Mark Complete
              </ActionButton>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
