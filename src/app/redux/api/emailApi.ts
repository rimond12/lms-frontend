// ═════════════════════════════════════════════════════════════════════════════════
// 📧 Email Management - Redux RTK Query API
// ═════════════════════════════════════════════════════════════════════════════════

import { type Api, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import baseApi from './baseApi';

export interface ISendEmailPayload {
  subject: string;
  content: string;
  htmlContent?: string;
  recipientType: 'all' | 'custom' | 'specific' | 'filter';
  recipientEmails?: string[];
  memberFilters?: {
    membership?: 'M' | 'AM' | 'F'; // M=Member, AM=Affiliate Member, F=Fellow
    includeAll?: boolean;
  };
}

export interface IEmailResponse {
  success: boolean;
  message: string;
  data?: {
    emailId: string;
    totalRecipients: number;
    sentCount: number;
  };
}

export interface IMemberInfo {
  id: string;
  name: string;
  email: string;
  membershipId: string;
}

export interface IMemberGroup {
  label: string;
  icon: string;
  description: string;
  members: IMemberInfo[];
  count: number;
}

export interface IMembersByGroupResponse {
  success: boolean;
  data: {
    all: IMemberGroup;
    M: IMemberGroup;
    AM: IMemberGroup;
    F: IMemberGroup;
  };
}

export interface IEmailHistoryItem {
  _id: string;
  subject: string;
  status: 'sent' | 'pending' | 'failed';
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  sentAt: string;
  sentBy: string;
  category?: string;
}

export interface IEmailHistoryResponse {
  success: boolean;
  data: {
    data: IEmailHistoryItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface IEmailStatsResponse {
  success: boolean;
  data: {
    totalEmails: number;
    sentEmails: number;
    pendingEmails: number;
    failedEmails: number;
    totalRecipients: number;
    totalSent: number;
  };
}

export interface IRecipientsPreviewResponse {
  success: boolean;
  data: {
    count: number;
    recipients: string[];
    totalRecipients: number;
  };
}

export interface ITestEmailPayload {
  email: string;
  subject: string;
  message: string;
}

const emailApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Send bulk email
    sendBulkEmail: builder.mutation({
      query: (payload: ISendEmailPayload) => ({
        url: '/email/send',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Email'],
    }),

    // Send test email
    sendTestEmail: builder.mutation({
      query: (payload: ITestEmailPayload) => ({
        url: '/email/send-test',
        method: 'POST',
        body: payload,
      }),
    }),

    // Get email history
    getEmailHistory: builder.query({
      query: ({ page = 1, limit = 10, adminId }: any) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (adminId) params.append('adminId', adminId);
        return `/email/history?${params.toString()}`;
      },
      providesTags: ['Email'],
    }),

    // Get email details
    getEmailDetails: builder.query({
      query: (emailId: string) => `/email/${emailId}`,
      providesTags: ['Email'],
    }),

    // Get email statistics
    getEmailStats: builder.query({
      query: (adminId: string | undefined) => {
        const params = new URLSearchParams();
        if (adminId) params.append('adminId', adminId);
        return `/email/stats/overview${params.toString() ? '?' + params.toString() : ''}`;
      },
      providesTags: ['Email'],
    }),

    // Get recipients preview
    getRecipientsPreview: builder.mutation({
      query: (payload: any) => ({
        url: '/email/preview/recipients',
        method: 'POST',
        body: payload,
      }),
    }),

    // Get members by group
    getMembersByGroup: builder.query({
      query: () => ({
        url: '/email/members/groups',
        method: 'GET',
      }),
      providesTags: ['Email'],
    }),
  }),
});

export const {
  useSendBulkEmailMutation,
  useSendTestEmailMutation,
  useGetEmailHistoryQuery,
  useGetEmailDetailsQuery,
  useGetEmailStatsQuery,
  useGetRecipientsPreviewMutation,
  useGetMembersByGroupQuery,
} = emailApi;

export default emailApi;
