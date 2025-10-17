"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Settings,
  TestTube,
  Target,
  ShoppingCart,
  Users,
  GraduationCap,
  Heart,
  Factory,
} from "lucide-react";

interface TestScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  messages: string[];
}

const testScenarios: TestScenario[] = [
  {
    id: "ecommerce-cart",
    name: "E-commerce Cart Abandonment",
    description: "Customer abandoned cart with blue dress",
    icon: <ShoppingCart className="w-5 h-5" />,
    messages: [
      "I added a blue dress to my cart but didn't complete the purchase. Is it still available?",
      "I'm not sure about the size. What if it doesn't fit?",
      "The shipping is expensive. Do you have any discounts?",
      "I need to think about it. Can you hold it for me?",
    ],
  },
  {
    id: "saas-trial",
    name: "SaaS Trial Conversion",
    description: "User on day 12 of 14-day trial",
    icon: <Users className="w-5 h-5" />,
    messages: [
      "I'm using the trial but I'm not sure if it's worth paying for. What are the benefits?",
      "We already have a solution that works. Why should we switch?",
      "The price seems high compared to what we're using now.",
      "I need to discuss this with my team. Can you give me more time?",
    ],
  },
  {
    id: "education-course",
    name: "Education Course Upsell",
    description: "Student considering premium course",
    icon: <GraduationCap className="w-5 h-5" />,
    messages: [
      "I'm enjoying the free course but wondering about the premium version. What's included?",
      "I'm not sure if I have time to complete a full course.",
      "Is the premium course really worth the extra cost?",
      "Can I get a discount since I'm already a student?",
    ],
  },
  {
    id: "healthcare-appointment",
    name: "Healthcare Appointment Booking",
    description: "Patient interested in cardiology consultation",
    icon: <Heart className="w-5 h-5" />,
    messages: [
      "I need to see a cardiologist. Do you have any available appointments?",
      "I'm not sure if my insurance covers this. Can you check?",
      "I'm worried about the cost. What are your rates?",
      "I need to schedule around my work. What times are available?",
    ],
  },
  {
    id: "manufacturing-demo",
    name: "Manufacturing Equipment Demo",
    description: "B2B lead from trade show interested in equipment",
    icon: <Factory className="w-5 h-5" />,
    messages: [
      "We saw your equipment at the trade show. Can you tell us more about the specifications?",
      "We need equipment that meets FDA standards. Does yours comply?",
      "What's the typical ROI for this type of equipment?",
      "We need to see it in action. Can you arrange a demonstration?",
    ],
  },
];

interface MarvinTestChatProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: any;
}

export default function MarvinTestChat({
  isOpen,
  onClose,
  companyProfile,
}: MarvinTestChatProps) {
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(
    null
  );
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "marvin"; content: string }>
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleStartScenario = (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    setCurrentMessageIndex(0);
    setChatMessages([]);
  };

  const handleSendMessage = async (message: string) => {
    // Add user message
    const newMessages = [
      ...chatMessages,
      { role: "user" as const, content: message },
    ];
    setChatMessages(newMessages);
    setIsGenerating(true);

    // Simulate Marvin's response (in real implementation, this would call the API)
    setTimeout(() => {
      const marvinResponse = generateMarvinResponse(message, companyProfile);
      setChatMessages([
        ...newMessages,
        { role: "marvin" as const, content: marvinResponse },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const generateMarvinResponse = (
    userMessage: string,
    profile: any
  ): string => {
    // This is a simplified version - in real implementation, this would call the actual Marvin API
    const responses = [
      `Thank you for your interest in ${
        profile.name || "our company"
      }! I'd be happy to help you with that. Let me understand your specific needs better.`,
      `That's a great question! At ${
        profile.name || "our company"
      }, we specialize in solving exactly that type of challenge. What's your current situation?`,
      `I understand your concern. Many of our customers had similar questions initially. Let me share how we've helped others in your situation.`,
      `That's exactly why ${
        profile.name || "we"
      } exists! We've helped hundreds of customers overcome that challenge. What's your timeline for making a decision?`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleNextMessage = () => {
    if (
      selectedScenario &&
      currentMessageIndex < selectedScenario.messages.length
    ) {
      const message = selectedScenario.messages[currentMessageIndex];
      handleSendMessage(message);
      setCurrentMessageIndex(currentMessageIndex + 1);
    }
  };

  const resetChat = () => {
    setSelectedScenario(null);
    setCurrentMessageIndex(0);
    setChatMessages([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <TestTube className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Marvin Test Chat
              </h2>
              <p className="text-sm text-gray-500">
                Test how Marvin responds to your customers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Scenario Selection */}
          {!selectedScenario && (
            <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Scenarios
              </h3>
              <div className="space-y-3">
                {testScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleStartScenario(scenario)}
                    className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {scenario.icon}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {scenario.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {scenario.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {selectedScenario && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {selectedScenario.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {selectedScenario.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedScenario.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetChat}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {message.role === "user" ? "Customer" : "Marvin"}
                      </span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs font-medium">Marvin</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            {selectedScenario && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    {currentMessageIndex < selectedScenario.messages.length ? (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-700 mb-2">
                          Next test message:
                        </div>
                        <div className="text-gray-900">
                          {selectedScenario.messages[currentMessageIndex]}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-3">
                        All test messages sent. Try starting a new scenario or
                        add your own message.
                      </div>
                    )}
                  </div>
                  {currentMessageIndex < selectedScenario.messages.length && (
                    <button
                      onClick={handleNextMessage}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

