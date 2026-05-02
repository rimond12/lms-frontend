"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Award,
  User,
  Mail,
  Calendar,
  GraduationCap,
  FileText,
  Download,
  Eye,
  AlertCircle,
  ArrowRight,
  Loader2,
  Building,
} from "lucide-react";
import {
  useLazyVerifyCertificateQuery,
  ICertificateVerificationResult,
} from "@/app/redux/api/batchCertificateApi";

export default function VerifyCertificatePage() {
  const [searchType, setSearchType] = useState<"email" | "certificate">(
    "email"
  );
  const [searchValue, setSearchValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [verify, { data, isLoading, error }] = useLazyVerifyCertificateQuery();

  const results = data?.data || [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setHasSearched(true);
    const params =
      searchType === "email"
        ? { email: searchValue.trim() }
        : { certificateNumber: searchValue.trim() };

    await verify(params);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Certificate Verification
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Verify the authenticity of certificates issued by IMMIGRANT JOBS WORLD .
              Enter the student&apos;s email or certificate number to validate.
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <form onSubmit={handleSearch}>
            {/* Search Type Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setSearchType("email");
                  setSearchValue("");
                  setHasSearched(false);
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  searchType === "email"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Mail className="w-4 h-4" />
                By Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchType("certificate");
                  setSearchValue("");
                  setHasSearched(false);
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  searchType === "certificate"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                By Certificate #
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={searchType === "email" ? "email" : "text"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={
                  searchType === "email"
                    ? "Enter student email address..."
                    : "Enter certificate number (e.g.,DFL-CERT-100001)"
                }
                className="w-full pl-12 pr-36 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <button
                type="submit"
                disabled={isLoading || !searchValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying certificate...</p>
          </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Certificates Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn&apos;t find any certificates matching your search.
              Please check the
              {searchType === "email"
                ? " email address"
                : " certificate number"}{" "}
              and try again.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>
                Make sure you&apos;re using the registered email or exact
                certificate number
              </span>
            </div>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600 mb-6">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Found {results.length} certificate
                {results.length > 1 ? "s" : ""}
              </span>
            </div>

            {results.map(
              (result: ICertificateVerificationResult, index: number) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Status Banner */}
                  <div
                    className={`px-6 py-3 flex items-center gap-3 ${
                      result.valid
                        ? "bg-green-50 border-b border-green-100"
                        : "bg-red-50 border-b border-red-100"
                    }`}
                  >
                    {result.valid ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          Valid Certificate
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800">
                          Certificate Revoked
                        </span>
                      </>
                    )}
                  </div>

                  {result.certificate && (
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Certificate Details */}
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Student Name
                              </p>
                              <p className="font-semibold text-gray-900">
                                {result.certificate.studentName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Mail className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-semibold text-gray-900">
                                {result.certificate.studentEmail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <GraduationCap className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Course</p>
                              <p className="font-semibold text-gray-900">
                                {result.certificate.courseName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {result.certificate.batchName}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Certificate Number
                              </p>
                              <p className="font-mono font-semibold text-gray-900">
                                {result.certificate.certificateNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Calendar className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Issue Date
                              </p>
                              <p className="font-semibold text-gray-900">
                                {formatDate(result.certificate.issueDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <Building className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Issued By</p>
                              <p className="font-semibold text-gray-900">
                                IMMIGRANT JOBS WORLD
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {result.certificate.certificateFileUrl &&
                        result.valid && (
                          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                            <a
                              href={getCertificateUrl(
                                result.certificate.certificateFileUrl
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Certificate
                            </a>
                            <a
                              href={getCertificateUrl(
                                result.certificate.certificateFileUrl
                              )}
                              download
                              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Info Cards */}
        {!hasSearched && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Authentic Verification
              </h3>
              <p className="text-gray-600 text-sm">
                All certificates are digitally verified and stored in our secure
                database.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Instant Results
              </h3>
              <p className="text-gray-600 text-sm">
                Get immediate verification results with complete certificate
                details.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Download & Share
              </h3>
              <p className="text-gray-600 text-sm">
                View and download the original certificate for your records.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Want to Earn a Certificate?
          </h2>
          <p className="text-gray-400 mb-6">
            Enroll in our professional courses and earn industry-recognized
            certificates.
          </p>
          <Link
            href="/all-courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <GraduationCap className="w-5 h-5" />
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
