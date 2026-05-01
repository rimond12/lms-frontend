"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Users,
  PlayCircle,
  AlertCircle,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Layers,
  BookOpen,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetAllBatchesQuery,
  useDeleteBatchMutation,
  useStartBatchMutation,
  useCompleteBatchMutation,
  useCancelBatchMutation,
  useReactivateBatchMutation,
  IBatch,
} from "@/app/redux/api/batchApi/batchApi";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ActionButton } from "@/components/ui/ActionButton";

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<
    string,
    { bg: string; text: string; border: string; icon: any }
  > = {
    upcoming: {
      bg: "bg-blue-50/80",
      text: "text-blue-700",
      border: "border-blue-100",
      icon: Clock,
    },
    running: {
      bg: "bg-emerald-50/80",
      text: "text-emerald-700",
      border: "border-emerald-100",
      icon: PlayCircle,
    },
    completed: {
      bg: "bg-slate-100/80",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: CheckCircle,
    },
    cancelled: {
      bg: "bg-rose-50/80",
      text: "text-rose-700",
      border: "border-rose-100",
      icon: XCircle,
    },
  };

  const { bg, text, border, icon: Icon } = config[status] || config.upcoming;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${bg} ${text} ${border} shadow-sm`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: "blue" | "emerald" | "violet" | "slate";
}) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    violet: "text-violet-600 bg-violet-50 border-violet-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <div
      className={`p-4 rounded-xl border bg-white shadow-sm flex items-center justify-between ${colors[color].replace("text-", "border-").replace("bg-", "hover:border-")}`}
    >
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon size={20} />
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function ManageBatchesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [page, setPage] = useState(1);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    batchId: string;
    batchName: string;
  }>({ isOpen: false, batchId: "", batchName: "" });
  const [startModal, setStartModal] = useState<{
    isOpen: boolean;
    batchId: string;
  }>({ isOpen: false, batchId: "" });
  const [completeModal, setCompleteModal] = useState<{
    isOpen: boolean;
    batchId: string;
  }>({ isOpen: false, batchId: "" });
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean;
    batchId: string;
  }>({ isOpen: false, batchId: "" });
  const [reactivateModal, setReactivateModal] = useState<{
    isOpen: boolean;
    batchId: string;
  }>({ isOpen: false, batchId: "" });

  const [isProcessing, setIsProcessing] = useState(false);

  // API Queries
  const { data, isLoading, error } = useGetAllBatchesQuery({
    page,
    limit: 10,
    searchTerm: searchTerm || undefined,
    status: filterStatus || undefined,
    sort: "-createdAt",
  });

  const [deleteBatch] = useDeleteBatchMutation();
  const [startBatch] = useStartBatchMutation();
  const [completeBatch] = useCompleteBatchMutation();
  const [cancelBatch] = useCancelBatchMutation();
  const [reactivateBatch] = useReactivateBatchMutation();

  // Handlers
  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteBatch(deleteModal.batchId).unwrap();
      toast.success("Batch deleted successfully");
      setDeleteModal({ isOpen: false, batchId: "", batchName: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartBatch = async () => {
    setIsProcessing(true);
    try {
      await startBatch(startModal.batchId).unwrap();
      toast.success("Batch started successfully!");
      setStartModal({ isOpen: false, batchId: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to start batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteBatch = async () => {
    setIsProcessing(true);
    try {
      await completeBatch(completeModal.batchId).unwrap();
      toast.success("Batch completed!");
      setCompleteModal({ isOpen: false, batchId: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to complete batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBatch = async () => {
    setIsProcessing(true);
    try {
      await cancelBatch(cancelModal.batchId).unwrap();
      toast.success("Batch cancelled");
      setCancelModal({ isOpen: false, batchId: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateBatch = async () => {
    setIsProcessing(true);
    try {
      await reactivateBatch(reactivateModal.batchId).unwrap();
      toast.success("Batch reactivated successfully!");
      setReactivateModal({ isOpen: false, batchId: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reactivate batch");
    } finally {
      setIsProcessing(false);
    }
  };

  // Utilities
  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Loading/Error States
  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-xl shadow-sm animate-pulse"
              ></div>
            ))}
          </div>
          <div className="h-96 bg-white rounded-xl shadow-sm animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Error Loading Batches
          </h2>
          <p className="text-slate-500 text-sm">
            We couldn't load the batch data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  const batches = data?.data || [];
  const meta = data?.meta;

  const stats = {
    total: batches.length,
    upcoming: batches.filter((b) => b.status === "upcoming").length,
    running: batches.filter((b) => b.status === "running").length,
    totalStudents: batches.reduce((sum, b) => sum + b.currentStudentCount, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manage Batches
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Oversee all your course batches in one place
            </p>
          </div>
          <Link href="/dashboard/manage-batches/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle size={18} />
              <span>Create New Batch</span>
            </motion.button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Batches"
            value={stats.total}
            icon={Layers}
            color="slate"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={Clock}
            color="blue"
          />
          <StatCard
            label="Running Now"
            value={stats.running}
            icon={PlayCircle}
            color="emerald"
          />
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="violet"
          />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-40">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-slate-900/10 appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="running">Running</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3 font-semibold">Batch Info</th>
                  <th className="px-3 py-3 font-semibold">Timeline</th>
                  <th className="px-3 py-3 font-semibold">Financials</th>
                  <th className="px-3 py-3 font-semibold">Enrollment</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {batches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 text-slate-400">
                          <Layers size={24} />
                        </div>
                        <p className="font-medium text-slate-900 mb-1">
                          No batches found
                        </p>
                        <p className="text-sm">
                          Try adjusting your filters or create a new batch.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch: IBatch) => {
                    const course =
                      typeof batch.courseId === "object"
                        ? batch.courseId
                        : null;
                    return (
                      <motion.tr
                        key={batch._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="px-3 py-3">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {batch.batchName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {batch.batchNumber}
                            </span>
                            <span
                              className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]"
                              title={course?.title}
                            >
                              {course?.title || "Unknown Course"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-medium text-slate-700">
                              {formatDate(batch.startDate)}
                            </span>
                            {batch.autoStart && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-1 py-0 rounded w-fit font-medium border border-blue-100">
                                Auto
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-xs font-semibold text-slate-700">
                            {formatCurrency(batch.totalPrice, batch.currency)}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[10px] font-medium text-slate-600">
                              <span>
                                {batch.maxStudents
                                  ? `${Math.round(
                                      (batch.currentStudentCount /
                                        batch.maxStudents) *
                                        100,
                                    )}%`
                                  : "N/A"}
                              </span>
                              <span className="text-slate-400">
                                {batch.currentStudentCount}/
                                {batch.maxStudents || "∞"}
                              </span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-800 rounded-full"
                                style={{
                                  width: `${
                                    batch.maxStudents
                                      ? Math.min(
                                          100,
                                          (batch.currentStudentCount /
                                            batch.maxStudents) *
                                            100,
                                        )
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={batch.status} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/dashboard/manage-batches/${batch._id}/details`}
                            >
                              <button
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            </Link>

                            <Link
                              href={`/dashboard/manage-batches/${batch._id}/modules`}
                            >
                              <button
                                className="p-1 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                                title="Modules"
                              >
                                <BookOpen size={14} />
                              </button>
                            </Link>

                            <Link
                              href={`/dashboard/manage-batches/${batch._id}/students`}
                            >
                              <button
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Enrolled Students"
                              >
                                <Users size={14} />
                              </button>
                            </Link>

                            <Link
                              href={`/dashboard/manage-batches/${batch._id}/payments`}
                            >
                              <button
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Payments"
                              >
                                <DollarSign size={14} />
                              </button>
                            </Link>

                            {/* Contextual Actions */}
                            {batch.status === "upcoming" && (
                              <button
                                onClick={() =>
                                  setStartModal({
                                    isOpen: true,
                                    batchId: batch._id,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Start Batch"
                              >
                                <PlayCircle size={14} />
                              </button>
                            )}

                            {batch.status === "running" && (
                              <button
                                onClick={() =>
                                  setCompleteModal({
                                    isOpen: true,
                                    batchId: batch._id,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                title="Complete Batch"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}

                            {(batch.status === "upcoming" ||
                              batch.status === "running") && (
                              <button
                                onClick={() =>
                                  setCancelModal({
                                    isOpen: true,
                                    batchId: batch._id,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Cancel Batch"
                              >
                                <XCircle size={14} />
                              </button>
                            )}

                            {batch.status === "cancelled" && (
                              <button
                                onClick={() =>
                                  setReactivateModal({
                                    isOpen: true,
                                    batchId: batch._id,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Reactivate Batch"
                              >
                                <ArrowRight size={14} />
                              </button>
                            )}

                            <Link
                              href={`/dashboard/manage-batches/${batch._id}`}
                            >
                              <button
                                className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                            </Link>

                            {batch.currentStudentCount === 0 && (
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    batchId: batch._id,
                                    batchName: batch.batchName,
                                  })
                                }
                                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span>{" "}
                of {meta.totalPages} ({meta.total} items)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                    const p = Math.max(1, page - 2) + i;
                    if (p > meta.totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                          page === p
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, batchId: "", batchName: "" })
        }
        onConfirm={handleDelete}
        title="Delete Batch?"
        description={`Are you sure you want to delete "${deleteModal.batchName}"?`}
        confirmText="Delete"
        variant="danger"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={startModal.isOpen}
        onClose={() => setStartModal({ isOpen: false, batchId: "" })}
        onConfirm={handleStartBatch}
        title="Start Batch?"
        description="Students will get immediate access."
        confirmText="Start"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={completeModal.isOpen}
        onClose={() => setCompleteModal({ isOpen: false, batchId: "" })}
        onConfirm={handleCompleteBatch}
        title="Mark Complete?"
        description="Status will change to completed."
        confirmText="Complete"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, batchId: "" })}
        onConfirm={handleCancelBatch}
        title="Cancel Batch?"
        description="Students will lose access."
        confirmText="Cancel"
        variant="warning"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={reactivateModal.isOpen}
        onClose={() => setReactivateModal({ isOpen: false, batchId: "" })}
        onConfirm={handleReactivateBatch}
        title="Reactivate Batch?"
        description="Batch will return to upcoming status."
        confirmText="Reactivate"
        variant="info"
        isLoading={isProcessing}
      />
    </div>
  );
}
