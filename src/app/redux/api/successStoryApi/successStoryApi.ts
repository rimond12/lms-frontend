import baseApi from "../baseApi";

export interface TSuccessStory {
  _id?: string;
  fullName: string;
  image?: string;
  country: string;
  profession: string;
  story: string;
  rating?: number;
  videoUrl?: string;
  date?: string;
  isApproved: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

const successStoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public - Submit success story
    submitSuccessStory: builder.mutation<ApiResponse<TSuccessStory>, Partial<TSuccessStory>>({
      query: (data) => ({
        url: "/success-stories",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SuccessStory"],
    }),

    // Public - Get approved success stories
    getApprovedSuccessStories: builder.query<ApiResponse<TSuccessStory[]>, void>({
      query: () => "/success-stories/approved",
      providesTags: ["SuccessStory"],
    }),

    // Admin - Get all success stories
    getAllSuccessStories: builder.query<ApiResponse<TSuccessStory[]>, void>({
      query: () => "/success-stories",
      providesTags: ["SuccessStory"],
    }),

    // Admin - Get success story details
    getSuccessStory: builder.query<ApiResponse<TSuccessStory>, string>({
      query: (id) => `/success-stories/${id}`,
      providesTags: ["SuccessStory"],
    }),

    // Admin - Update success story (approve/reject/edit)
    updateSuccessStory: builder.mutation<ApiResponse<TSuccessStory>, { id: string; data: Partial<TSuccessStory> }>({
      query: ({ id, data }) => ({
        url: `/success-stories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SuccessStory"],
    }),

    // Admin - Delete success story
    deleteSuccessStory: builder.mutation<ApiResponse<TSuccessStory>, string>({
      query: (id) => ({
        url: `/success-stories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SuccessStory"],
    }),
  }),
});

export const {
  useSubmitSuccessStoryMutation,
  useGetApprovedSuccessStoriesQuery,
  useGetAllSuccessStoriesQuery,
  useGetSuccessStoryQuery,
  useUpdateSuccessStoryMutation,
  useDeleteSuccessStoryMutation,
} = successStoryApi;

export default successStoryApi;
