"use client";

/**
 * ChatWidget Component
 * Modern floating AI chatbot widget for Immigrant Jobs World
 * Features: Glassmorphism design, typing animation, suggestions
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useChatbot, ChatMessage } from "@/hooks/useChatbot";
import "./ChatWidget.css";

// Icons as inline SVG components for better performance
const BotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="chat-icon"
  >
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="15" x2="8" y2="15.01" />
    <line x1="16" y1="15" x2="16" y2="15.01" />
  </svg>
);

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="send-icon"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="close-icon"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const MinimizeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="minimize-icon"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="sparkle-icon">
    <path d="M12 2L13.09 8.26L19 9.27L14.55 13.14L15.82 19.02L12 16.27L8.18 19.02L9.45 13.14L5 9.27L10.91 8.26L12 2Z" />
  </svg>
);

interface SuggestionButton {
  label: string;
  query: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionButton[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, sendMessage, clearMessages } = useChatbot();

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch initial suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
        const response = await fetch(`${baseUrl}/chatbot/suggestions`);
        const data = await response.json();
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        // Use default suggestions if API fails
        setSuggestions([
          { label: "📚 কোর্স দেখুন", query: "কোন কোন কোর্স আছে?" },
          { label: "💰 মূল্য তালিকা", query: "কোর্সের দাম কত?" },
          { label: "📅 ব্যাচ তথ্য", query: "পরবর্তী ব্যাচ কবে শুরু হবে?" },
        ]);
      }
    };

    if (isOpen && messages.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleSuggestionClick = async (query: string) => {
    if (isLoading) return;
    await sendMessage(query);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("bn-BD", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-widget-container">
      {/* Chat Window */}
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <BotIcon />
              <span className="online-indicator"></span>
            </div>
            <div className="chat-header-text">
              <h3>ইমিগ্র্যান্ট বট</h3>
              <p>AI সহায়ক • অনলাইন</p>
            </div>
          </div>
          <div className="chat-header-actions">
            <button
              onClick={() => clearMessages()}
              className="header-btn"
              title="নতুন চ্যাট"
              aria-label="Clear chat"
            >
              <SparkleIcon />
            </button>
            <button
              onClick={toggleChat}
              className="header-btn"
              title="বন্ধ করুন"
              aria-label="Close chat"
            >
              <MinimizeIcon />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="chat-messages">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="welcome-container">
              <div className="welcome-icon">
                <BotIcon />
              </div>
              <h4>স্বাগতম! 👋</h4>
              <p>
                আমি ইমিগ্র্যান্ট বট, Immigrant Jobs World এর AI সহায়ক। কোর্স, ব্যাচ, ভর্তি, বা
                যেকোনো বিষয়ে আমাকে জিজ্ঞাসা করুন!
              </p>

              {/* Initial Suggestions */}
              {suggestions.length > 0 && (
                <div className="initial-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="suggestion-btn"
                      disabled={isLoading}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message List */}
          {messages.map((message: ChatMessage, index: number) => (
            <div
              key={index}
              className={`message ${
                message.role === "user" ? "user-message" : "bot-message"
              }`}
            >
              {message.role === "assistant" && (
                <div className="message-avatar">
                  <BotIcon />
                </div>
              )}
              <div className="message-content">
                <div className="message-bubble">{message.content}</div>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="message bot-message">
              <div className="message-avatar">
                <BotIcon />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="আপনার প্রশ্ন লিখুন..."
              disabled={isLoading}
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="send-btn"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
          {/* <p className="powered-by">
            Powered by <span>Gemini AI</span>
          </p> */}
        </form>
      </div>

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className={`chat-toggle-btn ${isOpen ? "active" : ""}`}
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        title="Immigrant AI"
      >
        {isOpen ? (
          <CloseIcon />
        ) : (
          <div className="chat-btn-image-wrapper" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image
              src="/images/imigrant-1.png"
              alt="Immigrant AI"
              width={44}
              height={44}
              style={{ objectFit: "contain" }}
              priority
            />
            <div
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                color: "#fff",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(124, 58, 237, 0.5)",
              }}
              title="AI Assistant"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "10px", height: "10px", color: "#fbbf24" }}>
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>
        )}
        {!isOpen && <span className="btn-pulse"></span>}
      </button>
    </div>
  );
};

export default ChatWidget;
