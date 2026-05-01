import baseApi from "../baseApi";
import type { 
  EventCalendarItem, 
  EventFilters, 
  EventStats, 
  MonthEvents,
  CreateEventPayload,
  UpdateEventPayload,
  BulkCreateEventPayload,
  BulkDeleteEventPayload 
} from "@/types/eventCalendar";

const EventCalendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all events with optional filters
    getEvents: builder.query<EventCalendarItem[], EventFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                params.append(key, value.join(','));
              } else {
                params.append(key, String(value));
              }
            }
          });
        }
        
        const queryString = params.toString();
        return `/event-calendar${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get event by ID
    getEventById: builder.query<EventCalendarItem, string>({
      query: (id) => `/event-calendar/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: 'EventCalendar', id }],
    }),

    // Get event by slug
    getEventBySlug: builder.query<EventCalendarItem, string>({
      query: (slug) => `/event-calendar/slug/${slug}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, slug) => [{ type: 'EventCalendar', id: slug }],
    }),

    // Get events by month
    getEventsByMonth: builder.query<EventCalendarItem[], { year: number; month: number }>({
      query: ({ year, month }) => `/event-calendar/month/${year}/${month}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get events by year
    getEventsByYear: builder.query<EventCalendarItem[], number>({
      query: (year) => `/event-calendar/year/${year}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get events grouped by month for a year
    getEventsGroupedByMonth: builder.query<MonthEvents, number>({
      query: (year) => `/event-calendar/year/${year}/grouped`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get upcoming events
    getUpcomingEvents: builder.query<EventCalendarItem[], number | void>({
      query: (limit = 10) => `/event-calendar/upcoming?limit=${limit}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get featured events
    getFeaturedEvents: builder.query<EventCalendarItem[], number | void>({
      query: (limit = 6) => `/event-calendar/featured?limit=${limit}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Search events
    searchEvents: builder.query<EventCalendarItem[], { q: string; limit?: number }>({
      query: ({ q, limit = 20 }) => `/event-calendar/search?q=${encodeURIComponent(q)}&limit=${limit}`,
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get event statistics
    getEventStats: builder.query<EventStats, void>({
      query: () => '/event-calendar/stats',
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get all tags
    getEventTags: builder.query<string[], void>({
      query: () => '/event-calendar/tags',
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get all categories
    getEventCategories: builder.query<string[], void>({
      query: () => '/event-calendar/categories',
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Get BlogEventNews slugs for dropdown
    getBlogEventNewsSlugs: builder.query<Array<{ slug: string; title: string }>, void>({
      query: () => '/event-calendar/slugs/blog-event-news',
      transformResponse: (response: any) => response.data,
      providesTags: ['EventCalendar'],
    }),

    // Create event
    createEvent: builder.mutation<EventCalendarItem, CreateEventPayload>({
      query: (payload) => ({
        url: '/event-calendar',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['EventCalendar'],
    }),

    // Bulk create events
    bulkCreateEvents: builder.mutation<EventCalendarItem[], BulkCreateEventPayload>({
      query: (payload) => ({
        url: '/event-calendar/bulk',
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ['EventCalendar'],
    }),

    // Update event
    updateEvent: builder.mutation<EventCalendarItem, UpdateEventPayload>({
      query: ({ _id, ...payload }) => ({
        url: `/event-calendar/${_id}`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, arg) => [
        'EventCalendar',
        { type: 'EventCalendar', id: arg._id }
      ],
    }),

    // Delete event
    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/event-calendar/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EventCalendar'],
    }),

    // Bulk delete events
    bulkDeleteEvents: builder.mutation<void, BulkDeleteEventPayload>({
      query: (payload) => ({
        url: '/event-calendar/bulk',
        method: 'DELETE',
        body: payload,
      }),
      invalidatesTags: ['EventCalendar'],
    }),

    // Upload event image
    uploadEventImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/event-calendar/upload-image',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useGetEventBySlugQuery,
  useGetEventsByMonthQuery,
  useGetEventsByYearQuery,
  useGetEventsGroupedByMonthQuery,
  useGetUpcomingEventsQuery,
  useGetFeaturedEventsQuery,
  useSearchEventsQuery,
  useGetEventStatsQuery,
  useGetEventTagsQuery,
  useGetEventCategoriesQuery,
  useGetBlogEventNewsSlugsQuery,
  useCreateEventMutation,
  useBulkCreateEventsMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useBulkDeleteEventsMutation,
  useUploadEventImageMutation,
} = EventCalendarApi;

export default EventCalendarApi;
