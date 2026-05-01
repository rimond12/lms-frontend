/**
 * Batch API - RTK Query endpoints
 * Handles batch management for admin dashboard
 */

import baseApi from "../baseApi";

// Types

/** A named discount tier admin can set up (e.g. "Early Bird 10%") */
export interface IDiscountTier {
  _id?: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  description?: string;
  isActive: boolean;
}

/** Per-plan discount (auto-applied when a student picks a specific plan) */
export interface IPlanDiscount {
  planType: '1-plan' | '2-plan' | '3-plan';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountScope: 'all' | 'first-only';
  isActive: boolean;
  description?: string;
}

/** Policy that controls automatic access revocation for overdue installments */
export interface IInstallmentRevocationPolicy {
  enabled: boolean;
  gracePeriodDays: number;
  notifyBeforeDays?: number;
}

export interface IInstallmentPlan {
  planType: '1-plan' | '2-plan' | '3-plan';
  label: string;
  numberOfPayments: number;
  amountPerInstallment: number;
  totalAmount: number;
  installments: {
    installmentNumber: number;
    amount: number;
    label: string;
  }[];
}

export interface IBatch {
  _id: string;
  batchName: string;
  batchNumber: string;
  courseId: string | {
    _id: string;
    title: string;
    slug: string;
    bannerImage?: string;
  };
  startDate: string;
  endDate?: string;
  enrollmentDeadline?: string;
  status: 'upcoming' | 'running' | 'completed' | 'cancelled';
  autoStart: boolean;
  maxStudents?: number;
  currentStudentCount: number;
  totalPrice: number;
  currency: string;
  installmentPlans: {
    onePlan: { enabled: boolean };
    twoPlan: { enabled: boolean };
    threePlan: { enabled: boolean };
  };
  installmentOptions?: IInstallmentPlan[];
  /** Admin-defined named discount tiers for this batch */
  discountTiers?: IDiscountTier[];
  /** Per-plan discounts applied automatically at enrollment */
  planDiscounts?: IPlanDiscount[];
  /** Installment revocation policy for overdue payments */
  installmentRevocationPolicy?: IInstallmentRevocationPolicy;
  description?: string;
  progressionType?: 'free' | 'sequential';
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBatchRequest {
  batchName: string;
  batchNumber?: string;
  courseId: string;
  startDate: string;
  endDate?: string;
  enrollmentDeadline?: string;
  autoStart?: boolean;
  maxStudents?: number;
  totalPrice: number;
  currency?: string;
  installmentPlans: {
    onePlan: boolean;
    twoPlan: boolean;
    threePlan: boolean;
  };
  description?: string;
  progressionType?: 'free' | 'sequential';
  discountTiers?: IDiscountTier[];
  planDiscounts?: IPlanDiscount[];
  installmentRevocationPolicy?: IInstallmentRevocationPolicy;
}

export interface IUpdateBatchRequest {
  batchName?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  autoStart?: boolean;
  maxStudents?: number;
  totalPrice?: number;
  currency?: string;
  installmentPlans?: {
    onePlan?: boolean;
    twoPlan?: boolean;
    threePlan?: boolean;
  };
  description?: string;
  progressionType?: 'free' | 'sequential';
  status?: 'upcoming' | 'running' | 'completed' | 'cancelled';
  isActive?: boolean;
  discountTiers?: IDiscountTier[];
  planDiscounts?: IPlanDiscount[];
  installmentRevocationPolicy?: IInstallmentRevocationPolicy;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const batchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get all batches (admin)
     */
    getAllBatches: builder.query<
      ApiResponse<IBatch[]>,
      { 
        courseId?: string; 
        status?: string; 
        isActive?: boolean;
        searchTerm?: string;
        page?: number; 
        limit?: number;
        sort?: string;
      } | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.courseId) params.append("courseId", filters.courseId);
          if (filters.status) params.append("status", filters.status);
          if (filters.isActive !== undefined) params.append("isActive", String(filters.isActive));
          if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
          if (filters.sort) params.append("sort", filters.sort);
        }
        const queryString = params.toString();
        return `/batches${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "Batch", id: "LIST" }],
    }),

    /**
     * Get batch by ID
     */
    getBatchById: builder.query<ApiResponse<IBatch>, string>({
      query: (id) => `/batches/${id}`,
      providesTags: (result, error, id) => [{ type: "Batch", id }],
    }),

    /**
     * Get batches by course (admin)
     */
    getBatchesByCourse: builder.query<
      ApiResponse<IBatch[]>,
      { courseId: string; includeInactive?: boolean }
    >({
      query: ({ courseId, includeInactive }) =>
        `/batches/course/${courseId}${includeInactive ? '?includeInactive=true' : ''}`,
      providesTags: (result, error, { courseId }) => [
        { type: "Batch", id: `course-${courseId}` },
      ],
    }),

    /**
     * Get enrollable batches for a course (public)
     */
    getEnrollableBatches: builder.query<ApiResponse<IBatch[]>, string>({
      query: (courseId) => `/batches/course/${courseId}/enrollable`,
      providesTags: (result, error, courseId) => [
        { type: "Batch", id: `enrollable-${courseId}` },
      ],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Create batch
     */
    createBatch: builder.mutation<ApiResponse<IBatch>, ICreateBatchRequest>({
      query: (data) => ({
        url: "/batches",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Batch", id: "LIST" }],
    }),

    /**
     * Update batch
     */
    updateBatch: builder.mutation<
      ApiResponse<IBatch>,
      { id: string; data: IUpdateBatchRequest }
    >({
      query: ({ id, data }) => ({
        url: `/batches/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Start batch manually
     */
    startBatch: builder.mutation<ApiResponse<IBatch>, string>({
      query: (id) => ({
        url: `/batches/${id}/start`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
        { type: "BatchEnrollment", id: "LIST" },
      ],
    }),

    /**
     * Complete batch
     */
    completeBatch: builder.mutation<ApiResponse<IBatch>, string>({
      query: (id) => ({
        url: `/batches/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Cancel batch
     */
    cancelBatch: builder.mutation<ApiResponse<IBatch>, string>({
      query: (id) => ({
        url: `/batches/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Reactivate batch (Undo Cancel)
     */
    reactivateBatch: builder.mutation<ApiResponse<IBatch>, string>({
      query: (id) => ({
        url: `/batches/${id}/reactivate`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Batch", id },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Delete batch
     */
    deleteBatch: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/batches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Batch", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllBatchesQuery,
  useGetBatchByIdQuery,
  useGetBatchesByCourseQuery,
  useGetEnrollableBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useStartBatchMutation,
  useCompleteBatchMutation,
  useCancelBatchMutation,
  useReactivateBatchMutation,
  useDeleteBatchMutation,
} = batchApi;

export default batchApi;
