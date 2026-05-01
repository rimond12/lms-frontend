/**
 * BatchEnrollment API - RTK Query endpoints
 * Handles student enrollments in batches with payment tracking
 */

import baseApi from "../baseApi";
import { IBatch } from "./batchApi";

// Types
export interface IStudentInfo {
  name: string;
  email: string;
  phone: string;
  educationalInfo?: string;
  address?: string;
  additionalInfo?: Record<string, any>;
}

export interface IPaymentRecord {
  _id: string;
  installmentNumber: number;
  amount: number;
  bankTransactionId: string;
  proofImageUrl: string;
  paymentMethod?: string;
  paymentDate: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  submittedAt: string;
  /** ISO date string for when this installment is due */
  dueDate?: string;
  /** True if the due date has passed and payment is still pending */
  isOverdue?: boolean;
}

export interface IEnrollmentProgress {
  materialsViewed: number;
  totalMaterials: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  lastActivityDate?: string;
  certificateIssued: boolean;
  certificateId?: string;
}

export interface IBatchEnrollment {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    plainPassword?: string; // For admin visibility
  };
  batchId: string | IBatch;
  courseId: string | {
    _id: string;
    title: string;
    slug: string;
    bannerImage?: string;
  };
  studentInfo: IStudentInfo;
  selectedPlan: '1-plan' | '2-plan' | '3-plan';
  payments: IPaymentRecord[];
  totalPaid: number;
  totalDue: number;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'rejected';
  enrollmentStatus: 'pending_payment' | 'payment_approved' | 'active' | 'completed' | 'cancelled' | 'shifted';
  hasAccess: boolean;
  accessGrantedAt?: string;
  progress: IEnrollmentProgress;
  viewedMaterials: string[];
  completedQuizzes: string[];
  completedAssignments: string[];
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  shiftHistory: {
    fromBatchId: string;
    fromBatchName?: string;
    toBatchId: string;
    toBatchName?: string;
    shiftedAt: string;
    shiftedBy: string;
    reason?: string;
  }[];
  enrollmentNumber?: string;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;

  // --- Discount snapshot (set at enrollment time) ---
  /** ID of the discount tier applied (if any) */
  discountTierId?: string;
  /** Type of discount: 'percentage' | 'fixed' | 'none' */
  discountType?: 'percentage' | 'fixed' | 'none';
  /** Numeric value of the discount (e.g. 20 for 20%) */
  discountValue?: number;
  /** Admin-provided reason for the discount */
  discountReason?: string;
  /** How the discount is spread: 'all' = reduces total evenly, 'first-only' = deducted from first installment */
  discountScope?: 'all' | 'first-only';
  /** Original price before discount */
  originalPrice?: number;
  /** Computed discount amount in currency */
  discountAmount?: number;
  /** Effective price after discount (what the student pays) */
  effectivePrice?: number;
  /** True when a plan-based auto-discount was applied */
  planDiscountApplied?: boolean;

  // --- Access revocation (overdue installments) ---
  /** True when access was removed due to overdue installment */
  accessRevokedDueToOverdue?: boolean;
  /** When access was revoked */
  accessRevokedAt?: string;
  /** When the student requested access restoration */
  accessRestoreRequestedAt?: string;
}

export interface IEnrollInBatchRequest {
  batchId: string;
  selectedPlan: '1-plan' | '2-plan' | '3-plan';
  studentInfo: IStudentInfo;
}

export interface ISubmitPaymentRequest {
  installmentNumber: number;
  amount: number;
  bankTransactionId: string;
  proofImageUrl: string;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
}

export interface IPendingPayment {
  enrollmentId: string;
  enrollmentNumber: string;
  paymentId: string;
  student: {
    userId: string;
    name: string;
    email: string;
  };
  installmentNumber: number;
  amount: number;
  bankTransactionId: string;
  proofImageUrl: string;
  paymentMethod?: string;
  paymentDate: string;
  submittedAt: string;
  notes?: string;
  /** ISO date string of when this installment was due */
  dueDate?: string;
  /** True if the due date has passed and payment is still pending */
  isOverdue?: boolean;
}

export interface IAccessCheckResponse {
  hasAccess: boolean;
  reason: string;
  enrollmentStatus?: string;
  paymentStatus?: string;
  batchStatus?: string;
  batchStartDate?: string;
  enrollment?: IBatchEnrollment;
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

const batchEnrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== STUDENT ROUTES ====================

    /**
     * Enroll in a batch
     */
    enrollInBatch: builder.mutation<ApiResponse<IBatchEnrollment>, IEnrollInBatchRequest>({
      query: (data) => ({
        url: "/batch-enrollments/enroll",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "BatchEnrollment", id: "MY_ENROLLMENTS" },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Submit payment proof
     */
    submitPayment: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; data: ISubmitPaymentRequest }
    >({
      query: ({ enrollmentId, data }) => ({
        url: `/batch-enrollments/${enrollmentId}/payment`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "MY_ENROLLMENTS" },
      ],
    }),

    /**
     * Get my enrollments
     */
    getMyBatchEnrollments: builder.query<
      ApiResponse<IBatchEnrollment[]>,
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.status) params.append("status", filters.status);
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
        }
        const queryString = params.toString();
        return `/batch-enrollments/my-enrollments${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "BatchEnrollment", id: "MY_ENROLLMENTS" }],
    }),

    /**
     * Get enrollment by ID
     */
    getBatchEnrollmentById: builder.query<ApiResponse<IBatchEnrollment>, string>({
      query: (id) => `/batch-enrollments/${id}`,
      providesTags: (result, error, id) => [{ type: "BatchEnrollment", id }],
    }),

    /**
     * Check access to course
     */
    checkBatchAccess: builder.query<ApiResponse<IAccessCheckResponse>, string>({
      query: (courseId) => `/batch-enrollments/course/${courseId}/check-access`,
      providesTags: (result, error, courseId) => [
        { type: "BatchEnrollment", id: `access-${courseId}` },
      ],
    }),

    /**
     * Mark material as viewed
     */
    markBatchMaterialViewed: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; materialId: string }
    >({
      query: ({ enrollmentId, materialId }) => ({
        url: `/batch-enrollments/${enrollmentId}/materials/${materialId}/view`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: `progress-map-${enrollmentId}` },
      ],
    }),

    /**
     * Mark quiz as completed
     */
    markBatchQuizCompleted: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; quizId: string }
    >({
      query: ({ enrollmentId, quizId }) => ({
        url: `/batch-enrollments/${enrollmentId}/quizzes/${quizId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: `progress-map-${enrollmentId}` },
      ],
    }),

    /**
     * Get progress map
     */
    getProgressMap: builder.query<
      ApiResponse<import('../../../../types/course').IProgressMap>,
      string
    >({
      query: (enrollmentId) => `/batch-enrollments/${enrollmentId}/progress-map`,
      providesTags: (result, error, enrollmentId) => [
        { type: "BatchEnrollment", id: `progress-map-${enrollmentId}` },
      ],
    }),

    // ==================== ADMIN ROUTES ====================

    /**
     * Get batch enrollments (admin)
     */
    getAllBatchEnrollments: builder.query<
      ApiResponse<IBatchEnrollment[]>,
      {
        paymentStatus?: string;
        enrollmentStatus?: string;
        searchTerm?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
        if (filters.enrollmentStatus) params.append("enrollmentStatus", filters.enrollmentStatus);
        if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
        if (filters.page) params.append("page", String(filters.page));
        if (filters.limit) params.append("limit", String(filters.limit));
        const queryString = params.toString();
        return `/batch-enrollments/admin/all-enrollments${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result) => [
        { type: "BatchEnrollment", id: "LIST" },
      ],
    }),

    /**
     * Get batch enrollments (admin)
     */
    getBatchEnrollments: builder.query<
      ApiResponse<IBatchEnrollment[]>,
      {
        batchId: string;
        paymentStatus?: string;
        enrollmentStatus?: string;
        searchTerm?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ batchId, ...filters }) => {
        const params = new URLSearchParams();
        if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
        if (filters.enrollmentStatus) params.append("enrollmentStatus", filters.enrollmentStatus);
        if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
        if (filters.page) params.append("page", String(filters.page));
        if (filters.limit) params.append("limit", String(filters.limit));
        const queryString = params.toString();
        return `/batch-enrollments/batch/${batchId}/students${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: (result, error, { batchId }) => [
        { type: "BatchEnrollment", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Get pending payments for a batch
     */
    getPendingPayments: builder.query<ApiResponse<IPendingPayment[]>, string>({
      query: (batchId) => `/batch-enrollments/batch/${batchId}/pending-payments`,
      providesTags: (result, error, batchId) => [
        { type: "BatchEnrollment", id: `pending-${batchId}` },
      ],
    }),

    /**
     * Approve payment
     */
    approvePayment: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; paymentId: string; adminNotes?: string }
    >({
      query: ({ enrollmentId, paymentId, adminNotes }) => ({
        url: `/batch-enrollments/${enrollmentId}/payments/${paymentId}/approve`,
        method: "PUT",
        body: { adminNotes },
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
        { type: "BatchEnrollment", id: "MY_ENROLLMENTS" },
      ],
    }),

    /**
     * Reject payment
     */
    rejectPayment: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; paymentId: string; rejectionReason: string; adminNotes?: string }
    >({
      query: ({ enrollmentId, paymentId, rejectionReason, adminNotes }) => ({
        url: `/batch-enrollments/${enrollmentId}/payments/${paymentId}/reject`,
        method: "PUT",
        body: { rejectionReason, adminNotes },
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
        { type: "BatchEnrollment", id: "MY_ENROLLMENTS" },
      ],
    }),

    /**
     * Shift student to another batch
     */
    shiftToBatch: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; newBatchId: string; reason?: string }
    >({
      query: ({ enrollmentId, newBatchId, reason }) => ({
        url: `/batch-enrollments/${enrollmentId}/shift-batch`,
        method: "PUT",
        body: { newBatchId, reason },
      }),
      invalidatesTags: [
        { type: "BatchEnrollment", id: "LIST" },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Remove from batch
     */
    removeFromBatch: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      { enrollmentId: string; reason?: string }
    >({
      query: ({ enrollmentId, reason }) => ({
        url: `/batch-enrollments/${enrollmentId}`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: [
        { type: "BatchEnrollment", id: "LIST" },
        { type: "Batch", id: "LIST" },
      ],
    }),

    /**
     * Enhanced: Manually add student to batch
     * - Supports existing user selection OR new user creation
     * - Supports flexible payment options
     */
    addStudentToBatch: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      {
        // Either select existing user OR create new one
        userId?: string;
        createNewUser?: boolean;
        newUserData?: {
          name: string;
          email: string;
          phone: string;
          password: string;
        };
        batchId: string;
        // Payment options
        skipPayment?: boolean;
        paymentInfo?: {
          paidAmount: number;
          dueAmount?: number;
          paymentMethod?: string;
          transactionId?: string;
          paymentProofUrl?: string;
          notes?: string;
        };
        selectedPlan?: '1-plan' | '2-plan' | '3-plan';
        // Discount fields
        discountTierId?: string;
        discountType?: 'none' | 'percentage' | 'fixed';
        discountValue?: number;
        discountScope?: 'all' | 'first-only';
        discountReason?: string;
      }
    >({
      query: (data) => ({
        url: "/batch-enrollments/admin/add-to-batch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "BatchEnrollment", id: "LIST" },
        { type: "Batch", id: "LIST" },
        { type: "User" }, // Invalidate users if new user created
      ],
    }),

    /**
     * Bulk add students to batch (Excel Import)
     */
    bulkAddStudents: builder.mutation<
       ApiResponse<{
          successful: any[];
          failed: any[];
          totalProcessed: number;
          totalSuccess: number;
          totalFailed: number;
       }>,
       {
         batchId: string;
         students: { 
           name: string; 
           email: string; 
           phone: string; 
           studentId?: string;
           paidAmount?: number;
           paymentMethod?: string;
           transactionId?: string;
           // Discount fields (per-student, aligned with server IBulkEnrollmentRequest)
           selectedPlan?: '1-plan' | '2-plan' | '3-plan';
           discountTierId?: string;
           discountType?: 'none' | 'percentage' | 'fixed';
           discountValue?: number;
           discountReason?: string;
           discountScope?: 'all' | 'first-only';
         }[];
         skipPayment: boolean;
       }
    >({
      query: (data) => ({
        url: "/batch-enrollments/admin/bulk-add-to-batch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "BatchEnrollment", id: "LIST" },
        { type: "Batch", id: "LIST" },
        { type: "User" },
      ],
    }),

    // Admin: Set due date for a specific installment
    setInstallmentDueDate: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      {
        enrollmentId: string;
        installmentNumber: number;
        dueDate: string; // 'YYYY-MM-DD'
      }
    >({
      query: ({ enrollmentId, installmentNumber, dueDate }) => ({
        url: `/batch-enrollments/${enrollmentId}/installments/${installmentNumber}/due-date`,
        method: "PUT",
        body: { dueDate },
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
      ],
    }),

    // Admin: Edit an existing payment record
    editPayment: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      {
        enrollmentId: string;
        paymentId: string;
        data: {
          amount?: number;
          paymentMethod?: string;
          transactionId?: string;
          notes?: string;
        };
      }
    >({
      query: ({ enrollmentId, paymentId, data }) => ({
        url: `/batch-enrollments/${enrollmentId}/payments/${paymentId}/edit`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
      ],
    }),

    // Admin: Delete a payment record
    deletePayment: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      {
        enrollmentId: string;
        paymentId: string;
      }
    >({
      query: ({ enrollmentId, paymentId }) => ({
        url: `/batch-enrollments/${enrollmentId}/payments/${paymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
      ],
    }),

    // Admin: Update enrollment (student info, payment, password, access)
    updateEnrollmentByAdmin: builder.mutation<
      ApiResponse<IBatchEnrollment>,
      {
        enrollmentId: string;
        data: {
          studentInfo?: {
            name?: string;
            email?: string;
            phone?: string;
            address?: string;
            educationalInfo?: string;
          };
          enrollmentNumber?: string;
          selectedPlan?: '1-plan' | '2-plan' | '3-plan';
          addPayment?: {
            amount: number;
            paymentMethod: string;
            transactionId?: string;
            notes?: string;
          };
          adjustDiscount?: {
            discountType: 'none' | 'percentage' | 'fixed';
            discountValue?: number;
            discountReason?: string;
            discountScope?: 'all' | 'first-only';
          };
          overridePrice?: number;
          newPassword?: string;
          manualAccessGrant?: boolean;
        };
      }
    >({
      query: ({ enrollmentId, data }) => ({
        url: `/batch-enrollments/${enrollmentId}/admin-update`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: "BatchEnrollment", id: enrollmentId },
        { type: "BatchEnrollment", id: "LIST" },
        { type: "User" },
      ],
    }),
  }),
});

export const {
  // Student
  useEnrollInBatchMutation,
  useSubmitPaymentMutation,
  useGetMyBatchEnrollmentsQuery,
  useGetBatchEnrollmentByIdQuery,
  useCheckBatchAccessQuery,
  useMarkBatchMaterialViewedMutation,
  useMarkBatchQuizCompletedMutation,
  useGetProgressMapQuery,
  // Admin
  useGetBatchEnrollmentsQuery,
  useGetAllBatchEnrollmentsQuery,
  useGetPendingPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useShiftToBatchMutation,
  useRemoveFromBatchMutation,
  useAddStudentToBatchMutation,
  useBulkAddStudentsMutation,
  useUpdateEnrollmentByAdminMutation,
  useEditPaymentMutation,
  useDeletePaymentMutation,
  useSetInstallmentDueDateMutation,
} = batchEnrollmentApi;

export default batchEnrollmentApi;

