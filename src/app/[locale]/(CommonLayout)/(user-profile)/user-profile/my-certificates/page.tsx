"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Award,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Calendar,
  GraduationCap,
  Shield,
  ExternalLink,
  Search,
  Grid3X3,
  List,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import {
  useGetMyCertificatesQuery,
  IStudentCertificate,
} from "@/app/redux/api/batchCertificateApi";
import Link from "next/link";

export default function MyCertificatesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCert, setSelectedCert] = useState<IStudentCertificate | null>(
    null,
  );

  // Fetch student's certificates
  const { data: certificatesData, isLoading } = useGetMyCertificatesQuery();
  const certificates = certificatesData?.data || [];

  // Filter certificates
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getFileIcon = (fileType: string, size: number = 24) => {
    if (fileType === "pdf") {
      return (
        <FileText
          className={`w-${size} h-${size} text-red-500`}
          style={{ width: size, height: size }}
        />
      );
    }
    return (
      <ImageIcon
        className={`w-${size} h-${size} text-blue-500`}
        style={{ width: size, height: size }}
      />
    );
  };

  const getCertificateUrl = (url: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "";
    return `${baseUrl}${url}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My Certificates
            </h1>
            <p className="text-gray-600">
              View and download your earned certificates
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">{certificates.length}</p>
              <p className="text-blue-100 text-sm">Total Certificates</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">{certificates.length}</p>
              <p className="text-green-100 text-sm">Verified</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-3xl font-bold">
                {certificates.filter((c) => c.grade).length}
              </p>
              <p className="text-purple-100 text-sm">With Grades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="Grid view"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            title="List view"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Certificates */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your certificates...</p>
        </div>
      ) : filteredCertificates.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-2xl">
          <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {certificates.length === 0
              ? "No Certificates Yet"
              : "No Results Found"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {certificates.length === 0
              ? "Complete your course to earn certificates. They will appear here once issued."
              : "Try adjusting your search terms."}
          </p>
          {certificates.length === 0 && (
            <Link
              href="/all-courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              Browse Courses
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Certificate Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {cert.fileType === "pdf" ? (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-red-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-500">
                      PDF Certificate
                    </span>
                  </div>
                ) : (
                  <Image
                    src={getCertificateUrl(cert.certificateFileUrl)}
                    alt={cert.courseName}
                    fill
                    className="object-cover"
                  />
                )}
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <a
                    href={getCertificateUrl(cert.certificateFileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white rounded-full hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5 text-blue-600" />
                  </a>
                  <a
                    href={getCertificateUrl(cert.certificateFileUrl)}
                    download
                    className="p-3 bg-white rounded-full hover:bg-green-50 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-green-600" />
                  </a>
                </div>
                {/* Badge */}
                <div className="absolute top-3 right-3">
                  <div className="px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                {cert.grade && (
                  <div className="absolute top-3 left-3">
                    <div className="px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      {cert.grade}
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {cert.courseName}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{cert.batchName}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(cert.issueDate)}
                  </span>
                  <span className="text-gray-400 font-mono text-xs">
                    {cert.certificateNumber.slice(0, 15)}...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Certificate
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCertificates.map((cert) => (
                <tr
                  key={cert._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(cert.fileType, 20)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {cert.certificateNumber}
                        </p>
                        <span className="text-xs text-gray-500">
                          {cert.fileType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 text-sm">
                      {cert.courseName}
                    </p>
                    <p className="text-xs text-gray-500">{cert.batchName}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(cert.issueDate)}
                  </td>
                  <td className="px-6 py-4">
                    {cert.grade ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        {cert.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={getCertificateUrl(cert.certificateFileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={getCertificateUrl(cert.certificateFileUrl)}
                        download
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Verification Link */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Certificate Verification
              </h3>
              <p className="text-sm text-gray-600">
                Share your certificate verification link with employers
              </p>
            </div>
          </div>
          <Link
            href="/verify-certificate"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Verification Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
