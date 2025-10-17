"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Clock,
  Filter,
  Search,
  Plus,
  Download,
  Eye,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";

interface WhatsAppMessage {
  id: string;
  to: string;
  message: string;
  type: "text" | "image" | "document" | "template";
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  mediaUrl?: string;
  templateName?: string;
}

interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  status: "active" | "inactive" | "blocked";
}

interface WhatsAppIntegrationProps {
  onMessageSent?: (message: WhatsAppMessage) => void;
  onConnectionStatusChange?: (connected: boolean) => void;
}

export default function WhatsAppIntegration({
  onMessageSent,
  onConnectionStatusChange,
}: WhatsAppIntegrationProps) {
  const toast = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState<"text" | "image" | "document">(
    "text"
  );
  const [mediaUrl, setMediaUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
    loadContacts();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/integrations/whatsapp/connect");
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setIsConnected(true);
        onConnectionStatusChange?.(true);
      } else {
        setIsConnected(false);
        onConnectionStatusChange?.(false);
      }
    } catch (error) {
      console.error("Error checking WhatsApp connection:", error);
      setIsConnected(false);
      onConnectionStatusChange?.(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await fetch("/api/integrations/whatsapp/contacts");
      const data = await response.json();

      if (data.success) {
        setContacts(data.data.contacts || []);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would redirect to WhatsApp Business setup
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setIsConnected(true);
      onConnectionStatusChange?.(true);
      toast.success(
        "Connected",
        "WhatsApp Business integration connected successfully"
      );
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast.error(
        "Connection Failed",
        "Failed to connect WhatsApp integration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !newMessage.trim()) {
      toast.error(
        "Missing Information",
        "Please select a contact and enter a message"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/integrations/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedContact,
          message: newMessage,
          type: messageType,
          mediaUrl: mediaUrl || undefined,
          accessToken: "mock_access_token", // In real app, get from stored credentials
          phoneNumberId: "mock_phone_number_id",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newMessageObj: WhatsAppMessage = {
          id: data.data.messageId,
          to: selectedContact,
          message: newMessage,
          type: messageType,
          status: "sent",
          timestamp: data.data.timestamp,
          mediaUrl: mediaUrl || undefined,
        };

        setMessages((prev) => [newMessageObj, ...prev]);
        onMessageSent?.(newMessageObj);
        setNewMessage("");
        setMediaUrl("");
        toast.success("Message Sent", "WhatsApp message sent successfully");
      } else {
        toast.error(
          "Send Failed",
          data.error || "Failed to send WhatsApp message"
        );
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      toast.error("Send Failed", "Failed to send WhatsApp message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    loadMessagesForContact(contactId);
  };

  const loadMessagesForContact = async (contactId: string) => {
    try {
      const response = await fetch(
        `/api/integrations/whatsapp/messages?contact=${contactId}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "text-blue-600 bg-blue-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "read":
        return "text-green-700 bg-green-200";
      case "failed":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "read":
        return <Eye className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isConnected ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <MessageSquare
                  className={`w-6 h-6 ${
                    isConnected ? "text-green-600" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  WhatsApp Business Integration
                </h3>
                <p className="text-sm text-gray-500">
                  {isConnected
                    ? "Connected and ready to send messages"
                    : "Connect to send WhatsApp messages to your leads"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  <span>Connect WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contacts List */}
          <div className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacts
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedContact === contact.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {contact.name}
                        </h4>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                        {contact.lastMessage && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            {contact.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {contact.unreadCount}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            contact.status === "active"
                              ? "bg-green-100 text-green-700"
                              : contact.status === "inactive"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {contact.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Input */}
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Send Message
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message Type
                    </label>
                    <select
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text Message</option>
                      <option value="image">Image</option>
                      <option value="document">Document</option>
                    </select>
                  </div>

                  {messageType === "image" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {messageType === "document" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document URL
                      </label>
                      <input
                        type="url"
                        value={mediaUrl}
                        onChange={(e) => setMediaUrl(e.target.value)}
                        placeholder="https://example.com/document.pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleSendMessage}
                    disabled={
                      !selectedContact || !newMessage.trim() || isLoading
                    }
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Message History */}
            {selectedContact && (
              <div className="card">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Message History
                  </h3>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No messages yet. Send your first message!
                      </p>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {message.to}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    message.status
                                  )}`}
                                >
                                  {getStatusIcon(message.status)}
                                  <span className="ml-1 capitalize">
                                    {message.status}
                                  </span>
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              {message.message}
                            </p>
                            {message.mediaUrl && (
                              <div className="text-xs text-blue-600">
                                Media: {message.mediaUrl}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
