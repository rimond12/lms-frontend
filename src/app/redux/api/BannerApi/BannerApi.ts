import baseApi from "../baseApi";

export interface Banner {
  _id: string;
  title?: string;
  imageUrl: string;
  altText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

const BannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<{ success: boolean; message: string; data: Banner[] }, void>({
      query: () => '/banner',
      providesTags: ['Banner'],
    }),
    getBannerById: builder.query<{ success: boolean; message: string; data: Banner }, string>({
      query: (id) => `/banner/${id}`,
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation<Banner, Partial<Banner>>({
      query: (payload) => ({
        url: '/banner',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Banner'],
    }),
    updateBanner: builder.mutation<Banner, { id: string } & Partial<Banner>>({
      query: ({ id, ...patch }) => ({
        url: `/banner/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation<void, string>({
      query: (id) => ({
        url: `/banner/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    uploadBannerImage: builder.mutation<{ success: boolean; message: string; data: { imagePath: string } }, FormData>({
      query: (formData) => ({
        url: '/banner/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetBannersQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} = BannerApi;
