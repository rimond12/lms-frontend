/**
 * Batch Certificate API - RTK Query endpoints
 * Handles admin certificate issuance, student access, and public verification
 */

import baseApi from "./baseApi";

// Types
export interface IBatchCertificate {
  _id: string;
  certificateNumber: string;
  batchId: string;
  batchEnrollmentId: string;
  userId: string;
  courseId: string;
  studentName: string;
  studentEmail: string;
  certificateFileUrl: string;
  fileType: "pdf" | "jpg" | "png";
  originalFileName?: string;
  issueDate: string;
  grade?: string;
  description?: string;
  status: "issued" | "revoked";
  issuedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICertificateListItem {
  _id: string;
  certificateNumber: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  batchName: string;
  issueDate: string;
  status: "issued" | "revoked";
  certificateFileUrl: string;
  fileType: "pdf" | "jpg" | "png";
}

export interface IStudentWithoutCertificate {
  enrollmentId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
}

export interface ICertificateVerificationResult {
  valid: boolean;
  message: string;
  certificate?: {
    certificateNumber: string;
    studentName: string;
    studentEmail: string;
    courseName: string;
    batchName: string;
    issueDate: string;
    status: "issued" | "revoked";
    certificateFileUrl?: string;
  };
}

export interface IStudentCertificate {
  _id: string;
  certificateNumber: string;
  courseName: string;
  batchName: string;
  issueDate: string;
  grade?: string;
  description?: string;
  certificateFileUrl: string;
  fileType: "pdf" | "jpg" | "png";
}

interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const batchCertificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== ADMIN QUERIES ====================

    /**
     * Get all certificates (admin)
     */
    getAllCertificates: builder.query<
      ApiResponse<ICertificateListItem[]>,
      { page?: number; limit?: number; batchId?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, batchId, status }) => {
        let url = `/batch-certificates/all?page=${page}&limit=${limit}`;
        if (batchId) url += `&batchId=${batchId}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: [{ type: "BatchCertificate", id: "LIST" }],
    }),

    /**
     * Get next certificate number (for auto-generate preview)
     */
    getNextCertificateNumber: builder.query<
      ApiResponse<{ nextCertificateNumber: string }>,
      void
    >({
      query: () => "/batch-certificates/next-number",
    }),

    /**
     * Get certificates for a specific batch
     */
    getBatchCertificates: builder.query<
      ApiResponse<ICertificateListItem[]>,
      { batchId: string; page?: number; limit?: number }
    >({
      query: ({ batchId, page = 1, limit = 20 }) =>
        `/batch-certificates/batch/${batchId}?page=${page}&limit=${limit}`,
      providesTags: (result, error, { batchId }) => [
        { type: "BatchCertificate", id: `batch-${batchId}` },
      ],
    }),

    /**
     * Get students without certificates for a batch
     */
    getStudentsWithoutCertificate: builder.query<
      ApiResponse<IStudentWithoutCertificate[]>,
      string
    >({
      query: (batchId) =>
        `/batch-certificates/batch/${batchId}/students-without-certificate`,
      providesTags: (result, error, batchId) => [
        { type: "BatchCertificate", id: `students-${batchId}` },
      ],
    }),

    /**
     * Get certificate by ID (admin)
     */
    getCertificateById: builder.query<ApiResponse<IBatchCertificate>, string>({
      query: (certificateId) =>
        `/batch-certificates/admin/${certificateId}`,
      providesTags: (result, error, id) => [
        { type: "BatchCertificate", id },
      ],
    }),

    // ==================== STUDENT QUERIES ====================

    /**
     * Get student's own certificates
     */
    getMyCertificates: builder.query<ApiResponse<IStudentCertificate[]>, void>({
      query: () => "/batch-certificates/my-certificates",
      providesTags: [{ type: "BatchCertificate", id: "MY_CERTIFICATES" }],
    }),

    // ==================== PUBLIC QUERIES ====================

    /**
     * Verify certificate (public)
     */
    verifyCertificate: builder.query<
      ApiResponse<ICertificateVerificationResult[]>,
      { email?: string; certificateNumber?: string }
    >({
      query: ({ email, certificateNumber }) => {
        let url = "/batch-certificates/verify?";
        if (email) url += `email=${encodeURIComponent(email)}`;
        if (certificateNumber) url += `certificateNumber=${certificateNumber}`;
        return url;
      },
    }),

    /**
     * Get public certificate details
     */
    getPublicCertificate: builder.query<
      ApiResponse<ICertificateVerificationResult["certificate"]>,
      string
    >({
      query: (certificateNumber) =>
        `/batch-certificates/public/${certificateNumber}`,
    }),

    // ==================== MUTATIONS ====================

    /**
     * Issue a new certificate (admin)
     * Note: Uses FormData for file upload
     */
    issueCertificate: builder.mutation<
      ApiResponse<IBatchCertificate>,
      FormData
    >({
      query: (formData) => ({
        url: "/batch-certificates/issue",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "BatchCertificate", id: "LIST" },
        { type: "BatchCertificate", id: "MY_CERTIFICATES" },
      ],
    }),

    /**
     * Revoke a certificate (admin)
     */
    revokeCertificate: builder.mutation<
      ApiResponse<IBatchCertificate>,
      { certificateId: string; reason: string }
    >({
      query: ({ certificateId, reason }) => ({
        url: `/batch-certificates/${certificateId}/revoke`,
        method: "DELETE",
        body: { reason },
      }),
      invalidatesTags: [{ type: "BatchCertificate", id: "LIST" }],
    }),
  }),
});

export const {
  // Admin
  useGetAllCertificatesQuery,
  useGetNextCertificateNumberQuery,
  useGetBatchCertificatesQuery,
  useGetStudentsWithoutCertificateQuery,
  useGetCertificateByIdQuery,
  // Student
  useGetMyCertificatesQuery,
  // Public
  useVerifyCertificateQuery,
  useLazyVerifyCertificateQuery,
  useGetPublicCertificateQuery,
  // Mutations
  useIssueCertificateMutation,
  useRevokeCertificateMutation,
} = batchCertificateApi;

export default batchCertificateApi;
