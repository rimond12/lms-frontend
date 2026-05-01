// Types for Blog, Event, and News content

export interface Speaker {
  name: string;
  speakerDegree?: string;
  speakerPhotoUrl?: string;
  speakerCertification?: string;
  speakerInstitution?: string;
  details?: string; // HTML content for speaker bio
}

export interface TimetableItem {
  activity: string;
  start: string;
  end: string;
  duration: string;
}

export interface BlogEventNewsItem {
  _id: string;
  title: string;
  slug: string;
  category: 'blog' | 'news' | 'event';
  content: string;
  excerpt?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Event specific fields
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventAttendees?: number;
  eventMapLink?: string;
  EventsJoinLink?: string;
  organizerName?: string;
  
  // Speaker fields - can be single or multiple speakers
  speakers?: Speaker[];
  speaker?: string; // Legacy field for backward compatibility
  speakerDetails?: string;
  
  // Sponsor fields
  sponsorName?: string;
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;
  
  // Timetable for events
  timetable?: TimetableItem[];
  
  // Additional fields that might be useful
  author?: string;
  tags?: string[];
  published?: boolean;
  featured?: boolean;
  readTime?: number;
}

export interface RelatedContentResponse {
  success: boolean;
  data: BlogEventNewsItem[];
  total: number;
  page?: number;
  limit?: number;
}

export interface BlogEventNewsResponse {
  success: boolean;
  data: BlogEventNewsItem;
  message?: string;
}
