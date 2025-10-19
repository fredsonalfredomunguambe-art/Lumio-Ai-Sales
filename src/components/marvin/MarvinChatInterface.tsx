"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  Loader2,
  MessageSquare,
  X,
  Sparkles,
  Mic,
  Paperclip,
  Smile,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useToast } from "@/components/NotificationSystem";
import Image from "next/image";

interface MarvinChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  marvinConfig?: any;
}

interface ChatMessage {
  id: string;
  type: "user" | "marvin";
  message: string;
  timestamp: Date;
  rating?: "positive" | "negative" | null;
}

export default function MarvinChatInterface({
  isOpen,
  onClose,
  marvinConfig,
}: MarvinChatInterfaceProps) {
  const toast = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 20,
      },
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Load Marvin configuration
      loadMarvinConfig();

      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: `marvin-${Date.now()}`,
        type: "marvin",
        message: marvinConfig?.companyName
          ? `Hello! I'm Marvin, your intelligent sales assistant at ${marvinConfig.companyName}. How can I help you today?`
          : "Hello! I'm Marvin, your intelligent sales assistant. How can I help you today?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const loadMarvinConfig = async () => {
    try {
      const response = await fetch("/api/company/profile");
      if (response.ok) {
        const config = await response.json();
        // Update the config for this chat session
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === 0
              ? {
                  ...msg,
                  message: config.name
                    ? `Hello! I'm Marvin, your intelligent sales assistant at ${config.name}. How can I help you today?`
                    : "Hello! I'm Marvin, your intelligent sales assistant. How can I help you today?",
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error loading Marvin config:", error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      message: currentMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Load current configuration for this chat
      const configResponse = await fetch("/api/company/profile");
      let currentConfig = marvinConfig;

      if (configResponse.ok) {
        currentConfig = await configResponse.json();
      }

      const response = await fetch("/api/marvin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage.trim(),
          config: currentConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Simulate typing delay for more realistic experience
        setTimeout(() => {
          const marvinMessage: ChatMessage = {
            id: `marvin-${Date.now()}`,
            type: "marvin",
            message: data.response,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, marvinMessage]);
          setIsTyping(false);
        }, 1000 + Math.random() * 1000);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: `marvin-error-${Date.now()}`,
        type: "marvin",
        message: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Error", "Failed to send message");
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const rateMessage = (messageId: string, rating: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Chat Container */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[85vh] overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header Elite */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Image
                      src="/fotos/marvin.png"
                      alt="Marvin"
                      width={32}
                      height={32}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center">
                      Marvin Chat Test
                      <Sparkles className="w-4 h-4 text-yellow-500 ml-2" />
                    </h3>
                    <p className="text-xs text-gray-600">
                      Test how Marvin will respond to your customers
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/80 rounded-xl transition-all group"
                >
                  <X className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : "bg-white text-gray-900 shadow-sm border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.type === "marvin" && (
                          <Image
                            src="/fotos/marvin.png"
                            alt="Marvin"
                            width={20}
                            height={20}
                            className="w-5 h-5 rounded-full object-cover mt-0.5 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">
                            {message.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p
                              className={`text-xs ${
                                message.type === "user"
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            {message.type === "marvin" && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() =>
                                    rateMessage(message.id, "positive")
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    message.rating === "positive"
                                      ? "text-green-600 bg-green-100"
                                      : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                                  }`}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    rateMessage(message.id, "negative")
                                  }
                                  className={`p-1 rounded transition-colors ${
                                    message.rating === "negative"
                                      ? "text-red-600 bg-red-100"
                                      : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {message.type === "user" && (
                          <User className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/fotos/marvin.png"
                        alt="Marvin"
                        width={20}
                        height={20}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <div className="flex space-x-1">
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
                      <span className="text-sm text-gray-600">
                        Marvin is typing...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area Elite */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                      rows={1}
                      disabled={isLoading}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-3 top-3 flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !currentMessage.trim()}
                    className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
