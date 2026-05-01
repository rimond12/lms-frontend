"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  useGetAllQuizApplicationsQuery,
  useApproveQuizApplicationMutation,
  useRejectQuizApplicationMutation,
  QuizApplicationWithDetails,
} from "@/app/redux/api/QuizApi/quizApi";
import { getImageUrl } from "@/utils/imageUtils";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  Users,
  Eye,
  User,
  Mail,
  Search,
  MapPin,
  CreditCard,
  Phone,
} from "lucide-react";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 ${className}`}
  >
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    PENDING: {
      icon: <Clock className="w-3 h-3" />,
      text: "Pending",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    APPROVED: {
      icon: <CheckCircle className="w-3 h-3" />,
      text: "Approved",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    REJECTED: {
      icon: <XCircle className="w-3 h-3" />,
      text: "Rejected",
      className: "bg-red-100 text-[#AF4444] border-red-200",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.icon}
      {config.text}
    </span>
  );
};

const RejectModal = ({
  isOpen,
  onClose,
  onReject,
  applicationIds,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  applicationIds: string[];
  isLoading: boolean;
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onReject(reason.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Reject{" "}
          {applicationIds.length > 1
            ? `${applicationIds.length} Applications`
            : "Application"}
        </h3>
        {applicationIds.length > 1 && (
          <p className="text-sm text-gray-600 mb-4">
            All selected pending applications will be rejected with this reason.
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
              rows={4}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isLoading || !reason.trim()}
            >
              {isLoading ? "Rejecting..." : "Reject Application"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default function AdminQuizApplications() {
  const {
    data: applications,
    isLoading,
    error,
  } = useGetAllQuizApplicationsQuery();

  const [approveApplication] = useApproveQuizApplicationMutation();
  const [rejectApplication] = useRejectQuizApplicationMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterQuiz, setFilterQuiz] = useState<string>("ALL");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetIds, setRejectTargetIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterQuiz]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Filter applications based on search and status
  const filteredApplications = useMemo(
    () =>
      applications?.filter((app) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          !term ||
          app.quiz?.title?.toLowerCase().includes(term) ||
          app.user?.name?.toLowerCase().includes(term) ||
          app.user?.email?.toLowerCase().includes(term);
        const matchesStatus =
          filterStatus === "ALL" || app.status === filterStatus;
        const matchesQuiz =
          filterQuiz === "ALL" || app.quiz?._id === filterQuiz;
        return matchesSearch && matchesStatus && matchesQuiz;
      }) || [],
    [applications, searchTerm, filterStatus, filterQuiz],
  );

  // Distinct quiz list for filter
  const quizOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    (applications || []).forEach((app) => {
      if (app.quiz?._id)
        map.set(app.quiz._id, { id: app.quiz._id, title: app.quiz.title });
    });
    return Array.from(map.values());
  }, [applications]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredApplications.length / pageSize) || 1;
  const currentPageItems = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const allPageItemsSelected =
    currentPageItems.length > 0 &&
    currentPageItems.every((a) => selectedIds.has(a._id!));
  const toggleSelectAllCurrentPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageItemsSelected) {
        currentPageItems.forEach((a) => next.delete(a._id!));
      } else {
        currentPageItems.forEach((a) => next.add(a._id!));
      }
      return next;
    });
  };

  const handleApprove = async (applicationId: string) => {
    setIsProcessing(true);
    try {
      await approveApplication(applicationId).unwrap();
      toast.success("Application approved successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve application");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = Array.from(selectedIds).filter((id) => {
      const app = filteredApplications.find((a) => a._id === id);
      return app?.status === "PENDING";
    });
    if (pendingIds.length === 0) {
      toast.error("No pending selected applications to approve");
      return;
    }
    setIsProcessing(true);
    const results = await Promise.allSettled(
      pendingIds.map((id) => approveApplication(id).unwrap()),
    );
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.length - successCount;
    if (successCount) toast.success(`Approved ${successCount} application(s)`);
    if (failCount) toast.error(`${failCount} approval(s) failed`);
    setIsProcessing(false);
    clearSelection();
  };

  const handleReject = async (reason: string) => {
    setIsProcessing(true);
    try {
      const targetIds = rejectTargetIds;
      const pendingIds = targetIds.filter((id) => {
        const app = filteredApplications.find((a) => a._id === id);
        return app?.status === "PENDING";
      });
      const results = await Promise.allSettled(
        pendingIds.map((id) =>
          rejectApplication({
            applicationId: id,
            rejectionReason: reason,
          }).unwrap(),
        ),
      );
      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = results.length - successCount;
      if (successCount)
        toast.success(`Rejected ${successCount} application(s)`);
      if (failCount) toast.error(`${failCount} rejection(s) failed`);
      setRejectModalOpen(false);
      setRejectTargetIds([]);
      clearSelection();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject application(s)");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (ids: string | string[]) => {
    const arr = Array.isArray(ids) ? ids : [ids];
    setRejectTargetIds(arr);
    setRejectModalOpen(true);
  };

  // Statistics
  const stats = applications
    ? {
        total: applications.length,
        pending: applications.filter((app) => app.status === "PENDING").length,
        approved: applications.filter((app) => app.status === "APPROVED")
          .length,
        rejected: applications.filter((app) => app.status === "REJECTED")
          .length,
      }
    : { total: 0, pending: 0, approved: 0, rejected: 0 };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {" "}
            Applications Management
          </h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-800 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Applications
            </h3>
            <p className="text-gray-600">
              Failed to load quiz applications. Please try again later.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl mb-4 sm:text-2xl uppercase  font-bold text-gray-900 leading-tight">
          Course And Quiz Applications Management
        </h1>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full sm:w-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quiz title, user name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-80 text-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={filterQuiz}
              onChange={(e) => setFilterQuiz(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="ALL">All Quizzes</option>
              {quizOptions.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}/page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm sticky top-0 z-30">
            <span className="font-medium text-blue-700">
              {selectedIds.size} selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-black disabled:opacity-50 w-full xs:w-auto"
              >
                Approve
              </button>
              <button
                onClick={() => openRejectModal(Array.from(selectedIds))}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-md bg-red-800 text-white hover:bg-red-700 disabled:opacity-50 w-full xs:w-auto"
              >
                Reject
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full xs:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.rejected}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== "ALL"
                ? "No Matching Applications"
                : "No Applications Yet"}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "ALL"
                ? "Try adjusting your search criteria or filters."
                : "Quiz applications will appear here when users start applying."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Select all current page */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={allPageItemsSelected}
                onChange={toggleSelectAllCurrentPage}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">
                Select page ({currentPageItems.length})
              </span>
            </div>
            {currentPageItems.map(
              (application: QuizApplicationWithDetails, index: number) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    {/* Compact Header with Quiz Image and Basic Info */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                      {/* Small Quiz Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {application.quiz?.descriptionImage ? (
                          <img
                            src={getImageUrl(application.quiz.descriptionImage)}
                            alt={application.quiz.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/400x300/e2e8f0/64748b?text=Quiz";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Quiz Title and Status */}
                      <div className="flex-grow min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 truncate">
                          {application.quiz?.title || "Quiz Title"}
                        </h3>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={application.status} />
                          <span className="text-xs text-gray-500">
                            Applied:{" "}
                            {new Date(
                              application.appliedAt!,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Selection Checkbox and Actions */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(application._id!)}
                          onChange={() => toggleSelect(application._id!)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        {application.status === "PENDING" && (
                          <div className="hidden sm:flex gap-2">
                            <button
                              onClick={() => handleApprove(application._id!)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-black text-xs disabled:opacity-50 transition-colors"
                            >
                              {isProcessing ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => openRejectModal(application._id!)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-red-800 text-white rounded-md hover:bg-red-700 text-xs disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Profile Section */}
                    <div className="p-4">
                      <div className="flex items-start gap-4 mb-4">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          {application.user?.profilePhoto ? (
                            <img
                              src={getImageUrl(application.user.profilePhoto)}
                              alt={application.user?.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextElementSibling?.classList.remove(
                                  "hidden",
                                );
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold border-2 border-blue-200 shadow-sm ${application.user?.profilePhoto ? "hidden" : ""}`}
                          >
                            {(
                              application.user?.name ||
                              application.userName ||
                              "U"
                            )
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-base font-semibold text-gray-900 truncate">
                              {application.user?.name || application.userName}
                            </h4>
                            {application.user?.emailVerified && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>

                          {/* Contact Information Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">
                                {application.user?.email ||
                                  application.userEmail}
                              </span>
                            </div>

                            {application.user?.mobileNumber && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{application.user.mobileNumber}</span>
                              </div>
                            )}

                            {application.user?.nid && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <CreditCard className="w-4 h-4 flex-shrink-0" />
                                <span>NID: {application.user.nid}</span>
                              </div>
                            )}

                            {application.user?.address && (
                              <div className="flex items-start gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2 text-xs">
                                  {application.user.address}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Missing Information Alert */}
                          {(!application.user?.nid ||
                            !application.user?.address ||
                            !application.user?.mobileNumber) && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-yellow-800">
                                  <span className="font-medium">
                                    Incomplete profile:
                                  </span>
                                  <div className="mt-1">
                                    {!application.user?.nid && (
                                      <span className="inline-block mr-2">
                                        • NID missing
                                      </span>
                                    )}
                                    {!application.user?.address && (
                                      <span className="inline-block mr-2">
                                        • Address missing
                                      </span>
                                    )}
                                    {!application.user?.mobileNumber && (
                                      <span className="inline-block mr-2">
                                        • Mobile missing
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile Action Buttons */}
                      {application.status === "PENDING" && (
                        <div className="flex sm:hidden gap-2 mt-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => handleApprove(application._id!)}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black text-sm disabled:opacity-50 transition-colors"
                          >
                            {isProcessing ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() => openRejectModal(application._id!)}
                            disabled={isProcessing}
                            className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {application.rejectionReason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-[#AF4444]">
                            <span className="font-medium">
                              Rejection Reason:
                            </span>{" "}
                            {application.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Additional Timestamps */}
                      {application.approvedAt && (
                        <div className="mt-3 text-xs text-gray-500">
                          {application.status === "APPROVED"
                            ? "Approved"
                            : "Processed"}
                          :{" "}
                          {new Date(
                            application.approvedAt,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ),
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredApplications.length > 0 && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredApplications.length)} of{" "}
              {filteredApplications.length}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                ⏮
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                ⏭
              </button>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <AnimatePresence>
          {rejectModalOpen && (
            <RejectModal
              isOpen={rejectModalOpen}
              onClose={() => {
                setRejectModalOpen(false);
                setRejectTargetIds([]);
              }}
              onReject={handleReject}
              applicationIds={rejectTargetIds}
              isLoading={isProcessing}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
