import baseApi from "../baseApi";

interface TStudentReview {
  _id: string;
  studentName?: string;
  studentPhoto?: string;
  designation?: string;
  reviewText?: string;
  youtubeUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

const studentReviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public - Get active reviews for home page
    getActiveStudentReviews: builder.query<ApiResponse<TStudentReview[]>, void>({
      query: () => "/student-reviews/active",
      providesTags: ["StudentReview"],
    }),

    // Admin - Get all reviews
    getAllStudentReviews: builder.query<ApiResponse<TStudentReview[]>, void>({
      query: () => "/student-reviews",
      providesTags: ["StudentReview"],
    }),

    // Admin - Create review
    createStudentReview: builder.mutation<ApiResponse<TStudentReview>, Partial<TStudentReview>>({
      query: (data) => ({
        url: "/student-reviews",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentReview"],
    }),

    // Admin - Update review
    updateStudentReview: builder.mutation<ApiResponse<TStudentReview>, { id: string; data: Partial<TStudentReview> }>({
      query: ({ id, data }) => ({
        url: `/student-reviews/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["StudentReview"],
    }),

    // Admin - Delete review
    deleteStudentReview: builder.mutation<ApiResponse<TStudentReview>, string>({
      query: (id) => ({
        url: `/student-reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentReview"],
    }),

    // Admin - Toggle visibility
    toggleStudentReviewVisibility: builder.mutation<ApiResponse<TStudentReview>, string>({
      query: (id) => ({
        url: `/student-reviews/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["StudentReview"],
    }),
  }),
});

export const {
  useGetActiveStudentReviewsQuery,
  useGetAllStudentReviewsQuery,
  useCreateStudentReviewMutation,
  useUpdateStudentReviewMutation,
  useDeleteStudentReviewMutation,
  useToggleStudentReviewVisibilityMutation,
} = studentReviewApi;

export default studentReviewApi;
