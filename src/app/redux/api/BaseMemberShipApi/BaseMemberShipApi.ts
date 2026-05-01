/**
 * BaseMemberShipApi - DEPRECATED AND REMOVED
 * This file provides stub exports to prevent build errors
 * All BaseMember functionality has been removed from the system
 */

import baseApi from "../baseApi";

export const BaseMemberShipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Stub endpoints - these will never be called
    getMyMembershipApplication: builder.query({
      query: () => ({ url: '/deprecated/base-member', method: 'GET' }),
      providesTags: [],
    }),
    getPendingReferenceRequests: builder.query({
      query: () => ({ url: '/deprecated/base-member', method: 'GET' }),
      providesTags: [],
    }),
    getAllMembershipApplications: builder.query({
      query: () => ({ url: '/deprecated/base-member', method: 'GET' }),
      providesTags: [],
    }),
    getSingleMembershipApplication: builder.query({
      query: () => ({ url: '/deprecated/base-member', method: 'GET' }),
      providesTags: [],
    }),
    searchMembers: builder.query({
      query: () => ({ url: '/deprecated/base-member', method: 'GET' }),
      providesTags: [],
    }),
    updateApplicationStatus: builder.mutation({
      query: () => ({ url: '/deprecated/base-member', method: 'POST' }),
      invalidatesTags: [],
    }),
    respondToReferenceRequest: builder.mutation({
      query: () => ({ url: '/deprecated/base-member', method: 'POST' }),
      invalidatesTags: [],
    }),
    deleteMembershipApplication: builder.mutation({
      query: () => ({ url: '/deprecated/base-member', method: 'DELETE' }),
      invalidatesTags: [],
    }),
    adminApplyForUser: builder.mutation({
      query: () => ({ url: '/deprecated/base-member', method: 'POST' }),
      invalidatesTags: [],
    }),
  }),
});

// Export stub hooks
export const {
  useGetMyMembershipApplicationQuery,
  useGetPendingReferenceRequestsQuery,
  useGetAllMembershipApplicationsQuery,
  useGetSingleMembershipApplicationQuery,
  useSearchMembersQuery,
  useUpdateApplicationStatusMutation,
  useRespondToReferenceRequestMutation,
  useDeleteMembershipApplicationMutation,
  useAdminApplyForUserMutation,
} = BaseMemberShipApi;

export default BaseMemberShipApi;
