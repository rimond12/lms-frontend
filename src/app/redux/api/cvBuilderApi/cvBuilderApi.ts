import baseApi from "../baseApi";

export const cvBuilderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCvBuilderCms: builder.query<any, void>({
      query: () => ({
        url: "/cv-builder/cms",
        method: "GET",
      }),
      providesTags: ["CvBuilderCMS"],
    }),

    updateCvBuilderCms: builder.mutation<any, any>({
      query: (data) => ({
        url: "/cv-builder/cms",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CvBuilderCMS"],
    }),

    getMyCvs: builder.query<any, void>({
      query: () => ({
        url: "/cv-builder/my-cv",
        method: "GET",
      }),
      providesTags: ["CvBuilder"],
    }),

    getCvById: builder.query<any, string>({
      query: (id) => ({
        url: `/cv-builder/my-cv/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "CvBuilder", id }],
    }),

    saveCv: builder.mutation<any, any>({
      query: (cvData) => ({
        url: cvData._id ? `/cv-builder/my-cv/${cvData._id}` : "/cv-builder/my-cv",
        method: cvData._id ? "PUT" : "POST",
        body: cvData,
      }),
      invalidatesTags: ["CvBuilder"],
    }),

    deleteCv: builder.mutation<any, string>({
      query: (id) => ({
        url: `/cv-builder/my-cv/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CvBuilder"],
    }),

    generateCvAiContent: builder.mutation<any, {
      action: string;
      inputText?: string;
      contextData?: any;
      userPrompt?: string;
      language?: string;
    }>({
      query: (body) => ({
        url: "/cv-builder/ai/generate",
        method: "POST",
        body,
      }),
    }),

    uploadCvPhoto: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/cv-builder/upload-photo",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetCvBuilderCmsQuery,
  useUpdateCvBuilderCmsMutation,
  useGetMyCvsQuery,
  useGetCvByIdQuery,
  useSaveCvMutation,
  useDeleteCvMutation,
  useGenerateCvAiContentMutation,
  useUploadCvPhotoMutation,
} = cvBuilderApi;
