// ═════════════════════════════════════════════════════════════════════════════════
// 📢 Notice Board API - Redux RTK Query Slice
// ═════════════════════════════════════════════════════════════════════════════════

import baseApi from "./baseApi";

export interface IRecipientUser {
  userId: string;
  name: string;
  email: string;
}

export interface INotice {
  _id: string;
  title: string;
  description?: string;
  content: string;

  image?: string;
  recipientType: 'ALL_USERS' | 'BATCH' | 'INDIVIDUAL';
  targetBatches?: string[];
  recipientUsers?: IRecipientUser[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sendEmail: boolean;
  totalRecipients: number;
  emailSentCount: number;
  emailFailedCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface INoticeResponse {
  success: boolean;
  data: INotice;
  message: string;
}

export interface INoticesListResponse {
  success: boolean;
  data: {
    notices: INotice[];
    total: number;
    page: number;
    limit: number;
  };
  message: string;
}

export interface IRecipientsPreviewResponse {
  success: boolean;
  data: IRecipientUser[];
  message: string;
}

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new notice (DRAFT)
    createNotice: builder.mutation<
      INoticeResponse,
      {
        title: string;
        description?: string;
        content: string;
        recipientType: string;
        targetBatches?: string[];
        recipientUsers?: IRecipientUser[];
        sendEmail: boolean;
        emailTemplate?: string;
        image?: string;
      }
    >({
      query: (payload) => {
        console.log('📤 [Redux] Creating notice:', payload.title);
        return {
          url: '/notices/create',
          method: 'POST',
          body: payload,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ [Redux] Notice created:', data.data._id);
          dispatch(baseApi.util.invalidateTags(['Notice']));
        } catch (error) {
          console.error('❌ [Redux] Create error:', error);
        }
      },
    }),

    // Update an existing notice (only DRAFT)
    updateNotice: builder.mutation<
      INoticeResponse,
      {
        noticeId: string;
        payload: {
          title?: string;
          description?: string;
          content?: string;
          recipientType?: string;
          targetBatches?: string[];
          recipientUsers?: IRecipientUser[];
          sendEmail?: boolean;
          emailTemplate?: string;
          image?: string;
        };
      }
    >({
      query: ({ noticeId, payload }) => {
        console.log('📝 [Redux] Updating notice:', noticeId);
        return {
          url: `/notices/${noticeId}/update`,
          method: 'PUT',
          body: payload,
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ [Redux] Notice updated:', data.data._id);
          dispatch(baseApi.util.invalidateTags(['Notice']));
        } catch (error) {
          console.error('❌ [Redux] Update error:', error);
        }
      },
    }),

    // Publish a notice (DRAFT -> PUBLISHED)
    publishNotice: builder.mutation<
      INoticeResponse,
      {
        noticeId: string;
        sendEmail?: boolean;
      }
    >({
      query: ({ noticeId, sendEmail }) => {
        console.log('🚀 [Redux] Publishing notice:', noticeId, { sendEmail });
        return {
          url: `/notices/${noticeId}/publish`,
          method: 'POST',
          body: { sendEmail },
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ [Redux] Notice published:', data.data._id);
          dispatch(baseApi.util.invalidateTags(['Notice']));
        } catch (error) {
          console.error('❌ [Redux] Publish error:', error);
        }
      },
    }),

    // Get all notices (admin)
    getAllNotices: builder.query<
      INoticesListResponse,
      {
        page?: number;
        limit?: number;
        status?: string;
      }
    >({
      query: ({ page = 1, limit = 10, status }) => {
        console.log('📋 [Redux] Fetching all notices:', { page, limit, status });
        let url = `/notices/admin/all?page=${page}&limit=${limit}`;
        if (status) {
          url += `&status=${status}`;
        }
        return url;
      },
      providesTags: ['Notice'],
    }),

    // Get single notice details
    getNoticeById: builder.query<INoticeResponse, string>({
      query: (noticeId) => {
        console.log('👁️ [Redux] Fetching notice details:', noticeId);
        return `/notices/admin/${noticeId}`;
      },
      providesTags: ['Notice'],
    }),

    // Get recipients preview
    getRecipientsPreview: builder.mutation<
      IRecipientsPreviewResponse,
      {
        recipientType: string;
        targetBatches?: string[];
        recipientUsers?: IRecipientUser[];
      }
    >({
      query: (payload) => {
        console.log('👥 [Redux] Fetching recipients preview:', payload.recipientType);
        return {
          url: '/notices/recipients-preview',
          method: 'POST',
          body: payload,
        };
      },
    }),

    // Delete a notice (only DRAFT)
    deleteNotice: builder.mutation<INoticeResponse, string>({
      query: (noticeId) => {
        console.log('🗑️ [Redux] Deleting notice:', noticeId);
        return {
          url: `/notices/${noticeId}/delete`,
          method: 'DELETE',
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('✅ [Redux] Notice deleted:', arg);
          dispatch(baseApi.util.invalidateTags(['Notice']));
        } catch (error) {
          console.error('❌ [Redux] Delete error:', error);
        }
      },
    }),

    // Get user's notices
    getUserNotices: builder.query<
      INoticesListResponse,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page = 1, limit = 10 }) => {
        console.log('📬 [Redux] Fetching user notices:', { page, limit });
        return `/notices/user/my-notices?page=${page}&limit=${limit}`;
      },
      providesTags: ['Notice'],
    }),
  }),
});

export const {
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  usePublishNoticeMutation,
  useGetAllNoticesQuery,
  useGetNoticeByIdQuery,
  useGetRecipientsPreviewMutation,
  useDeleteNoticeMutation,
  useGetUserNoticesQuery,
} = noticeApi;
