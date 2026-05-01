import baseApi from "../baseApi";

// Voucher interface
export interface Voucher {
  _id: string;
  name: string;
  slug: string;
  instructionTitle: string;
  instructionDetails: string;
  contactPhoneNumber?: string;
  prefilledMessage?: string;
  imageUrl?: string;
  price?: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalVoucherSettings {
  _id: string;
  defaultPhoneNumber: string;
  defaultPrefilledMessage: string;
  updatedAt: string;
}

export interface CreateVoucherPayload {
  name: string;
  slug?: string;
  instructionTitle: string;
  instructionDetails: string;
  contactPhoneNumber?: string;
  prefilledMessage?: string;
  imageUrl?: string;
  price?: number;
  isActive?: boolean;
  order?: number;
}

export interface UpdateVoucherPayload {
  id: string;
  name?: string;
  slug?: string;
  instructionTitle?: string;
  instructionDetails?: string;
  contactPhoneNumber?: string;
  prefilledMessage?: string;
  imageUrl?: string;
  price?: number;
  isActive?: boolean;
  order?: number;
}

const VoucherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all vouchers (admin)
    getVouchers: builder.query<{ success: boolean; message: string; data: Voucher[] }, void>({
      query: () => '/vouchers',
      providesTags: ['Voucher'],
    }),
    
    // Get active vouchers only (public)
    getActiveVouchers: builder.query<{ success: boolean; message: string; data: Voucher[] }, void>({
      query: () => '/vouchers/active',
      providesTags: ['Voucher'],
    }),
    
    // Get single voucher by ID
    getVoucherById: builder.query<{ success: boolean; message: string; data: Voucher }, string>({
      query: (id) => `/vouchers/${id}`,
      providesTags: ['Voucher'],
    }),
    
    // Get single voucher by Slug
    getVoucherBySlug: builder.query<{ success: boolean; message: string; data: Voucher }, string>({
      query: (slug) => `/vouchers/slug/${slug}`,
      providesTags: ['Voucher'],
    }),
    
    // Create voucher
    createVoucher: builder.mutation<{ success: boolean; message: string; data: Voucher }, CreateVoucherPayload>({
      query: (payload) => ({
        url: '/vouchers',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Voucher'],
    }),
    
    // Update voucher
    updateVoucher: builder.mutation<{ success: boolean; message: string; data: Voucher }, UpdateVoucherPayload>({
      query: ({ id, ...patch }) => ({
        url: `/vouchers/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Voucher'],
    }),
    
    // Delete voucher
    deleteVoucher: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vouchers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Voucher'],
    }),
    
    // Upload voucher image
    uploadVoucherImage: builder.mutation<{ success: boolean; message: string; data: { imagePath: string } }, FormData>({
      query: (formData) => ({
        url: '/vouchers/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
    
    // Get global settings
    getGlobalVoucherSettings: builder.query<{ success: boolean; message: string; data: GlobalVoucherSettings }, void>({
      query: () => '/vouchers/settings',
      providesTags: ['Voucher'],
    }),
    
    // Update global settings
    updateGlobalVoucherSettings: builder.mutation<{ success: boolean; message: string; data: GlobalVoucherSettings }, { defaultPhoneNumber: string; defaultPrefilledMessage: string }>({
      query: (payload) => ({
        url: '/vouchers/settings',
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Voucher'],
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetActiveVouchersQuery,
  useGetVoucherByIdQuery,
  useGetVoucherBySlugQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useUploadVoucherImageMutation,
  useGetGlobalVoucherSettingsQuery,
  useUpdateGlobalVoucherSettingsMutation,
} = VoucherApi;

export default VoucherApi;
