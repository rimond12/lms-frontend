"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  Edit,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  Layers,
  ChevronRight,
  Search,
  Filter,
  Download,
  ClipboardList,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBatchByIdQuery,
  useStartBatchMutation,
  useCompleteBatchMutation,
  useCancelBatchMutation,
  useReactivateBatchMutation,
  useDeleteBatchMutation,
} from "@/app/redux/api/batchApi/batchApi";
import { useGetBatchModulesQuery } from "@/app/redux/api/batchModuleApi/batchModuleApi";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ActionButton } from "@/components/ui/ActionButton";
import RecentActivity from "./RecentActivity";

// Stats Card Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "gray",
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
  trend?: { value: number; isPositive: boolean };
}) => {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; text: string }
  > = {
    gray: { bg: "bg-gray-50", icon: "text-gray-600", text: "text-gray-900" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-900" },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      text: "text-green-900",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      text: "text-amber-900",
    },
    red: { bg: "bg-red-50", icon: "text-red-600", text: "text-red-900" },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      text: "text-purple-900",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      text: "text-indigo-900",
    },
  };

  const {
    bg,
    icon: iconColor,
    text,
  } = colorClasses[color] || colorClasses.gray;

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${text}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <TrendingUp
                size={14}
                className={trend.isPositive ? "" : "rotate-180"}
              />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${bg} rounded-xl`}>
          <Icon className={iconColor} size={22} />
        </div>
      </div>
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    upcoming: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock },
    running: { bg: "bg-green-100", text: "text-green-700", icon: PlayCircle },
    completed: { bg: "bg-gray-100", text: "text-gray-700", icon: CheckCircle },
    cancelled: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.upcoming;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${bg} ${text}`}
    >
      <Icon size={14} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Quick Action Card
const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  color = "gray",
  count,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  color?: string;
  count?: number;
}) => {
  const colorClasses: Record<
    string,
    {
      bg: string;
      hoverBg: string;
      border: string;
      iconBg: string;
      iconColor: string;
    }
  > = {
    indigo: {
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-100",
      border: "border-indigo-200",
      iconBg: "bg-indigo-500",
      iconColor: "text-white",
    },
    green: {
      bg: "bg-green-50",
      hoverBg: "hover:bg-green-100",
      border: "border-green-200",
      iconBg: "bg-green-500",
      iconColor: "text-white",
    },
    amber: {
      bg: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
      border: "border-amber-200",
      iconBg: "bg-amber-500",
      iconColor: "text-white",
    },
    purple: {
      bg: "bg-purple-50",
      hoverBg: "hover:bg-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
    },
    blue: {
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-500",
      iconColor: "text-white",
    },
    red: {
      bg: "bg-red-50",
      hoverBg: "hover:bg-red-100",
      border: "border-red-200",
      iconBg: "bg-red-500",
      iconColor: "text-white",
    },
    gray: {
      bg: "bg-gray-50",
      hoverBg: "hover:bg-gray-100",
      border: "border-gray-200",
      iconBg: "bg-gray-500",
      iconColor: "text-white",
    },
  };

  const { bg, hoverBg, border, iconBg, iconColor } =
    colorClasses[color] || colorClasses.gray;

  return (
    <Link href={href}>
      <div
        className={`${bg} ${hoverBg} border ${border} rounded-xl p-4 transition-all cursor-pointer group`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${iconBg} rounded-lg`}>
            <Icon className={iconColor} size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {count !== undefined && (
                <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-full">
                  {count}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <ChevronRight
            className="text-gray-400 group-hover:text-gray-600 transition-colors"
            size={18}
          />
        </div>
      </div>
    </Link>
  );
};

export default function BatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params.id as string;

  const {
    data: batchData,
    isLoading: batchLoading,
    error: batchError,
  } = useGetBatchByIdQuery(batchId);
  const { data: modulesData, isLoading: modulesLoading } =
    useGetBatchModulesQuery({ batchId });

  const [startBatch] = useStartBatchMutation();
  const [completeBatch] = useCompleteBatchMutation();
  const [cancelBatch] = useCancelBatchMutation();
  const [reactivateBatch] = useReactivateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();

  const [isProcessing, setIsProcessing] = useState(false);

  // Modal States
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Handlers
  const handleStartBatch = async () => {
    setIsProcessing(true);
    try {
      await startBatch(batchId).unwrap();
      toast.success("Batch started successfully!");
      setStartModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to start batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteBatch = async () => {
    setIsProcessing(true);
    try {
      await completeBatch(batchId).unwrap();
      toast.success("Batch marked as completed");
      setCompleteModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to complete batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBatch = async () => {
    setIsProcessing(true);
    try {
      await cancelBatch(batchId).unwrap();
      toast.success("Batch cancelled");
      setCancelModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateBatch = async () => {
    setIsProcessing(true);
    try {
      await reactivateBatch(batchId).unwrap();
      toast.success("Batch reactivated successfully!");
      setReactivateModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reactivate batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteBatch = async () => {
    setIsProcessing(true);
    try {
      await deleteBatch(batchId).unwrap();
      toast.success("Batch deleted successfully");
      router.push("/dashboard/manage-batches");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete batch");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Loading State
  if (batchLoading) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white rounded-xl shadow-sm"
                ></div>
              ))}
            </div>
            <div className="h-96 bg-white rounded-xl shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (batchError || !batchData?.data) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 rounded-xl p-8 border border-red-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Batch Not Found
            </h2>
            <p className="text-red-600 mb-4">
              The batch you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
            <Link
              href="/dashboard/manage-batches"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const batch = batchData.data;
  const course = typeof batch.courseId === "object" ? batch.courseId : null;
  const modules = modulesData?.data || [];

  // Calculate stats
  const totalStudents = batch.currentStudentCount || 0;
  const maxStudents = batch.maxStudents || 0;
  const enrollmentRate =
    maxStudents > 0 ? Math.round((totalStudents / maxStudents) * 100) : 0;
  const moduleCount = modules.length;

  // Mock data for demo (replace with real API data)
  const assignmentsSubmitted = 0; // Replace with real data
  const totalPaymentsReceived = totalStudents * (batch.totalPrice || 0);
  const pendingPayments = 0; // Replace with real data

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {batch.batchName}
                </h1>
                <StatusBadge status={batch.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {batch.batchNumber} • {course?.title || "Course"}
              </p>
            </div>
            <Link href={`/dashboard/manage-batches/${batchId}`}>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Edit size={16} />
                Edit Batch
              </button>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {batch.status === "upcoming" && (
                <ActionButton
                  icon={PlayCircle}
                  label="Start Batch"
                  variant="positive"
                  showLabel={true}
                  onClick={() => setStartModalOpen(true)}
                />
              )}

              {batch.status === "completed" && (
                <ActionButton
                  icon={PlayCircle}
                  label="Mark as Running"
                  variant="positive"
                  showLabel={true}
                  onClick={() => setStartModalOpen(true)}
                />
              )}

              {batch.status === "running" && (
                <ActionButton
                  icon={CheckCircle}
                  label="Complete"
                  variant="positive"
                  showLabel={true}
                  onClick={() => setCompleteModalOpen(true)}
                />
              )}

              {(batch.status === "upcoming" || batch.status === "running") && (
                <ActionButton
                  icon={XCircle}
                  label="Cancel"
                  variant="warning"
                  showLabel={true}
                  onClick={() => setCancelModalOpen(true)}
                />
              )}

              {batch.status === "cancelled" && (
                <ActionButton
                  icon={RotateCcw}
                  label="Reactivate"
                  variant="positive"
                  showLabel={true}
                  onClick={() => setReactivateModalOpen(true)}
                />
              )}

              {batch.currentStudentCount === 0 && (
                <ActionButton
                  icon={Trash2}
                  label="Delete"
                  variant="delete"
                  showLabel={true}
                  onClick={() => setDeleteModalOpen(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Students"
            value={totalStudents}
            subtitle={maxStudents ? `of ${maxStudents} capacity` : undefined}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Modules"
            value={moduleCount}
            subtitle="Active modules"
            icon={BookOpen}
            color="indigo"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalPaymentsReceived, batch.currency)}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Enrollment Rate"
            value={`${enrollmentRate}%`}
            icon={TrendingUp}
            color={
              enrollmentRate > 70
                ? "green"
                : enrollmentRate > 40
                  ? "amber"
                  : "red"
            }
          />
        </div>

        {/* Batch Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers size={20} />
            Batch Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(batch.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-semibold text-gray-900">
                {formatDate(batch.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Batch Price</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(batch.totalPrice, batch.currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <StatusBadge status={batch.status} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-semibold text-gray-900">
                {course?.title || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Auto Start</p>
              <p className="font-semibold text-gray-900">
                {batch.autoStart ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Installment Options</p>
              <p className="font-semibold text-gray-900">
                {batch.installmentPlans?.twoPlan?.enabled ||
                batch.installmentPlans?.threePlan?.enabled
                  ? "Available"
                  : "Full Payment Only"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="font-semibold text-gray-900">
                {formatDate(batch.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              title="Manage Modules"
              description="Add, edit, or schedule modules"
              icon={BookOpen}
              href={`/dashboard/manage-batches/${batchId}/modules`}
              color="indigo"
              count={moduleCount}
            />
            <QuickActionCard
              title="View Students"
              description="See enrolled students and their progress"
              icon={Users}
              href={`/dashboard/manage-batches/${batchId}/students`}
              color="green"
              count={totalStudents}
            />
            <QuickActionCard
              title="Payment Management"
              description="Track payments and pending dues"
              icon={DollarSign}
              href={`/dashboard/manage-batches/${batchId}/payments`}
              color="amber"
            />
            <QuickActionCard
              title="Assignments"
              description="View and grade student assignments"
              icon={ClipboardList}
              href={`/dashboard/assignments?batchId=${batchId}`}
              color="purple"
            />
            <QuickActionCard
              title="Quiz Results"
              description="See quiz performance and scores"
              icon={Award}
              href={`/dashboard/all-results?batchId=${batchId}`}
              color="blue"
            />
            <QuickActionCard
              title="Edit Batch Settings"
              description="Update batch details and configuration"
              icon={Edit}
              href={`/dashboard/manage-batches/${batchId}`}
              color="gray"
            />
          </div>
        </div>

        {/* Modules Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} />
              Modules Overview
            </h2>
            <Link
              href={`/dashboard/manage-batches/${batchId}/modules`}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Manage Modules →
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No modules yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Add modules to this batch to start teaching
              </p>
              <Link
                href={`/dashboard/manage-batches/${batchId}/modules`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <BookOpen size={16} />
                Add Modules
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.slice(0, 5).map((module: any, idx: number) => (
                <div
                  key={module._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {module.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {module.lessons?.length || 0} lessons
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      module.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {module.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
              {modules.length > 5 && (
                <p className="text-sm text-center text-gray-500 pt-2">
                  +{modules.length - 5} more modules
                </p>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="h-full">
          <RecentActivity batchId={batchId} />
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        onConfirm={handleStartBatch}
        title={
          batch.status === "completed" ? "Mark as Running?" : "Start Batch Now?"
        }
        description={
          batch.status === "completed"
            ? "Batch status will be changed back to Running."
            : "All approved students will get immediate access. Are you sure?"
        }
        confirmText={
          batch.status === "completed" ? "Make Running" : "Start Batch"
        }
        cancelText="Cancel"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onConfirm={handleCompleteBatch}
        title="Mark as Completed?"
        description="Status will change to completed. Students retain access."
        confirmText="Mark Complete"
        cancelText="Cancel"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelBatch}
        title="Cancel Batch?"
        description="Students will lose access. This action can be undone."
        confirmText="Cancel Batch"
        cancelText="Go Back"
        variant="warning"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={reactivateModalOpen}
        onClose={() => setReactivateModalOpen(false)}
        onConfirm={handleReactivateBatch}
        title="Reactivate Batch?"
        description="Status will return to Upcoming. You may need to start it manually."
        confirmText="Reactivate"
        cancelText="Cancel"
        variant="info"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteBatch}
        title="Delete Batch?"
        description="This cannot be undone. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
