"use client";

/**
 * useChatbot Hook
 * Custom React hook for managing chatbot state and API communication
 * Features: Message history, session management, loading states
 */

import { useState, useCallback, useEffect } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
}

interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  sessionId: string;
}

// Generate unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Session storage key
const SESSION_KEY = "cadd_chatbot_session";

// Get/Create session from localStorage
const getSession = (): ChatSession => {
  if (typeof window === "undefined") {
    return { sessionId: generateSessionId(), messages: [] };
  }

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const session = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      session.messages = session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      return session;
    }
  } catch (error) {
    console.error("Error reading chat session:", error);
  }

  return { sessionId: generateSessionId(), messages: [] };
};

// Save session to localStorage
const saveSession = (session: ChatSession): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error saving chat session:", error);
  }
};

export const useChatbot = (): UseChatbotReturn => {
  const [session, setSession] = useState<ChatSession>(() => getSession());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save session whenever messages change
  useEffect(() => {
    saveSession(session);
  }, [session]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return;

      setIsLoading(true);
      setError(null);

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: "user",
        content: message.trim(),
        timestamp: new Date(),
      };

      setSession((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
      }));

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api";

        // Get current messages for context (limit to last 10 for performance)
        const historyMessages = session.messages.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }));

        const response = await fetch(`${baseUrl}/chatbot/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // For authentication cookies
          body: JSON.stringify({
            message: message.trim(),
            sessionId: session.sessionId,
            history: historyMessages,
            language: "bn",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const botMessage: ChatMessage = {
            role: "assistant",
            content: data.response,
            timestamp: new Date(data.timestamp || Date.now()),
            sources: data.sources,
          };

          setSession((prev) => ({
            ...prev,
            messages: [...prev.messages, botMessage],
          }));
        } else {
          throw new Error(data.message || "Failed to get response");
        }
      } catch (err: any) {
        console.error("Chatbot error:", err);

        // Add error message as bot response
        const errorMessage: ChatMessage = {
          role: "assistant",
          content: "দুঃখিত, কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
          timestamp: new Date(),
        };

        setSession((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMessage],
        }));

        setError(err.message || "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading],
  );

  const clearMessages = useCallback(() => {
    const newSession: ChatSession = {
      sessionId: generateSessionId(),
      messages: [],
    };
    setSession(newSession);
    setError(null);
  }, []);

  return {
    messages: session.messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    sessionId: session.sessionId,
  };
};

export default useChatbot;
