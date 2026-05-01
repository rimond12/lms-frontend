"use client";

import React, { useState } from 'react';
import { 
  useGetItemsQuery, 
  useDeleteItemMutation, 
  useUpdateItemMutation
} from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import { format, isValid } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import ImageUploadField from '@/components/shared/ImageUploadField';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { getServerBaseUrl, getFullDocumentUrl } from '@/utils/serverUrl';

type Category = 'blog' | 'news' | 'event';
type ViewMode = 'all' | 'blog' | 'news' | 'event';

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
  eventTime?: string;
  eventVenue?: string;
  eventAttendees?: number;
  eventMapLink?: string;
  EventsJoinLink?: string;
  organizerName?: string;
  speaker?: string;
  speakers?: Array<{
    name: string;
    speakerDegree: string;
    speakerPhotoUrl: string;
    speakerCertification: string;
    speakerInstitution: string;
    details: string;
  }>;
  speakerDetails?: string;
  sponsorName?: string;
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;
}

export default function ManageBlogEventNewsPage() {
  const [activeTab, setActiveTab] = useState<ViewMode>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<BlogEventNews | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch data based on active tab
  const queryArg = activeTab === 'all' ? undefined : { category: activeTab as Category };
  const { data, isLoading, refetch } = useGetItemsQuery(queryArg);
  const [deleteItem] = useDeleteItemMutation();
  const [updateItem] = useUpdateItemMutation();

  const items: BlogEventNews[] = data?.data || [];

  // Safe date formatting function
  const formatDate = (dateString: string | undefined, formatString: string) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return null;
      return format(date, formatString);
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return null;
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

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id).unwrap();
      toast.success('Item deleted successfully');
      setDeleteConfirmId(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await Promise.all(selectedItems.map(id => deleteItem(id).unwrap()));
      toast.success(`${selectedItems.length} items deleted successfully`);
      setSelectedItems([]);
      refetch();
    } catch (error) {
      toast.error('Failed to delete selected items');
    }
  };

  const handleStatusToggle = async (item: BlogEventNews) => {
    try {
      // Toggle some status or update timestamp
      await updateItem({ 
        id: item._id, 
        updatedAt: new Date().toISOString() 
      }).unwrap();
      toast.success('Item updated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item._id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const getTabCount = (category: ViewMode) => {
    if (category === 'all') return items.length;
    return items.filter(item => item.category === category).length;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black">Manage Content</h1>
          <p className="text-gray-600 mt-1">Manage your blogs, news, and events</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/create-blog-events-news"
            className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New
          </Link>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 bg-[#B34644] text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'all', label: 'All Content' },
            { key: 'blog', label: 'Blogs' },
            { key: 'news', label: 'News' },
            { key: 'event', label: 'Events' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ViewMode)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {getTabCount(tab.key as ViewMode)}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bulk Actions Bar */}
      {items.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={selectedItems.length === items.length && items.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              Select All ({items.length})
            </label>
            {selectedItems.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedItems.length} items selected
              </span>
            )}
          </div>
          <button
            onClick={refetch}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* Content Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first {activeTab === 'all' ? 'content' : activeTab}.</p>
          <Link 
            href="/dashboard/create-blog-events-news"
            className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Create New Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              {/* Item Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)}
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item._id)}
                      className="p-1.5 text-gray-400 hover:text-[#B34644] hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm overflow-hidden">
                  <span className="block truncate">
                    {item?.title}
                  </span>
                </h3>
              </div>

              {/* Item Image */}
              {item.photoUrl && (
                <div className="relative h-32">
                  <img
                    src={getFullDocumentUrl(item.photoUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Item Content */}
              <div className="p-4">
                <div className="text-sm text-gray-600 mb-3 overflow-hidden"
                     style={{
                       display: '-webkit-box',
                       WebkitLineClamp: 2,
                       WebkitBoxOrient: 'vertical' as const,
                       textOverflow: 'ellipsis'
                     }}
                     dangerouslySetInnerHTML={{ 
                       __html: item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' 
                     }}
                />
                
                {/* Event specific info */}
                {item.category === 'event' && item.eventDate && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(item.eventDate, 'MMM dd, yyyy')}
                    </div>
                    {item.organizerName && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {item.organizerName}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(item.createdAt, 'MMM dd, yyyy')}</span>
                  <Link
                    href={`/blogs-news-events/${item.slug}`}
                    className="text-black hover:underline font-medium"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#B34644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-[#B34644] rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quick Edit</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <EditForm 
                item={editingItem} 
                onSave={(updatedItem) => {
                  // Handle regular update with the updated photoUrl
                  updateItem({ id: updatedItem._id, ...updatedItem }).unwrap()
                    .then(() => {
                      toast.success('Item updated successfully');
                      setIsEditModalOpen(false);
                      setEditingItem(null);
                      refetch();
                    })
                    .catch(() => {
                      toast.error('Failed to update item');
                    });
                }}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setEditingItem(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Form Component
interface EditFormProps {
  item: BlogEventNews;
  onSave: (item: BlogEventNews) => void;
  onCancel: () => void;
}

function EditForm({ item, onSave, onCancel }: EditFormProps) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content); // Keep HTML content as-is
  const [photoUrl, setPhotoUrl] = useState(item.photoUrl || '');
  const [eventDateTime, setEventDateTime] = useState(
    item.eventTime ? format(new Date(item.eventTime), "yyyy-MM-dd'T'HH:mm") : 
    item.eventDate ? format(new Date(item.eventDate), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [organizerName, setOrganizerName] = useState(item.organizerName || '');
  const [speaker, setSpeaker] = useState(item.speaker || '');
  const [eventVenue, setEventVenue] = useState(item.eventVenue || '');
  const [eventAttendees, setEventAttendees] = useState(item.eventAttendees?.toString() || '');
  const [eventMapLink, setEventMapLink] = useState(item.eventMapLink || '');
  const [eventsJoinLink, setEventsJoinLink] = useState(item.EventsJoinLink || '');
  const [speakers, setSpeakers] = useState<any[]>(
    item.speakers && Array.isArray(item.speakers) && item.speakers.length > 0 
      ? item.speakers 
      : [{ name: speaker || '', speakerDegree: '', speakerPhotoUrl: '', speakerCertification: '', speakerInstitution: '', details: '' }]
  );
  const [sponsorTitle, setSponsorTitle] = useState(item.sponsorTitle || '');
  const [sponsorPhotoUrl, setSponsorPhotoUrl] = useState(item.sponsorPhotoUrl || '');

  // Handle image upload using the same pattern as create page
  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${getServerBaseUrl()}/api/blog-event-news/upload-image`, { 
      method: 'POST', 
      body: formData 
    });
    const data = await res.json();
    if (!data?.data?.imagePath) throw new Error('Upload failed');
    return data.data.imagePath; // Return the path as-is from backend
  };

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
    const updatedSpeakers = [...speakers];
    updatedSpeakers[index] = { ...updatedSpeakers[index], [field]: value };
    setSpeakers(updatedSpeakers);
  };

  const handleSpeakerPhotoUpload = async (file: File, speakerIndex: number): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${getServerBaseUrl()}/api/blog-event-news/upload-image`, { 
      method: 'POST', 
      body: formData 
    });
    const data = await res.json();
    if (!data?.data?.imagePath) throw new Error('Upload failed');
    
    // Update the speaker's photo URL
    const updatedSpeakers = [...speakers];
    updatedSpeakers[speakerIndex] = { 
      ...updatedSpeakers[speakerIndex], 
      speakerPhotoUrl: data.data.imagePath 
    };
    setSpeakers(updatedSpeakers);
    
    return data.data.imagePath;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedItem: BlogEventNews = {
      ...item,
      title,
      content,
      photoUrl,
      sponsorTitle: sponsorTitle || undefined,
      sponsorPhotoUrl: sponsorPhotoUrl || undefined,
      ...(item.category === 'event' && {
        eventTime: eventDateTime ? new Date(eventDateTime).toISOString() : undefined,
        eventDate: eventDateTime ? new Date(eventDateTime).toISOString() : undefined, // Keep both for backward compatibility
        organizerName: organizerName || undefined,
        speaker: speaker || undefined, // Keep legacy speaker for backward compatibility
        speakers: speakers.filter(s => s.name.trim() !== ''),
        eventVenue: eventVenue || undefined,
        eventAttendees: eventAttendees ? parseInt(eventAttendees) : undefined,
        eventMapLink: eventMapLink || undefined,
        EventsJoinLink: eventsJoinLink || undefined,
      })
    };
    
    onSave(updatedItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          required
        />
      </div>

      {/* Image Upload Field */}
      <ImageUploadField
        label="Cover Photo"
        value={photoUrl}
        onChange={(imagePath) => {
          setPhotoUrl(imagePath);
        }}
        onUpload={handleImageUpload}
        placeholder="Upload or change cover image"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <RichTextEditor 
            value={content} 
            onChange={setContent} 
            placeholder={`Edit your ${item.category} content...`}
            onImageUpload={handleImageUpload}
          />
        </div>
      </div>

      {item.category === 'event' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Date & Time</label>
            <input
              type="datetime-local"
              value={eventDateTime}
              onChange={(e) => setEventDateTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Venue</label>
            <input
              type="text"
              value={eventVenue}
              onChange={(e) => setEventVenue(e.target.value)}
              placeholder="Enter event venue/location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
            <input
              type="number"
              value={eventAttendees}
              onChange={(e) => setEventAttendees(e.target.value)}
              placeholder="Enter expected number of attendees"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Map Link</label>
            <input
              type="url"
              value={eventMapLink}
              onChange={(e) => setEventMapLink(e.target.value)}
              placeholder="Enter Google Maps or location link"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Link</label>
            <input
              type="url"
              value={eventsJoinLink}
              onChange={(e) => setEventsJoinLink(e.target.value)}
              placeholder="Enter registration or join link"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Speakers Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Speakers</label>
              <button
                type="button"
                onClick={addSpeaker}
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Speaker
              </button>
            </div>
            
            {speakers.map((speaker, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 relative">
                {speakers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="absolute top-2 right-2 text-red-800 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Speaker Name *</label>
                    <input
                      type="text"
                      value={speaker.name}
                      onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                      placeholder="Enter speaker name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Degree/Title</label>
                    <input
                      type="text"
                      value={speaker.speakerDegree}
                      onChange={(e) => updateSpeaker(index, 'speakerDegree', e.target.value)}
                      placeholder="e.g., PhD, Dr., Prof."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Institution</label>
                    <input
                      type="text"
                      value={speaker.speakerInstitution}
                      onChange={(e) => updateSpeaker(index, 'speakerInstitution', e.target.value)}
                      placeholder="University/Organization"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Certification</label>
                    <input
                      type="text"
                      value={speaker.speakerCertification}
                      onChange={(e) => updateSpeaker(index, 'speakerCertification', e.target.value)}
                      placeholder="Professional certifications"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <ImageUploadField
                    label="Speaker Photo"
                    value={speaker.speakerPhotoUrl}
                    onChange={(imagePath) => updateSpeaker(index, 'speakerPhotoUrl', imagePath)}
                    onUpload={(file) => handleSpeakerPhotoUpload(file, index)}
                    placeholder="Upload speaker photo"
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Speaker Details/Bio</label>
                  <textarea
                    value={speaker.details}
                    onChange={(e) => updateSpeaker(index, 'details', e.target.value)}
                    placeholder="Enter speaker biography or additional details"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Sponsor Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Sponsor Information</label>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sponsor Title</label>
              <input
                type="text"
                value={sponsorTitle}
                onChange={(e) => setSponsorTitle(e.target.value)}
                placeholder="Enter sponsor title/name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <ImageUploadField
              label="Sponsor Photo"
              value={sponsorPhotoUrl}
              onChange={(imagePath) => setSponsorPhotoUrl(imagePath)}
              onUpload={handleImageUpload}
              placeholder="Upload sponsor logo/photo"
            />
          </div>
          
          {/* Legacy speaker field for backward compatibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Legacy Speaker (for old events)</label>
            <input
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="Single speaker name (legacy field)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
