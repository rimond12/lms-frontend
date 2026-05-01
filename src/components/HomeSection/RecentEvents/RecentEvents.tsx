"use client";

import React, { useEffect, useState } from "react";
import { useGetUpcomingEventsQuery } from "@/app/redux/api/EventCalendarApi/EventCalendarApi";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  ArrowRight,
  ExternalLink,
  Users,
} from "lucide-react";
import {
  format,
  parseISO,
  isPast,
  isFuture,
  differenceInSeconds,
} from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { EventCalendarItem } from "@/types/eventCalendar";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";

export default function RecentEvents() {
  const { data: upcomingEvents, isLoading } = useGetUpcomingEventsQuery(6);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
            <div className="h-5 w-72 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 animate-pulse border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="w-full lg:w-24 h-28 bg-gray-100 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                  <div className="w-full lg:w-36">
                    <div className="h-10 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Events"
          title="Upcoming Events"
          subtitle="Join our workshops, seminars, and networking events to learn cutting-edge skills."
          viewAllLink="/event-calendar"
          viewAllText="View All Events"
        />

        {/* Events List */}
        <div className="space-y-4 mb-10">
          {upcomingEvents.slice(0, 4).map((event, index) => (
            <EventListItem key={event._id} event={event} index={index} />
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="text-center lg:hidden">
          <Link href="/event-calendar">
            <Button
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg"
            >
              View All Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function EventListItem({
  event,
  index,
}: {
  event: EventCalendarItem;
  index: number;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">(
    "upcoming",
  );
  const [mounted, setMounted] = useState(false);

  // Parse dates safely
  const eventDate = (() => {
    if (!event.startDate) return new Date();
    try {
      return parseISO(event.startDate);
    } catch {
      console.error("Invalid start date:", event.startDate);
      return new Date();
    }
  })();

  const day = format(eventDate, "dd");
  const month = format(eventDate, "MMM");
  const year = format(eventDate, "yyyy");

  useEffect(() => {
    setMounted(true);

    const updateCountdown = () => {
      if (!event.startDate || !event.endDate) {
        setStatus("upcoming");
        setTimeLeft(null);
        return;
      }

      try {
        const now = new Date();
        const eventStart = parseISO(event.startDate);
        const eventEnd = parseISO(event.endDate);

        if (isPast(eventEnd)) {
          setStatus("ended");
          setTimeLeft(null);
          return;
        }

        if (isFuture(eventStart)) {
          setStatus("upcoming");
          const totalSeconds = Math.max(
            0,
            differenceInSeconds(eventStart, now),
          );
          const days = Math.floor(totalSeconds / (24 * 3600));
          const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setStatus("live");
          setTimeLeft(null);
        }
      } catch (error) {
        console.error("Error parsing event dates:", error);
        setStatus("upcoming");
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.startDate, event.endDate]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="flex flex-col lg:flex-row">
        {/* Date Card - Left Side */}
        <div className="bg-gray-50 p-4 lg:p-5 flex lg:flex-col items-center justify-center lg:w-28 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="text-center">
            <div className="text-3xl lg:text-4xl font-bold text-gray-900">
              {day}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {month}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{year}</div>
          </div>
          <div className="ml-4 lg:ml-0 lg:mt-3 flex items-center gap-1.5 text-xs text-gray-600 bg-white px-2.5 py-1 rounded-md border border-gray-100">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="font-medium">{event.startTime}</span>
          </div>
        </div>

        {/* Event Details - Middle */}
        <div className="flex-1 p-4 lg:p-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="px-2.5 py-1 rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: event.color || "#374151" }}
            >
              {event.eventType}
            </span>

            {status === "live" && (
              <span className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                LIVE NOW
              </span>
            )}

            {status === "ended" && (
              <span className="px-2.5 py-1 bg-gray-400 text-white rounded-md text-xs font-semibold">
                Ended
              </span>
            )}

            {event.isOnline && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium flex items-center gap-1">
                <Video className="w-3 h-3" />
                Online
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/event-calendar/${event.slug}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {event.isOnline ? (
              <>
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <Video className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span>Online Event - Join from anywhere</span>
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <span className="line-clamp-1">
                  {event.venue}
                  {event.venueAddress && `, ${event.venueAddress}`}
                </span>
              </>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="mt-4 lg:hidden">
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdAZaO5kAEHJgFRnQ4kLZhrR8JKFHaO50IlVDn2_Mz7wWz5mA/viewform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-lg py-2.5 text-sm"
              >
                <Users className="w-4 h-4 mr-2" />
                Register Now
              </Button>
            </a>
          </div>
        </div>

        {/* Countdown & CTA - Right Side (Desktop) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-5 border-l border-gray-100 w-44 bg-gray-50/50">
          {status === "live" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              </div>
              <p className="text-red-600 font-bold text-sm">LIVE NOW</p>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </div>
          ) : status === "ended" ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center mb-2 mx-auto">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">Event Ended</p>
            </div>
          ) : (
            <div className="text-center w-full">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Starts In
              </p>
              {mounted && timeLeft ? (
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {timeLeft.days > 0 && (
                    <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100 col-span-2">
                      <div className="text-xl font-bold text-gray-900">
                        {timeLeft.days}
                      </div>
                      <div className="text-[10px] font-medium text-gray-500 uppercase">
                        Days
                      </div>
                    </div>
                  )}
                  <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold text-gray-900">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] font-medium text-gray-500 uppercase">
                      Hrs
                    </div>
                  </div>
                  <div className="bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                    <div className="text-lg font-bold text-gray-900">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] font-medium text-gray-500 uppercase">
                      Min
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 mb-4">Loading...</div>
              )}

              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSdAZaO5kAEHJgFRnQ4kLZhrR8JKFHaO50IlVDn2_Mz7wWz5mA/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  size="sm"
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 font-semibold rounded-lg text-xs"
                >
                  Register
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
