/**
 * Enrollment API - RTK Query endpoints
 * Handles user enrollments, progress tracking, and access control
 */

import baseApi from "../baseApi";
import type {
  IEnrollment,
  IEnrollmentInput,
  IEnrollmentProgress,
  IAccessCheckResponse,
} from "@/types/course";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get user's enrollments
     */
    getMyEnrollments: builder.query<
      ApiResponse<IEnrollment[]>,
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
        return `/enrollments/user/my-enrollments${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: [{ type: "Enrollment", id: "MY_ENROLLMENTS" }],
    }),

    /**
     * Get enrollment details for a specific program
     */
    getEnrollmentDetails: builder.query<ApiResponse<IEnrollment>, string>({
      query: (courseId) => `/enrollments/${courseId}/details`,
      providesTags: (result, error, courseId) => [
        { type: "Enrollment", id: courseId },
      ],
    }),

    /**
     * Get enrollment by enrollment ID (for course materials page)
     */
    getEnrollmentById: builder.query<ApiResponse<IEnrollment>, string>({
      query: (enrollmentId) => `/enrollments/enrollment/${enrollmentId}`,
      providesTags: (result, error, enrollmentId) => {
        const tags: any[] = [
          { type: "Enrollment", id: enrollmentId },
          { type: "Enrollment", id: `enrollment-${enrollmentId}` },
        ];
        // Also provide the courseId-progress tag if we have the data
        // This ensures mutations that invalidate courseId-progress also refresh this query
        if (result?.data?.courseId && typeof result.data.courseId !== 'string' && (result.data.courseId as any)._id) {
          tags.push({ type: "Enrollment", id: `${(result.data.courseId as any)._id}-progress` });
        }
        return tags;
      },
    }),

    /**
     * Get user's progress in a program
     */
    getCourseProgress: builder.query<ApiResponse<IEnrollmentProgress>, string>({
      query: (courseId) => `/enrollments/${courseId}/progress`,
      providesTags: (result, error, courseId) => [
        { type: "Enrollment", id: `${courseId}-progress` },
      ],
    }),

    /**
     * Check user's access to a resource in a program
     */
    checkAccess: builder.query<
      ApiResponse<IAccessCheckResponse>,
      { courseId: string; resourceType?: 'material' | 'quiz' | 'all' }
    >({
      query: ({ courseId, resourceType = 'all' }) =>
        `/enrollments/${courseId}/check-access?resourceType=${resourceType}`,
      providesTags: (result, error, { courseId }) => [
        { type: "Enrollment", id: `${courseId}-access` },
      ],
    }),

    /**
     * Get all enrollments for a program (admin only)
     */
    getCourseEnrollments: builder.query<
      ApiResponse<IEnrollment[]>,
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page = 1, limit = 50 }) =>
        `/enrollments/course/${courseId}/enrollments?page=${page}&limit=${limit}`,
      providesTags: (result, error, { courseId }) => [
        { type: "Enrollment", id: `${courseId}-enrollments` },
      ],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Enroll user in a program
     */
    enrollInCourse: builder.mutation<ApiResponse<IEnrollment>, IEnrollmentInput>(
      {
        query: (enrollmentData) => ({
          url: "/enrollments/enroll",
          method: "POST",
          body: enrollmentData,
        }),
        invalidatesTags: [{ type: "Enrollment", id: "MY_ENROLLMENTS" }],
      }
    ),

    /**
     * Mark material as viewed
     */
    markMaterialViewed: builder.mutation<
      ApiResponse<any>,
      { courseId: string; materialId: string; enrollmentId?: string }
    >({
      query: ({ courseId, materialId }) => ({
        url: `/enrollments/${courseId}/materials/${materialId}/view`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { courseId, enrollmentId }) => {
        const tags: any[] = [{ type: "Enrollment", id: `${courseId}-progress` }];
        if (enrollmentId) {
          tags.push({ type: "Enrollment", id: enrollmentId });
        }
        return tags;
      },
    }),

    /**
     * Mark quiz as completed
     */
    markQuizCompleted: builder.mutation<
      ApiResponse<any>,
      { courseId: string; quizId: string; enrollmentId?: string }
    >({
      query: ({ courseId, quizId }) => ({
        url: `/enrollments/${courseId}/quizzes/${quizId}/complete`,
        method: "POST",
      }),
      invalidatesTags: (result, error, { courseId, enrollmentId }) => {
        const tags: any[] = [{ type: "Enrollment", id: `${courseId}-progress` }];
        if (enrollmentId) {
          tags.push({ type: "Enrollment", id: enrollmentId });
        }
        return tags;
      },
    }),

    /**
     * Cancel enrollment
     */
    cancelEnrollment: builder.mutation<ApiResponse<IEnrollment>, string>({
      query: (courseId) => ({
        url: `/enrollments/${courseId}/cancel`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Enrollment", id: "MY_ENROLLMENTS" }],
    }),

    /**
     * Approve enrollment (Admin only)
     */
    approveEnrollment: builder.mutation<ApiResponse<IEnrollment>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/approve/${enrollmentId}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: "Enrollment", id: enrollmentId },
        { type: "Enrollment", id: "MY_ENROLLMENTS" },
      ],
    }),

    /**
     * Reject enrollment (Admin only)
     */
    rejectEnrollment: builder.mutation<ApiResponse<IEnrollment>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/reject/${enrollmentId}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: "Enrollment", id: enrollmentId },
        { type: "Enrollment", id: "MY_ENROLLMENTS" },
      ],
    }),
  }),
});

export const {
  useGetMyEnrollmentsQuery,
  useGetEnrollmentDetailsQuery,
  useGetEnrollmentByIdQuery,
  useGetCourseProgressQuery,
  useCheckAccessQuery,
  useGetCourseEnrollmentsQuery,
  useEnrollInCourseMutation,
  useMarkMaterialViewedMutation,
  useMarkQuizCompletedMutation,
  useCancelEnrollmentMutation,
  // useBulkAssignUsersMutation,
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
} = enrollmentApi;

export default enrollmentApi;

