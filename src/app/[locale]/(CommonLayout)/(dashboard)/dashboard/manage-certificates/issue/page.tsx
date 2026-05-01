"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  ArrowLeft,
  Upload,
  FileText,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  X,
  CheckCircle,
  AlertCircle,
  Hash,
  RefreshCw,
} from "lucide-react";
import {
  useIssueCertificateMutation,
  useGetStudentsWithoutCertificateQuery,
  useGetNextCertificateNumberQuery,
  IStudentWithoutCertificate,
} from "@/app/redux/api/batchCertificateApi";
import { useGetAllBatchesQuery } from "@/app/redux/api/batchApi/batchApi";

export default function IssueCertificatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<IStudentWithoutCertificate | null>(null);
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [useAutoNumber, setUseAutoNumber] = useState(true);
  const [manualCertNumber, setManualCertNumber] = useState("");

  // Fetch next certificate number
  const { data: nextNumberData, refetch: refetchNextNumber } =
    useGetNextCertificateNumberQuery();
  const nextCertNumber =
    nextNumberData?.data?.nextCertificateNumber || "cert-100001";

  // Fetch batches
  const { data: batchesData, isLoading: batchesLoading } =
    useGetAllBatchesQuery({});
  const batches = batchesData?.data || [];

  // Fetch students without certificates for selected batch
  const {
    data: studentsData,
    isLoading: studentsLoading,
    isFetching: studentsFetching,
  } = useGetStudentsWithoutCertificateQuery(selectedBatchId, {
    skip: !selectedBatchId,
  });
  const students = studentsData?.data || [];

  // Issue mutation
  const [issueCertificate, { isLoading: isIssuing }] =
    useIssueCertificateMutation();

  // Reset student when batch changes
  useEffect(() => {
    setSelectedStudent(null);
  }, [selectedBatchId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF, JPG, and PNG files are allowed");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBatchId) {
      toast.error("Please select a batch");
      return;
    }
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    if (!file) {
      toast.error("Please upload a certificate file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("batchId", selectedBatchId);
      formData.append("batchEnrollmentId", selectedStudent.enrollmentId);
      formData.append("issueDate", issueDate);
      if (!useAutoNumber && manualCertNumber.trim()) {
        formData.append("certificateNumber", manualCertNumber.trim());
      }
      if (grade) formData.append("grade", grade);
      if (description) formData.append("description", description);
      formData.append("certificateFile", file);

      await issueCertificate(formData).unwrap();
      toast.success("Certificate issued successfully!");
      router.push("/dashboard/manage-certificates");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to issue certificate");
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    if (file.type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/manage-certificates"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Award className="w-7 h-7 text-blue-600" />
          Issue New Certificate
        </h1>
        <p className="text-gray-600 mt-1">
          Upload and issue a certificate to a batch student
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Select Batch
          </h2>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={batchesLoading}
          >
            <option value="">
              {batchesLoading ? "Loading batches..." : "Choose a batch"}
            </option>
            {batches.map((batch: any) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName} ({batch.batchNumber})
              </option>
            ))}
          </select>
        </div>

        {/* Student Selection */}
        {selectedBatchId && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Select Student
            </h2>

            {studentsLoading || studentsFetching ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">
                  Loading students...
                </p>
              </div>
            ) : students.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-lg">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">
                  All students have certificates!
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Every student in this batch has already been issued a
                  certificate.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-[300px] overflow-y-auto">
                {students.map((student) => (
                  <button
                    key={student.enrollmentId}
                    type="button"
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      selectedStudent?.enrollmentId === student.enrollmentId
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.studentName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {student.studentName}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {student.studentEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {student.studentPhone}
                          </span>
                        </div>
                      </div>
                      {selectedStudent?.enrollmentId ===
                        student.enrollmentId && (
                        <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Student Info Preview */}
        {selectedStudent && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-3">
              Selected Student
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedStudent.studentName.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedStudent.studentName}
                </p>
                <p className="text-gray-600">{selectedStudent.studentEmail}</p>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Number */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-600" />
            Certificate Number
          </h2>

          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4 max-w-md">
            <button
              type="button"
              onClick={() => setUseAutoNumber(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                useAutoNumber
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Auto Generate
            </button>
            <button
              type="button"
              onClick={() => setUseAutoNumber(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                !useAutoNumber
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Manual Input
            </button>
          </div>

          {useAutoNumber ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Next Certificate Number:
                  </p>
                  <p className="text-lg font-mono font-bold text-green-900">
                    {nextCertNumber}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => refetchNextNumber()}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-green-600 mt-2">
                This number will be assigned automatically when you issue the
                certificate.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Certificate Number *
              </label>
              <input
                type="text"
                value={manualCertNumber}
                onChange={(e) => setManualCertNumber(e.target.value)}
                placeholder="e.g., cert-custom-001"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a unique certificate number. Make sure it doesn&apos;t
                already exist.
              </p>
            </div>
          )}
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Certificate Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade (Optional)
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., A+, 95%, Excellent"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional notes or description..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Upload Certificate
          </h2>

          {file ? (
            <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getFileIcon()}
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
            >
              <Upload
                className={`w-10 h-10 mx-auto mb-3 ${
                  dragActive ? "text-blue-500" : "text-gray-400"
                }`}
              />
              <p className="text-lg font-medium text-gray-900">
                Drop your certificate here
              </p>
              <p className="text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-3">
                Supports: PDF, JPG, PNG (Max 10MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
            }}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/manage-certificates"
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              isIssuing || !selectedBatchId || !selectedStudent || !file
            }
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isIssuing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <Award className="w-5 h-5" />
                Issue Certificate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
