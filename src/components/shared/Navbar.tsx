"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  User,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Settings,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  PlayCircle,
  FileText,
  Home,
  Layout,
  HelpCircle,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { ThemeContext } from "@/lib/ThemeProvider/ThemeProvider";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { logout } from "@/app/[locale]/@auth/AuthService";

import { Link, useRouter, usePathname } from "@/i18n/routing";
import { isAuthenticated, isAdmin } from "@/utils/auth";
import Image from "next/image";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

// Define the type for a navigation link
interface NavLink {
  name: string;
  href: string;
  dropdown?: NavLink[];
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  featured?: boolean;
}

export const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="relative">
      <Image
        width={140}
        height={40}
        alt="logo"
        src={"/images/imigrant-2.png"}
        className="relative w-auto h-20.5 object-contain"
        priority
      />
    </div>
  </div>
);

export const LogoCompact = () => (
  <div className="flex items-center gap-2">
    <div className="relative">
      <Image
        width={100}
        height={32}
        alt="logo"
        src={"/images/imigrant-2.png"}
        className="relative w-auto h-8 object-contain"
        priority
      />
    </div>
  </div>
);

export const CompanyLogo = Logo;

// Navigation Link Item Component (desktop)
const NavItem: React.FC<{ link: NavLink; isActive: boolean }> = ({
  link,
  isActive,
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (link.dropdown) {
      e.preventDefault();
      setDropdownOpen(!isDropdownOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <li className="relative group uppercase " ref={dropdownRef}>
      <Link
        href={link.href}
        className={`relative flex items-center px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${isActive
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
          }`}
        onClick={handleClick}
      >
        <span
          className={`absolute inset-0 rounded-xl transition-all duration-300 ${isActive
            ? "bg-blue-50/80 dark:bg-blue-900/20"
            : "bg-transparent group-hover:bg-gray-100/80 dark:group-hover:bg-gray-800/50"
            }`}
        />

        <span className="relative z-10 flex items-center gap-1.5">
          <span>{link.name}</span>
          {link.dropdown && (
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""
                }`}
            />
          )}
        </span>

        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
        )}
      </Link>

      {link.dropdown && isDropdownOpen && (
        <div className="absolute left-0 mt-3 w-72 origin-top-left">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-900 rotate-45 border-l border-t border-gray-100 dark:border-gray-700" />

          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-200/40 dark:shadow-black/40 border border-gray-100/80 dark:border-gray-700/50 py-2 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

            {link.dropdown.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group/item flex items-start px-4 py-3 mx-2 rounded-xl hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200"
                onClick={() => setDropdownOpen(false)}
              >
                <span
                  className={`mr-3 mt-0.5 p-2 rounded-lg transition-all duration-200 ${item.featured
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover/item:bg-blue-100 dark:group-hover/item:bg-blue-900/30 group-hover/item:text-blue-600"
                    }`}
                >
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover/item:text-blue-700 transition-colors">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                      {item.description}
                    </span>
                  )}
                </div>
                <ChevronRight
                  size={14}
                  className="mt-1 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 text-blue-500"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
};

const TopBar = () => {
  return (
    <div className="bg-slate-900 text-white/90 backdrop-blur-md items-center border-b border-white/10 text-[11px] font-medium tracking-wide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1 rounded-full bg-white/10 group-hover:bg-blue-600 transition-colors duration-300">
              <Phone size={10} className="text-white" />
            </div>
            <a
              href="tel:+8801611223637"
              className="text-gray-300 group-hover:text-white transition-colors"
            >
              09606-810081
            </a>
          </div>
          <div className="hidden sm:flex items-center gap-2 group cursor-pointer">
            <div className="p-1 rounded-full bg-white/10 group-hover:bg-blue-600 transition-colors duration-300">
              <Mail size={10} className="text-white" />
            </div>
            <a
              href="mailto:info@immigrantjobsworld.com"
              className="text-gray-300 group-hover:text-white transition-colors"
            >
              info@immigrantjobsworld.com
            </a>
            <div className="p-1 rounded-full bg-white/10 group-hover:bg-blue-600 transition-colors duration-300">
              <Mail size={10} className="text-white" />
            </div>
            <a
              href="mailto:support@immigrantjobsworld.com"
              className="text-gray-300 group-hover:text-white transition-colors"
            >
              support@immigrantjobsworld.com
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hidden sm:flex items-center gap-1.5 hover:text-blue-400 transition-colors"
          >
            <HelpCircle size={12} />
            <span>Help Center</span>
          </Link>
          <div className="w-px h-3 bg-white/20 mx-1 hidden sm:block" />
          <div className="scale-90 origin-right">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
};

const MobileNav: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navLinks: NavLink[];
}> = ({ isOpen, setIsOpen, navLinks }) => {
  const { user, setUser, setIsLoading: setUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");

  const handleLogout = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
      setUser(null);
      setUserLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 w-[85%] max-w-sm h-full bg-white dark:bg-gray-900 z-50 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-500 ease-out lg:hidden flex flex-col shadow-2xl`}
      >
        <div className="relative flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />
          <LogoCompact />
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.dropdown ? (
                  <>
                    <button
                      onClick={() =>
                        setExpandedMenu(
                          expandedMenu === link.name ? null : link.name,
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          {link.icon}
                        </span>
                        <span className="font-medium">{link.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-300 ${expandedMenu === link.name ? "rotate-180" : ""}`}
                      />
                    </button>
                    {expandedMenu === link.name && (
                      <div className="ml-4 mt-2 space-y-1 pl-4 border-l-2 border-blue-500">
                        {link.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 rounded-xl transition-all"
                          >
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                  >
                    <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {isAuthenticated(user) ? (
            <div className="space-y-4">
              {/* User Profile Card */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-2">
                {isAdmin(user) && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
                  >
                    <Layout size={16} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/user-profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-250 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all text-sm border border-gray-200/50 dark:border-gray-700/50"
                >
                  <User size={16} />
                  <span>My Profile Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/20 rounded-xl font-semibold transition-all text-sm"
                >
                  <LogOut size={16} />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25"
            >
              <User size={18} />
              <span>{t("login")}</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { user, setUser, setIsLoading: setUserLoading } = useUser();
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");

  const navLinks: NavLink[] = [
    { name: t("home"), href: "/", icon: <Home size={18} /> },
    { name: t("courses"), href: "/all-courses", icon: <BookOpen size={18} /> },
    { name: t("jobs"), href: "/jobs", icon: <Briefcase size={18} /> },
    {
      name: t("resources"),
      href: "#",
      icon: <FileText size={18} />,
      dropdown: [
        {
          name: t("blog"),
          href: "/blog",
          description: "Articles & insights",
          icon: <FileText size={16} />,
        },
      ],
    },
    {
      name: t("about"),
      href: "#",
      icon: <HelpCircle size={18} />,
      dropdown: [
        {
          name: t("about"),
          href: "/about-us",
          description: "Learn about IMMIGRANT JOBS WORLD",
          icon: <Users size={16} />,
        },
        {
          name: t("contact"),
          href: "/contact",
          description: "Get in touch",
          icon: <Mail size={16} />,
        },
      ],
    },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
      setUser(null);
      setUserLoading(false);
    }
  };

  return (
    <>
      <TopBar />
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${isScrolled ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50" : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"}`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 lg:h-20">
            <Link href="/" className="flex-shrink-0 group">
              <div className="hidden sm:block transform group-hover:scale-105 transition-transform duration-300">
                <Logo />
              </div>
              <div className="sm:hidden">
                <LogoCompact />
              </div>
            </Link>

            <div className="hidden lg:flex lg:items-center lg:justify-center flex-1 px-8">
              <ul className="flex items-center gap-1 px-3 py-2 bg-gray-100/80 dark:bg-gray-800/40 rounded-2xl border border-gray-100/50 dark:border-gray-700/30">
                {navLinks.map((link) => (
                  <NavItem
                    key={link.name}
                    link={link}
                    isActive={
                      pathname === link.href ||
                      (link.dropdown?.some((i) =>
                        pathname.startsWith(i.href),
                      ) ??
                        false)
                    }
                  />
                ))}
              </ul>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:scale-105 transition-all"
              >
                {theme === "light" ? (
                  <Moon size={18} className="text-slate-600" />
                ) : (
                  <Sun size={18} className="text-amber-400" />
                )}
              </button>

              {isAuthenticated(user) ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/50 transition-all">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium hidden xl:block">
                      {user?.name}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>
                  <div className="absolute right-0 mt-3 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                      <div className="px-4 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-2">
                        {isAdmin(user) && (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Layout size={16} />
                            <span>Dashboard</span>
                          </Link>
                        )}
                        <Link
                          href="/user-profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <User size={16} />
                          <span>{t("profile")}</span>
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-800 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>{t("logout")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-0.5"
                >
                  {t("login")}
                </Link>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </nav>
      </header>
      <MobileNav
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        navLinks={navLinks}
      />
    </>
  );
};

export default Navbar;
