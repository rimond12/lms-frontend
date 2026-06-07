"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  User,
  Search,
  Grid,
  List,
  Clock,
} from "lucide-react";
import { useGetItemsQuery } from "@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi";

// Types based on your API
type Category = "blog" | "news" | "event";

interface BlogEventNews {
  _id: string;
  title: string;
  content: string;
  category: Category;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  slug: string;
  // Event-specific fields
  eventDate?: string;
  organizerName?: string;
  speaker?: string;
  speakerDetails?: string;
  sponsorName?: string;
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;
}

type Props = {
  limit?: number;
};

const getCategoryColor = (category: Category) => {
  switch (category) {
    case "blog":
      return "bg-black text-white";
    case "news":
      return "bg-[#B34644] text-white";
    case "event":
      return "bg-gray-800 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

function formatDate(dateString?: string) {
  if (!dateString) return "TBA";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "TBA";
  }
}

function formatTime(dateString?: string) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function getImageUrl(photoUrl?: string): string {
  if (!photoUrl) return "/images/course-thumbnail.jpg";
  if (photoUrl.startsWith("http")) return photoUrl;
  const baseUrl =
    process.env.NEXT_PUBLIC_FILE_URL || "https://api.immigrantjobsworld.com";
  // Ensure we have a proper path separator
  const cleanPhotoUrl = photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`;
  return `${baseUrl}${cleanPhotoUrl}`;
}

export default function BaseEvents({ limit = 12 }: Props) {
  const { data: apiResponse, isLoading, error } = useGetItemsQuery(undefined);

  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Filter only events from the API data
  const events = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.filter(
      (item: BlogEventNews) => item.category === "event",
    );
  }, [apiResponse]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((event: BlogEventNews) => {
        const searchTerm = search.trim().toLowerCase();
        if (!searchTerm) return true;
        return (
          event.title.toLowerCase().includes(searchTerm) ||
          event.content.toLowerCase().includes(searchTerm) ||
          (event.organizerName || "").toLowerCase().includes(searchTerm) ||
          (event.speaker || "").toLowerCase().includes(searchTerm)
        );
      })
      .slice(0, limit);
  }, [events, search, limit]);

  if (isLoading) {
    return (
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Loading amazing events...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-6">
              <Calendar className="w-10 h-10 text-red-800" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Unable to load events
            </h3>
            <p className="text-gray-600 text-lg">
              Please check your connection and try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover transformative experiences through our carefully curated
            workshops, seminars, and networking opportunities designed to
            elevate your learning journey.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6"
        >
          {/* Search */}
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events, speakers, organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-lg"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden shadow-lg">
            <button
              onClick={() => setView("grid")}
              className={`px-6 py-4 flex items-center gap-3 transition-all duration-300 font-medium ${
                view === "grid"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <Grid size={18} />
              Grid View
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-6 py-4 flex items-center gap-3 transition-all duration-300 font-medium ${
                view === "list"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <List size={18} />
              List View
            </button>
          </div>
        </motion.div>

        {/* Events Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-gray-700 font-medium">
              {filteredEvents.length} of {events.length} events available
            </p>
          </div>
        </motion.div>

        {/* Events Display */}
        {filteredEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No events found
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              {search
                ? "Try adjusting your search terms to find more events."
                : "Check back soon for exciting upcoming events and workshops."}
            </p>
          </motion.div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: BlogEventNews, index: number) => (
              <motion.article
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-36 overflow-hidden">
                  <Image
                    src={getImageUrl(event.photoUrl)}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                      EVENT
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {event.eventDate && (
                    <div className="flex items-center gap-3 mb-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatTime(event.eventDate)}</span>
                      </div>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {event.title}
                  </h3>

                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {event.content.replace(/<[^>]*>/g, "").substring(0, 80)}...
                  </p>

                  {(event.speaker || event.organizerName) && (
                    <div className="mb-3 space-y-1">
                      {event.speaker && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <User size={10} />
                          <span>{event.speaker}</span>
                        </div>
                      )}
                      {event.organizerName && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin size={10} />
                          <span>{event.organizerName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center justify-center w-full px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event: BlogEventNews, index: number) => (
              <motion.article
                key={event._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.01,
                  transition: { duration: 0.2 },
                }}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(event.photoUrl)}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                        EVENT
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 sm:flex-1 sm:pr-4">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 sm:mt-0 text-xs text-gray-500 flex-shrink-0">
                        {event.eventDate && (
                          <>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(event.eventDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{formatTime(event.eventDate)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {event.content.replace(/<[^>]*>/g, "").substring(0, 120)}
                      ...
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        {event.speaker && (
                          <div className="flex items-center gap-1">
                            <User size={10} />
                            <span className="truncate">{event.speaker}</span>
                          </div>
                        )}
                        {event.organizerName && (
                          <div className="flex items-center gap-1">
                            <MapPin size={10} />
                            <span className="truncate">
                              {event.organizerName}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/events/${event.slug}`}
                        className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors sm:w-auto w-full flex-shrink-0"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
