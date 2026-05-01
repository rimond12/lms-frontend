/**
 * Access Control API - RTK Query endpoints
 * Handles access grants, revokes, and invitations
 */

import baseApi from "../baseApi";
import type {
  IAccessControlGrant,
  IAccessControlInput,
  IInvitation,
  IInvitationInput,
  IBulkInvitationInput,
  IInvitationValidation,
} from "@/types/course";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

const accessControlApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ACCESS CONTROL ====================

    /**
     * Grant access to a user for a program
     */
    grantAccess: builder.mutation<
      ApiResponse<IAccessControlGrant>,
      IAccessControlInput
    >({
      query: (grantData) => ({
        url: "/access-control/grant",
        method: "POST",
        body: grantData,
      }),
      invalidatesTags: [{ type: "AccessControl", id: "LIST" }],
    }),

    /**
     * Revoke access for a user
     */
    revokeAccess: builder.mutation<
      ApiResponse<IAccessControlGrant>,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) => ({
        url: "/access-control/revoke",
        method: "POST",
        body: { userId, courseId },
      }),
      invalidatesTags: [{ type: "AccessControl", id: "LIST" }],
    }),

    // ==================== INVITATIONS ====================

    /**
     * Create a single invitation token
     */
    createInvitation: builder.mutation<ApiResponse<IInvitation>, IInvitationInput>(
      {
        query: (invitationData) => ({
          url: "/access-control/invitations",
          method: "POST",
          body: invitationData,
        }),
        invalidatesTags: [{ type: "Invitation", id: "LIST" }],
      }
    ),

    /**
     * Create bulk invitation tokens
     */
    createBulkInvitations: builder.mutation<
      ApiResponse<IInvitation[]>,
      IBulkInvitationInput
    >({
      query: (bulkInvitationData) => ({
        url: "/access-control/invitations/bulk",
        method: "POST",
        body: bulkInvitationData,
      }),
      invalidatesTags: [{ type: "Invitation", id: "LIST" }],
    }),

    /**
     * Validate invitation token
     */
    validateInvitation: builder.query<
      ApiResponse<IInvitationValidation>,
      string
    >({
      query: (token) => `/access-control/invitations/${token}/validate`,
      providesTags: (result, error, token) => [
        { type: "Invitation", id: token },
      ],
    }),

    /**
     * Redeem invitation token
     */
    redeemInvitation: builder.mutation<
      ApiResponse<{ token: string; courseId: string; accessGranted: boolean }>,
      { token: string }
    >({
      query: ({ token }) => ({
        url: "/access-control/invitations/redeem",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: [{ type: "Invitation", id: "LIST" }],
    }),

    /**
     * Get invitations for a program (admin only)
     */
    getProgramInvitations: builder.query<
      ApiResponse<IInvitation[]>,
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page = 1, limit = 10 }) =>
        `/access-control/invitations?courseId=${courseId}&page=${page}&limit=${limit}`,
      providesTags: [{ type: "Invitation", id: "LIST" }],
    }),
  }),
});

export const {
  useGrantAccessMutation,
  useRevokeAccessMutation,
  useCreateInvitationMutation,
  useCreateBulkInvitationsMutation,
  useValidateInvitationQuery,
  useRedeemInvitationMutation,
  useGetProgramInvitationsQuery,
} = accessControlApi;

export default accessControlApi;
