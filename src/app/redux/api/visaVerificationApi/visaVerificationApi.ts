import baseApi from "../baseApi";

export interface IVisaVerification {
  _id: string;
  mobileNumber: string;
  passportNumber: string;
  visaDocument: string[];
  status: "Pending" | "Approved" | "Rejected";
  adminFeedback?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IVisaVerificationListResponse {
  data: IVisaVerification[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IVisaVerificationFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const visaVerificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ User submission (with file upload)
    submitVisaVerification: builder.mutation<IVisaVerification, FormData>({
      query: (formData) => ({
        url: "/visa-verifications",
        method: "POST",
        body: formData,
        formData: true,
      }),
      transformResponse: (response: { data: IVisaVerification }) => response.data,
      invalidatesTags: ["VisaVerification"],
    }),

    // ✅ Admin: get all requests
    getAllVisaVerifications: builder.query<IVisaVerificationListResponse, IVisaVerificationFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const qs = params.toString();
        return `/visa-verifications${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: { data: IVisaVerificationListResponse }) => response.data,
      providesTags: ["VisaVerification"],
    }),

    // ✅ Admin: get request by ID
    getVisaVerificationById: builder.query<IVisaVerification, string>({
      query: (id) => `/visa-verifications/${id}`,
      transformResponse: (response: { data: IVisaVerification }) => response.data,
      providesTags: (result, error, id) => [{ type: "VisaVerification", id }],
    }),

    // ✅ Admin: update request info & status
    updateVisaVerification: builder.mutation<IVisaVerification, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/visa-verifications/${id}`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      transformResponse: (response: { data: IVisaVerification }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "VisaVerification", id },
        "VisaVerification",
      ],
    }),

    // ✅ Admin: delete request
    deleteVisaVerification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/visa-verifications/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: any }) => response.data,
      invalidatesTags: ["VisaVerification"],
    }),

    // ✅ User: Check status
    checkVisaStatus: builder.query<IVisaVerification, { mobileNumber: string; passportNumber: string }>({
      query: ({ mobileNumber, passportNumber }) =>
        `/visa-verifications/status?mobileNumber=${encodeURIComponent(mobileNumber)}&passportNumber=${encodeURIComponent(passportNumber)}`,
      transformResponse: (response: { data: IVisaVerification }) => response.data,
      providesTags: (result, error, { mobileNumber, passportNumber }) => [
        { type: "VisaVerification", id: `${mobileNumber}-${passportNumber}` },
      ],
    }),
  }),
});

export const {
  useSubmitVisaVerificationMutation,
  useGetAllVisaVerificationsQuery,
  useGetVisaVerificationByIdQuery,
  useUpdateVisaVerificationMutation,
  useDeleteVisaVerificationMutation,
  useCheckVisaStatusQuery,
  useLazyCheckVisaStatusQuery,
} = visaVerificationApi;
