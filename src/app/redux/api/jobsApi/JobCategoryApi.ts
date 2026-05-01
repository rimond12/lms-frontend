import baseApi from "../baseApi";

export interface IJobCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
}

const JobCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /job-categories — public
    getJobCategories: builder.query<
      IJobCategory[],
      { active?: boolean } | void
    >({
      query: (params) => {
        const qs = params?.active ? "?active=true" : "";
        return `/job-categories${qs}`;
      },
      transformResponse: (res: any) => res.data,
      providesTags: ["JobCategory"],
    }),

    // ✅ POST /job-categories
    createJobCategory: builder.mutation<IJobCategory, Partial<IJobCategory>>({
      query: (body) => ({ url: "/job-categories", method: "POST", body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["JobCategory"],
    }),

    // ✅ PATCH /job-categories/:id
    updateJobCategory: builder.mutation<
      IJobCategory,
      { id: string } & Partial<IJobCategory>
    >({
      query: ({ id, ...patch }) => ({
        url: `/job-categories/${id}`,
        method: "PATCH",
        body: patch,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["JobCategory"],
    }),

    // ✅ DELETE /job-categories/:id
    deleteJobCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/job-categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["JobCategory"],
    }),

    // ✅ PATCH /job-categories/:id/toggle
    toggleJobCategory: builder.mutation<IJobCategory, string>({
      query: (id) => ({ url: `/job-categories/${id}/toggle`, method: "PATCH" }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["JobCategory"],
    }),
  }),
});

export const {
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
  useUpdateJobCategoryMutation,
  useDeleteJobCategoryMutation,
  useToggleJobCategoryMutation,
} = JobCategoryApi;

export default JobCategoryApi;
