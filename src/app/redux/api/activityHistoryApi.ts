import baseApi from './baseApi';
import type {
  IActivityHistoryFilters,
  IActivityHistoryResponse,
  IActivityHistory,
  IActivityStats,
} from '@/types/activityHistory';

const activityHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET all activities (admin)
    getAllActivities: builder.query<IActivityHistoryResponse, IActivityHistoryFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return {
          url: `/activity-history?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ActivityHistory'],
    }),

    // GET activity stats (admin)
    getActivityStats: builder.query<{ data: IActivityStats }, Partial<IActivityHistoryFilters>>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return {
          url: `/activity-history/stats?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ActivityHistory'],
    }),

    // GET my activities (current user)
    getMyActivities: builder.query<IActivityHistoryResponse, Partial<IActivityHistoryFilters>>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return {
          url: `/activity-history/my-activities?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ActivityHistory'],
    }),

    // GET user activity history (admin)
    getUserActivityHistory: builder.query<IActivityHistoryResponse, { userId: string; filters?: Partial<IActivityHistoryFilters> }>({
      query: ({ userId, filters = {} }) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, String(value));
          }
        });
        return {
          url: `/activity-history/user/${userId}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ActivityHistory'],
    }),

    // GET activities by entity ID
    getActivitiesByEntityId: builder.query<{ data: IActivityHistory[] }, string>({
      query: (entityId) => ({
        url: `/activity-history/entity/${entityId}`,
        method: 'GET',
      }),
      providesTags: ['ActivityHistory'],
    }),

    // GET single activity by ID
    getActivityById: builder.query<{ data: IActivityHistory }, string>({
      query: (id) => ({
        url: `/activity-history/${id}`,
        method: 'GET',
      }),
      providesTags: ['ActivityHistory'],
    }),

    // DELETE single activity (admin)
    deleteActivity: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/activity-history/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ActivityHistory'],
    }),

    // DELETE bulk activities (admin)
    deleteActivitiesBulk: builder.mutation<{ deletedCount: number }, Partial<IActivityHistoryFilters>>({
      query: (filters) => ({
        url: `/activity-history/bulk-delete`,
        method: 'DELETE',
        body: filters,
      }),
      invalidatesTags: ['ActivityHistory'],
    }),
  }),
});

export const {
  useGetAllActivitiesQuery,
  useGetActivityStatsQuery,
  useGetMyActivitiesQuery,
  useGetUserActivityHistoryQuery,
  useGetActivitiesByEntityIdQuery,
  useGetActivityByIdQuery,
  useDeleteActivityMutation,
  useDeleteActivitiesBulkMutation,
} = activityHistoryApi;

export default activityHistoryApi;
