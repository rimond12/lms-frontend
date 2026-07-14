"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/lib/AxiosInstance/client";
import { toast } from "react-hot-toast";
import { Loader2, Send, CheckCircle, ArrowLeft, RefreshCw, MessageSquare } from "lucide-react";

interface Message {
  sender: "user" | "bot" | "agent";
  text: string;
  createdAt: string;
}

interface ChatSession {
  _id: string;
  sessionId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  status: "bot" | "waiting_for_agent" | "with_agent" | "closed";
  language: "en" | "bn";
  messages: Message[];
  unreadByAdmin: number;
  updatedAt: string;
}

export default function LiveConversations() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const listIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async (showLoading = false) => {
    if (showLoading) setIsLoadingList(true);
    try {
      const res = await axiosInstance.get(`/immigrant-ai/admin/sessions?status=${filterStatus === "all" ? "" : filterStatus}`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load sessions:", err);
    } finally {
      if (showLoading) setIsLoadingList(false);
    }
  };

  const fetchSessionDetails = useCallback(async (id: string, showLoading = false) => {
    if (showLoading) setIsLoadingSession(true);
    try {
      const res = await axiosInstance.get(`/immigrant-ai/admin/sessions/${id}`);
      if (res.data.success) {
        setSelectedSession(res.data.data);
        // Clean unread count locally in list
        setSessions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, unreadByAdmin: 0 } : s))
        );
      }
    } catch (err: any) {
      toast.error("Failed to load conversation details");
    } finally {
      if (showLoading) setIsLoadingSession(false);
    }
  }, []);

  // Poll active session details
  useEffect(() => {
    if (!selectedSession) return;

    const interval = setInterval(() => {
      fetchSessionDetails(selectedSession._id, false);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedSession?._id, fetchSessionDetails]);

  // Poll list
  useEffect(() => {
    fetchSessions(true);
    listIntervalRef.current = setInterval(() => {
      fetchSessions(false);
    }, 8000);

    return () => {
      if (listIntervalRef.current) clearInterval(listIntervalRef.current);
    };
  }, [filterStatus]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages?.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSession) return;

    const textToSend = replyText.trim();
    setReplyText("");

    try {
      const res = await axiosInstance.post(
        `/immigrant-ai/admin/sessions/${selectedSession._id}/reply`,
        { text: textToSend }
      );
      if (res.data.success) {
        setSelectedSession(res.data.data);
        fetchSessions(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;
    try {
      const res = await axiosInstance.post(`/immigrant-ai/admin/sessions/${selectedSession._id}/close`);
      if (res.data.success) {
        toast.success("Conversation marked as closed");
        setSelectedSession(res.data.data);
        fetchSessions(false);
      }
    } catch (err: any) {
      toast.error("Failed to close session");
    }
  };

  const handleReopenSession = async () => {
    if (!selectedSession) return;
    try {
      const res = await axiosInstance.post(`/immigrant-ai/admin/sessions/${selectedSession._id}/reopen`);
      if (res.data.success) {
        toast.success("Conversation reopened");
        setSelectedSession(res.data.data);
        fetchSessions(false);
      }
    } catch (err: any) {
      toast.error("Failed to reopen session");
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-80px)] flex flex-col max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Agent Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time visitor chats, support requests & escalation inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="active">Active Conversations</option>
            <option value="waiting_for_agent">Waiting for Agent</option>
            <option value="with_agent">With Agent</option>
            <option value="closed">Closed Conversations</option>
            <option value="bot">Bot Only</option>
            <option value="all">All Conversations</option>
          </select>
          <button
            onClick={() => fetchSessions(true)}
            className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Side: Session List */}
        <div className="w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Active Conversations</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {sessions.length} chats
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingList ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-700" size={24} />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm">
                <MessageSquare className="mx-auto mb-2 opacity-50" size={32} />
                No conversations found
              </div>
            ) : (
              sessions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => fetchSessionDetails(s._id, true)}
                  className={`w-full p-4 text-left flex flex-col gap-1 transition-colors hover:bg-slate-50/50 ${
                    selectedSession?._id === s._id ? "bg-blue-50/40 border-r-4 border-blue-700" : ""
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-semibold text-slate-800 text-sm truncate max-w-[70%]">
                      {s.userName || "Guest Visitor"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(s.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-full">
                    {s.messages[s.messages.length - 1]?.text || "No messages yet"}
                  </div>
                  <div className="flex justify-between items-center mt-2 w-full">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        s.status === "waiting_for_agent"
                          ? "bg-amber-100 text-amber-800"
                          : s.status === "with_agent"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {s.status.replace(/_/g, " ")}
                    </span>
                    {s.unreadByAdmin > 0 && (
                      <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {s.unreadByAdmin} new
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Chat Panel */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {selectedSession.userName || "Guest Visitor"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedSession.userEmail} • {selectedSession.userPhone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status !== "closed" ? (
                    <button
                      onClick={handleCloseSession}
                      className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <CheckCircle size={14} /> Close Session
                    </button>
                  ) : (
                    <button
                      onClick={handleReopenSession}
                      className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reopen Session
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 flex flex-col gap-4">
                {isLoadingSession ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-blue-700" size={24} />
                  </div>
                ) : (
                  selectedSession.messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col max-w-[70%] ${
                        m.sender === "user" ? "self-start" : "self-end items-end"
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold mb-1">
                        {m.sender === "user" ? "Visitor" : m.sender === "agent" ? "You (Agent)" : "Bot"}
                      </span>
                      <div
                        className={`p-3 rounded-lg text-sm shadow-sm ${
                          m.sender === "user"
                            ? "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                            : m.sender === "agent"
                            ? "bg-blue-700 text-white rounded-br-none"
                            : "bg-slate-200 text-slate-700 rounded-br-none"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Form */}
              {selectedSession.status !== "closed" && (
                <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type reply and press Enter..."
                    className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="bg-blue-700 hover:bg-blue-800 text-white p-2.5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-slate-400 text-sm">
              <MessageSquare size={48} className="opacity-30 mb-2" />
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
