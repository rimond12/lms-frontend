"use client";

import React, { useState, useEffect } from 'react';
import { 
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetBlogEventNewsSlugsQuery
} from '@/app/redux/api/EventCalendarApi/EventCalendarApi';
import { toast } from 'sonner';
import { X, Calendar, Clock, MapPin, Video, Users, Star } from 'lucide-react';
import type { EventCalendarItem, EventType, CreateEventPayload } from '@/types/eventCalendar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const EVENT_TYPES: EventType[] = ['Seminar', 'Webinar', 'Workshop', 'Conference', 'Training', 'Meetup', 'Other'];

const EVENT_TYPE_COLORS = {
  'Seminar': '#3b82f6',
  'Webinar': '#8b5cf6',
  'Workshop': '#10b981',
  'Conference': '#f59e0b',
  'Training': '#ef4444',
  'Meetup': '#06b6d4',
  'Other': '#6b7280',
};

// Utility function to generate slug from title
const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

interface EventFormModalProps {
  event: EventCalendarItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EventFormModal({ event, onClose, onSuccess }: EventFormModalProps) {
  const isEditMode = !!event;
  const { data: slugOptions = [] } = useGetBlogEventNewsSlugsQuery();
  
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  // Form state
  const [formData, setFormData] = useState<Partial<CreateEventPayload>>({
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
    color: EVENT_TYPE_COLORS.Seminar,
    slug: '',
    registrationUrl: '',
    detailsLink: '',
    category: '',
    isFeatured: false,
    priority: 0,
    published: true,
  });

  // Initialize form with event data in edit mode
  useEffect(() => {
    if (event) {
      try {
        // Helper function to safely extract date and time
        const extractDateTime = (dateValue: any, timeValue?: string) => {
          let date: Date;
          if (typeof dateValue === 'string') {
            // Handle ISO string or date-only string
            date = dateValue.includes('T') ? new Date(dateValue) : new Date(`${dateValue}T${timeValue || '00:00'}:00`);
          } else if (dateValue instanceof Date) {
            date = dateValue;
          } else if (dateValue && typeof dateValue === 'object' && dateValue.$date) {
            // Handle MongoDB date format
            date = new Date(dateValue.$date);
          } else {
            date = new Date();
          }

          return {
            dateString: date.toISOString().split('T')[0],
            timeString: timeValue || date.toTimeString().slice(0, 5)
          };
        };

        const startDateTime = extractDateTime(event.startDate, event.startTime);
        const endDateTime = extractDateTime(event.endDate, event.endTime);

        setFormData({
          title: event.title,
          eventType: event.eventType,
          startDate: startDateTime.dateString,
          endDate: endDateTime.dateString,
          startTime: startDateTime.timeString,
          endTime: endDateTime.timeString,
          isOnline: event.isOnline,
          onlineLink: event.onlineLink || '',
          venue: event.venue || '',
          venueAddress: event.venueAddress || '',
          mapLink: event.mapLink || '',
          color: event.color || EVENT_TYPE_COLORS[event.eventType],
          slug: event.slug || '',
          registrationUrl: event.registrationUrl || '',
          detailsLink: event.detailsLink || '',
          category: event.category || '',
          isFeatured: event.isFeatured || false,
          priority: event.priority || 0,
          published: event.published !== false,
        });
      } catch (error) {
        console.error('Error initializing form with event data:', error);
        toast.error('Error loading event data');
      }
    }
  }, [event]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-update color when event type changes
    if (field === 'eventType') {
      setFormData(prev => ({ ...prev, color: EVENT_TYPE_COLORS[value as EventType] }));
    }

    // Auto-generate slug from title if no dropdown slug selected
    if (field === 'title' && !formData.slug) {
      const autoSlug = generateSlugFromTitle(value);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }

    // Clear offline fields when switching to online
    if (field === 'isOnline' && value === true) {
      setFormData(prev => ({ ...prev, venue: '', venueAddress: '', mapLink: '' }));
    }

    // Clear online field when switching to offline
    if (field === 'isOnline' && value === false) {
      setFormData(prev => ({ ...prev, onlineLink: '' }));
    }

    // Clear detailsLink when slug is selected
    if (field === 'slug' && value) {
      setFormData(prev => ({ ...prev, detailsLink: '' }));
    }

    // Clear slug when detailsLink is added
    if (field === 'detailsLink' && value) {
      setFormData(prev => ({ ...prev, slug: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.title?.trim()) {
      toast.error('Event title is required');
      return false;
    }

    if (!formData.startDate) {
      toast.error('Start date is required');
      return false;
    }

    if (!formData.endDate) {
      toast.error('End date is required');
      return false;
    }

    if (formData.isOnline && !formData.onlineLink?.trim()) {
      toast.error('Online link is required for online events');
      return false;
    }

    if (!formData.isOnline && !formData.venue?.trim()) {
      toast.error('Venue is required for offline events');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // Format dates properly for backend
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? new Date(`${formData.startDate}T${formData.startTime || '00:00'}:00.000Z`).toISOString() : undefined,
        endDate: formData.endDate ? new Date(`${formData.endDate}T${formData.endTime || '23:59'}:00.000Z`).toISOString() : undefined,
      };

      if (isEditMode && event) {
        await updateEvent({
          _id: event._id,
          ...formattedData,
        }).unwrap();
        toast.success('Event updated successfully');
      } else {
        await createEvent(formattedData as CreateEventPayload).unwrap();
        toast.success('Event created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save event');
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#B34644]" />
              Basic Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter event title..."
                required
                className="w-full"
              />
            </div>

            {/* Event Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleChange('eventType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
                  required
                >
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g., Technology, Health..."
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Date and Time */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#B34644]" />
              Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B34644]" />
              Location
            </h3>

            {/* Online/Offline Toggle */}
            <div>
              <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isOnline}
                  onChange={(e) => handleChange('isOnline', e.target.checked)}
                  className="w-4 h-4 text-[#B34644] border-gray-300 rounded focus:ring-[#B34644]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Online Event</span>
              </label>
            </div>

            {/* Online Link or Venue */}
            {formData.isOnline ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Link *
                </label>
                <Input
                  type="url"
                  value={formData.onlineLink}
                  onChange={(e) => handleChange('onlineLink', e.target.value)}
                  placeholder="https://zoom.us/... or https://meet.google.com/..."
                  className="w-full"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleChange('venue', e.target.value)}
                    placeholder="Venue name..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <Input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => handleChange('venueAddress', e.target.value)}
                    placeholder="Enter full address..."
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Link
                  </label>
                  <Input
                    type="url"
                    value={formData.mapLink}
                    onChange={(e) => handleChange('mapLink', e.target.value)}
                    placeholder="Google Maps link..."
                    className="w-full"
                  />
                </div>
              </>
            )}
          </section>

          {/* Additional Details */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#B34644]" />
              Additional Details
            </h3>

            {/* Blog Event News Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog/Event/News Slug (Optional)
              </label>
              <select
                value={formData.slug || ''}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B34644] focus:border-transparent"
              >
                <option value="">-- Auto-generated or select slug --</option>
                {slugOptions.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title} ({item.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current slug: <span className="font-mono font-semibold">{formData.slug}</span>
              </p>
            </div>

            {/* Details Link - Hidden when slug is selected */}
            {!formData.slug && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Details Link (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.detailsLink || ''}
                  onChange={(e) => handleChange('detailsLink', e.target.value)}
                  placeholder="https://example.com/event-details..."
                  className="w-full"
                />
              </div>
            )}

            {/* Registration URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration URL (Optional)
              </label>
              <Input
                type="url"
                value={formData.registrationUrl || ''}
                onChange={(e) => handleChange('registrationUrl', e.target.value)}
                placeholder="https://example.com/register..."
                className="w-full"
              />
            </div>
          </section>

          {/* Features & Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#B34644]" />
              Features & Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Featured */}
              <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 text-[#B34644] border-gray-300 rounded focus:ring-[#B34644]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Featured Event</span>
              </label>

              {/* Published */}
              <label className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => handleChange('published', e.target.checked)}
                  className="w-4 h-4 text-[#B34644] border-gray-300 rounded focus:ring-[#B34644]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority (0-10)
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                value={formData.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color || '#3b82f6'}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#B34644] hover:bg-[#9d3a38]"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
