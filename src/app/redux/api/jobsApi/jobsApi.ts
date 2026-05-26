/**
 * Jobs API - RTK Query endpoints
 * Handles all Jobs and Job Applications CRUD operations
 */

// import baseApi from "../baseApi";

// export interface IJob {
//   _id: string;
//   title: string;
//   slug: string;
//   type: "Internship" | "Full time" | "Part time";
//   duration?: string;
//   salary?: string;
//   date: string;
//   category: string;
//   location?: string;
//   vacancy?: string;
//   experience?: string;
//   about?: string;
//   qualifications?: string[];
//   responsibilities?: string[];
//   benefits?: string[];
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface IJobApplication {
//   _id?: string;
//   jobId: string;
//   name: string;
//   email: string;
//   phone: string;
//   linkedin?: string;
//   resumeLink: string;
//   academicQualifications: string;
//   presentAddress: string;
//   portfolio?: string;
//   whyHireYou?: string;
//   exprience?: string;
//   vacancy?: string;
//   certifications?: string[];
//   softSkills?: string[];
//   hardSkills?: string[];
//   createdAt?: string;
// }

// interface ApiResponse<T> {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data: T;
// }

// const jobsApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // ==================== JOB QUERIES ====================

//     getAllJobs: builder.query<ApiResponse<IJob[]>, void>({
//       query: () => "/jobs",
//       providesTags: ["Jobs"],
//     }),

//     getJobBySlug: builder.query<ApiResponse<IJob>, string>({
//       query: (slug) => `/jobs/${slug}`,
//       providesTags: ["Jobs"],
//     }),

//     // ==================== JOB MUTATIONS ====================

//     createJob: builder.mutation<ApiResponse<IJob>, Partial<IJob>>({
//       query: (body) => ({
//         url: "/jobs",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Jobs"],
//     }),

//     updateJob: builder.mutation<
//       ApiResponse<IJob>,
//       { id: string; body: Partial<IJob> }
//     >({
//       query: ({ id, body }) => ({
//         url: `/jobs/${id}`,
//         method: "PATCH",
//         body,
//       }),
//       invalidatesTags: ["Jobs"],
//     }),

//     deleteJob: builder.mutation<ApiResponse<null>, string>({
//       query: (id) => ({
//         url: `/jobs/${id}`,
//         method: "DELETE",
//       }),
//       invalidatesTags: ["Jobs"],
//     }),

//     // ==================== JOB APPLICATIONS ====================

//     applyForJob: builder.mutation<
//       ApiResponse<IJobApplication>,
//       Partial<IJobApplication>
//     >({
//       query: (body) => ({
//         url: "/job-applications",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["JobApplications"],
//     }),

//     getApplicationsByJob: builder.query<ApiResponse<IJobApplication[]>, string>(
//       {
//         query: (jobId) => `/job-applications/job/${jobId}`,
//         providesTags: ["JobApplications"],
//       },
//     ),

//     getAllApplications: builder.query<ApiResponse<IJobApplication[]>, void>({
//       query: () => "/job-applications",
//       providesTags: ["JobApplications"],
//     }),
//   }),
// });

// export const {
//   useGetAllJobsQuery,
//   useGetJobBySlugQuery,
//   useCreateJobMutation,
//   useUpdateJobMutation,
//   useDeleteJobMutation,
//   useApplyForJobMutation,
//   useGetApplicationsByJobQuery,
//   useGetAllApplicationsQuery,

// } = jobsApi;

// export default jobsApi;
/**
 * Jobs API - RTK Query endpoints
 * Handles all Jobs and Job Applications CRUD operations
 */

import baseApi from "../baseApi";
import type {
  IJob,
  ICreateJobPayload,
  IUpdateJobPayload,
  IJobFilters,
  TJobStatus,
  IJobAnalytics,
} from "@/types/job";

const JobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /jobs — filter: type, status, category
    getAllJobs: builder.query<IJob[], IJobFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.category) params.append("category", filters.category);
        const qs = params.toString();
        return `/jobs${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res: any) => res.data,
      providesTags: ["Job"],
    }),

    // ✅ GET /jobs/analytics
    getJobAnalytics: builder.query<IJobAnalytics, void>({
      query: () => "/jobs/analytics",
      transformResponse: (res: any) => res.data,
      providesTags: ["Job"],
    }),

    // ✅ GET /jobs/:slug — viewCount বাড়বে
    getJobBySlug: builder.query<IJob, string>({
      query: (slug) => `/jobs/${slug}`,
      transformResponse: (res: any) => res.data,
      providesTags: (result, error, slug) => [{ type: "Job", id: slug }],
    }),

    // ✅ POST /jobs — create (draft হবে)
    createJob: builder.mutation<IJob, ICreateJobPayload>({
      query: (payload) => ({ url: "/jobs", method: "POST", body: payload }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Job"],
    }),

    // ✅ PATCH /jobs/:id — title, deadline etc update
    updateJob: builder.mutation<IJob, { id: string } & IUpdateJobPayload>({
      query: ({ id, ...patch }) => ({
        url: `/jobs/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Job"],
    }),

    // ✅ PATCH /jobs/:id/status — publish / unpublish / close
    updateJobStatus: builder.mutation<IJob, { id: string; status: TJobStatus }>(
      {
        query: ({ id, status }) => ({
          url: `/jobs/${id}/status`,
          method: "PATCH",
          body: { status },
        }),
        transformResponse: (res: any) => res.data,
        invalidatesTags: ["Job"],
      },
    ),

    // ✅ POST /jobs/:id/duplicate
    duplicateJob: builder.mutation<IJob, string>({
      query: (id) => ({ url: `/jobs/${id}/duplicate`, method: "POST" }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Job"],
    }),

    // ✅ DELETE /jobs/:id
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({ url: `/jobs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Job"],
    }),

    // ✅ POST /jobs/upload-image — upload banner image, returns URL string
    uploadJobImage: builder.mutation<string, FormData>({
      query: (formData) => ({
        url: "/jobs/upload-image",
        method: "POST",
        body: formData,
        formData: true,
      }),
      transformResponse: (res: any) =>
        res?.data?.url ?? res?.data?.imageUrl ?? res?.data ?? "",
    }),
  }),
});

export const {
  useGetAllJobsQuery,
  useGetJobAnalyticsQuery,
  useGetJobBySlugQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useDuplicateJobMutation,
  useDeleteJobMutation,
  useUploadJobImageMutation,
} = JobApi;

export default JobApi;
