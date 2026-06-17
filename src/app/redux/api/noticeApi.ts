// ═════════════════════════════════════════════════════════════════════════════════
// 📢 Notice Board API - Redux RTK Query Slice
// ═════════════════════════════════════════════════════════════════════════════════

import baseApi from "./baseApi";

export interface INotice {
  _id: string;
  title: string;
  content: string;
  description?: string;   // Kept for backward compatibility
  image?: string;         // Kept for backward compatibility
  recipientType?: string; // Kept for backward compatibility
  attachment?: string;
  attachments?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INoticeResponse {
  success: boolean;
  data: INotice;
  message: string;
}

export interface INoticesListResponse {
  success: boolean;
  data: INotice[];
  message: string;
}

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notices (for admin, fetches active and inactive notices)
    getAllNotices: builder.query<INoticesListResponse, void>({
      query: () => {
        console.log('📋 [Redux] Fetching all notices (admin view)');
        return '/notices?role=admin';
      },
      providesTags: ['Notice'],
    }),

    // Get active notices (for public user view)
    getActiveNotices: builder.query<INoticesListResponse, void>({
      query: () => {
        console.log('📬 [Redux] Fetching active notices');
        return '/notices';
      },
      providesTags: ['Notice'],
    }),

    // Get user notices (for backward compatibility in user profiles/notifications)
    getUserNotices: builder.query<
      {
        success: boolean;
        data: {
          notices: INotice[];
          total: number;
        };
        message: string;
      },
      { page?: number; limit?: number } | void
    >({
      query: () => {
        console.log('📬 [Redux] Fetching user notices compatibility wrapper');
        return '/notices';
      },
      transformResponse: (response: INoticesListResponse) => {
        const notices = (response?.data || []).map(notice => ({
          ...notice,
          recipientType: "ALL_USERS", // Default to "ALL_USERS" for UI badge compatibility
        }));
        return {
          success: response?.success ?? true,
          message: response?.message ?? "",
          data: {
            notices,
            total: notices.length,
          },
        };
      },
      providesTags: ['Notice'],
    }),

    // Create a new notice (Admin Only)
    createNotice: builder.mutation<
      INoticeResponse,
      {
        title: string;
        content: string;
        attachment?: string;
        attachments?: string[];
        isActive: boolean;
      }
    >({
      query: (payload) => {
        console.log('📤 [Redux] Creating notice:', payload.title);
        return {
          url: '/notices',
          method: 'POST',
          body: payload,
        };
      },
      invalidatesTags: ['Notice'],
    }),

    // Update an existing notice (Admin Only)
    updateNotice: builder.mutation<
      INoticeResponse,
      {
        noticeId: string;
        payload: {
          title?: string;
          content?: string;
          attachment?: string;
          attachments?: string[];
          isActive?: boolean;
        };
      }
    >({
      query: ({ noticeId, payload }) => {
        console.log('📝 [Redux] Updating notice:', noticeId, payload);
        return {
          url: `/notices/${noticeId}`,
          method: 'PUT',
          body: payload,
        };
      },
      invalidatesTags: ['Notice'],
    }),

    // Upload Notice Attachment (Admin Only)
    uploadNoticeAttachment: builder.mutation<
      { success: boolean; data: { attachmentPath: string }; message: string },
      FormData
    >({
      query: (formData) => {
        console.log('📤 [Redux] Uploading notice attachment');
        return {
          url: '/notices/upload-attachment',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // Delete a notice (Admin Only)
    deleteNotice: builder.mutation<INoticeResponse, string>({
      query: (noticeId) => {
        console.log('🗑️ [Redux] Deleting notice:', noticeId);
        return {
          url: `/notices/${noticeId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['Notice'],
    }),
  }),
});

export const {
  useGetAllNoticesQuery,
  useGetActiveNoticesQuery,
  useGetUserNoticesQuery, // Re-exported for backward compatibility
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useUploadNoticeAttachmentMutation,
} = noticeApi;
