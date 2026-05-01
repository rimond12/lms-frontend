"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Award,
  Plus,
  Search,
  FileText,
  Download,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetAllCertificatesQuery,
  useRevokeCertificateMutation,
  ICertificateListItem,
} from "@/app/redux/api/batchCertificateApi";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";

export default function ManageCertificatesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [revokeModal, setRevokeModal] = useState<{
    open: boolean;
    certificate: ICertificateListItem | null;
    reason: string;
  }>({
    open: false,
    certificate: null,
    reason: "",
  });

  // Fetch certificates
  const { data: certificatesData, isLoading, refetch } = useGetAllCertificatesQuery({
    page,
    limit: 20,
    batchId: selectedBatch || undefined,
    status: statusFilter || undefined,
  });

  // Fetch batches for filter
  const { data: batchesData } = useGetAllBatchesQuery({});

  // Revoke mutation
  const [revokeCertificate, { isLoading: isRevoking }] = useRevokeCertificateMutation();

  const certificates = certificatesData?.data || [];
  const batches = batchesData?.data || [];
  const meta = certificatesData?.meta;

  // Filter by search term
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRevoke = async () => {
    if (!revokeModal.certificate || !revokeModal.reason.trim()) {
      toast.error("Please provide a reason for revocation");
      return;
    }

    try {
      await revokeCertificate({
        certificateId: revokeModal.certificate._id,
        reason: revokeModal.reason,
      }).unwrap();
      toast.success("Certificate revoked successfully");
      setRevokeModal({ open: false, certificate: null, reason: "" });
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to revoke certificate");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    return <ImageIcon className="w-4 h-4 text-blue-500" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "issued") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Issued
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
        <XCircle className="w-3 h-3" />
        Revoked
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-blue-600" />
            Certificate Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student certificates for all batches
          </p>
        </div>
        <Link
          href="/dashboard/manage-certificates/issue"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Issue Certificate
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Batch Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[180px]"
            >
              <option value="">All Batches</option>
              {batches.map((batch: any) => (
                <option key={batch._id} value={batch._id}>
                  {batch.batchName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading certificates...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No certificates found</h3>
            <p className="text-gray-500 mt-1">
              {certificates.length === 0
                ? "Start by issuing a certificate to a student."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Certificate
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Course / Batch
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCertificates.map((cert) => (
                  <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(cert.fileType)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {cert.certificateNumber}
                          </p>
                          <p className="text-xs text-gray-500">{cert.fileType.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{cert.studentName}</p>
                      <p className="text-xs text-gray-500">{cert.studentEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 text-sm">{cert.courseName}</p>
                      <p className="text-xs text-gray-500">{cert.batchName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(cert.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${cert.certificateFileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${cert.certificateFileUrl}`}
                          download
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {cert.status === "issued" && (
                          <button
                            onClick={() =>
                              setRevokeModal({ open: true, certificate: cert, reason: "" })
                            }
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Revoke"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(page - 1) * meta.limit + 1} to{" "}
              {Math.min(page * meta.limit, meta.total)} of {meta.total} certificates
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Modal */}
      {revokeModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Revoke Certificate
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to revoke the certificate for{" "}
              <strong>{revokeModal.certificate?.studentName}</strong>? This action
              cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for revocation *
              </label>
              <textarea
                value={revokeModal.reason}
                onChange={(e) =>
                  setRevokeModal({ ...revokeModal, reason: e.target.value })
                }
                placeholder="Enter the reason for revoking this certificate..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setRevokeModal({ open: false, certificate: null, reason: "" })
                }
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={isRevoking || !revokeModal.reason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRevoking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Revoking...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Revoke Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
