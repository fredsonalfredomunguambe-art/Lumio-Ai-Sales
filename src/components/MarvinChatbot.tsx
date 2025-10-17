"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  RocketLaunchIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Marvin: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey there! I'm Marvin, your AI Marketing Intelligence Partner. I'm genuinely excited to help you transform your marketing strategy and unlock growth you never thought possible.\n\nWhat's on your mind today? I'm here to listen and guide you through this journey.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const predefinedQuestions = [
    "How does Lumio work?",
    "What are the benefits?",
    "How can I get started?",
    "I need marketing help",
    "Tell me about pricing",
  ];

  const handleQuestionClick = (question: string) => {
    // Add user question
    const userMessage: Message = {
      id: Date.now(),
      text: question,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate response based on question
    setTimeout(() => {
      let response = "";

      switch (question) {
        case "How does Lumio work?":
          response =
            "Great question! Let me break this down in a way that makes sense for your business.\n\nHere's the magic behind Lumio:\n\nWe've built something that feels like having your best marketing strategist working 24/7, but with superhuman capabilities. Our AI doesn't just analyze data—it understands your business, your audience, and your goals.\n\nThe Process:\n1. Smart Integration - We connect to your existing platforms seamlessly\n2. Deep Analysis - Our AI studies your campaigns like a seasoned expert would\n3. Real-time Optimization - We make adjustments while you sleep\n4. Predictive Insights - We spot opportunities before your competitors do\n\nThink of it as having a marketing genius who never gets tired, never takes breaks, and always has your best interests at heart.\n\nDoes this sound like what you're looking for?";
          break;
        case "What are the benefits?":
          response =
            "Let me share what our clients are actually experiencing—this isn't just marketing speak, it's real results.\n\nThe Numbers That Matter:\n\nROI Growth: Our clients see an average 40% increase in campaign performance within 90 days\nTime Freedom: You'll reclaim 15+ hours weekly from manual optimization\nCompetitive Edge: Stay ahead with predictive analytics that spot trends before they happen\nSmart Decisions: Get recommendations that feel like they come from your best marketing consultant\n\nThe Human Side:\n\nWhat I'm most proud of? Seeing our clients finally get their weekends back. They're spending time with family instead of staring at spreadsheets.\n\nAnd here's the thing—we're not just another tool. We're your partner in growth. When you succeed, we succeed.\n\nReady to join the success stories?";
          break;
        case "How can I get started?":
          response =
            "I love this question because it shows you're ready to take action! Let me walk you through this step by step.\n\nYour 5-Minute Path to Marketing Transformation:\n\nStep 1: Create Your Free Account\n• Click the button below (no credit card required)\n• Takes literally 2 minutes\n\nStep 2: Connect Your Platforms\n• Google Ads, Facebook, LinkedIn, TikTok\n• We handle the technical stuff\n• You focus on your business\n\nStep 3: AI Analysis Begins\n• Our system studies your campaigns\n• Identifies immediate opportunities\n• Creates your personalized strategy\n\nStep 4: Watch the Magic Happen\n• Marvin starts optimizing immediately\n• You'll see results in your first week\n• Real-time dashboard shows progress\n\nHere's what makes this special:\n\nWe don't believe in long onboarding processes. You should see value from day one.\n\nWant me to personally guide you through this? Let's create your account right now!";
          break;
        case "I need marketing help":
          response =
            "I hear you, and honestly? You're not alone. Most businesses are struggling with the same challenges.\n\nLet me ask you something:\n\nAre you tired of:\n• Spending money on ads that don't convert?\n• Wondering if your marketing is actually working?\n• Feeling like you're always playing catch-up?\n• Wasting time on strategies that don't move the needle?\n\nHere's the truth:\n\nMarketing shouldn't be a guessing game. It should be a science with a human touch.\n\nWhat Lumio does differently:\n\nWe don't just give you data—we give you understanding. We don't just optimize campaigns—we optimize your entire marketing strategy.\n\nThe result?\n\nYou'll finally have confidence in your marketing decisions. You'll know exactly where your money is going and why it's working.\n\nReady to stop guessing and start growing? Let's talk about your specific situation.";
          break;
        case "Tell me about pricing":
          response =
            "I appreciate you asking about pricing—it shows you're serious about this investment.\n\nLet me be completely transparent:\n\nStarter Plan: $99/month\n• Perfect for small businesses and startups\n• Full AI optimization suite\n• Real-time analytics dashboard\n• 24/7 campaign monitoring\n\nProfessional Plan: $299/month\n• Ideal for growing companies\n• Advanced segmentation and targeting\n• Priority support and consultation\n• Custom reporting and insights\n\nEnterprise Plan: Custom pricing\n• For large organizations\n• Dedicated success manager\n• Custom integrations\n• White-label solutions\n\nHere's what I want you to know:\n\n• No setup fees or hidden costs\n• 14-day free trial (no credit card required)\n• Cancel anytime\n• All plans include our full feature set\n\nThe real question is:\n\nWhat's the cost of NOT optimizing your marketing? Most businesses spend thousands on ads that don't work.\n\nWith Lumio, you're not just spending money—you're investing in growth.\n\nWant to start with our free trial and see the difference?";
          break;
        default:
          response =
            "That's a fantastic question! I love when people think outside the box.\n\nHere's what I can tell you:\n\nLumio is designed to solve real marketing challenges that businesses face every day. We're not just another tool—we're your strategic partner in growth.\n\nWhat makes us different:\n\nWe combine cutting-edge AI with human understanding. We don't just optimize campaigns—we optimize your entire marketing strategy.\n\nMy promise to you:\n\nI'm here to help you succeed. Whether it's through our platform, our expertise, or just being a sounding board for your ideas.\n\nLet's start your journey:\n\nCreate your free account, and let me show you what's possible. The transformation begins the moment you sign up.\n\nReady to unlock your marketing potential?";
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Check for interactive responses based on the last bot message
    const lastBotMessage = messages[messages.length - 1];
    if (lastBotMessage && !lastBotMessage.isUser) {
      const lastBotText = lastBotMessage.text.toLowerCase();

      // Response to "How does Lumio work?" question
      if (
        lastBotText.includes("does this sound like what you're looking for?")
      ) {
        setTimeout(() => {
          let response = "";
          const userInput = userMessage.text.toLowerCase();

          if (
            userInput.includes("yes") ||
            userInput.includes("yeah") ||
            userInput.includes("sure") ||
            userInput.includes("absolutely") ||
            userInput.includes("definitely")
          ) {
            response =
              "Fantastic! I'm excited that this resonates with you.\n\nNow, let me ask you something important:\n\nWhat's your biggest marketing challenge right now?\n\n• Are you struggling with low conversion rates?\n• Is your ad spend not delivering results?\n• Do you need help with audience targeting?\n• Are you looking to scale your campaigns?\n\nUnderstanding your specific situation helps me give you the most relevant guidance. Plus, I can show you exactly how Lumio will solve your particular challenges.\n\nWhat's keeping you up at night when it comes to marketing?";
          } else if (
            userInput.includes("no") ||
            userInput.includes("not really") ||
            userInput.includes("not sure") ||
            userInput.includes("maybe")
          ) {
            response =
              "I really appreciate your honesty! That's actually really valuable feedback.\n\nYou know what? That's totally okay. Not every solution is right for every business, and I'd rather be upfront about that than waste your time.\n\nBut I'm still here to help you, even if Lumio isn't the right fit. Marketing challenges are real, and sometimes just talking through them can help.\n\nWhat are you currently struggling with in your marketing? Maybe I can offer some general advice or point you in the right direction, regardless of whether you use our platform or not.\n\nWhat's on your mind?";
          } else {
            response =
              "I see you have a different perspective. That's actually really valuable feedback.\n\nCould you help me understand what you're looking for in a marketing solution?\n\n• What features are most important to you?\n• What's your current marketing setup?\n• What results are you hoping to achieve?\n\nI want to make sure I'm giving you the right information. If Lumio isn't the right fit, I'd rather tell you upfront than waste your time.\n\nWhat's your vision for your marketing success?";
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to "What are the benefits?" question
      if (lastBotText.includes("ready to join the success stories?")) {
        setTimeout(() => {
          let response = "";
          const userInput = userMessage.text.toLowerCase();

          if (
            userInput.includes("yes") ||
            userInput.includes("yeah") ||
            userInput.includes("sure") ||
            userInput.includes("absolutely") ||
            userInput.includes("definitely") ||
            userInput.includes("ready")
          ) {
            response =
              "Excellent! I love your enthusiasm.\n\nNow, let me get you started on the right foot. I have a few quick questions to make sure we set up your account perfectly:\n\n• What's your current monthly marketing budget?\n• Which platforms are you currently using (Google Ads, Facebook, LinkedIn)?\n• What's your primary business goal right now?\n\nOnce I understand your setup, I can create a personalized onboarding plan that will get you seeing results faster.\n\nLet's start with your marketing budget - what are you currently spending monthly?";
          } else if (
            userInput.includes("no") ||
            userInput.includes("not really") ||
            userInput.includes("not sure") ||
            userInput.includes("maybe")
          ) {
            response =
              "I completely understand, and I respect that decision. Sometimes it's just not the right time, and that's perfectly fine.\n\nBut I want you to know something: I'm still here to help you, even if you don't become a client right now. Marketing is complex, and sometimes just having someone to bounce ideas off of can make a huge difference.\n\nWhat would be most helpful for you right now?\n\n• Do you have specific marketing questions I can answer?\n• Are you looking for general advice on a particular challenge?\n• Would you like me to point you toward some free resources?\n\nMy goal is to help you succeed, whether that's with Lumio or not. What's on your mind?";
          } else {
            response =
              "I appreciate you sharing your thoughts. Every business is different, and I want to make sure we're addressing your specific needs.\n\nCould you tell me more about what you're looking for?\n\n• What's your current marketing situation?\n• What results are you hoping to achieve?\n• What's your timeline for making a decision?\n\nSometimes the best way to understand if something is right for you is to see it in action. Would you be open to a quick 15-minute demo where I show you exactly how Lumio would work for your business?\n\nWhat would be most helpful for you right now?";
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to "How can I get started?" question
      if (
        lastBotText.includes("want me to personally guide you through this?")
      ) {
        setTimeout(() => {
          let response = "";
          const userInput = userMessage.text.toLowerCase();

          if (
            userInput.includes("yes") ||
            userInput.includes("yeah") ||
            userInput.includes("sure") ||
            userInput.includes("absolutely") ||
            userInput.includes("definitely") ||
            userInput.includes("guide")
          ) {
            response =
              "Perfect! I'm excited to be your personal guide through this journey.\n\nLet me make this super easy for you. I'll walk you through every step:\n\nFirst, let's create your account together. It literally takes 2 minutes:\n\n• Click the 'Start Free Trial' button below\n• I'll guide you through the setup process\n• We'll connect your platforms together\n• I'll show you exactly what to expect\n\nI'm not going anywhere - I'll be here every step of the way to make sure you get the most out of Lumio.\n\nReady to start? Click the button below and let's get you set up!";
          } else if (
            userInput.includes("no") ||
            userInput.includes("not really") ||
            userInput.includes("not sure") ||
            userInput.includes("maybe")
          ) {
            response =
              "No problem at all! I totally get it. Sometimes you want to explore things on your own first, and that's actually a smart approach.\n\nBut here's the thing: I'm still here to help you, whether you use our platform or not. Marketing challenges don't disappear just because you're not ready for a tool yet.\n\nWhat would be most helpful for you right now?\n\n• Do you have specific questions about your current marketing setup?\n• Are you looking for advice on a particular challenge?\n• Would you like me to share some free resources or tips?\n\nI genuinely want to help you succeed, regardless of whether that involves Lumio or not. What's on your mind?";
          } else {
            response =
              "I appreciate you considering this. Let me make sure you have all the information you need to make the best decision.\n\nWhat would be most helpful for you right now?\n\n• Would you like to see a quick demo first?\n• Do you have specific questions about the setup process?\n• Are you looking for more information about pricing?\n• Would you prefer to start with a smaller commitment?\n\nI'm here to help you find the right path forward. Sometimes the best approach is to start small and scale up as you see results.\n\nWhat feels like the right next step for you?";
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to "I need marketing help" question
      if (lastBotText.includes("ready to stop guessing and start growing?")) {
        setTimeout(() => {
          let response = "";
          const userInput = userMessage.text.toLowerCase();

          if (
            userInput.includes("yes") ||
            userInput.includes("yeah") ||
            userInput.includes("sure") ||
            userInput.includes("absolutely") ||
            userInput.includes("definitely") ||
            userInput.includes("growing")
          ) {
            response =
              "That's exactly the mindset that leads to success! I love your determination.\n\nNow, let me get you the help you need. I want to understand your situation so I can give you the most relevant solution:\n\n• What's your biggest marketing pain point right now?\n• How much are you currently spending on marketing monthly?\n• What results are you seeing from your current efforts?\n\nOnce I understand your specific challenges, I can show you exactly how Lumio will solve them. Plus, I'll create a personalized strategy that addresses your unique situation.\n\nLet's start with your biggest pain point - what's the main thing that's frustrating you about your marketing right now?";
          } else if (
            userInput.includes("no") ||
            userInput.includes("not really") ||
            userInput.includes("not sure") ||
            userInput.includes("maybe")
          ) {
            response =
              "I completely understand, and I respect that. Sometimes it's just not the right time, and that's totally okay.\n\nBut I want you to know something: I'm still here to help you, even if you're not ready for a big change right now. Marketing problems can feel overwhelming, but they're usually solvable when we tackle them one step at a time.\n\nWhat would be most helpful for you right now?\n\n• Do you have a specific marketing question I can answer?\n• Are you looking for some free tips or resources?\n• Would you like me to help you break down a particular challenge?\n\nMy goal is to help you succeed, whether that's with Lumio or not. What's on your mind?";
          } else {
            response =
              "I appreciate you sharing your thoughts. Every business situation is unique, and I want to make sure I'm giving you the right guidance.\n\nCould you help me understand your current marketing situation better?\n\n• What marketing activities are you currently doing?\n• What results are you seeing?\n• What's your biggest frustration?\n• What would success look like for you?\n\nSometimes the best help comes from understanding the full picture. Once I see your situation clearly, I can give you much more targeted advice.\n\nWhat would you like to focus on first?";
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to "Tell me about pricing" question
      if (
        lastBotText.includes(
          "want to start with our free trial and see the difference?"
        )
      ) {
        setTimeout(() => {
          let response = "";
          const userInput = userMessage.text.toLowerCase();

          if (
            userInput.includes("yes") ||
            userInput.includes("yeah") ||
            userInput.includes("sure") ||
            userInput.includes("absolutely") ||
            userInput.includes("definitely") ||
            userInput.includes("trial")
          ) {
            response =
              "Excellent choice! Starting with the free trial is the smartest way to see if Lumio is right for you.\n\nHere's what you'll get with your free trial:\n\n• Full access to all features for 14 days\n• No credit card required\n• No commitment\n• Personal onboarding support\n• Real results in your first week\n\nI'm going to make sure you get the most out of this trial. I'll personally guide you through:\n\n• Setting up your account\n• Connecting your platforms\n• Understanding your first insights\n• Seeing your first optimizations\n\nReady to start? Click the 'Start Free Trial' button below and let's get you set up in just 2 minutes!";
          } else if (
            userInput.includes("no") ||
            userInput.includes("not really") ||
            userInput.includes("not sure") ||
            userInput.includes("maybe")
          ) {
            response =
              "I completely understand, and I respect that decision. Pricing decisions are important, and you want to make sure you're making the right choice for your business.\n\nBut I want you to know something: I'm still here to help you, even if you don't become a client right now. Marketing challenges don't disappear just because you're not ready for an investment.\n\nWhat would be most helpful for you right now?\n\n• Do you have specific marketing questions I can answer?\n• Are you looking for some free resources or tips?\n• Would you like me to help you think through a particular challenge?\n\nMy goal is to help you succeed, whether that's with Lumio or not. What's on your mind?";
          } else {
            response =
              "I appreciate you taking the time to consider this carefully. Pricing decisions are important, and I want to make sure you have all the information you need.\n\nWhat would be most helpful for you right now?\n\n• Would you like to see a detailed ROI calculation?\n• Do you have questions about what's included in each plan?\n• Are you looking for a custom pricing option?\n• Would you prefer to start with a smaller commitment?\n\nSometimes the best approach is to start small and scale up as you see results. I'm here to help you find the right path forward.\n\nWhat feels like the right next step for you?";
          }

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to follow-up questions about marketing challenges
      if (
        lastBotText.includes(
          "what's keeping you up at night when it comes to marketing?"
        ) ||
        lastBotText.includes(
          "what's the main thing that's frustrating you about your marketing right now?"
        ) ||
        lastBotText.includes(
          "what's your biggest marketing pain point right now?"
        )
      ) {
        setTimeout(() => {
          const response =
            "Thank you for sharing that. I can see exactly how Lumio will solve this challenge for you.\n\nBased on what you've told me, here's what I recommend:\n\n• Start with our free trial to see immediate results\n• I'll personally guide you through the setup\n• You'll see improvements in your first week\n• We'll address your specific pain point head-on\n\nI'm confident that once you see how Lumio works for your situation, you'll understand why this is the right solution.\n\nReady to stop struggling and start succeeding? Click the 'Start Free Trial' button below and let's get you set up right now!";

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }

      // Response to budget questions
      if (
        lastBotText.includes("what are you currently spending monthly?") ||
        lastBotText.includes(
          "how much are you currently spending on marketing monthly?"
        )
      ) {
        setTimeout(() => {
          const response =
            "Perfect! That gives me a clear picture of your situation.\n\nBased on your budget, I can see exactly how Lumio will help you:\n\n• Optimize your current spend for better results\n• Identify where you're wasting money\n• Show you opportunities to scale efficiently\n• Give you confidence in every marketing decision\n\nHere's what I recommend:\n\nStart with our free trial to see how Lumio can optimize your current budget. You'll see immediate improvements in your ROI, and then we can discuss the best plan for your needs.\n\nReady to get more from your marketing budget? Click 'Start Free Trial' below and let's optimize your campaigns together!";

          const botMessage: Message = {
            id: Date.now() + 1,
            text: response,
            isUser: false,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, botMessage]);
        }, 800);
        return;
      }
    }

    // Automatic response for other custom messages
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Thank you for reaching out! I really appreciate you taking the time to connect.\n\nHere's what I can help you with:\n\nI'm specialized in digital marketing strategies that actually work. I've helped hundreds of businesses transform their campaigns and achieve results they never thought possible.\n\nWhether you need help with:\n• Campaign optimization\n• Audience targeting\n• ROI improvement\n• Strategy development\n\nMy approach:\n\nI believe in personalized solutions, not one-size-fits-all approaches. Every business is unique, and your marketing strategy should reflect that.\n\nLet's start your transformation:\n\nCreate your free account, and let me show you what's possible. I'll personally guide you through the process and make sure you see results.\n\nReady to revolutionize your marketing?",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Opcional: mostrar feedback visual
      const tempInput = document.createElement("input");
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <div className="fixed bottom-6 right-24 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        >
          <ChatBubbleLeftRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Overlay - Allows page interaction */}
      {isOpen && (
        <div className="fixed bottom-6 right-24 z-50 w-96 h-[600px]">
          <div className="relative bg-white rounded-2xl shadow-2xl h-full flex flex-col border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/fotos/marvin.png"
                  alt="Marvin AI"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Marvin</h3>
                <p className="text-blue-100 text-sm">
                  AI Marketing Intelligence
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.isUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-gray-100 text-gray-800 rounded-bl-md"
                    }`}
                  >
                    <div className="relative group">
                      <p className="text-sm whitespace-pre-line font-medium leading-relaxed">
                        {message.text}
                      </p>
                      {!message.isUser && (
                        <button
                          onClick={() => copyMessage(message.text)}
                          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-xs text-gray-600 hover:text-gray-800"
                          title="Copiar mensagem"
                        >
                          📋
                        </button>
                      )}
                    </div>
                    <p
                      className={`text-xs mt-2 ${
                        message.isUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {predefinedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 text-center"
                  >
                    <SparklesIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm resize-none min-h-[44px] max-h-32"
                  rows={1}
                  style={{ minHeight: "44px", maxHeight: "128px" }}
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors duration-200 self-end"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center">
                Shift+Enter para nova linha • Enter para enviar
              </div>
            </div>

            {/* CTA Footer */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-b-2xl border-t border-blue-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  Ready to revolutionize your marketing?
                </p>
                <div className="flex space-x-2">
                  <Link
                    href="/sign-up"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 text-center flex items-center justify-center space-x-2"
                  >
                    <RocketLaunchIcon className="w-4 h-4" />
                    <span>Start Free Trial</span>
                  </Link>
                  <Link
                    href="/sign-in"
                    className="flex-1 bg-white border border-blue-200 text-blue-600 text-sm font-semibold py-2 px-4 rounded-xl hover:bg-blue-50 transition-all duration-200 text-center flex items-center justify-center space-x-2"
                  >
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Marvin;
