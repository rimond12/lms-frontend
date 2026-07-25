"use client";

import React, { useState, ReactNode, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppImage from "@/components/ui/AppImage";
import { logout } from "@/app/[locale]/@auth/AuthService";
import {
  Home,
  BookOpen,
  ClipboardCheck,
  Award,
  Settings,
  X,
  ChevronLeft,
  User,
  FileText,
  UserCheck,
  LogOut,
  Menu,
  Bell,
  CreditCard,
  GraduationCap,
  Layers,
  ChevronRightSquare,
  Sparkles,
  Briefcase,
  Bookmark,
  ClipboardList,
  Star,
  Calendar,
  AlertCircle,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { changelogData } from "@/data/changelog";
import { ChangelogModal } from "@/components/shared/ChangelogModal";

// Define sidebar items with organized sections
const sidebarSections = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/user-profile", icon: Home },
      { name: "My Information", href: "/user-profile/cv", icon: User },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        name: "My Courses",
        href: "/user-profile/my-courses-and-programs",
        icon: BookOpen,
      },
      {
        name: "Batch Enrollments",
        href: "/user-profile/my-batch-enrollments",
        icon: Layers,
      },
      {
        name: "My Quizzes",
        href: "/user-profile/my-quizzes",
        icon: ClipboardCheck,
      },
      {
        name: "My Assignments",
        href: "/user-profile/my-assignments",
        icon: FileText,
      },

      { name: "Certificates", href: "/user-profile/certificates", icon: Award },
    ],
  },
  {
    title: "Jobs Portal",
    items: [
      {
        name: "Job Seeker Dashboard",
        href: "/user-profile/job-seeker",
        icon: Briefcase,
      },
      {
        name: "My Applications",
        href: "/user-profile/my-applications",
        icon: ClipboardList,
      },
      { name: "Saved Jobs", href: "/user-profile/saved-jobs", icon: Bookmark },
    ],
  },
  {
    title: "Account",
    items: [
      { name: "My Notices", href: "/user-profile/my-notice", icon: Bell },
      { name: "Change Password", href: "/user-profile/change-password", icon: Settings },
    ],
  },
];

// Flatten for mobile and title lookup
const allItems = sidebarSections.flatMap((section) => section.items);

// ─── Notification Dropdown ────────────────────────────────────────
type JobNotifType =
  | "shortlisted"
  | "interview"
  | "rejected"
  | "new_job"
  | "reminder";
interface JobNotification {
  _id: string;
  type: JobNotifType;
  title: string;
  message: string;
  logo?: string;
  logoColor?: string;
  time: string;
  read: boolean;
}
const NOTIF_CONFIG: Record<
  JobNotifType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  shortlisted: { icon: Star, color: "text-green-600", bg: "bg-green-50" },
  interview: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  rejected: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
  new_job: { icon: Briefcase, color: "text-purple-600", bg: "bg-purple-50" },
  reminder: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
};
const INIT_NOTIFS: JobNotification[] = [
  {
    _id: "1",
    type: "shortlisted",
    title: "You've been shortlisted!",
    message: "Creative Studio shortlisted your UX/UI Designer application.",
    logo: "CS",
    logoColor: "bg-purple-600",
    time: "2h ago",
    read: false,
  },
  {
    _id: "2",
    type: "interview",
    title: "Interview Scheduled",
    message: "Startup Hub scheduled an interview for Product Manager.",
    logo: "SH",
    logoColor: "bg-green-600",
    time: "5h ago",
    read: false,
  },
  {
    _id: "3",
    type: "new_job",
    title: "New job matching your profile",
    message: "Full Stack Developer at Innovate GmbH matches your skills.",
    logo: "IG",
    logoColor: "bg-blue-700",
    time: "1d ago",
    read: false,
  },
  {
    _id: "4",
    type: "reminder",
    title: "Application deadline tomorrow",
    message: "Cloud Architect at SkyTech AG closes tomorrow!",
    logo: "ST",
    logoColor: "bg-sky-600",
    time: "1d ago",
    read: true,
  },
  {
    _id: "5",
    type: "rejected",
    title: "Application Update",
    message: "DataFlow AG reviewed your Backend Engineer application.",
    logo: "DF",
    logoColor: "bg-orange-500",
    time: "3d ago",
    read: true,
  },
];

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<JobNotification[]>(INIT_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () =>
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifs((p) => p.map((n) => (n._id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-full hover:bg-gray-100 transition-colors group"
      >
        <Bell
          size={18}
          className="text-gray-500 group-hover:text-gray-700 transition-colors"
        />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  Notifications
                </span>
                {unread > 0 && (
                  <span className="bg-blue-700 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                    {unread}
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifs.map((n) => {
                const cfg = NOTIF_CONFIG[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!n.read ? "bg-blue-50/40" : ""}`}
                  >
                    {n.logo ? (
                      <div
                        className={`w-8 h-8 rounded-lg ${n.logoColor} flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0`}
                      >
                        {n.logo}
                      </div>
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon size={14} className={cfg.color} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className={`text-xs font-semibold leading-snug ${!n.read ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-700 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50">
              <Link
                href="/user-profile/notifications"
                onClick={() => setOpen(false)}
              >
                <button className="w-full text-xs font-semibold text-blue-700 hover:underline text-center">
                  View all notifications →
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sidebar Component (Compact Tech Theme) ---
const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  const isActive = (href: string) => {
    if (href === "/user-profile") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // Auto-collapse logic
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 20000); // 20 seconds delay
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex flex-col h-screen bg-white border-r border-slate-200 shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-20 relative overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Subtle Tech Grid - Very Faint */}
      <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] bg-size-[16px_16px] opacity-70 pointer-events-none" />

      {/* Header */}
      <div className="relative h-16 px-4 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-sm z-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={`flex items-center gap-2.5 flex-1 min-w-0 mr-2 ${
            isExpanded ? "block" : "hidden"
          }`}
        >
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center border border-slate-800 shadow-sm relative overflow-hidden group flex-shrink-0">
            <div className="absolute inset-0 bg-red-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <GraduationCap className="w-4 h-4 text-white relative z-10" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-[14px] text-blue-600 tracking-tight leading-tight whitespace-normal break-words">
              IMMIGRANT JOBS WORLD
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider truncate">
                Learning Portal
              </p>
            </div>
          </div>
        </motion.div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <ChevronRightSquare
            size={20}
            className={`transition-transform   duration-300 ${
              isExpanded ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-5 overflow-y-auto no-scrollbar relative z-10">
        {sidebarSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
            {isExpanded && (
              <div className="px-3 mb-2 flex items-center gap-2">
                <span className="w-0.5 h-2.5 bg-red-500/30 rounded-full"></span>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono"
                >
                  {section.title}
                </motion.h3>
              </div>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.name}
                  icon={<item.icon size={18} />}
                  text={item.name}
                  href={item.href}
                  active={isActive(item.href)}
                  isExpanded={isExpanded}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile Section (Compact) */}
      <div
        className={`border-t border-slate-100 p-3 mx-2 mb-2 relative z-10 ${
          isExpanded ? "" : "flex justify-center"
        }`}
      >
        <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold font-mono text-xs border border-slate-200">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.1 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-xs text-slate-800 truncate group-hover:text-red-600 transition-colors">
                    {user?.name || "User"}
                  </p>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-[9px] font-mono text-slate-400 truncate">
                    {user?.email?.slice(0, 18) || "STD"}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-red-600 transition-colors p-0.5 rounded-sm hover:bg-slate-100"
                    title="Logout"
                  >
                    <LogOut size={11} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};

// --- Compact Tech Sidebar Item ---
const SidebarItem = ({
  icon,
  text,
  href,
  active,
  isExpanded,
  onClick,
}: {
  icon: ReactNode;
  text: string;
  href: string;
  active?: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}) => {
  return (
    <li className="relative group/item">
      <Link
        href={href}
        onClick={onClick}
        className={`
          flex items-center gap-3 py-2 px-3 mx-1 rounded-[4px] font-medium text-[13px]
          transition-all duration-150 relative overflow-hidden group/link
          ${
            active
              ? "bg-slate-50 text-slate-900"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        {/* Active Border Indicator (Left) */}
        {active && (
          <motion.div
            layoutId="activeBorder"
            className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 rounded-r-sm"
          />
        )}

        <span
          className={`flex-shrink-0 transition-colors duration-200 ${
            active
              ? "text-red-600"
              : "text-slate-400 group-hover/link:text-slate-600"
          }`}
        >
          {icon}
        </span>

        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden whitespace-nowrap tracking-normal"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle Tech Dot for Active */}
        {active && isExpanded && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-red-500 opacity-60" />
        )}

        {/* Collapsed Tooltip */}
        {!isExpanded && (
          <div
            className={`
              absolute left-full top-1/2 -translate-y-1/2 rounded-sm px-2.5 py-1 ml-3
              bg-slate-800 text-white text-[10px] font-medium tracking-wide
              invisible opacity-0 translate-x-2 transition-all duration-150
              group-hover/item:visible group-hover/item:opacity-100 group-hover/item:translate-x-0
              z-50 whitespace-nowrap shadow-lg border-l-2 border-red-500
              after:content-[''] after:absolute after:right-full after:top-1/2
              after:-translate-y-1/2 after:border-4 after:border-transparent
              after:border-r-slate-800
            `}
          >
            {text}
          </div>
        )}
      </Link>
    </li>
  );
};

// --- Mobile Sidebar (Compact Tech Theme) ---
const MobileSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const { user } = useUser();

  const isActive = (href: string) => {
    if (href === "/user-profile") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-40 md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Tech Grid Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#f1f5f9_1px,transparent_1px)] bg-size-[16px_16px] opacity-70 pointer-events-none" />

            {/* Mobile Header */}
            <div className="relative h-16 px-5 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center border border-slate-800 shadow-sm relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-red-600/10" />
                  <GraduationCap className="w-4 h-4 text-white relative z-10" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-[15px] text-slate-900 tracking-tight leading-none truncate">
                    IMMIGRANT JOBS<span className="text-red-600">WORLD</span>
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-wider truncate">
                      IJW Portal V2.0
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-3 py-5 overflow-y-auto relative z-10">
              {sidebarSections.map((section, idx) => (
                <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
                  <div className="px-3 mb-2 flex items-center gap-2">
                    <span className="w-0.5 h-2.5 bg-red-500/30 rounded-full"></span>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {section.title}
                    </h3>
                  </div>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <SidebarItem
                        key={item.name}
                        icon={<item.icon size={18} />}
                        text={item.name}
                        href={item.href}
                        active={isActive(item.href)}
                        isExpanded={true}
                        onClick={onClose}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Mobile User Profile */}
            <div className="border-t border-slate-100 p-4 bg-white/80 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-3 p-2.5 rounded-md border border-slate-100 bg-white shadow-sm">
                <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 text-slate-600 font-bold font-mono text-xs">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs text-slate-900 truncate">
                      {user?.name || "User"}
                    </p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[9px] font-mono text-slate-500 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Header Component ---
const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const { user, setUser } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [hasNewUpdate, setHasNewUpdate] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for updates with delay
  useEffect(() => {
    const lastViewedVersion = localStorage.getItem(
      "lastViewedChangelogVersion",
    );
    const latestVersion = changelogData[0]?.version;

    if (latestVersion && lastViewedVersion !== latestVersion) {
      // Delay showing the badge by 10 seconds
      const showTimer = setTimeout(() => {
        setHasNewUpdate(true);
        setIsAnimating(true);

        // Stop animation after another 10 seconds
        const stopAnimationTimer = setTimeout(() => {
          setIsAnimating(false);
        }, 10000);

        return () => clearTimeout(stopAnimationTimer);
      }, 10000);

      return () => clearTimeout(showTimer);
    }
  }, []);

  const handleOpenChangelog = () => {
    setIsChangelogOpen(true);
    setIsAnimating(false);

    // Hide the button after 4 minutes (240000ms)
    if (!hideTimerRef.current) {
      hideTimerRef.current = setTimeout(() => {
        setHasNewUpdate(false);
        const latestVersion = changelogData[0]?.version;
        if (latestVersion) {
          localStorage.setItem("lastViewedChangelogVersion", latestVersion);
        }
        hideTimerRef.current = null;
      }, 240000);
    }
  };

  // Get current page title
  const getPageTitle = () => {
    const item = allItems.find((item) => {
      if (item.href === "/user-profile") {
        return pathname === item.href;
      }
      return pathname.startsWith(item.href);
    });
    return item?.name || "Dashboard";
  };

  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
      <div className="h-11 px-3 lg:px-6 flex items-center justify-between gap-4">
        {/* Mobile Menu Button - Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
          >
            <Menu size={20} />
          </button>

          {/* Page Title */}
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[15px] tracking-wide text-gray-800 uppercase">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* What's New Button (Only visible if new update) */}
          <AnimatePresence>
            {hasNewUpdate && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleOpenChangelog}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-linear-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border border-red-200/50 transition-all group relative mr-2"
              >
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  {isAnimating && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  )}
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <Sparkles size={13} className="text-red-500" />
                <span className="text-[11px] font-bold bg-clip-text text-transparent bg-linear-to-r from-red-600 to-orange-600">
                  What's New
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Home Button */}
          <Link
            href="/"
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            title="Back to Home"
          >
            <Home size={18} />
          </Link>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile */}
          <div className="pl-3 border-l border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer select-none">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span
                      suppressHydrationWarning
                      className="text-xs font-bold text-gray-700 leading-none"
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                      Student
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-sm transition-transform active:scale-95">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[1px] overflow-hidden">
                      {user?.profilePhoto ? (
                        <AppImage
                          photoUrl={user.profilePhoto}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p
                      suppressHydrationWarning
                      className="text-sm font-medium leading-none"
                    >
                      {user?.name}
                    </p>
                    <p
                      suppressHydrationWarning
                      className="text-xs leading-none text-muted-foreground"
                    >
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsChangelogOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>What's New</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <ChangelogModal
        isOpen={isChangelogOpen}
        onOpenChange={setIsChangelogOpen}
      />
    </header>
  );
};

// --- Main Layout ---
export default function StudentLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      suppressHydrationWarning={true}
      className="flex h-screen bg-gray-50 text-gray-900 font-sans"
    >
      <Sidebar />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-3"
        >
          <div className="h-full">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}
