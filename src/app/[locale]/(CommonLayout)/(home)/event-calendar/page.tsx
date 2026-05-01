"use client";

import React, { useState, useMemo } from 'react';
import { 
  useGetEventsQuery,
  useGetFeaturedEventsQuery,
  useGetEventTagsQuery,
  useGetEventCategoriesQuery 
} from '@/app/redux/api/EventCalendarApi/EventCalendarApi';
import { 
  Calendar, 
  Grid, 
  List, 
  Search, 
  Filter, 
  X,
  MapPin,
  Video,
  Clock,
  Star,
  ChevronDown
} from 'lucide-react';
import CalendarView from '@/components/calendar/CalendarView';
import type { EventCalendarItem, EventType } from '@/types/eventCalendar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import RichTextRenderer from '@/components/shared/RichTextRenderer';

const EVENT_TYPES: EventType[] = ['Seminar', 'Webinar', 'Workshop', 'Conference', 'Training', 'Meetup', 'Other'];

type ViewMode = 'calendar' | 'grid' | 'list';

export default function EventCalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // API queries
  const { data: eventsData, isLoading } = useGetEventsQuery({ 
    published: true,
    eventType: filterType || undefined,
    isOnline: filterLocation === 'online' ? true : filterLocation === 'offline' ? false : undefined,
    tags: filterTag ? [filterTag] : undefined,
    category: filterCategory || undefined,
  });

  const { data: featuredEvents } = useGetFeaturedEventsQuery();
  const { data: tags } = useGetEventTagsQuery();
  const { data: categories } = useGetEventCategoriesQuery();

  const events = eventsData || [];

  // Filtered events based on search
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    
    const lowerSearch = searchTerm.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(lowerSearch) ||
      event.description.toLowerCase().includes(lowerSearch) ||
      event.organizer?.toLowerCase().includes(lowerSearch) ||
      event.venue?.toLowerCase().includes(lowerSearch)
    );
  }, [events, searchTerm]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterLocation('');
    setFilterTag('');
    setFilterCategory('');
  };

  const hasActiveFilters = searchTerm || filterType || filterLocation || filterTag || filterCategory;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B34644] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-[#B34644] rounded-2xl mb-4">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Event Calendar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and join our upcoming seminars, webinars, workshops, and conferences
          </p>
        </div>

        {/* Featured Events */}
        {featuredEvents && featuredEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                Featured Events
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map(event => (
                <FeaturedEventCard key={event._id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Search and View Controls */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 w-full text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter and View Controls Row */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Filter Toggle */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-[#B34644] text-white rounded-full px-1.5 sm:px-2 py-0.5 text-xs">
                    {[filterType, filterLocation, filterTag, filterCategory, searchTerm].filter(Boolean).length}
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>

              {/* View Mode Selector */}
              <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1 ml-auto">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    viewMode === 'calendar' 
                      ? 'bg-white shadow-sm text-[#B34644]' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-[#B34644]' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-[#B34644]' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as EventType | '')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {EVENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    <option value="online">Online Only</option>
                    <option value="offline">Offline Only</option>
                  </select>
                </div>

                {/* Tag Filter */}
                {tags && tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tag
                    </label>
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
                    >
                      <option value="">All Tags</option>
                      {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Filter */}
                {categories && categories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-gray-600"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span> events
            {hasActiveFilters && (
              <span className="text-gray-500"> (filtered)</span>
            )}
          </p>
        </div>

        {/* Content based on view mode */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more events' 
                : 'There are no upcoming events at the moment'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'calendar' && <CalendarView events={filteredEvents} />}
            {viewMode === 'grid' && <GridView events={filteredEvents} />}
            {viewMode === 'list' && <ListView events={filteredEvents} />}
          </>
        )}
      </div>
    </div>
  );
}

// Featured Event Card
function FeaturedEventCard({ event }: { event: EventCalendarItem }) {
  return (
    <Link href={`/event-calendar/${event.slug}`}>
      <div className="group relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: event.color }}
            >
              {event.eventType}
            </span>
            {event.isOnline ? (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                <Video className="w-3 h-3" />
                Online
              </span>
            ) : (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.venue}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#B34644] transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{event.startDate ? format(parseISO(event.startDate), 'MMM dd, yyyy') : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Grid View Component
function GridView({ events }: { events: EventCalendarItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <FeaturedEventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

// List View Component
function ListView({ events }: { events: EventCalendarItem[] }) {
  return (
    <div className="space-y-6">
      {events.map(event => {
        const getEventStatus = () => {
          const now = new Date();
          const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
          const endDateTime = new Date(`${event.endDate}T${event.endTime}`);

          if (now < startDateTime) return { label: 'Upcoming', color: '#10B981', bgColor: '#D1FAE5' };
          if (now >= startDateTime && now <= endDateTime) return { label: 'Live Now', color: '#F59E0B', bgColor: '#FEF3C7' };
          return { label: 'Completed', color: '#6B7280', bgColor: '#F3F4F6' };
        };

        const status = getEventStatus();

        return (
          <Link key={event._id} href={`/event-calendar/${event.slug}`}>
            <div className="group relative bg-gradient-to-r from-white via-slate-50/30 to-white rounded-2xl shadow-lg border-2 border-slate-200 hover:border-[#B34644] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              {/* Status Banner */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: status.color }}
              />

              {/* Featured Badge */}
              {event.isFeatured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </div>
                </div>
              )}

              <div className="p-6 lg:p-8">
                <div className="flex items-start gap-6">
                  {/* Enhanced Status Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="relative">
                      <div
                        className="w-5 h-5 lg:w-6 lg:h-6 rounded-full shadow-lg ring-3 ring-white transition-all group-hover:scale-110"
                        style={{ backgroundColor: status.color }}
                      />
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Event Type and Status Badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className="px-4 py-2 rounded-full text-xs lg:text-sm font-bold text-white shadow-lg"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.eventType}
                      </span>

                      <span
                        className="px-4 py-2 rounded-full text-xs lg:text-sm font-bold shadow-lg border-2 border-white"
                        style={{
                          backgroundColor: `${status.color}20`,
                          color: status.color,
                          borderColor: status.color
                        }}
                      >
                        {status.label}
                      </span>

                      {event.isOnline && (
                        <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-full text-xs lg:text-sm font-semibold shadow-sm border border-purple-300">
                          <Video className="w-4 h-4 inline mr-1.5" />
                          Online Event
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#B34644] transition-colors duration-300 leading-tight">
                      {event.title}
                    </h3>

                    {/* Event Description */}
                    <div className="text-sm lg:text-base text-gray-600 mb-6 leading-relaxed line-clamp-2">
                      <RichTextRenderer htmlString={event.description} />
                    </div>

                    {/* Enhanced Event Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      {/* Date Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 font-semibold mb-0.5">Date</p>
                            <p className="text-sm font-bold text-blue-900">
                              {event.startDate ? format(parseISO(event.startDate), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Time Card */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-green-700 font-semibold mb-0.5">Time</p>
                            <p className="text-sm font-bold text-green-900">
                              {event.startTime} - {event.endTime}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                            {event.isOnline ? (
                              <Video className="w-4 h-4 text-white" />
                            ) : (
                              <MapPin className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-purple-700 font-semibold mb-0.5">
                              {event.isOnline ? 'Platform' : 'Venue'}
                            </p>
                            <p className="text-sm font-bold text-purple-900 truncate">
                              {event.isOnline ? 'Virtual Event' : (event.venue || 'Venue TBA')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organizer Info */}
                    {event.organizer && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Organized by:</span>
                          <span className="font-semibold text-gray-900">{event.organizer}</span>
                        </div>

                        {/* Action Arrow */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                          <div className="flex items-center gap-2 text-[#B34644] font-semibold">
                            <span className="text-sm">View Details</span>
                            <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
