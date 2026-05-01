/**
 * BatchModule API - RTK Query endpoints
 * Handles batch-specific module management with scheduling
 */

import baseApi from "../baseApi";

// ==================== TYPES ====================

export type UnlockType = 'immediate' | 'fixed-date' | 'days-after-enrollment' | 'days-after-batch-start';

export interface IBatchLesson {
  _id?: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'doc' | 'link' | 'file';
  // Video provider type (youtube, vdocipher, or direct file)
  videoProvider?: 'youtube' | 'vdocipher' | 'direct';
  // VdoCipher Video ID (only used when videoProvider is 'vdocipher')
  vdocipherVideoId?: string;
  contentUrl?: string;
  videoId?: string | {
    _id: string;
    title: string;
    thumbnail?: string;
    duration?: number;
    fileId?: string;
  };
  duration?: number;
  order: number;
  isFree?: boolean;
}

export interface IBatchResource {
  _id?: string;
  title: string;
  fileUrl: string;
  type: 'pdf' | 'doc' | 'zip' | 'link' | 'other';
}

export interface IBatchModule {
  _id: string;
  batchId: string;
  courseId: string;
  sourceModuleId?: string;
  
  title: string;
  description?: string;
  order: number;
  
  lessons: IBatchLesson[];
  resources: IBatchResource[];
  
  quizId?: string | { _id: string; title: string };
  assignmentId?: string | { _id: string; title: string };
  
  // Scheduling
  unlockType: UnlockType;
  unlockDate?: string;
  unlockDaysAfterEnrollment?: number;
  unlockDaysAfterBatchStart?: number;
  
  isActive: boolean;
  isPublished: boolean;
  
  // Clone metadata
  copiedFromBatchId?: string;
  copiedFromModuleId?: string;
  
  // Virtual fields
  totalLessons?: number;
  totalDuration?: number;
  
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== REQUEST TYPES ====================

export interface ICreateBatchModuleRequest {
  title: string;
  description?: string;
  order?: number;
  lessons?: Omit<IBatchLesson, '_id'>[];
  resources?: Omit<IBatchResource, '_id'>[];
  quizId?: string;
  assignmentId?: string;
  unlockType?: UnlockType;
  unlockDate?: string;
  unlockDaysAfterEnrollment?: number;
  unlockDaysAfterBatchStart?: number;
}

export interface IUpdateBatchModuleRequest extends Partial<ICreateBatchModuleRequest> {
  isActive?: boolean;
  isPublished?: boolean;
}

export interface ICopyModulesRequest {
  sourceBatchId: string;
  moduleIds?: string[];
  includeAssignments?: boolean;
  includeQuizzes?: boolean;
  adjustScheduleToNewBatch?: boolean;
}

export interface IScheduleUpdateRequest {
  unlockType: UnlockType;
  unlockDate?: string;
  unlockDaysAfterEnrollment?: number;
  unlockDaysAfterBatchStart?: number;
}

export interface IBulkScheduleRequest {
  schedules: Array<{
    moduleId: string;
    schedule: IScheduleUpdateRequest;
  }>;
}

export interface IReorderModulesRequest {
  moduleOrder: string[];
}

// Schedule with computed dates
export interface IModuleScheduleView {
  _id: string;
  title: string;
  order: number;
  unlockType: UnlockType;
  unlockDate?: string;
  unlockDaysAfterEnrollment?: number;
  unlockDaysAfterBatchStart?: number;
  computedUnlockDate?: string;
}

// Student view (only unlocked modules)
export interface IStudentModuleView {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: IBatchLesson[];
  resources: IBatchResource[];
  quizId?: string;
  assignmentId?: string;
  isUnlocked: boolean;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// ==================== API ====================

const batchModuleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // ==================== ADMIN CRUD ====================

    /**
     * Get all modules for a batch (admin)
     */
    getBatchModules: builder.query<
      ApiResponse<IBatchModule[]>,
      { batchId: string; includeInactive?: boolean }
    >({
      query: ({ batchId, includeInactive }) => 
        `/batch-modules/batch/${batchId}/modules${includeInactive ? '?includeInactive=true' : ''}`,
      providesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
        { type: "BatchModule", id: "LIST" }
      ],
    }),

    /**
     * Get single module
     */
    getBatchModule: builder.query<
      ApiResponse<IBatchModule>,
      { batchId: string; moduleId: string }
    >({
      query: ({ batchId, moduleId }) => 
        `/batch-modules/batch/${batchId}/modules/${moduleId}`,
      providesTags: (result, error, { moduleId }) => [
        { type: "BatchModule", id: moduleId }
      ],
    }),

    /**
     * Create new module
     */
    createBatchModule: builder.mutation<
      ApiResponse<IBatchModule>,
      { batchId: string; data: ICreateBatchModuleRequest }
    >({
      query: ({ batchId, data }) => ({
        url: `/batch-modules/batch/${batchId}/modules`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
        { type: "BatchModule", id: "LIST" },
        { type: "Batch", id: batchId }
      ],
    }),

    /**
     * Update module
     */
    updateBatchModule: builder.mutation<
      ApiResponse<IBatchModule>,
      { batchId: string; moduleId: string; data: IUpdateBatchModuleRequest }
    >({
      query: ({ batchId, moduleId, data }) => ({
        url: `/batch-modules/batch/${batchId}/modules/${moduleId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { batchId, moduleId }) => [
        { type: "BatchModule", id: moduleId },
        { type: "BatchModule", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Delete module
     */
    deleteBatchModule: builder.mutation<
      ApiResponse<null>,
      { batchId: string; moduleId: string }
    >({
      query: ({ batchId, moduleId }) => ({
        url: `/batch-modules/batch/${batchId}/modules/${moduleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
        { type: "BatchModule", id: "LIST" },
        { type: "Batch", id: batchId }
      ],
    }),

    /**
     * Reorder modules
     */
    reorderBatchModules: builder.mutation<
      ApiResponse<IBatchModule[]>,
      { batchId: string; moduleOrder: string[] }
    >({
      query: ({ batchId, moduleOrder }) => ({
        url: `/batch-modules/batch/${batchId}/modules-reorder`,
        method: "PUT",
        body: { moduleOrder },
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
      ],
    }),

    // ==================== SCHEDULING ====================

    /**
     * Update single module schedule
     */
    updateModuleSchedule: builder.mutation<
      ApiResponse<IBatchModule>,
      { batchId: string; moduleId: string; schedule: IScheduleUpdateRequest }
    >({
      query: ({ batchId, moduleId, schedule }) => ({
        url: `/batch-modules/batch/${batchId}/modules/${moduleId}/schedule`,
        method: "PUT",
        body: schedule,
      }),
      invalidatesTags: (result, error, { batchId, moduleId }) => [
        { type: "BatchModule", id: moduleId },
        { type: "BatchModule", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Bulk update schedules
     */
    bulkUpdateSchedule: builder.mutation<
      ApiResponse<IBatchModule[]>,
      { batchId: string; schedules: IBulkScheduleRequest['schedules'] }
    >({
      query: ({ batchId, schedules }) => ({
        url: `/batch-modules/batch/${batchId}/bulk-schedule`,
        method: "PUT",
        body: { schedules },
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Get batch schedule summary
     */
    getBatchSchedule: builder.query<
      ApiResponse<IModuleScheduleView[]>,
      string
    >({
      query: (batchId) => `/batch-modules/batch/${batchId}/schedule`,
      providesTags: (result, error, batchId) => [
        { type: "BatchModule", id: `schedule-${batchId}` }
      ],
    }),

    // ==================== COPY/CLONE ====================

    /**
     * Copy modules from another batch
     */
    copyModulesFromBatch: builder.mutation<
      ApiResponse<IBatchModule[]>,
      { targetBatchId: string; data: ICopyModulesRequest }
    >({
      query: ({ targetBatchId, data }) => ({
        url: `/batch-modules/batch/${targetBatchId}/copy-from-batch`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { targetBatchId }) => [
        { type: "BatchModule", id: `batch-${targetBatchId}` },
        { type: "BatchModule", id: "LIST" },
        { type: "Batch", id: targetBatchId }
      ],
    }),

    /**
     * Copy modules from course template
     */
    copyModulesFromCourse: builder.mutation<
      ApiResponse<IBatchModule[]>,
      { batchId: string; courseId: string }
    >({
      query: ({ batchId, courseId }) => ({
        url: `/batch-modules/batch/${batchId}/copy-from-course`,
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: (result, error, { batchId }) => [
        { type: "BatchModule", id: `batch-${batchId}` },
        { type: "BatchModule", id: "LIST" },
        { type: "Batch", id: batchId }
      ],
    }),

    /**
     * Clone a single module
     */
    cloneBatchModule: builder.mutation<
      ApiResponse<IBatchModule>,
      { moduleId: string; targetBatchId: string }
    >({
      query: ({ moduleId, targetBatchId }) => ({
        url: `/batch-modules/modules/${moduleId}/clone`,
        method: "POST",
        body: { targetBatchId },
      }),
      invalidatesTags: (result, error, { targetBatchId }) => [
        { type: "BatchModule", id: `batch-${targetBatchId}` },
        { type: "BatchModule", id: "LIST" },
        { type: "Batch", id: targetBatchId }
      ],
    }),

    // ==================== STUDENT ====================

    /**
     * Get modules for enrolled student (only unlocked)
     */
    getStudentBatchModules: builder.query<
      ApiResponse<IStudentModuleView[]>,
      string
    >({
      query: (batchId) => `/batch-modules/student/batch/${batchId}/modules`,
      providesTags: (result, error, batchId) => [
        { type: "BatchModule", id: `student-${batchId}` }
      ],
    }),

    /**
     * Get single module content for student
     */
    getStudentModuleContent: builder.query<
      ApiResponse<IStudentModuleView>,
      { batchId: string; moduleId: string }
    >({
      query: ({ batchId, moduleId }) => 
        `/batch-modules/student/batch/${batchId}/modules/${moduleId}`,
      providesTags: (result, error, { batchId, moduleId }) => [
        { type: "BatchModule", id: `student-module-${moduleId}` }
      ],
    }),

    /**
     * Upload lesson file
     */
    uploadLessonFile: builder.mutation<
      ApiResponse<{ 
        fileUrl: string;
        filename: string;
        originalName: string;
        mimetype: string;
        size: number;
      }>,
      { batchId: string; file: File }
    >({
      query: ({ batchId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/batch-modules/batch/${batchId}/upload-lesson-file`,
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  // Admin CRUD
  useGetBatchModulesQuery,
  useGetBatchModuleQuery,
  useCreateBatchModuleMutation,
  useUpdateBatchModuleMutation,
  useDeleteBatchModuleMutation,
  useReorderBatchModulesMutation,
  
  // Scheduling
  useUpdateModuleScheduleMutation,
  useBulkUpdateScheduleMutation,
  useGetBatchScheduleQuery,
  
  // Copy/Clone
  useCopyModulesFromBatchMutation,
  useCopyModulesFromCourseMutation,
  useCloneBatchModuleMutation,
  
  // Student
  useGetStudentBatchModulesQuery,
  useGetStudentModuleContentQuery,
  
  // Upload
  useUploadLessonFileMutation,
} = batchModuleApi;

export default batchModuleApi;
