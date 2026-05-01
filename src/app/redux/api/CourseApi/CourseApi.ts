/**
 * Course API - RTK Query endpoints
 * Handles all Course CRUD operations and image uploads
 */

import baseApi from "../baseApi";
import type {
  ICourse,
  ICreateCourseRequest,
  IUpdateCourseRequest,
  ICourseResponse,
  IUploadResponse
} from "@/types/course";

const CourseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get all programs with optional filters
     */
    getCourses: builder.query<
      { data: ICourse[]; meta: any },
      {
        page?: number;
        limit?: number;
        type?: string;
        level?: string;
        searchTerm?: string;
        category?: string;
        subcategory?: string;
      } | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters) {
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
          if (filters.type) params.append("type", filters.type);
          if (filters.level) params.append("level", filters.level);
          if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
          if (filters.category) params.append("category", filters.category);
          if (filters.subcategory) params.append("subcategory", filters.subcategory);
        }

        const queryString = params.toString();
        return `/programs${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: any) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return {
            data: response,
            meta: { total: response.length, totalPages: 1 },
          };
        }
        return {
          data: response.data || [],
          meta: response.meta || { total: 0, totalPages: 1 },
        };
      },
      providesTags: ["Course"],
    }),

    /**
     * Get program by ID
     */
    getCourseById: builder.query<ICourse, string>({
      query: (id) => `/programs/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),

    /**
     * Get program by slug
     */
    getCourseBySlug: builder.query<ICourse, string>({
      query: (slug) => `/programs/slug/${slug}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, slug) => [{ type: "Course", id: slug }],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Create new program
     */
    createCourse: builder.mutation<ICourse, ICreateCourseRequest>({
      query: (payload) => ({
        url: "/programs",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["Course"],
    }),

    /**
     * Update program by ID
     */
    updateCourse: builder.mutation<
      ICourse,
      { id: string } & IUpdateCourseRequest
    >({
      query: ({ id, ...patch }) => ({
        url: `/programs/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Course", id }],
    }),

    /**
     * Delete program by ID
     */
    deleteCourse: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/programs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    /**
     * Upload program image
     * Sends FormData with file to backend Multer
     */
    uploadCourseImage: builder.mutation<IUploadResponse, FormData>({
      query: (formData) => ({
        url: "/uploads/image",
        method: "POST",
        body: formData,
        // Important: Don't set Content-Type header, let browser set it with boundary
      }),
      transformResponse: (response: any) => response,
    }),

    /**
     * Add material to program
     */
    addMaterial: builder.mutation<
      ICourse,
      { courseId: string; material: any }
    >({
      query: ({ courseId, material }) => ({
        url: `/programs/${courseId}/materials`,
        method: "POST",
        body: material,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add expert to program
     */
    addExpert: builder.mutation<ICourse, { courseId: string; expert: any }>({
      query: ({ courseId, expert }) => ({
        url: `/programs/${courseId}/experts`,
        method: "POST",
        body: expert,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add quiz to program
     */
    addQuiz: builder.mutation<ICourse, { courseId: string; quizId: string }>({
      query: ({ courseId, quizId }) => ({
        url: `/programs/${courseId}/quizzes`,
        method: "POST",
        body: { quizId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Get program statistics
     */
    getCourseStats: builder.query<any, string>({
      query: (courseId) => `/programs/${courseId}/stats`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, courseId) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Bulk assign users to program
     */
    bulkAssignUsers: builder.mutation<
      { success: number; failed: number; errors: any[] },
      { courseId: string; userIds: string[] }
    >({
      query: ({ courseId, userIds }) => ({
        url: `/enrollments/${courseId}/bulk-assign`,
        method: "POST",
        body: { userIds },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Delete material from program
     */
    deleteMaterial: builder.mutation<
      { success: boolean },
      { courseId: string; materialId: string }
    >({
      query: ({ courseId, materialId }) => ({
        url: `/programs/${courseId}/materials/${materialId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Update material in program
     */
    updateMaterial: builder.mutation<
      ICourse,
      { courseId: string; materialId: string; material: any }
    >({
      query: ({ courseId, materialId, material }) => ({
        url: `/programs/${courseId}/materials/${materialId}`,
        method: "PATCH",
        body: material,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Delete expert from program
     */
    deleteExpert: builder.mutation<
      { success: boolean },
      { courseId: string; expertId: string }
    >({
      query: ({ courseId, expertId }) => ({
        url: `/programs/${courseId}/experts/${expertId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Remove quiz from program
     */
    removeQuiz: builder.mutation<
      { success: boolean },
      { courseId: string; quizId: string }
    >({
      query: ({ courseId, quizId }) => ({
        url: `/programs/${courseId}/quizzes/${quizId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add curriculum module to program
     */
    addCurriculum: builder.mutation<
      any,
      { courseId: string; curriculum: any }
    >({
      query: ({ courseId, curriculum }) => ({
        url: `/programs/${courseId}/curriculum`,
        method: "POST",
        body: curriculum,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Update curriculum module in program
     */
    updateCurriculum: builder.mutation<
      any,
      { courseId: string; curriculumId: string; curriculum: any }
    >({
      query: ({ courseId, curriculumId, curriculum }) => ({
        url: `/programs/${courseId}/curriculum/${curriculumId}`,
        method: "PATCH",
        body: curriculum,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Delete curriculum module from program
     */
    deleteCurriculum: builder.mutation<
      { success: boolean },
      { courseId: string; curriculumId: string }
    >({
      query: ({ courseId, curriculumId }) => ({
        url: `/programs/${courseId}/curriculum/${curriculumId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Update expert in program
     */
    updateExpert: builder.mutation<
      any,
      { courseId: string; expertId: string; expert: any }
    >({
      query: ({ courseId, expertId, expert }) => ({
        url: `/programs/${courseId}/experts/${expertId}`,
        method: "PATCH",
        body: expert,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add project to program
     */
    addProject: builder.mutation<ICourse, { courseId: string; project: any }>({
      query: ({ courseId, project }) => ({
        url: `/programs/${courseId}/projects`,
        method: "POST",
        body: project,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Update project in program
     */
    updateProject: builder.mutation<
      any,
      { courseId: string; projectId: string; project: any }
    >({
      query: ({ courseId, projectId, project }) => ({
        url: `/programs/${courseId}/projects/${projectId}`,
        method: "PATCH",
        body: project,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Delete project from program
     */
    deleteProject: builder.mutation<
      { success: boolean },
      { courseId: string; projectId: string }
    >({
      query: ({ courseId, projectId }) => ({
        url: `/programs/${courseId}/projects/${projectId}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Update certificate rules for program
     */
    updateCertificateRules: builder.mutation<
      any,
      { courseId: string; certificateRule: any }
    >({
      query: ({ courseId, certificateRule }) => ({
        url: `/programs/${courseId}/certificate-rules`,
        method: "PATCH",
        body: certificateRule,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    // ==================== MODULE CRUD ====================

    /**
     * Add module to program
     */
    addModule: builder.mutation<
      ICourse,
      { courseId: string; module: any }
    >({
      query: ({ courseId, module }) => ({
        url: `/programs/${courseId}/modules`,
        method: "POST",
        body: module,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add lesson to module
     */
    addLesson: builder.mutation<
      ICourse,
      { courseId: string; moduleId: string; lesson: any }
    >({
      query: ({ courseId, moduleId, lesson }) => ({
        url: `/programs/${courseId}/modules/${moduleId}/lessons`,
        method: "POST",
        body: lesson,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),

    /**
     * Add resource to module
     */
    addModuleResource: builder.mutation<
      ICourse,
      { courseId: string; moduleId: string; resource: any }
    >({
      query: ({ courseId, moduleId, resource }) => ({
        url: `/programs/${courseId}/modules/${moduleId}/resources`,
        method: "POST",
        body: resource,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Course", id: courseId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseBySlugQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useUploadCourseImageMutation,
  useAddMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
  useAddExpertMutation,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddQuizMutation,
  useRemoveQuizMutation,
  useAddCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
  useUpdateCertificateRulesMutation,
  useGetCourseStatsQuery,
  useBulkAssignUsersMutation,
  useAddModuleMutation,
  useAddLessonMutation,
  useAddModuleResourceMutation,
} = CourseApi;

export default CourseApi;

