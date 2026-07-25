"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import "./ImmigrantAiWidget.css";

// Scoped translation strings
const TRANSLATIONS = {
  en: {
    headerTitle: "Immigrant AI",
    headerSubtitle: "How can we help you today?",
    online: "Online",
    placeholder: "Type a message...",
    welcomeTitle: "Welcome! 👋",
    welcomeText: "I am Immigrant AI. Let me help you find jobs, training, or connect with our advisors. Choose an option below or type your question.",
    nextBtn: "Next →",
    prevBtn: "← Prev",
    viewJob: "View Job",
    viewCourse: "View Course",
    viewAllCourses: "View All Courses",
    consultantTitle: "Ask for a Consultant",
    ccTitle: "Talk to a Human",
    formName: "Full Name",
    formEmail: "Email Address",
    formPhone: "Phone Number",
    formInterest: "Which service are you interested in?",
    formCountry: "Preferred Country",
    formCourse: "Preferred Course",
    formSubmit: "Submit Request",
    formSubmitting: "Submitting...",
    formSuccess: "Thank you! Your request has been submitted successfully.",
    ccWaiting: "Connecting to a representative. Please wait...",
    ccSuccess: "An agent will be with you shortly.",
    errorState: "Immigrant AI is temporarily unavailable.",
    agentTag: "Agent",
    statusClosed: "This session has been closed by the agent. You can start a new message to reopen.",
  },
  bn: {
    headerTitle: "ইমিগ্র্যান্ট এআই",
    headerSubtitle: "আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
    online: "অনলাইন",
    placeholder: "বার্তা লিখুন...",
    welcomeTitle: "স্বাগতম! 👋",
    welcomeText: "আমি ইমিগ্র্যান্ট এআই। আমি আপনাকে চাকরি ও প্রশিক্ষণ খুঁজতে এবং আমাদের পরামর্শদাতাদের সাথে যোগাযোগ করতে সাহায্য করতে পারি। নিচে একটি অপশন বেছে নিন অথবা আপনার প্রশ্ন লিখুন।",
    nextBtn: "পরবর্তী →",
    prevBtn: "← পূর্ববর্তী",
    viewJob: "চাকরি দেখুন",
    viewCourse: "কোর্স দেখুন",
    viewAllCourses: "সব কোর্স দেখুন",
    consultantTitle: "পরামর্শকের সাথে কথা বলুন",
    ccTitle: "সরাসরি কথা বলুন",
    formName: "পূর্ণ নাম",
    formEmail: "ইমেইল ঠিকানা",
    formPhone: "ফোন নম্বর",
    formInterest: "কোন সেবায় আপনি আগ্রহী?",
    formCountry: "পছন্দের দেশ",
    formCourse: "পছন্দের কোর্স",
    formSubmit: "অনুরোধ জমা দিন",
    formSubmitting: "জমা হচ্ছে...",
    formSuccess: "ধন্যবাদ! আপনার অনুরোধটি সফলভাবে জমা দেওয়া হয়েছে।",
    ccWaiting: "প্রতিনিধির সাথে সংযুক্ত করা হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...",
    ccSuccess: "একজন প্রতিনিধি শীঘ্রই আপনার সাথে সংযুক্ত হবেন।",
    errorState: "ইমিগ্র্যান্ট এআই সাময়িকভাবে বন্ধ আছে।",
    agentTag: "প্রতিনিধি",
    statusClosed: "এই চ্যাটটি বন্ধ করা হয়েছে। নতুন বার্তা পাঠিয়ে পুনরায় সেশন শুরু করতে পারেন।",
  }
};

interface Message {
  sender: "user" | "bot" | "agent";
  text: string;
  createdAt?: string | Date;
}

interface MenuItem {
  _id: string;
  label: string;
  labelBn: string;
  icon: string;
  actionType: string;
  actionValue: string;
}

interface CountryItem {
  _id: string;
  name: string;
  nameBn: string;
  flagIcon: string;
}

interface CourseItem {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  duration?: string;
  description?: string;
  shortDescription?: string;
}

interface JobItem {
  _id: string;
  title: string;
  slug: string;
  companyName?: string;
  location?: string;
}

export const ImmigrantAiWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [isHidingTooltip, setIsHidingTooltip] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("bot");
  const [isApiError, setIsApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-close welcome tooltip after 5 seconds with smooth exit animation
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsHidingTooltip(true);
    }, 4500);

    const closeTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  // Widget view states
  const [activeView, setActiveView] = useState<"chat" | "countries" | "jobs" | "courses" | "consultant_form" | "cc_form">("chat");

  // Dynamic lists
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [countryPage, setCountryPage] = useState(0);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interestService: "",
    interestCountry: "",
    interestCourse: "",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = TRANSLATIONS[lang];
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";

  // Init local session and load menu
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect language from HTML lang attribute or pathname
    const htmlLang = document.documentElement.lang;
    if (htmlLang === "bn" || window.location.pathname.startsWith("/bn")) {
      setLang("bn");
    }

    const storedSessionId = localStorage.getItem("immigrant_ai_session_id");

    const initSession = async () => {
      try {
        const res = await fetch(`${baseUrl}/immigrant-ai/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: storedSessionId, language: htmlLang === "bn" ? "bn" : "en" }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setSessionId(data.data.sessionId);
          setSessionStatus(data.data.status);
          localStorage.setItem("immigrant_ai_session_id", data.data.sessionId);
          if (data.data.messages && data.data.messages.length > 0) {
            setMessages(data.data.messages);
            setIsFirstLoad(false);
          }
        }
      } catch (err) {
        console.error("Failed to init Immigrant AI session:", err);
        setIsApiError(true);
      }
    };

    const fetchMenu = async () => {
      try {
        const res = await fetch(`${baseUrl}/immigrant-ai/menu`);
        const data = await res.json();
        if (data.success && data.data) {
          setMenu(data.data);
        }
      } catch (err) {
        console.error("Failed to load Immigrant AI menu:", err);
      }
    };

    initSession();
    fetchMenu();
  }, [baseUrl]);

  // Reset chat session
  const handleReset = async () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("immigrant_ai_session_id");
    setMessages([]);
    setSessionStatus("bot");
    setActiveView("chat");
    setIsLoading(true);
    try {
      const htmlLang = document.documentElement.lang;
      const res = await fetch(`${baseUrl}/immigrant-ai/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: null, language: htmlLang === "bn" ? "bn" : "en" }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSessionId(data.data.sessionId);
        setSessionStatus(data.data.status);
        localStorage.setItem("immigrant_ai_session_id", data.data.sessionId);
      }
    } catch (err) {
      console.error("Failed to reset session:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setIsFirstLoad(false);
    }
  }, [messages, isOpen, scrollToBottom]);

  // Polling for Agent Takeover responses
  useEffect(() => {
    if (!sessionId) return;

    const poll = async () => {
      try {
        const res = await fetch(`${baseUrl}/immigrant-ai/session/${sessionId}/poll`);
        const data = await res.json();
        if (data.success && data.data) {
          setSessionStatus(data.data.status);
          if (data.data.messages && data.data.messages.length !== messages.length) {
            // Check if last message was from agent/bot and we are closed/hidden
            const lastMsg = data.data.messages[data.data.messages.length - 1];
            if (lastMsg && lastMsg.sender !== "user" && !isOpen) {
              setHasUnread(true);
            }
            setMessages(data.data.messages);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Poll every 4 seconds if waiting or active with agent
    if (sessionStatus === "waiting_for_agent" || sessionStatus === "with_agent") {
      pollIntervalRef.current = setInterval(poll, 4000);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [sessionId, sessionStatus, messages.length, isOpen, baseUrl]);

  // Form option pre-population
  const loadFormOptions = async () => {
    try {
      const cRes = await fetch(`${baseUrl}/countries`);
      const cData = await cRes.json();
      if (cData.success && cData.data) {
        setCountries(cData.data);
      }

      const pRes = await fetch(`${baseUrl}/programs?isPublished=true&isActive=true&limit=100`);
      const pData = await pRes.json();
      if (pData.success && pData.data) {
        // Handle array response if not nested in pagination
        const fetchedCourses = Array.isArray(pData.data) ? pData.data : pData.data.courses || [];
        setCourses(fetchedCourses);
      }
    } catch (err) {
      console.error("Failed to load selector options:", err);
    }
  };

  // Action dispatcher
  const handleAction = async (actionType: string, actionValue: string) => {
    if (actionType === "link" && actionValue) {
      window.location.href = actionValue;
      return;
    }

    if (actionType === "showAbout") {
      // Add message bubble mimicking option click
      const msgText = lang === "bn" ? "আমাদের সম্পর্কে" : "About Us";
      setMessages((prev) => [...prev, { sender: "user", text: msgText }]);

      setIsLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: lang === "bn"
              ? "ইমিগ্র্যান্ট জবস ওয়ার্ল্ড হচ্ছে আন্তর্জাতিক চাকরি ও প্রশিক্ষণ খোঁজার বিশ্বস্ত প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হল আপনাদের বিদেশে কাজের এবং প্রশিক্ষণের নিরাপদ সুযোগ তৈরি করে দেওয়া।"
              : "Immigrant Jobs World is your trusted platform for overseas jobs and vocational training. Our mission is to facilitate safe and prosperous migration pathways."
          }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (actionType === "showContact") {
      const msgText = lang === "bn" ? "যোগাযোগ করুন" : "Contact Details";
      setMessages((prev) => [...prev, { sender: "user", text: msgText }]);

      setIsLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: lang === "bn"
              ? "📞 ফোন: +৮৮০ ১২৩৪৫৬৭৮৯\n✉️ ইমেইল: info@immigrantjobsworld.com\n📍 অফিস: ঢাকা, বাংলাদেশ।"
              : "📞 Phone: +880 123456789\n✉️ Email: info@immigrantjobsworld.com\n📍 Address: Dhaka, Bangladesh."
          }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    if (actionType === "showCountries") {
      setActiveView("countries");
      setCountryPage(0);
      try {
        const res = await fetch(`${baseUrl}/countries`);
        const data = await res.json();
        if (data.success && data.data) {
          setCountries(data.data);
        }
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (actionType === "showCourses") {
      setActiveView("courses");
      try {
        const res = await fetch(`${baseUrl}/programs?isPublished=true&isActive=true&limit=6`);
        const data = await res.json();
        if (data.success && data.data) {
          const fetchedCourses = Array.isArray(data.data) ? data.data : data.data.courses || [];
          setCourses(fetchedCourses);
        }
      } catch (err) {
        console.error(err);
      }
      return;
    }

    if (actionType === "consultantForm") {
      setActiveView("consultant_form");
      await loadFormOptions();
      return;
    }

    if (actionType === "customerCare") {
      setActiveView("cc_form");
      return;
    }

    if (actionType === "triggerRule" && actionValue) {
      setInputText(actionValue);
      // Programmatically trigger sending message
      await sendBotRequest(actionValue);
    }
  };

  // Submit search query or free text
  const sendBotRequest = async (text: string) => {
    if (!text.trim() || !sessionId) return;
    setInputText("");

    const newMsg: Message = { sender: "user", text: text.trim() };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      let res = await fetch(`${baseUrl}/immigrant-ai/session/${sessionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), language: lang }),
      });

      // Self-healing: if session is lost/not found (404), reset session and retry
      if (res.status === 404) {
        localStorage.removeItem("immigrant_ai_session_id");
        const initRes = await fetch(`${baseUrl}/immigrant-ai/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: null, language: lang }),
        });
        const initData = await initRes.json();
        if (initData.success && initData.data) {
          const newSessionId = initData.data.sessionId;
          setSessionId(newSessionId);
          localStorage.setItem("immigrant_ai_session_id", newSessionId);
          // Retry sending message
          res = await fetch(`${baseUrl}/immigrant-ai/session/${newSessionId}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text.trim(), language: lang }),
          });
        }
      }

      const data = await res.json();
      if (data.success && data.data) {
        setMessages(data.data.messages);
        setSessionStatus(data.data.status);

        // Handle auto action triggers from matched rule
        if (data.actionType && data.actionType !== "none") {
          handleAction(data.actionType, data.actionValue);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit consultant lead
  const handleConsultantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/immigrant-ai/session/${sessionId}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: t.formSuccess }
        ]);
        setActiveView("chat");
        setFormData({
          name: "",
          email: "",
          phone: "",
          interestService: "",
          interestCountry: "",
          interestCourse: "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Escalate to human agent
  const handleCcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/immigrant-ai/session/${sessionId}/request-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionStatus("waiting_for_agent");
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: t.ccWaiting }
        ]);
        setActiveView("chat");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Query jobs of selected country
  const handleCountryClick = async (countryName: string) => {
    setSelectedCountry(countryName);
    setActiveView("jobs");
    setIsLoading(true);
    try {
      const res = await fetch(`${baseUrl}/jobs?country=${encodeURIComponent(countryName)}&status=published`);
      const data = await res.json();
      if (data.success && data.data) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Country Paginated Grid
  const renderCountries = () => {
    const itemsPerPage = 6;
    const paginated = countries.slice(countryPage * itemsPerPage, (countryPage + 1) * itemsPerPage);

    return (
      <div className="iai-countries-wrap animate-fade-in">
        <div className="iai-countries-title">{lang === "bn" ? "দেশ নির্বাচন করুন" : "Select Country"}</div>
        <div className="iai-countries-grid">
          {paginated.map((c) => (
            <button key={c._id} onClick={() => handleCountryClick(c.name)} className="iai-country-card">
              <img src={c.flagIcon || "https://flagcdn.com/w80/un.png"} alt={c.name} />
              <span>{lang === "bn" ? c.nameBn : c.name}</span>
            </button>
          ))}
        </div>
        <div className="iai-pagination-row">
          <button
            onClick={() => setCountryPage((p) => Math.max(0, p - 1))}
            disabled={countryPage === 0}
            className="iai-page-btn"
          >
            {t.prevBtn}
          </button>
          <span className="iai-page-info">
            {countryPage + 1} / {Math.ceil(countries.length / itemsPerPage) || 1}
          </span>
          <button
            onClick={() => setCountryPage((p) => p + 1)}
            disabled={(countryPage + 1) * itemsPerPage >= countries.length}
            className="iai-page-btn"
          >
            {t.nextBtn}
          </button>
        </div>
      </div>
    );
  };

  if (isApiError) {
    return null; // Silent failure as per safety guidelines
  }

  return (
    <div className="iai-widget-root">
      {/* Welcome Tooltip Badge on Page Load (Fancy, Fresh & Compact) */}
      {showTooltip && !isOpen && (
        <div className={`iai-welcome-tooltip ${isHidingTooltip ? "hiding" : ""}`}>
          <div className="iai-tooltip-content">
            <span className="iai-tooltip-dot" />
            <span className="iai-tooltip-text">
              {lang === "bn" ? "ইমিগ্র্যান্ট এআই" : "Immigrant AI"}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="iai-tooltip-close"
            title="Dismiss"
            aria-label="Close tooltip"
          >
            ✕
          </button>
          <div className="iai-tooltip-arrow" />
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="iai-toggle-btn"
        aria-label="Immigrant AI Assistant"
        title="Immigrant AI"
      >
        {isOpen ? (
          <span className="iai-close-icon">✕</span>
        ) : (
          <div className="iai-btn-image-wrapper">
            <Image
              src="/images/imigrant-1.png"
              alt="Immigrant AI"
              width={46}
              height={46}
              className="iai-btn-img"
              priority
            />
            <div className="iai-ai-badge" title="AI Assistant">
              <svg viewBox="0 0 24 24" fill="currentColor" className="iai-sparkle-svg">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
              </svg>
            </div>
          </div>
        )}
        {isFirstLoad && !isOpen && <span className="iai-pulse-ring"></span>}
        {hasUnread && !isOpen && <span className="iai-notif-dot"></span>}
      </button>

      {/* Main Chat Panel */}
      <div className={`iai-panel ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="iai-header">
          <div className="iai-header-avatar" style={{ background: "white", padding: "4px" }}>
            <Image
              width={24}
              height={24}
              alt="Immigrant AI"
              src="/images/imigrant-2.png"
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="iai-header-info">
            <h3>{t.headerTitle}</h3>
            <p>
              <span className="iai-online-dot"></span>
              {t.online}
            </p>
          </div>
          <div className="iai-header-actions">
            <button onClick={handleReset} className="iai-lang-btn" title="Reset Chat" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              🔄 {lang === "en" ? "Reset" : "রিসেট"}
            </button>
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="iai-lang-btn"
            >
              {lang === "en" ? "বাংলা" : "English"}
            </button>
            <button onClick={() => setIsOpen(false)} className="iai-icon-btn">
              ✕
            </button>
          </div>
        </div>

        {/* Messaging & Cards view */}
        <div className="iai-messages">
          {activeView === "chat" && messages.length === 0 && (
            <div className="iai-welcome">
              <div className="iai-welcome-icon" style={{ background: "white", padding: "8px" }}>
                <Image
                  width={48}
                  height={48}
                  alt="Immigrant AI"
                  src="/images/imigrant-2.png"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h4>{t.welcomeTitle}</h4>
              <p>{t.welcomeText}</p>
              <div className="iai-menu-grid">
                {menu.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => {
                      const text = lang === "bn" ? item.labelBn : item.label;
                      sendBotRequest(text);
                    }}
                    className="iai-menu-chip"
                  >
                    <span>{item.icon}</span>
                    <span>{lang === "bn" ? item.labelBn : item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {activeView === "chat" && messages.map((msg, index) => (
            <div key={index} className={`iai-msg ${msg.sender === "user" ? "user" : msg.sender === "agent" ? "agent" : "bot"}`}>
              {msg.sender !== "user" && (
                <div className={`iai-msg-avatar ${msg.sender === "agent" ? "agent-av" : ""}`}>
                  {msg.sender === "agent" ? "👤" : "🤖"}
                </div>
              )}
              <div className="iai-msg-body">
                {msg.sender === "agent" && <span className="iai-agent-tag">{t.agentTag}</span>}
                <div className="iai-bubble">{msg.text}</div>
                {msg.createdAt && (
                  <span className="iai-msg-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Sub View: Country Selector */}
          {activeView === "countries" && renderCountries()}

          {/* Sub View: Job List */}
          {activeView === "jobs" && (
            <div className="animate-fade-in">
              <div className="iai-countries-title" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{selectedCountry} Jobs</span>
                <button onClick={() => setActiveView("countries")} className="iai-page-btn" style={{ padding: "2px 6px" }}>
                  Back
                </button>
              </div>
              {jobs.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#6b7280", textAlign: "center", margin: "20px 0" }}>
                  No published jobs found in this country.
                </p>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="iai-job-card">
                    <div className="iai-job-info">
                      <h5 className="iai-job-title">{lang === "bn" ? job.title : job.title}</h5>
                      <p className="iai-job-meta">
                        {job.companyName} • {job.location}
                      </p>
                    </div>
                    <a href={`/jobs/${job.slug}`} className="iai-view-btn">
                      {t.viewJob}
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sub View: Course List */}
          {activeView === "courses" && (
            <div className="animate-fade-in">
              <div className="iai-countries-title" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Available Training</span>
                <button onClick={() => setActiveView("chat")} className="iai-page-btn" style={{ padding: "2px 6px" }}>
                  Home
                </button>
              </div>
              {courses.map((course) => (
                <div key={course._id} className="iai-course-card">
                  <div className="iai-course-info">
                    <h5 className="iai-course-title">{course.title}</h5>
                    <p className="iai-course-meta">
                      {course.duration || "Self-paced"} • {course.price ? `${course.price} BDT` : "Free"}
                    </p>
                  </div>
                  <a href={`/courses/${course.slug}`} className="iai-view-btn">
                    {t.viewCourse}
                  </a>
                </div>
              ))}
              <div className="iai-courses-footer">
                <a href="/courses" className="iai-all-btn">
                  {t.viewAllCourses}
                </a>
              </div>
            </div>
          )}

          {/* Sub View: Consultant Form */}
          {activeView === "consultant_form" && (
            <div className="iai-form-card animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{t.consultantTitle}</h4>
                <button onClick={() => setActiveView("chat")} className="iai-page-btn" style={{ padding: "2px 6px" }}>
                  Cancel
                </button>
              </div>
              <form onSubmit={handleConsultantSubmit}>
                <div className="iai-field">
                  <label className="iai-label">{t.formName} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formEmail} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formPhone} *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formInterest}</label>
                  <select
                    value={formData.interestService}
                    onChange={(e) => setFormData({ ...formData, interestService: e.target.value })}
                    className="iai-select"
                  >
                    <option value="">Select option</option>
                    <option value="Jobs Search">Jobs Search</option>
                    <option value="Courses / Training">Courses / Training</option>
                    <option value="Visa / Immigration">Visa / Immigration</option>
                  </select>
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formCountry}</label>
                  <select
                    value={formData.interestCountry}
                    onChange={(e) => setFormData({ ...formData, interestCountry: e.target.value })}
                    className="iai-select"
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formCourse}</label>
                  <select
                    value={formData.interestCourse}
                    onChange={(e) => setFormData({ ...formData, interestCourse: e.target.value })}
                    className="iai-select"
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course.title}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={isLoading} className="iai-submit-btn">
                  {isLoading ? t.formSubmitting : t.formSubmit}
                </button>
              </form>
            </div>
          )}

          {/* Sub View: Customer Care Form */}
          {activeView === "cc_form" && (
            <div className="iai-form-card animate-fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4>{t.ccTitle}</h4>
                <button onClick={() => setActiveView("chat")} className="iai-page-btn" style={{ padding: "2px 6px" }}>
                  Cancel
                </button>
              </div>
              <form onSubmit={handleCcSubmit}>
                <div className="iai-field">
                  <label className="iai-label">{t.formName} *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formEmail} *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <div className="iai-field">
                  <label className="iai-label">{t.formPhone} *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="iai-input"
                  />
                </div>
                <button type="submit" disabled={isLoading} className="iai-submit-btn">
                  {isLoading ? t.formSubmitting : t.formSubmit}
                </button>
              </form>
            </div>
          )}

          {/* Waiting banner */}
          {sessionStatus === "waiting_for_agent" && activeView === "chat" && (
            <div className="iai-status-banner">
              <span>⏳</span>
              <span>{t.ccWaiting}</span>
            </div>
          )}

          {/* With agent banner */}
          {sessionStatus === "with_agent" && activeView === "chat" && (
            <div className="iai-status-banner" style={{ background: "#dcfce7", borderColor: "#86efac", color: "#166534" }}>
              <span>💬</span>
              <span>Connected with Live Agent</span>
            </div>
          )}

          {/* Closed session banner */}
          {sessionStatus === "closed" && activeView === "chat" && (
            <div className="iai-status-banner" style={{ background: "#f3f4f6", borderColor: "#d1d5db", color: "#4b5563" }}>
              <span>🔒</span>
              <span>{t.statusClosed}</span>
            </div>
          )}

          {isLoading && activeView === "chat" && (
            <div className="iai-msg bot">
              <div className="iai-msg-avatar">🤖</div>
              <div className="iai-typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="iai-input-row">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBotRequest(inputText);
              }
            }}
            placeholder={t.placeholder}
            className="iai-text-input"
            rows={1}
            disabled={activeView !== "chat"}
          />
          <button
            onClick={() => sendBotRequest(inputText)}
            disabled={!inputText.trim() || activeView !== "chat"}
            className="iai-send-btn"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};
export default ImmigrantAiWidget;
