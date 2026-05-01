import baseApi from "../baseApi";

// ─── Types ────────────────────────────────────────────────────────
export interface ILeadNote {
  text: string;
  createdAt: string;
}

export type TLeadStatus = "new" | "reviewed" | "contacted";

export interface ILead {
  _id: string;
  fullname: string;
  phone: string;
  dob?: string;
  address: string;
  lat?: number;
  lng?: number;
  country: string;
  experience?: string;
  job_type?: string;
  education?: string;
  passport_copy?: string;
  photo?: string;
  nid_copy?: string;
  cv_file?: string;
  status: TLeadStatus;
  notes: ILeadNote[];
  createdAt?: string;
}

export interface ILeadListResponse {
  data: ILead[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ILeadFilters {
  search?: string;
  status?: string;
  country?: string;
  page?: number;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────
const LeadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ POST /leads — form submit (multipart/form-data with files)
    submitLead: builder.mutation<ILead, FormData>({
      query: (formData) => ({
        url: "/leads",
        method: "POST",
        body: formData,
        // Content-Type header set করো না — browser automatically করবে boundary সহ
        formData: true,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Lead"],
    }),

    // ✅ GET /leads — admin list
    getAllLeads: builder.query<ILeadListResponse, ILeadFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append("search", filters.search);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.country) params.append("country", filters.country);
        if (filters?.page) params.append("page", String(filters.page));
        if (filters?.limit) params.append("limit", String(filters.limit));
        const qs = params.toString();
        return `/leads${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res: any) => res.data,
      providesTags: ["Lead"],
    }),

    // ✅ GET /leads/:id — single lead
    getLeadById: builder.query<ILead, string>({
      query: (id) => `/leads/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (result, error, id) => [{ type: "Lead", id }],
    }),

    // ✅ PATCH /leads/:id — lead info update (with optional file re-upload)
    updateLead: builder.mutation<ILead, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/leads/${id}`,
        method: "PATCH",
        body: formData,
        formData: true,
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Lead", id },
        "Lead",
      ],
    }),

    // ✅ DELETE /leads/:id
    deleteLead: builder.mutation<void, string>({
      query: (id) => ({ url: `/leads/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lead"],
    }),

    // ✅ PATCH /leads/:id/status
    updateLeadStatus: builder.mutation<
      ILead,
      { id: string; status: TLeadStatus }
    >({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ["Lead"],
    }),

    // ✅ POST /leads/:id/notes
    addLeadNote: builder.mutation<ILead, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/leads/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: (result, error, { id }) => [{ type: "Lead", id }],
    }),
  }),
});

export const {
  useSubmitLeadMutation,
  useGetAllLeadsQuery,
  useGetLeadByIdQuery,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  useAddLeadNoteMutation,
} = LeadApi;

export default LeadApi;
