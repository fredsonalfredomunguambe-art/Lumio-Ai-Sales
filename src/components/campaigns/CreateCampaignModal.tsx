"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Mail,
  Users,
  Target,
  Trash2,
  Calendar,
  MessageSquare,
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

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CampaignSequenceStep {
  id: string;
  step: number;
  delay: number;
  type: string;
  channel: string;
  subject: string;
  content: string;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("EMAIL_SEQUENCE");
  const [mode, setMode] = useState<"AUTOPILOT" | "COPILOT">("COPILOT");
  const [targetSegment, setTargetSegment] = useState("");
  const [sequences, setSequences] = useState<CampaignSequenceStep[]>([
    {
      id: "seq_1",
      step: 1,
      delay: 0,
      type: "EMAIL",
      channel: "email",
      subject: "",
      content: "",
    },
  ]);

  const handleAddSequence = () => {
    const newStep = sequences.length + 1;
    setSequences([
      ...sequences,
      {
        id: `seq_${newStep}`,
        step: newStep,
        delay: 24,
        type: "EMAIL",
        channel: "email",
        subject: "",
        content: "",
      },
    ]);
  };

  const handleRemoveSequence = (id: string) => {
    if (sequences.length === 1) return; // Keep at least one
    setSequences(sequences.filter((seq) => seq.id !== id));
  };

  const handleSequenceChange = (id: string, field: string, value: any) => {
    setSequences(
      sequences.map((seq) => (seq.id === id ? { ...seq, [field]: value } : seq))
    );
  };

  const handleSubmit = async () => {
    if (!name || !type) {
      alert("Please fill in campaign name and type");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          type,
          mode,
          targetSegment,
          status: "DRAFT",
          sequences: sequences.map((seq) => ({
            step: seq.step,
            delay: seq.delay,
            type: seq.type,
            channel: seq.channel,
            subject: seq.subject,
            content: seq.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create campaign");
      }

      // Success
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setType("EMAIL_SEQUENCE");
    setMode("COPILOT");
    setTargetSegment("");
    setSequences([
      {
        id: "seq_1",
        step: 1,
        delay: 0,
        type: "EMAIL",
        channel: "email",
        subject: "",
        content: "",
      },
    ]);
    setCurrentStep(1);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalHeader>
        <ModalTitle>Create New Campaign</ModalTitle>
      </ModalHeader>

      <ModalContent>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: "Basic Info" },
            { num: 2, label: "Sequences" },
            { num: 3, label: "Review" },
          ].map((step) => (
            <div key={step.num} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step.num}
              </div>
              <div className="ml-3 flex-1">
                <div
                  className={`text-sm font-medium ${
                    currentStep >= step.num ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </div>
              </div>
              {step.num < 3 && (
                <div
                  className={`h-1 flex-1 mx-4 rounded ${
                    currentStep > step.num ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Series, Product Launch"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "EMAIL_SEQUENCE",
                    label: "Email Sequence",
                    icon: Mail,
                  },
                  {
                    value: "LINKEDIN_SEQUENCE",
                    label: "LinkedIn",
                    icon: Users,
                  },
                  { value: "NURTURE", label: "Nurture", icon: Target },
                  {
                    value: "CART_RECOVERY",
                    label: "Cart Recovery",
                    icon: MessageSquare,
                  },
                ].map((typeOption) => (
                  <button
                    key={typeOption.value}
                    onClick={() => setType(typeOption.value)}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                      type === typeOption.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <typeOption.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{typeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Mode *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("COPILOT")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === "COPILOT"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold mb-1">Copilot</div>
                  <div className="text-xs text-gray-600">
                    AI suggests, you approve
                  </div>
                </button>
                <button
                  onClick={() => setMode("AUTOPILOT")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === "AUTOPILOT"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold mb-1">Autopilot</div>
                  <div className="text-xs text-gray-600">
                    AI runs automatically
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Segment
              </label>
              <select
                value={targetSegment}
                onChange={(e) => setTargetSegment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Leads</option>
                <option value="new">New Leads</option>
                <option value="qualified">Qualified Leads</option>
                <option value="shopify">Shopify Customers</option>
                <option value="hubspot">HubSpot Contacts</option>
                <option value="high-score">High Score (70+)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Sequences */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sequence Steps
                </h3>
                <p className="text-sm text-gray-600">
                  Build your multi-step campaign
                </p>
              </div>
              <ActionButton
                variant="secondary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleAddSequence}
              >
                Add Step
              </ActionButton>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sequences.map((seq, index) => (
                <div
                  key={seq.id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <Badge variant="ghost">Step {index + 1}</Badge>
                    </div>
                    {sequences.length > 1 && (
                      <button
                        onClick={() => handleRemoveSequence(seq.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Delay (hours)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={seq.delay}
                          onChange={(e) =>
                            handleSequenceChange(
                              seq.id,
                              "delay",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Channel
                        </label>
                        <select
                          value={seq.channel}
                          onChange={(e) =>
                            handleSequenceChange(
                              seq.id,
                              "channel",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="email">Email</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={seq.subject}
                        onChange={(e) =>
                          handleSequenceChange(
                            seq.id,
                            "subject",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Welcome to our platform"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Message Content
                      </label>
                      <textarea
                        value={seq.content}
                        onChange={(e) =>
                          handleSequenceChange(
                            seq.id,
                            "content",
                            e.target.value
                          )
                        }
                        rows={4}
                        placeholder="Hi {{firstName}}, &#10;&#10;Welcome to our platform..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        Available variables: {"{"}
                        {"{firstName}}"}, {"{"}
                        {"{lastName}}"}, {"{"}
                        {"{company}}"}, {"{"}
                        {"{email}}"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <Badge variant="ghost">{type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <Badge variant={mode === "AUTOPILOT" ? "warning" : "info"}>
                    {mode}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">
                    {targetSegment || "All Leads"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sequences:</span>
                  <span className="font-medium">{sequences.length} steps</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Sequence Preview
              </h4>
              <div className="space-y-2">
                {sequences.map((seq, index) => (
                  <div
                    key={seq.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {seq.subject || "Untitled"}
                        </span>
                        <Badge variant="ghost" size="sm">
                          {seq.channel}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {seq.delay === 0
                          ? "Send immediately"
                          : `Wait ${seq.delay} hours`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter>
        <div className="flex items-center justify-between w-full">
          <div>
            {currentStep > 1 && (
              <ActionButton
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Back
              </ActionButton>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ActionButton variant="secondary" onClick={handleClose}>
              Cancel
            </ActionButton>
            {currentStep < 3 ? (
              <ActionButton
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </ActionButton>
            ) : (
              <ActionButton
                variant="primary"
                onClick={handleSubmit}
                loading={loading}
              >
                Create Campaign
              </ActionButton>
            )}
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}
