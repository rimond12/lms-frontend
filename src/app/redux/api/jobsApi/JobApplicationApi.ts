import baseApi from "../baseApi";
import type {
  IApplication,
  ICreateApplicationPayload,
  IUpdateApplicationStatus,
  IApplicationFilters,
} from "@/types/job";

const JobApplicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /job-application — সব applications (admin)
    getAllApplications: builder.query<
      IApplication[],
      IApplicationFilters | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append("status", filters.status);
        if (filters?.jobId) params.append("jobId", filters.jobId);
        const qs = params.toString();
        return `/job-application${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["JobApplication"],
    }),

    // ✅ GET /job-application/my-applications?email=xxx
    getMyApplications: builder.query<IApplication[], string>({
      query: (email) => `/job-application/my-applications?email=${email}`,
      transformResponse: (response: any) => response.data,
      providesTags: ["JobApplication"],
    }),

    // ✅ GET /job-application/:id
    getApplicationById: builder.query<IApplication, string>({
      query: (id) => `/job-application/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, id) => [{ type: "JobApplication", id }],
    }),

    // ✅ POST /job-application — apply করা
    applyToJob: builder.mutation<IApplication, ICreateApplicationPayload>({
      query: (payload) => ({
        url: "/job-application",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["JobApplication"],
    }),

    // ✅ PATCH /job-application/:id — content edit (admin)
    // name, phone, address, resumeLink, skills, questionnaire etc.
    editApplication: builder.mutation<
      IApplication,
      { id: string } & Partial<IApplication>
    >({
      query: ({ id, ...patch }) => ({
        url: `/job-application/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["JobApplication"],
    }),

    // ✅ PATCH /job-application/:id/status — status change (admin)
    updateApplicationStatus: builder.mutation<
      IApplication,
      IUpdateApplicationStatus
    >({
      query: ({ id, status, adminNote, interviewDate }) => ({
        url: `/job-application/${id}/status`,
        method: "PATCH",
        body: { status, adminNote, interviewDate },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["JobApplication"],
    }),

    // ✅ PATCH /job-application/bulk-status
    bulkUpdateStatus: builder.mutation<
      { modifiedCount: number },
      { ids: string[]; status: string }
    >({
      query: (payload) => ({
        url: "/job-application/bulk-status",
        method: "PATCH",
        body: payload,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["JobApplication"],
    }),

    // ✅ POST /job-application/:id/notes — নতুন note add
    addAdminNote: builder.mutation<IApplication, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/job-application/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: ["JobApplication"],
    }),

    // ✅ DELETE /job-application/:id
    deleteApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `/job-application/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JobApplication"],
    }),
  }),
});

export const {
  useGetAllApplicationsQuery,
  useGetMyApplicationsQuery,
  useGetApplicationByIdQuery,
  useApplyToJobMutation,
  useEditApplicationMutation,
  useAddAdminNoteMutation, // ✅ নতুন
  useUpdateApplicationStatusMutation,
  useBulkUpdateStatusMutation,
  useDeleteApplicationMutation,
} = JobApplicationApi;

export default JobApplicationApi;
