"use client";

import React, { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  Calendar,
  FileText,
  Award,
  ClipboardList,
  GraduationCap,
  Bell,
  Search,
  UserCircle2,
  Newspaper,
  UserCog,
  Image as ImageIcon,
  Shield,
  FolderOpen,
  HelpCircle,
  Home,
  ClipboardCheck,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Sparkles,
  Briefcase,
  Tag,
  PanelTop,
} from "lucide-react";
import { useUser } from "@/app/[locale]/@auth/user.provider";

// --- NAVIGATION STRUCTURE ---
const navigationSections = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Learning Management",
    items: [
      {
        name: "All Courses",
        href: "/dashboard/manage-courses",
        icon: BookOpen,
      },
      {
        name: "Category",
        href: "/dashboard/manage-categories",
        icon: BookOpen,
      },
      {
        name: "Batch Management",
        href: "/dashboard/manage-batches",
        icon: ClipboardCheck,
      },
      {
        name: "Enrollments",
        href: "/dashboard/enrollment-manage",
        icon: UserCheck,
      },
      {
        name: "Certificates",
        href: "#",
        icon: Award,
      },
      { name: "All Quizzes", href: "/dashboard/manage-quiz", icon: FileText },
      { name: "Quiz Results", href: "/dashboard/all-results", icon: Award },
      {
        name: "Assignments",
        href: "/dashboard/assignments",
        icon: ClipboardList,
      },
    ],
  },

  {
    title: "Contact Management",
    items: [
      { name: "All Users", href: "/dashboard/all-users", icon: Users },
      // { name: "Contact", href: "/dashboard/contact", icon: Users },
    ],
  },
  {
    title: "Content Management",
    items: [
      {
        name: "Blog & News",
        href: "/dashboard/create-blog-events-news",
        icon: Newspaper,
      },
      { name: "Events", href: "/dashboard/manage-events", icon: Calendar },
      {
        name: "Manage Review",
        href: "/dashboard/manage-review",
        icon: Calendar,
      },
      {
        name: "Success Stories",
        href: "/dashboard/manage-success-stories",
        icon: Award,
      },

      {
        name: "Expert Panel",
        href: "/dashboard/manage-expert-panel",
        icon: GraduationCap,
      },
      { name: "About Us", href: "/dashboard/about-us", icon: GraduationCap },
      { name: "Notices", href: "/dashboard/notice", icon: Bell },
      {
        name: "Banners",
        href: "/dashboard/banner-management",
        icon: ImageIcon,
      },
      {
        name: "Landing Page CMS",
        href: "/dashboard/landing-page-cms",
        icon: PanelTop,
      },
    ],
  },
  {
    title: "Jobs Management",
    items: [
      { name: "Manage Jobs", href: "/dashboard/manage-jobs", icon: Briefcase },
      {
        name: "Job Applications",
        href: "/dashboard/job-applications",
        icon: Users,
      },
      {
        name: "Job Categories",
        href: "/dashboard/manage-job-categories",
        icon: Tag,
      },
      { name: "Submitted Forms", href: "/dashboard/leads", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Settings", href: "/reset-password", icon: Settings },
      { name: "Analytics", href: "#", icon: BarChart3 },
      {
        name: "Activity Log",
        href: "/dashboard/manage-activity",
        icon: ClipboardList,
      },
    ],
  },
];

// --- UI COMPONENTS ---

// Sidebar Component
const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const pathname = usePathname();
  const user = useUser();

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-screen bg-slate-100 border-r border-gray-100 shadow-sm"
    >
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -20 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${
            isExpanded ? "block" : "hidden"
          }`}
        >
          <Link
            href="/"
            className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </Link>
          <div>
            <h1 className="font-bold text-base text-gray-900">LMS Admin</h1>
            <Link
              href="/"
              className="text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft
            size={18}
            className={`text-gray-500 transform transition-transform duration-300 ${
              isExpanded ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {navigationSections.map((section, idx) => {
          const isCollapsed = collapsedSections.includes(section.title);
          const hasActiveItem = section.items.some(
            (item) => pathname === item.href,
          );

          return (
            <div key={section.title} className={idx > 0 ? "mt-4" : ""}>
              {isExpanded && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-3 mb-2 flex items-center justify-between group"
                >
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      hasActiveItem ? "text-purple-600" : "text-gray-400"
                    }`}
                  >
                    {section.title}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-200 ${
                      isCollapsed ? "-rotate-90" : ""
                    }`}
                  />
                </button>
              )}
              <AnimatePresence initial={false}>
                {(!isExpanded || !isCollapsed) && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {section.items.map((item) => (
                      <SidebarItem
                        key={item.name}
                        icon={<item.icon size={18} />}
                        text={item.name}
                        href={item.href}
                        active={pathname === item.href}
                        isExpanded={isExpanded}
                      />
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* User Profile */}
      <div
        className={`border-t border-gray-100 p-4 ${
          isExpanded ? "" : "flex justify-center"
        }`}
      >
        <div
          className={`flex items-center gap-3 ${
            isExpanded
              ? "p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              : ""
          }`}
        >
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1 min-w-0"
              >
                <p className="font-semibold text-sm text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && (
            <button className="p-1.5 rounded-lg hover:bg-white transition-colors">
              <LogOut size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

const SidebarItem = ({
  icon,
  text,
  href,
  active,
  isExpanded,
}: {
  icon: ReactNode;
  text: string;
  href: string;
  active?: boolean;
  isExpanded: boolean;
}) => {
  return (
    <li className="relative">
      <Link
        href={href}
        className={`
        flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium
        transition-all duration-200 group relative
        ${
          active
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }
      `}
      >
        <span
          className={`flex-shrink-0 ${
            active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"
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
              transition={{ duration: 0.2, delay: 0.05 }}
              className="overflow-hidden whitespace-nowrap text-sm"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 rounded-r-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        {!isExpanded && (
          <div
            className={`
            absolute left-full rounded-lg px-3 py-2 ml-4
            bg-gray-900 text-white text-xs font-medium
            invisible opacity-0 translate-x-2 transition-all duration-200
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 
            z-50 whitespace-nowrap shadow-xl
            after:content-[''] after:absolute after:right-full after:top-1/2 
            after:-translate-y-1/2 after:border-4 after:border-transparent 
            after:border-r-gray-900
          `}
          >
            {text}
          </div>
        )}
      </Link>
    </li>
  );
};

// Header Component
const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = useUser();
  const pathname = usePathname();

  // Get current page title
  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (path === "dashboard") return "Dashboard";
    return (
      path
        ?.split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") || "Dashboard"
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="h-14 px-4 lg:px-6 flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={20} className="text-gray-700" />
        </button>

        {/* Breadcrumb / Page Title */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-purple-600 transition-colors"
          >
            <Home size={16} />
          </Link>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-900">
            {getPageTitle()}
          </span>
        </div>

        {/* Search Bar - Takes remaining space */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search courses, students, batches..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile Search */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Search size={18} className="text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Help */}
          <button className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <HelpCircle size={18} className="text-gray-600" />
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2"></div>

          {/* User Profile */}
          <button className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <ChevronDown size={14} className="hidden sm:block text-gray-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Mobile Sidebar
const MobileSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const pathname = usePathname();
  const user = useUser();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-80 bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Mobile Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 text-white" />
                </Link>
                <div>
                  <h1 className="font-bold text-base text-gray-900">
                    LMS Admin
                  </h1>
                  <Link
                    href="/"
                    className="text-xs text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={22} className="text-gray-700" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {navigationSections.map((section, idx) => (
                <div key={section.title} className={idx > 0 ? "mt-6" : ""}>
                  <h3 className="px-3 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`
                            flex items-center gap-3 py-2.5 px-3 rounded-xl font-medium
                            transition-all duration-200
                            ${
                              pathname === item.href
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50"
                            }
                          `}
                        >
                          <item.icon
                            size={18}
                            className={
                              pathname === item.href
                                ? "text-gray-900"
                                : "text-gray-400"
                            }
                          />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Mobile User Profile */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Administrator
                  </p>
                </div>
                <button className="p-2 rounded-lg hover:bg-white transition-colors">
                  <LogOut size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Layout Component
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto"
        >
          <div className="min-h-full">{children}</div>
        </motion.main>
      </div>
    </div>
  );
}
