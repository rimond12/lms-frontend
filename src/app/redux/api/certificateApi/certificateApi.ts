/**
 * Certificate API - RTK Query endpoints
 * Handles certificate issuance, retrieval, and verification
 */

import baseApi from "../baseApi";
import type { ICertificateData, ICertificateInput } from "@/types/course";

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== QUERIES ====================

    /**
     * Get certificate by ID
     */
    getCertificateById: builder.query<ApiResponse<ICertificateData>, string>({
      query: (certificateId) => `/certificates/${certificateId}`,
      providesTags: (result, error, certificateId) => [
        { type: "Certificate", id: certificateId },
      ],
    }),

    /**
     * Get certificate by number
     */
    getCertificateByNumber: builder.query<
      ApiResponse<ICertificateData>,
      string
    >({
      query: (certificateNumber) =>
        `/certificates/number/${certificateNumber}`,
      providesTags: (result, error, certificateNumber) => [
        { type: "Certificate", id: certificateNumber },
      ],
    }),

    /**
     * Get user's certificates
     */
    getMyCertificates: builder.query<ApiResponse<ICertificateData[]>, void>({
      query: () => "/certificates/user/my-certificates",
      providesTags: [{ type: "Certificate", id: "MY_CERTIFICATES" }],
    }),

    /**
     * Get program's certificates (admin)
     */
    getProgramCertificates: builder.query<
      ApiResponse<ICertificateData[]>,
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page = 1, limit = 10 }) =>
        `/certificates/program/${courseId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { courseId }) => [
        { type: "Certificate", id: `program-${courseId}` },
      ],
    }),

    /**
     * Verify certificate authenticity
     */
    verifyCertificate: builder.query<
      ApiResponse<{ isValid: boolean; certificateNumber: string }>,
      string
    >({
      query: (certificateNumber) =>
        `/certificates/${certificateNumber}/verify`,
      providesTags: (result, error, certificateNumber) => [
        { type: "Certificate", id: `verify-${certificateNumber}` },
      ],
    }),

    // ==================== MUTATIONS ====================

    /**
     * Issue certificate to a user
     */
    issueCertificate: builder.mutation<
      ApiResponse<ICertificateData>,
      ICertificateInput
    >({
      query: (certificateData) => ({
        url: "/certificates",
        method: "POST",
        body: certificateData,
      }),
      invalidatesTags: [{ type: "Certificate", id: "MY_CERTIFICATES" }],
    }),

    /**
     * Revoke certificate
     */
    revokeCertificate: builder.mutation<
      ApiResponse<ICertificateData>,
      { certificateId: string; reason: string }
    >({
      query: ({ certificateId, reason }) => ({
        url: `/certificates/${certificateId}/revoke`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (result, error, { certificateId }) => [
        { type: "Certificate", id: certificateId },
      ],
    }),
  }),
});

export const {
  useGetCertificateByIdQuery,
  useGetCertificateByNumberQuery,
  useGetMyCertificatesQuery,
  useGetProgramCertificatesQuery,
  useVerifyCertificateQuery,
  useIssueCertificateMutation,
  useRevokeCertificateMutation,
} = certificateApi;

export default certificateApi;
