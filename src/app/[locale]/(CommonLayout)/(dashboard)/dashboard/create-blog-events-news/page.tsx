"use client";

import React, { useState } from 'react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import ImageUploadField from '@/components/shared/ImageUploadField';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCreateItemMutation } from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import { getServerBaseUrl } from '@/utils/serverUrl';

type Category = 'blog' | 'news' | 'event';

export default function CreateBlogEventsNewsPage() {
  const [category, setCategory] = useState<Category>('blog');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  
  // Event specific fields
  const [eventDateTime, setEventDateTime] = useState(''); // Combined date and time
  const [eventVenue, setEventVenue] = useState('');
  const [eventAttendees, setEventAttendees] = useState<number | ''>('');
  const [eventMapLink, setEventMapLink] = useState('');
  const [eventsJoinLink, setEventsJoinLink] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  
  // Speaker fields
  const [speakers, setSpeakers] = useState([{
    name: '',
    speakerDegree: '',
    speakerPhotoUrl: '',
    speakerCertification: '',
    speakerInstitution: '',
    details: ''
  }]);
  const [speaker, setSpeaker] = useState(''); // Legacy field
  const [speakerDetails, setSpeakerDetails] = useState(''); // Legacy field
  
  // Sponsor fields
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorTitle, setSponsorTitle] = useState('');
  const [sponsorPhotoUrl, setSponsorPhotoUrl] = useState('');

  // Redux mutation hook
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();

  // Speaker management functions
  const addSpeaker = () => {
    setSpeakers([...speakers, {
      name: '',
      speakerDegree: '',
      speakerPhotoUrl: '',
      speakerCertification: '',
      speakerInstitution: '',
      details: ''
    }]);
  };

  const removeSpeaker = (index: number) => {
    if (speakers.length > 1) {
      setSpeakers(speakers.filter((_, i) => i !== index));
    }
  };

  const updateSpeaker = (index: number, field: string, value: string) => {
    const updatedSpeakers = speakers.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    );
    setSpeakers(updatedSpeakers);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    // Use the dedicated blog-event-news upload endpoint
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${getServerBaseUrl()}/api/blog-event-news/upload-image`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data?.data?.imagePath) throw new Error('Upload failed');
    return data.data.imagePath; // Return the path as-is from backend
  };

  const handleSpeakerPhotoUpload = async (file: File): Promise<string> => {
    // Use the dedicated blog-event-news upload endpoint for speaker photos
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${getServerBaseUrl()}/api/blog-event-news/upload-image`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!data?.data?.imagePath) throw new Error('Speaker photo upload failed');
    return data.data.imagePath;
  };

  const getCategoryIcon = (category: Category) => {
    switch (category) {
      case 'blog':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        );
      case 'news':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'event':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (category: Category) => {
    switch (category) {
      case 'blog': return 'bg-black text-white';
      case 'news': return 'bg-[#B34644] text-white';
      case 'event': return 'bg-gray-800 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    try {
      const payload: any = { category, title, content, photoUrl };
      if (category === 'event') {
        // Parse the datetime-local input and split into date and time
        if (eventDateTime) {
          const dateTime = new Date(eventDateTime);
          payload.eventDate = dateTime.toISOString();
          payload.eventTime = dateTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          });
        }
        payload.eventVenue = eventVenue || undefined;
        payload.eventAttendees = eventAttendees || undefined;
        payload.eventMapLink = eventMapLink || undefined;
        payload.EventsJoinLink = eventsJoinLink || undefined;
        payload.organizerName = organizerName || undefined;
        
        // Add speakers array if speakers have content
        const validSpeakers = speakers.filter(speaker => speaker.name.trim());
        if (validSpeakers.length > 0) {
          payload.speakers = validSpeakers;
        }
        
        // Keep legacy fields for backward compatibility
        payload.speaker = speaker || undefined;
        payload.speakerDetails = speakerDetails || undefined;
        payload.sponsorName = sponsorName || undefined;
        payload.sponsorTitle = sponsorTitle || undefined;
        payload.sponsorPhotoUrl = sponsorPhotoUrl || undefined;
      }
      
      // Use Redux mutation instead of fetch
      await createItem(payload).unwrap();
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} created successfully!`);
      
      // Reset form
      setTitle(''); 
      setContent(''); 
      setPhotoUrl(''); 
      setEventDateTime('');
      setEventVenue('');
      setEventAttendees('');
      setEventMapLink('');
      setEventsJoinLink('');
      setOrganizerName(''); 
      setSpeakers([{
        name: '',
        speakerDegree: '',
        speakerPhotoUrl: '',
        speakerCertification: '',
        speakerInstitution: '',
        details: ''
      }]);
      setSpeaker(''); 
      setSpeakerDetails(''); 
      setSponsorName(''); 
      setSponsorTitle(''); 
      setSponsorPhotoUrl(''); 
      setCategory('blog');
    } catch (error: any) {
      console.error('Error creating content:', error);
      toast.error(error?.data?.message || error?.message || 'Failed to create content');
    }
  };

  const resetForm = () => {
    setTitle(''); 
    setContent(''); 
    setPhotoUrl(''); 
    setEventDateTime('');
    setEventVenue('');
    setEventAttendees('');
    setEventMapLink('');
    setEventsJoinLink('');
    setOrganizerName(''); 
    setSpeakers([{
      name: '',
      speakerDegree: '',
      speakerPhotoUrl: '',
      speakerCertification: '',
      speakerInstitution: '',
      details: ''
    }]);
    setSpeaker(''); 
    setSpeakerDetails(''); 
    setSponsorName(''); 
    setSponsorTitle(''); 
    setSponsorPhotoUrl('');
  };




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
                Create {category.charAt(0).toUpperCase() + category.slice(1)}
              </div>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-black">Content Creation</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/manage-blogs-events-news"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Manage Content
              </Link>
              <button
                onClick={resetForm}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Create engaging content for your audience</p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Content Type</label>
              <div className="grid grid-cols-3 gap-3">
                {(['blog', 'news', 'event'] as Category[]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`relative flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                      category === cat
                        ? `${getCategoryColor(cat)} border-transparent shadow-md`
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getCategoryIcon(cat)}
                    <span className="font-medium capitalize">{cat}</span>
                    {category === cat && (
                      <svg className="absolute top-2 right-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Title <span className="text-[#B34644]">*</span>
              </label>
              <input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors duration-200 text-gray-900 placeholder-gray-500" 
                placeholder={`Enter ${category} title...`}
                required
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Content <span className="text-[#B34644]">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <RichTextEditor 
                  value={content} 
                  onChange={setContent} 
                  placeholder={`Write your ${category} content...`}
                />
              </div>
            </div>

            {/* Cover Photo */}
            <div className="space-y-2">
              <ImageUploadField
                label="Cover Photo"
                value={photoUrl}
                onChange={(p) => setPhotoUrl(p)}
                onUpload={handleImageUpload}
                placeholder="Upload a compelling cover image"
              />
            </div>

            {/* Event-specific fields */}
            {category === 'event' && (
              <div className="space-y-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                </div>

                {/* Basic Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900">Event Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={eventDateTime} 
                      onChange={(e) => setEventDateTime(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Select date and time"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Event Venue</label>
                    <input 
                      value={eventVenue} 
                      onChange={(e) => setEventVenue(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" 
                      placeholder="Enter venue name and location"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Expected Attendees</label>
                    <input 
                      type="number"
                      value={eventAttendees} 
                      onChange={(e) => setEventAttendees(e.target.value ? parseInt(e.target.value) : '')} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Number of attendees"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Map Link</label>
                    <input 
                      type="url"
                      value={eventMapLink} 
                      onChange={(e) => setEventMapLink(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Google Maps or location link"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Join Event Link</label>
                    <input 
                      type="url"
                      value={eventsJoinLink} 
                      onChange={(e) => setEventsJoinLink(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Registration or joining link"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Organizer Name</label>
                  <input 
                    value={organizerName} 
                    onChange={(e) => setOrganizerName(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" 
                    placeholder="Enter organizer name"
                  />
                </div>

                {/* Speakers Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Event Speakers
                    </h4>
                    <button 
                      type="button"
                      onClick={addSpeaker}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Speaker
                    </button>
                  </div>

                  {speakers.map((speaker, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-900">Speaker {index + 1}</h5>
                        {speakers.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeSpeaker(index)}
                            className="text-red-800 hover:text-red-800"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Speaker Name</label>
                          <input 
                            value={speaker.name} 
                            onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Enter speaker name"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Degree/Qualification</label>
                          <input 
                            value={speaker.speakerDegree} 
                            onChange={(e) => updateSpeaker(index, 'speakerDegree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="e.g., PhD, MS, etc."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Institution</label>
                          <input 
                            value={speaker.speakerInstitution} 
                            onChange={(e) => updateSpeaker(index, 'speakerInstitution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="University/Organization"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Certification</label>
                          <input 
                            value={speaker.speakerCertification} 
                            onChange={(e) => updateSpeaker(index, 'speakerCertification', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            placeholder="Professional certifications"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <ImageUploadField
                          label="Speaker Photo"
                          value={speaker.speakerPhotoUrl}
                          onChange={(photoUrl) => updateSpeaker(index, 'speakerPhotoUrl', photoUrl)}
                          onUpload={handleSpeakerPhotoUpload}
                          placeholder="Upload speaker photo"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Speaker Bio & Details</label>
                        <textarea 
                          value={speaker.details} 
                          onChange={(e) => updateSpeaker(index, 'details', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                          rows={3}
                          placeholder="Speaker biography and details..."
                        />
                      </div>
                    </div>
                  ))}
                </div>

            
            

          

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">Sponsor Title/Level</label>
                    <input 
                      value={sponsorTitle} 
                      onChange={(e) => setSponsorTitle(e.target.value)} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" 
                      placeholder="e.g., Platinum Sponsor, Main Partner"
                    />
                  </div>
                  <div>
                    <ImageUploadField
                      label="Sponsor Logo"
                      value={sponsorPhotoUrl}
                      onChange={(p) => setSponsorPhotoUrl(p)}
                      onUpload={handleImageUpload}
                      placeholder="Upload sponsor logo"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button 
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button 
                disabled={isCreating || !title.trim() || !content.trim()} 
                onClick={onSubmit} 
                className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isCreating ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Publish {category.charAt(0).toUpperCase() + category.slice(1)}
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Your content will be published immediately and visible to all users.
            </p>
          </div>
        </div>

        {/* Preview Section */}
        {(title || content) && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              {title && (
                <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
              )}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mb-3 ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
                {category}
              </div>
              {content && (
                <div 
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: content.substring(0, 200) + (content.length > 200 ? '...' : '') }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
