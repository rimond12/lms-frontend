import baseApi from "../baseApi";
import type { IJob } from "@/types/job";

const SavedJobsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /saved-jobs — user এর সব saved jobs (full job data)
    getSavedJobs: builder.query<IJob[], void>({
      query: () => "/saved-jobs",
      transformResponse: (response: any) => response.data,
      providesTags: ["SavedJob"],
    }),

    // ✅ POST /saved-jobs/toggle — save/unsave toggle
    // call: toggleSaveJob("jobId")
    // returns: { saved: true/false }
    toggleSaveJob: builder.mutation<{ saved: boolean }, string>({
      query: (jobId) => ({
        url: "/saved-jobs/toggle",
        method: "POST",
        body: { jobId },
      }),
      transformResponse: (response: any) => response.data,
      // Toggle হলে saved jobs list refresh হবে
      invalidatesTags: ["SavedJob"],
    }),

    // ✅ GET /saved-jobs/check/:jobId — একটা job saved কিনা
    checkIsSaved: builder.query<{ isSaved: boolean }, string>({
      query: (jobId) => `/saved-jobs/check/${jobId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result, error, jobId) => [{ type: "SavedJob", id: jobId }],
    }),
  }),
});

export const {
  useGetSavedJobsQuery,
  useToggleSaveJobMutation,
  useCheckIsSavedQuery,
} = SavedJobsApi;

export default SavedJobsApi;
