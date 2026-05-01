// Event Calendar Types for Frontend

export type EventType = 
  | 'Seminar' 
  | 'Webinar' 
  | 'Workshop' 
  | 'Conference' 
  | 'Training' 
  | 'Meetup' 
  | 'Other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface EventRecurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  occurrences?: number;
}

export interface EventRegistration {
  enabled: boolean;
  maxAttendees?: number;
  currentAttendees?: number;
  registrationDeadline?: string;
  requiresApproval?: boolean;
}

export interface EventCalendarItem {
  organizer: string;
  description: string;
  _id: string;
  title: string;
  slug: string;
  eventType: EventType;
  
  // Date and Time
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  allDay?: boolean;
  
  // Location
  isOnline: boolean;
  onlineLink?: string;
  venue?: string;
  venueAddress?: string;
  mapLink?: string;
  
  // Color
  color?: string;
  
  // Additional Details
  category?: string;
  registrationUrl?: string;
  detailsLink?: string;
  
  // Features
  isFeatured?: boolean;
  priority?: number;
  status: EventStatus;
  
  // Registration
  registration?: EventRegistration;
  
  // Recurrence
  recurrence?: EventRecurrence;
  parentEventId?: string;
  
  // Metadata
  createdBy?: string;
  updatedBy?: string;
  publishedAt?: string;
  published?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface EventCalendarResponse {
  success: boolean;
  message: string;
  data: EventCalendarItem | EventCalendarItem[];
}

export interface EventFilters {
  eventType?: EventType;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  category?: string;
  isOnline?: boolean;
  isFeatured?: boolean;
  published?: boolean;
  search?: string;
}

export interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  featured: number;
  online: number;
  offline: number;
}

export interface MonthEvents {
  [month: number]: EventCalendarItem[];
}

export interface CreateEventPayload {
  title: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  onlineLink?: string;
  venue?: string;
  venueAddress?: string;
  mapLink?: string;
  color?: string;
  slug?: string;
  registrationUrl?: string;
  detailsLink?: string;
  category?: string;
  isFeatured?: boolean;
  priority?: number;
  registration?: EventRegistration;
  recurrence?: EventRecurrence;
  published?: boolean;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  _id: string;
}

export interface BulkCreateEventPayload {
  events: CreateEventPayload[];
}

export interface BulkDeleteEventPayload {
  ids: string[];
}
