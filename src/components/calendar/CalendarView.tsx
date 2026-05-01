"use client";

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Video, X, ExternalLink, Star, Users, Info } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { EventCalendarItem } from '@/types/eventCalendar';
import { Button } from '@/components/ui/Button';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import Link from 'next/link';

interface CalendarViewProps {
  events: EventCalendarItem[];
  initialDate?: Date;
}

export default function CalendarView({ events, initialDate = new Date() }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedEvent, setSelectedEvent] = useState<EventCalendarItem | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EventCalendarItem[]> = {};

    events.forEach(event => {
      if (!event.startDate) return; // Skip events without start date
      try {
        const startDate = format(parseISO(event.startDate), 'yyyy-MM-dd');
        if (!grouped[startDate]) {
          grouped[startDate] = [];
        }
        grouped[startDate].push(event);
      } catch (error) {
        console.error('Error parsing event date:', error);
      }
    });

    return grouped;
  }, [events]);

  // Navigation handlers
  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Event click handler
  const handleEventClick = (event: EventCalendarItem) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Get event status
  const getEventStatus = (event: EventCalendarItem) => {
    // Guard against undefined dates
    if (!event.startDate || !event.endDate) {
      return 'upcoming';
    }

    try {
      const now = new Date();
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);

      if (start > now) return 'upcoming';
      if (start <= now && end >= now) return 'ongoing';
      return 'past';
    } catch (error) {
      console.error('Error determining event status:', error);
      return 'upcoming';
    }
  };

  // Get status colors and labels
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { color: '#10B981', bgColor: '#D1FAE5', label: 'Upcoming' };
      case 'ongoing':
        return { color: '#F59E0B', bgColor: '#FEF3C7', label: 'Live Now' };
      case 'past':
        return { color: '#6B7280', bgColor: '#F3F4F6', label: 'Completed' };
      default:
        return { color: '#6B7280', bgColor: '#F3F4F6', label: 'Unknown' };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <p className="text-slate-300 text-sm lg:text-base">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="bg-white/10 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Week
              </button>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={goToPreviousMonth}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 p-3"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={goToToday}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-4 py-2 text-sm font-medium"
              >
                Today
              </Button>
              <Button
                onClick={goToNextMonth}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 p-3"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/20">
          <span className="text-sm text-slate-300 font-medium">Event Status:</span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-slate-300">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-sm text-slate-300">Live Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-slate-300">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Calendar Grid */}
      <div className="p-4 lg:p-6">
        {viewMode === 'month' ? (
          <>
            {/* Enhanced Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="text-center font-bold text-slate-700 py-3 text-sm lg:text-base border-b-2 border-slate-200">
                  <span className="hidden lg:inline">{day}</span>
                  <span className="lg:hidden">{day.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {/* Enhanced Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] lg:min-h-[160px] xl:min-h-[180px]
                      border-2 rounded-xl p-3 transition-all duration-200 relative group
                      ${!isCurrentMonth
                        ? 'bg-slate-50/50 opacity-60 border-slate-200'
                        : 'bg-gradient-to-br from-white to-slate-50/30 border-slate-200 hover:border-slate-300'
                      }
                      ${isToday
                        ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/50 border-blue-300'
                        : ''
                      }
                      ${hasEvents ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : ''}
                    `}
                    onClick={() => {
                      if (dayEvents.length === 1) {
                        window.location.href = `/event-calendar/${dayEvents[0].slug}`;
                      } else if (dayEvents.length > 1) {
                        handleEventClick(dayEvents[0]);
                      }
                    }}
                  >
                    {/* Professional Day Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`
                        text-sm lg:text-base font-bold flex items-center justify-center
                        w-8 h-8 lg:w-10 lg:h-10 rounded-full transition-all
                        ${isToday
                          ? 'bg-blue-600 text-white shadow-lg'
                          : isCurrentMonth
                            ? 'text-slate-800 bg-slate-100'
                            : 'text-slate-500 bg-slate-200'
                        }
                      `}>
                        {format(day, 'd')}
                      </div>

                      {/* Event Count Badge */}
                      {hasEvents && (
                        <div className="flex items-center gap-1">
                          <div className="px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded-full shadow-sm">
                            {dayEvents.length}
                          </div>
                          <CalendarIcon className="w-4 h-4 text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Enhanced Events Display */}
                    {hasEvents ? (
                      <div className="space-y-2">
                        {dayEvents.slice(0, 3).map((event) => {
                          const status = getEventStatus(event);
                          const statusInfo = getStatusInfo(status);

                          return (
                            <div
                              key={event._id}
                              className="block w-full text-left p-2 lg:p-3 rounded-lg text-xs lg:text-sm font-medium transition-all hover:scale-105 shadow-sm border border-transparent hover:border-slate-300"
                              style={{
                                backgroundColor: `${statusInfo.color}15`,
                                borderLeft: `4px solid ${statusInfo.color}`
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-start gap-2">
                                {/* Status Indicator */}
                                <div className="flex-shrink-0 mt-0.5">
                                  <div
                                    className="w-2 h-2 rounded-full shadow-sm"
                                    style={{ backgroundColor: statusInfo.color }}
                                    title={statusInfo.label}
                                  />
                                </div>

                                <div className="flex-1 min-w-0 text-left">
                                  {/* Event Title - Clear and prominent */}
                                  <div
                                    className="font-bold mb-1.5 text-xs leading-tight"
                                    style={{ color: statusInfo.color }}
                                  >
                                    {event.title}
                                  </div>

                                  {/* Event Details - Extra clear and readable */}
                                  <div className="space-y-1">
                                    {/* Time Row */}
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                      <Clock className="w-3 h-3 flex-shrink-0 text-slate-500" />
                                      <span className="text-[10px] font-medium leading-none">
                                        {event.startTime}
                                      </span>
                                    </div>

                                    {/* Location Row */}
                                    <div className="flex items-center gap-1.5 text-slate-700">
                                      {event.isOnline ? (
                                        <>
                                          <Video className="w-3 h-3 flex-shrink-0 text-green-600" />
                                          <span className="text-[10px] font-medium leading-none text-green-700">
                                            Online Event
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="w-3 h-3 flex-shrink-0 text-purple-600" />
                                          <span
                                            className="text-[10px] font-medium leading-none text-purple-700"
                                          >
                                            {event.venue || 'Venue TBA'}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* More Events Indicator */}
                        {dayEvents.length > 3 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(dayEvents[0]);
                            }}
                            className="w-full text-center py-2 px-3 text-xs lg:text-sm text-slate-700 hover:text-white hover:bg-slate-700 rounded-lg font-semibold transition-all border-2 border-slate-300 hover:border-slate-700"
                          >
                            +{dayEvents.length - 3} more event{dayEvents.length - 3 !== 1 ? 's' : ''}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-16 lg:h-20 text-slate-400">
                        {isCurrentMonth && (
                          <div className="text-center">
                            <CalendarIcon className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-xs opacity-60">No events</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enhanced Hover Tooltip */}
                    {dayEvents.length > 1 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg border border-slate-700">
                        <div className="flex items-center gap-2">
                          <Info className="w-3 h-3" />
                          <span>Click to view all {dayEvents.length} events</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Professional Week/List View */
          <div className="space-y-6 ">
            {/* Week Header */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-300 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Week of {format(calendarStart, 'MMM dd')} - {format(calendarEnd, 'MMM dd, yyyy')}
              </h3>
              <p className="text-base text-slate-600 font-medium">
                {Object.values(eventsByDate).flat().length} event{Object.values(eventsByDate).flat().length !== 1 ? 's' : ''} this week
              </p>
            </div>

            {/* Week Days List */}
            <div className="space-y-4 ">
              {calendarDays.map((day, index) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={index}
                    className={`
                      bg-white  border-2 rounded-xl p-6 transition-all duration-200 shadow-sm
                      ${!isCurrentMonth
                        ? 'bg-slate-50/50 opacity-60 border-slate-200'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                      }
                      ${isToday ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50/30 border-blue-300' : ''}
                    `}
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className={`
                          text-base font-bold flex items-center justify-center
                          w-12 h-12 rounded-full shadow-sm
                          ${isToday
                            ? 'bg-blue-600 text-white shadow-lg'
                            : isCurrentMonth
                              ? 'text-slate-800 bg-slate-100'
                              : 'text-slate-500 bg-slate-200'
                          }
                        `}>
                          {format(day, 'd')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-lg">
                            {format(day, 'EEEE')}
                          </div>
                          <div className="text-base text-slate-600 font-medium">
                            {format(day, 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>

                      {hasEvents && (
                        <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-slate-800 text-white text-sm font-bold rounded-full shadow-sm">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Events List */}
                    {hasEvents ? (
                      <div className="space-y-4">
                        {dayEvents.map((event) => {
                          const status = getEventStatus(event);
                          const statusInfo = getStatusInfo(status);

                          return (
                            <div
                              key={event._id}
                              className=" block w-full p-5 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg"
                              style={{
                                backgroundColor: `${statusInfo.color}10`,
                                borderColor: `${statusInfo.color}30`
                              }}
                            >
                              <div className="flex items-start gap-5 ">
                                {/* Status Indicator */}
                                <div className="flex-shrink-0 mt-2">
                                  <div
                                    className="w-4 h-4 rounded-full shadow-sm"
                                    style={{ backgroundColor: statusInfo.color }}
                                  />
                                </div>

                                {/* Event Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      {/* Event Title */}
                                      <h4
                                        className="font-bold text-base lg:text-lg mb-3 leading-tight"
                                        style={{ color: statusInfo.color }}
                                      >
                                        {event.title}
                                      </h4>

                                      {/* Event Details Grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        {/* Time */}
                                        <div className="flex items-center gap-3 text-slate-700">
                                          <Clock className="w-5 h-5 text-slate-500 flex-shrink-0" />
                                          <span className="text-sm font-medium">
                                            {event.startTime} - {event.endTime}
                                          </span>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-center gap-3 text-slate-700">
                                          {event.isOnline ? (
                                            <>
                                              <Video className="w-5 h-5 text-green-600 flex-shrink-0" />
                                              <span className="text-sm font-medium text-green-700">
                                                Online Event
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                                              <span className="text-sm font-medium text-purple-700 truncate">
                                                {event.venue || 'Venue TBA'}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Status Badge */}
                                      <div className="mt-3">
                                        <span
                                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm"
                                          style={{
                                            backgroundColor: `${statusInfo.color}20`,
                                            color: statusInfo.color
                                          }}
                                        >
                                          {statusInfo.label}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="flex-shrink-0 mt-2">
                                      <ChevronRight className="w-6 h-6 text-slate-400" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
                        <p className="text-base font-medium">No events scheduled</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={closeModal}
        />
      )}
    </div>
  );
}

// Helper functions for event status
function getEventStatus(event: EventCalendarItem): 'upcoming' | 'ongoing' | 'past' {
  const now = new Date();
  const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
  const endDateTime = new Date(`${event.endDate}T${event.endTime}`);

  if (now < startDateTime) return 'upcoming';
  if (now >= startDateTime && now <= endDateTime) return 'ongoing';
  return 'past';
}

function getStatusInfo(status: 'upcoming' | 'ongoing' | 'past') {
  switch (status) {
    case 'upcoming':
      return { label: 'Upcoming', color: '#3B82F6' };
    case 'ongoing':
      return { label: 'Live Now', color: '#10B981' };
    case 'past':
      return { label: 'Completed', color: '#6B7280' };
    default:
      return { label: 'Unknown', color: '#6B7280' };
  }
}

// Professional Event Detail Modal Component
function EventDetailModal({ event, onClose }: { event: EventCalendarItem; onClose: () => void }) {
  const status = getEventStatus(event);
  const statusInfo = getStatusInfo(status);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 scale-100">

          {/* Status Banner */}
          <div
            className="h-2 rounded-t-2xl"
            style={{ backgroundColor: statusInfo.color }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Hero Section */}
          <div className="relative px-6 lg:px-8 pt-8 pb-6">
            <div className="flex items-start gap-4 mb-4">
              {/* Status Badge */}
              <div
                className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2"
                style={{ backgroundColor: statusInfo.color }}
              >
                {status === 'ongoing' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                <span>{statusInfo.label}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              {event.title}
            </h1>

            {/* Event Tagline */}
            <p className="text-lg text-gray-600 mb-6">
              Join us for an engaging session on structural engineering excellence
            </p>
          </div>

          {/* Content */}
          <div className="px-6 lg:px-8 pb-8">
            {/* Enhanced Key Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Date Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl flex-shrink-0">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 font-semibold mb-1">Date</div>
                    <div className="text-lg font-bold text-blue-900">
                      {event.startDate ? format(parseISO(event.startDate), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                    {event.startDate !== event.endDate && event.endDate && (
                      <div className="text-sm text-blue-700">
                        to {format(parseISO(event.endDate), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-green-700 font-semibold mb-1">Time</div>
                    <div className="text-lg font-bold text-green-900">
                      {event.startTime}
                    </div>
                    <div className="text-sm text-green-700">
                      to {event.endTime}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl flex-shrink-0">
                    {event.isOnline ? (
                      <Video className="w-6 h-6 text-white" />
                    ) : (
                      <MapPin className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-purple-700 font-semibold mb-1">
                      {event.isOnline ? 'Platform' : 'Venue'}
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {event.isOnline ? 'Virtual Event' : event.venue}
                    </div>
                    <div className="text-sm text-purple-700">
                      {event.isOnline ? 'Online participation' : 'Physical location'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-gray-600" />
                About This Event
              </h3>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                <RichTextRenderer htmlString={event.description} />
              </div>
            </div>

            {/* Organizer & Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {event.organizer && (
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Organizer
                  </h4>
                  <p className="text-gray-700 font-medium">{event.organizer}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Bangladesh Association of Structural Engineers
                  </p>
                </div>
              )}

              {/* Event Stats */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  Event Highlights
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-semibold text-gray-900">
                      {event.isOnline ? 'Virtual' : 'In-Person'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className="font-semibold px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${statusInfo.color}20`,
                        color: statusInfo.color
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/event-calendar/${event.slug}`} className="flex-1">
                <Button className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  View Full Event Details
                </Button>
              </Link>

              {event.isOnline && event.onlineLink && (
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full py-4 text-lg font-semibold border-2 border-green-500 text-green-700 hover:bg-green-500 hover:text-white transition-all duration-200"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Join Live Event
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              )}

              {!event.isOnline && event.mapLink && (
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full py-4 text-lg font-semibold border-2 border-purple-500 text-purple-700 hover:bg-purple-500 hover:text-white transition-all duration-200"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Get Directions
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              )}
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Questions about this event? Contact us at{' '}
                <a href="mailto:basebd25@gmail.com" className="text-blue-600 hover:text-blue-800 font-medium">
                  basebd25@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
