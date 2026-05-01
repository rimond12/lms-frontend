"use client";

import React, { useState } from 'react';
import { useBulkCreateEventsMutation } from '@/app/redux/api/EventCalendarApi/EventCalendarApi';
import { toast } from 'sonner';
import { Upload, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { CreateEventPayload } from '@/types/eventCalendar';

interface BulkEventFormData extends CreateEventPayload {
  id?: string;
}

export default function BulkEventsPage() {
  const [bulkCreateEvents, { isLoading }] = useBulkCreateEventsMutation();
  const [events, setEvents] = useState<BulkEventFormData[]>([]);
  const [fileInput, setFileInput] = useState<File | null>(null);

  // Add empty event form
  const handleAddEvent = () => {
    const newEvent: BulkEventFormData = {
      id: Date.now().toString(),
      title: '',
      eventType: 'Seminar',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '17:00',
      isOnline: false,
      onlineLink: '',
      venue: '',
      venueAddress: '',
      mapLink: '',
      color: '#3b82f6',
      slug: '',
      registrationUrl: '',
      detailsLink: '',
      category: '',
      isFeatured: false,
      priority: 0,
      published: true,
    };
    setEvents([...events, newEvent]);
  };

  // Update event field
  const handleEventChange = (index: number, field: string, value: any) => {
    const updatedEvents = [...events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };

    // Auto-generate slug from title if empty
    if (field === 'title' && !updatedEvents[index].slug) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      updatedEvents[index].slug = slug;
    }

    setEvents(updatedEvents);
  };

  // Remove event
  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const importedEvents = json.map((evt, idx) => ({
            ...evt,
            id: `${Date.now()}-${idx}`,
          }));
          setEvents([...events, ...importedEvents]);
          toast.success(`Imported ${importedEvents.length} events`);
        } else {
          toast.error('JSON must contain an array of events');
        }
      } catch (error) {
        toast.error('Invalid JSON format');
      }
    };
    reader.readAsText(file);
    setFileInput(null);
  };

  // Export events as JSON template
  const handleExportTemplate = () => {
    const template = [
      {
        title: "Example Event 1",
        eventType: "Seminar",
        startDate: "2025-12-01",
        endDate: "2025-12-01",
        startTime: "10:00",
        endTime: "12:00",
        isOnline: true,
        onlineLink: "https://zoom.us/meeting",
        slug: "example-event-1",
        category: "Technology",
        isFeatured: false,
        priority: 0,
        published: true,
      },
      {
        title: "Example Event 2",
        eventType: "Workshop",
        startDate: "2025-12-05",
        endDate: "2025-12-05",
        startTime: "14:00",
        endTime: "17:00",
        isOnline: false,
        venue: "Main Hall",
        venueAddress: "123 Main St, City",
        slug: "example-event-2",
        category: "Training",
        isFeatured: true,
        priority: 5,
        published: true,
      },
    ];

    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events-template.json';
    link.click();
    toast.success('Template downloaded');
  };

  // Validate events before submission
  const validateEvents = (): boolean => {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event.title?.trim()) {
        toast.error(`Event ${i + 1}: Title is required`);
        return false;
      }
      if (!event.startDate) {
        toast.error(`Event ${i + 1}: Start date is required`);
        return false;
      }
      if (!event.endDate) {
        toast.error(`Event ${i + 1}: End date is required`);
        return false;
      }
      if (event.isOnline && !event.onlineLink?.trim()) {
        toast.error(`Event ${i + 1}: Online link is required`);
        return false;
      }
      if (!event.isOnline && !event.venue?.trim()) {
        toast.error(`Event ${i + 1}: Venue is required`);
        return false;
      }
    }
    return true;
  };

  // Submit bulk events
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (events.length === 0) {
      toast.error('Please add at least one event');
      return;
    }

    if (!validateEvents()) return;

    try {
      // Remove ID field before submitting
      const eventsToSubmit = events.map(({ id, ...evt }) => evt);
      await bulkCreateEvents({ events: eventsToSubmit }).unwrap();
      toast.success(`${events.length} events created successfully!`);
      setEvents([]);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create events');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Create Events</h1>
          <p className="text-gray-600">Create multiple calendar events at once</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={handleAddEvent}
            className="flex items-center gap-2 bg-[#B34644] hover:bg-[#9d3a38]"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </Button>

          <Button
            onClick={handleExportTemplate}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Button>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <span>
                <Upload className="w-4 h-4" />
                Import JSON
              </span>
            </Button>
          </label>
        </div>

        {/* Events Count */}
        {events.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-medium">
              {events.length} event{events.length !== 1 ? 's' : ''} ready to create
            </p>
          </div>
        )}

        {/* Events Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600 mb-6">No events added yet</p>
              <Button
                type="button"
                onClick={handleAddEvent}
                className="bg-[#B34644] hover:bg-[#9d3a38]"
              >
                Add First Event
              </Button>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="text-red-800 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <Input
                      type="text"
                      value={event.title || ''}
                      onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                      placeholder="Event title"
                      required
                    />
                  </div>

                  {/* Event Type & Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      value={event.eventType || 'Seminar'}
                      onChange={(e) => handleEventChange(index, 'eventType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="Seminar">Seminar</option>
                      <option value="Webinar">Webinar</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Conference">Conference</option>
                      <option value="Training">Training</option>
                      <option value="Meetup">Meetup</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Input
                      type="text"
                      value={event.category || ''}
                      onChange={(e) => handleEventChange(index, 'category', e.target.value)}
                      placeholder="Category"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <Input
                      type="date"
                      value={event.startDate || ''}
                      onChange={(e) => handleEventChange(index, 'startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <Input
                      type="date"
                      value={event.endDate || ''}
                      onChange={(e) => handleEventChange(index, 'endDate', e.target.value)}
                      required
                    />
                  </div>

                  {/* Times */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={event.startTime || '09:00'}
                      onChange={(e) => handleEventChange(index, 'startTime', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={event.endTime || '17:00'}
                      onChange={(e) => handleEventChange(index, 'endTime', e.target.value)}
                    />
                  </div>

                  {/* Online/Offline */}
                  <div className="md:col-span-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.isOnline || false}
                        onChange={(e) => handleEventChange(index, 'isOnline', e.target.checked)}
                        className="w-4 h-4 text-[#B34644] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Online Event
                      </span>
                    </label>
                  </div>

                  {/* Online Link or Venue */}
                  {event.isOnline ? (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Online Link *
                      </label>
                      <Input
                        type="url"
                        value={event.onlineLink || ''}
                        onChange={(e) => handleEventChange(index, 'onlineLink', e.target.value)}
                        placeholder="https://zoom.us/... or https://meet.google.com/..."
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Venue *
                        </label>
                        <Input
                          type="text"
                          value={event.venue || ''}
                          onChange={(e) => handleEventChange(index, 'venue', e.target.value)}
                          placeholder="Venue name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          type="text"
                          value={event.venueAddress || ''}
                          onChange={(e) => handleEventChange(index, 'venueAddress', e.target.value)}
                          placeholder="Full address"
                        />
                      </div>
                    </>
                  )}

                  {/* Slug */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (Auto-generated from title)
                    </label>
                    <Input
                      type="text"
                      value={event.slug || ''}
                      onChange={(e) => handleEventChange(index, 'slug', e.target.value)}
                      placeholder="auto-generated-slug"
                      className="bg-gray-50"
                    />
                  </div>

                  {/* Registration URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration URL
                    </label>
                    <Input
                      type="url"
                      value={event.registrationUrl || ''}
                      onChange={(e) => handleEventChange(index, 'registrationUrl', e.target.value)}
                      placeholder="https://example.com/register"
                    />
                  </div>

                  {/* Featured & Priority */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.isFeatured || false}
                        onChange={(e) => handleEventChange(index, 'isFeatured', e.target.checked)}
                        className="w-4 h-4 text-[#B34644] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Featured
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority (0-10)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={event.priority || 0}
                      onChange={(e) => handleEventChange(index, 'priority', parseInt(e.target.value))}
                    />
                  </div>

                  {/* Published */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.published !== false}
                        onChange={(e) => handleEventChange(index, 'published', e.target.checked)}
                        className="w-4 h-4 text-[#B34644] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Published
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Submit Buttons */}
          {events.length > 0 && (
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-[#B34644] hover:bg-[#9d3a38] text-white py-3 rounded-lg font-semibold"
              >
                {isLoading ? 'Creating Events...' : `Create ${events.length} Event${events.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                type="button"
                onClick={() => setEvents([])}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                Clear All
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
