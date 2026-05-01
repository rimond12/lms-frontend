"use client";

import React, { useState, useEffect } from 'react';
import { 
  useCreateEventMutation,
  useUpdateEventMutation,
  useUploadEventImageMutation,
  useGetBlogEventNewsSlugsQuery
} from '@/app/redux/api/EventCalendarApi/EventCalendarApi';
import { toast } from 'sonner';
import { X, Upload, Calendar, Clock, MapPin, Video, Users, Tag, Star, Image as ImageIcon } from 'lucide-react';
import type { EventCalendarItem, EventType, CreateEventPayload } from '@/types/eventCalendar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import RichTextEditor from '@/components/shared/RichTextEditor';
import AppImage from '@/components/ui/AppImage';

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
  const [uploadImage, { isLoading: isUploading }] = useUploadEventImageMutation();

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

  const [speakerInput, setSpeakerInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Initialize form with event data in edit mode
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        eventType: event.eventType,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
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
    }
  }, [event]);

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-update color when event type changes
    if (field === 'eventType') {
      setFormData(prev => ({ ...prev, color: EVENT_TYPE_COLORS[value as EventType] }));
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

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await uploadImage(formData).unwrap();
      handleChange('imageUrl', response.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
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

    // if (new Date(formData.endDate) < new Date(formData.startDate)) {
    //   toast.error('End date must be after or equal to start date');
    //   return false;
    // }

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

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode && event) {
        await updateEvent({ _id: event._id, ...formData }).unwrap();
        toast.success('Event updated successfully');
      } else {
        await createEvent(formData as CreateEventPayload).unwrap();
        toast.success('Event created successfully');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
      console.error(error);
    }
  };

  const isLoading = isCreating || isUpdating || isUploading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update event details' : 'Fill in the details to create a new event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
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
                  placeholder="e.g., Technology, Health, Education..."
                  className="w-full"
                />
              </div>
            </div>

            {/* Description */}
           
          </section>

          {/* Date and Time */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#B34644]" />
              Date & Time
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
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

              {/* End Date */}
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
                  min={formData.startDate}
                />
              </div>

              {/* Start Time */}
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

              {/* End Time */}
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
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!formData.isOnline}
                  onChange={() => handleChange('isOnline', false)}
                  className="w-4 h-4 text-[#B34644] border-gray-300 focus:ring-[#B34644]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Offline Event</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={formData.isOnline}
                  onChange={() => handleChange('isOnline', true)}
                  className="w-4 h-4 text-[#B34644] border-gray-300 focus:ring-[#B34644]"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Online Event</span>
              </label>
            </div>

            {/* Conditional Fields */}
            {formData.isOnline ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Online Link * (Zoom, Google Meet, etc.)
                </label>
                <Input
                  type="url"
                  value={formData.onlineLink}
                  onChange={(e) => handleChange('onlineLink', e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full"
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
                    value={formData.venue}
                    onChange={(e) => handleChange('venue', e.target.value)}
                    placeholder="Enter venue name..."
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue Address (Optional)
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
                    Map Link (Optional)
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

          {/* Event Image */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#B34644]" />
              Event Image
            </h3>

            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative">
                  <AppImage
                    photoUrl={imagePreview}
                    alt="Event preview"
                    width={200}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      handleChange('imageUrl', '');
                    }}
                    className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full p-1 hover:bg-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex-1">
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#B34644] transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload event image
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
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
                <option value="">-- Select a slug --</option>
                {slugOptions.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.title} ({item.slug})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                When selected, the Details Link field will be automatically hidden.
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
                <p className="text-xs text-gray-500 mt-1">
                  This field is hidden when a slug is selected.
                </p>
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

          {/* Settings */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#B34644]" />
              Settings
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
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#B34644] hover:bg-[#8B1E1E] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isEditMode ? 'Update Event' : 'Create Event'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
