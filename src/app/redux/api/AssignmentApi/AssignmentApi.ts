/**
 * Assignment API - RTK Query endpoints
 * Handles Assignment CRUD, submissions, and grading
 */

import baseApi from "../baseApi";
import type {
  IAssignment,
  ICreateAssignmentRequest,
  IUpdateAssignmentRequest,
  IAssignmentSubmission,
  IGradeSubmissionRequest,
  IAssignmentStats,
  IGetAssignmentsQuery,
  IGetSubmissionsQuery,
} from "./types";

const AssignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ASSIGNMENT QUERIES ====================

    /**
     * Get all assignments with filters (Admin)
     */
    getAssignments: builder.query<
      { data: IAssignment[]; meta: any },
      IGetAssignmentsQuery | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.courseId) params.append("courseId", filters.courseId);
          if (filters.moduleId) params.append("moduleId", filters.moduleId);
          if (filters.batchId) params.append("batchId", filters.batchId);
          if (filters.isPublished !== undefined)
            params.append("isPublished", String(filters.isPublished));
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
        }
        const queryString = params.toString();
        return `/assignments${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: any) => ({
        data: response.data || [],
        meta: response.meta || { total: 0, totalPages: 1 },
      }),
      providesTags: ["Assignment"],
    }),

    /**
     * Get assignment by ID
     */
    getAssignmentById: builder.query<IAssignment, string>({
      query: (id) => `/assignments/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),

    /**
     * Get assignments for a course (Admin)
     */
    getAssignmentsByCourse: builder.query<
      IAssignment[],
      { courseId: string; includeUnpublished?: boolean }
    >({
      query: ({ courseId, includeUnpublished }) =>
        `/assignments/course/${courseId}${includeUnpublished ? "?includeUnpublished=true" : ""}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, { courseId }) => [
        { type: "Assignment", id: `course-${courseId}` },
      ],
    }),

    /**
     * Get assignments for a batch (Admin)
     */
    getAssignmentsForBatch: builder.query<IAssignment[], string>({
      query: (batchId) => `/assignments/batch/${batchId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, batchId) => [
        { type: "Assignment", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Get assignments for student (based on enrollment)
     */
    getAssignmentsForStudent: builder.query<
      IAssignment[],
      { courseId: string; batchId: string }
    >({
      query: ({ courseId, batchId }) =>
        `/assignments/student/course/${courseId}/batch/${batchId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, { courseId, batchId }) => [
        { type: "Assignment", id: `student-${courseId}-${batchId}` },
      ],
    }),

    /**
     * Get upcoming assignments for batch
     */
    getUpcomingAssignments: builder.query<
      IAssignment[],
      { batchId: string; days?: number }
    >({
      query: ({ batchId, days = 7 }) =>
        `/assignments/batch/${batchId}/upcoming?days=${days}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["Assignment"],
    }),

    /**
     * Get overdue assignments for batch
     */
    getOverdueAssignments: builder.query<IAssignment[], string>({
      query: (batchId) => `/assignments/batch/${batchId}/overdue`,
      transformResponse: (response: any) => response.data,
      providesTags: ["Assignment"],
    }),

    // ==================== ASSIGNMENT MUTATIONS ====================

    /**
     * Create new assignment (Admin)
     */
    createAssignment: builder.mutation<IAssignment, ICreateAssignmentRequest>({
      query: (payload) => ({
        url: "/assignments",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Assignment"],
    }),

    /**
     * Update assignment (Admin)
     */
    updateAssignment: builder.mutation<
      IAssignment,
      { id: string } & IUpdateAssignmentRequest
    >({
      query: ({ id, ...patch }) => ({
        url: `/assignments/${id}`,
        method: "PUT",
        body: patch,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Assignment", id }],
    }),

    /**
     * Delete assignment (Admin)
     */
    deleteAssignment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/assignments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignment"],
    }),

    /**
     * Publish assignment (Admin)
     */
    publishAssignment: builder.mutation<IAssignment, string>({
      query: (id) => ({
        url: `/assignments/${id}/publish`,
        method: "POST",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),

    /**
     * Unpublish assignment (Admin)
     */
    unpublishAssignment: builder.mutation<IAssignment, string>({
      query: (id) => ({
        url: `/assignments/${id}/unpublish`,
        method: "POST",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, id) => [{ type: "Assignment", id }],
    }),

    /**
     * Upload reference files to assignment (Admin)
     */
    uploadReferenceFiles: builder.mutation<
      IAssignment,
      { assignmentId: string; files: FormData }
    >({
      query: ({ assignmentId, files }) => ({
        url: `/assignments/${assignmentId}/reference-files`,
        method: "POST",
        body: files,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "Assignment", id: assignmentId },
      ],
    }),

    /**
     * Delete reference file from assignment (Admin)
     */
    deleteReferenceFile: builder.mutation<
      IAssignment,
      { assignmentId: string; fileIndex: number }
    >({
      query: ({ assignmentId, fileIndex }) => ({
        url: `/assignments/${assignmentId}/reference-files/${fileIndex}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: "Assignment", id: assignmentId },
      ],
    }),

    // ==================== SUBMISSION QUERIES ====================


    /**
     * Get all submissions with filters (Admin)
     */
    getSubmissions: builder.query<
      { data: IAssignmentSubmission[]; meta: any },
      IGetSubmissionsQuery | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.assignmentId)
            params.append("assignmentId", filters.assignmentId);
          if (filters.studentId) params.append("studentId", filters.studentId);
          if (filters.batchId) params.append("batchId", filters.batchId);
          if (filters.courseId) params.append("courseId", filters.courseId);
          if (filters.status) params.append("status", filters.status);
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
        }
        const queryString = params.toString();
        return `/assignment-submissions${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: any) => ({
        data: response.data || [],
        meta: response.meta || { total: 0, totalPages: 1 },
      }),
      providesTags: ["AssignmentSubmission"],
    }),

    /**
     * Get submission by ID
     */
    getSubmissionById: builder.query<IAssignmentSubmission, string>({
      query: (id) => `/assignment-submissions/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [
        { type: "AssignmentSubmission", id },
      ],
    }),

    /**
     * Get student's own submissions
     */
    getMySubmissions: builder.query<
      { data: IAssignmentSubmission[]; meta: any },
      { courseId?: string; batchId?: string; status?: string } | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters) {
          if (filters.courseId) params.append("courseId", filters.courseId);
          if (filters.batchId) params.append("batchId", filters.batchId);
          if (filters.status) params.append("status", filters.status);
        }
        const queryString = params.toString();
        return `/assignment-submissions/my-submissions${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: any) => ({
        data: response.data || [],
        meta: response.meta || { total: 0, totalPages: 1 },
      }),
      providesTags: ["AssignmentSubmission"],
    }),

    /**
     * Get student's latest submission for an assignment
     */
    getMyLatestSubmission: builder.query<
      IAssignmentSubmission | null,
      { assignmentId: string; batchId?: string }
    >({
      query: ({ assignmentId, batchId }) => {
        const url = `/assignment-submissions/my-submission/${assignmentId}`;
        return batchId ? `${url}?batchId=${batchId}` : url;
      },
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, { assignmentId }) => [
        { type: "AssignmentSubmission", id: `my-${assignmentId}` },
      ],
    }),

    /**
     * Check if student has submitted assignment
     */
    checkSubmitted: builder.query<{ hasSubmitted: boolean }, string>({
      query: (assignmentId) =>
        `/assignment-submissions/check/${assignmentId}`,
      transformResponse: (response: any) => response.data,
    }),

    /**
     * Get assignment statistics for a batch (Admin)
     */
    getAssignmentStats: builder.query<
      IAssignmentStats,
      { assignmentId: string; batchId: string }
    >({
      query: ({ assignmentId, batchId }) =>
        `/assignment-submissions/stats/${assignmentId}/batch/${batchId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, { assignmentId, batchId }) => [
        { type: "AssignmentSubmission", id: `stats-${assignmentId}-${batchId}` },
      ],
    }),

    // ==================== SUBMISSION MUTATIONS ====================

    /**
     * Submit assignment (Student)
     * Note: For file uploads, use FormData
     */
    submitAssignment: builder.mutation<IAssignmentSubmission, FormData>({
      query: (formData) => ({
        url: "/assignment-submissions/submit",
        method: "POST",
        body: formData,
        // Don't set Content-Type, let browser set it for FormData
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["AssignmentSubmission", "Assignment"],
    }),

    /**
     * Grade submission (Admin)
     */
    gradeSubmission: builder.mutation<
      IAssignmentSubmission,
      { submissionId: string } & IGradeSubmissionRequest
    >({
      query: ({ submissionId, ...gradeData }) => ({
        url: `/assignment-submissions/${submissionId}/grade`,
        method: "PUT",
        body: gradeData,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { submissionId }) => [
        { type: "AssignmentSubmission", id: submissionId },
        "AssignmentSubmission",
      ],
    }),

    /**
     * Return submission for resubmission (Admin)
     */
    returnForResubmission: builder.mutation<
      IAssignmentSubmission,
      { submissionId: string; feedback: string }
    >({
      query: ({ submissionId, feedback }) => ({
        url: `/assignment-submissions/${submissionId}/return`,
        method: "POST",
        body: { feedback },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { submissionId }) => [
        { type: "AssignmentSubmission", id: submissionId },
        "AssignmentSubmission",
      ],
    }),
  }),
});

// Export hooks
export const {
  // Assignment Queries
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useGetAssignmentsByCourseQuery,
  useGetAssignmentsForBatchQuery,
  useGetAssignmentsForStudentQuery,
  useGetUpcomingAssignmentsQuery,
  useGetOverdueAssignmentsQuery,

  // Assignment Mutations
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  usePublishAssignmentMutation,
  useUnpublishAssignmentMutation,
  useUploadReferenceFilesMutation,
  useDeleteReferenceFileMutation,

  // Submission Queries
  useGetSubmissionsQuery,
  useGetSubmissionByIdQuery,
  useGetMySubmissionsQuery,
  useGetMyLatestSubmissionQuery,
  useCheckSubmittedQuery,
  useGetAssignmentStatsQuery,

  // Submission Mutations
  useSubmitAssignmentMutation,
  useGradeSubmissionMutation,
  useReturnForResubmissionMutation,
} = AssignmentApi;

export default AssignmentApi;
