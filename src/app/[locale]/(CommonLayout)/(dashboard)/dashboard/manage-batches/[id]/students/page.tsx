"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRightLeft,
  Trash2,
  UserPlus,
  DollarSign,
  Eye,
  Mail,
  Phone,
  X,
  Loader,
  MessageCircle,
  Key,
  Copy,
  EyeOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBatchByIdQuery,
  useGetAllBatchesQuery,
  IBatch,
} from "@/app/redux/api/batchApi/batchApi";
import {
  useGetBatchEnrollmentsQuery,
  useRemoveFromBatchMutation,
  useShiftToBatchMutation,
  useAddStudentToBatchMutation,
  IBatchEnrollment,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import {
  useGetAllUsersQuery,
  useLazySearchUsersQuery,
} from "@/app/redux/api/users/userApi";
import BulkEnrollmentModal from "./BulkEnrollmentModal";
import ExportButton from "@/components/common/ExportButton";

// Status badge component
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-700", icon: Clock },
    partial: { bg: "bg-blue-50", text: "text-blue-700", icon: DollarSign },
    completed: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle },
    rejected: { bg: "bg-orange-50", text: "text-orange-700", icon: XCircle },
  };

  const { bg, text, icon: Icon } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text}`}
    >
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EnrollmentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string }> = {
    pending_payment: { bg: "bg-yellow-50", text: "text-yellow-700" },
    payment_approved: { bg: "bg-blue-50", text: "text-blue-700" },
    active: { bg: "bg-green-50", text: "text-green-700" },
    completed: { bg: "bg-gray-100", text: "text-gray-700" },
    cancelled: { bg: "bg-orange-50", text: "text-orange-700" },
    shifted: { bg: "bg-purple-50", text: "text-purple-700" },
  };

  const { bg, text } = config[status] || config.pending_payment;
  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${bg} ${text}`}
    >
      {label}
    </span>
  );
};

// Password Cell Component
const PasswordCell = ({ password }: { password: string }) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Password copied!");
  };

  return (
    <div className="flex items-center gap-2">
      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700 min-w-[80px] text-center">
        {showPassword ? password : "••••••••"}
      </code>
      <button
        onClick={() => setShowPassword(!showPassword)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title={showPassword ? "Hide Password" : "Show Password"}
      >
        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      <button
        onClick={() => copyToClipboard(password)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
        title="Copy Password"
      >
        <Copy size={14} />
      </button>
    </div>
  );
};

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 z-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function BatchStudentsPage() {
  const params = useParams();
  const batchId = params.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterEnrollmentStatus, setFilterEnrollmentStatus] = useState("");
  const [page, setPage] = useState(1);

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState("");
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<IBatchEnrollment | null>(null);
  const [selectedTargetBatch, setSelectedTargetBatch] = useState("");
  const [shiftReason, setShiftReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [skipPayment, setSkipPayment] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Enhanced Add Student Modal state
  const [addStudentTab, setAddStudentTab] = useState<"existing" | "new">(
    "existing",
  );
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [paymentMode, setPaymentMode] = useState<"skip" | "full" | "partial">(
    "full",
  );
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<
    "1-plan" | "2-plan" | "3-plan"
  >("1-plan");
  // Discount state
  const [discountTierId, setDiscountTierId] = useState("");
  const [discountType, setDiscountType] = useState<
    "none" | "percentage" | "fixed"
  >("none");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountScope, setDiscountScope] = useState<"all" | "first-only">(
    "all",
  );
  const [discountReason, setDiscountReason] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const { data: batchData, isLoading: isLoadingBatch } =
    useGetBatchByIdQuery(batchId);
  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    refetch,
  } = useGetBatchEnrollmentsQuery({
    batchId,
    searchTerm: searchTerm || undefined,
    paymentStatus: filterPaymentStatus || undefined,
    enrollmentStatus: filterEnrollmentStatus || undefined,
    page,
    limit: 20,
  });

  // Get all batches for shift dropdown
  const { data: allBatchesData } = useGetAllBatchesQuery({ limit: 100 });

  // Get users for add student dropdown
  const { data: usersData, isLoading: isLoadingUsers } =
    useGetAllUsersQuery(undefined);

  const [removeFromBatch, { isLoading: isRemoving }] =
    useRemoveFromBatchMutation();
  const [shiftToBatch, { isLoading: isShifting }] = useShiftToBatchMutation();
  const [addStudentToBatch, { isLoading: isAdding }] =
    useAddStudentToBatchMutation();
  const [searchUsers, { isLoading: isSearching }] = useLazySearchUsersQuery();

  // Handle user search with debounce
  const handleUserSearch = async (term: string) => {
    setUserSearchTerm(term);
    if (term.length >= 2) {
      try {
        const result = await searchUsers({
          searchTerm: term,
          limit: 10,
        }).unwrap();
        setSearchResults(result?.data || []);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const batch = batchData?.data;
  const enrollments = enrollmentsData?.data || [];
  const meta = enrollmentsData?.meta;
  const allBatches =
    allBatchesData?.data?.filter(
      (b: IBatch) =>
        b._id !== batchId &&
        b.status !== "completed" &&
        b.status !== "cancelled",
    ) || [];

  // Filter users locally based on search term
  const allUsers = usersData?.data || [];
  const users = userSearchTerm
    ? allUsers.filter(
        (user: any) =>
          user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()),
      )
    : allUsers;

  // Handle Remove Modal Trigger
  const handleRemoveClick = (enrollmentId: string, studentName: string) => {
    setRemoveTarget({ id: enrollmentId, name: studentName });
    setRemoveConfirmText("");
    setRemoveModalOpen(true);
  };

  // Confirm Removal
  const confirmRemove = async () => {
    if (!removeTarget) return;

    if (removeConfirmText.trim() !== removeTarget.name) {
      toast.error(
        `Confirmation failed. You must type "${removeTarget.name}" exactly.`,
      );
      return;
    }

    try {
      await removeFromBatch({ enrollmentId: removeTarget.id }).unwrap();
      toast.success("Student removed from batch permanently");
      setRemoveModalOpen(false);
      setRemoveTarget(null);
      setRemoveConfirmText("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove student");
    }
  };

  // Handle Shift
  const handleOpenShiftModal = (enrollment: IBatchEnrollment) => {
    setSelectedEnrollment(enrollment);
    setSelectedTargetBatch("");
    setShiftReason("");
    setShiftModalOpen(true);
  };

  const handleShift = async () => {
    if (!selectedEnrollment || !selectedTargetBatch) {
      toast.error("Please select a target batch");
      return;
    }

    try {
      await shiftToBatch({
        enrollmentId: selectedEnrollment._id,
        newBatchId: selectedTargetBatch,
        reason: shiftReason || undefined,
      }).unwrap();
      toast.success("Student shifted to new batch successfully!");
      setShiftModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to shift student");
    }
  };

  // Handle Add Student (Enhanced)
  const handleAddStudent = async () => {
    // Validation based on tab
    if (addStudentTab === "existing" && !selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    if (addStudentTab === "new") {
      if (!newUserData.name || !newUserData.email || !newUserData.phone) {
        toast.error("Please fill in all required fields for new user");
        return;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
      // Validate phone number (at least 10 digits)
      if (newUserData.phone.length < 10) {
        toast.error("Phone number must be at least 10 digits");
        return;
      }
    }

    // Build payment info
    let paymentInfo = undefined;
    if (paymentMode !== "skip") {
      paymentInfo = {
        paidAmount: paymentMode === "full" ? effectivePrice : paidAmount,
        paymentMethod: paymentMethod || "Cash",
        transactionId: transactionId || undefined,
      };
    }

    try {
      await addStudentToBatch({
        batchId,
        // User selection (existing or new)
        userId: addStudentTab === "existing" ? selectedUserId : undefined,
        createNewUser: addStudentTab === "new",
        // Auto-generate password from phone number
        newUserData:
          addStudentTab === "new"
            ? {
                ...newUserData,
                password: newUserData.phone, // Use phone as password
              }
            : undefined,
        // Payment
        skipPayment: paymentMode === "skip",
        paymentInfo,
        selectedPlan,
        // Discount
        ...(discountType !== "none" && {
          discountType,
          discountValue,
          discountScope,
          discountReason: discountReason || undefined,
          discountTierId: discountTierId || undefined,
        }),
      }).unwrap();

      toast.success(
        addStudentTab === "new"
          ? "New student account created and added to batch! Confirmation email sent."
          : "Student added to batch successfully! Confirmation email sent.",
      );

      // Reset form
      resetAddStudentForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add student");
    }
  };

  const resetAddStudentForm = () => {
    setAddStudentModalOpen(false);
    setAddStudentTab("existing");
    setSelectedUserId("");
    setUserSearchTerm("");
    setSearchResults([]);
    setNewUserData({ name: "", email: "", phone: "" });
    setPaymentMode("full");
    setPaidAmount(0);
    setPaymentMethod("");
    setTransactionId("");
    setSelectedPlan("1-plan");
    setSkipPayment(false);
    setDiscountTierId("");
    setDiscountType("none");
    setDiscountValue(0);
    setDiscountScope("all");
    setDiscountReason("");
  };

  // Check if there's an active plan auto-discount
  const autoPlanDiscount = useMemo(() => {
    return (batch?.planDiscounts || []).find(
      (pd: any) => pd.planType === selectedPlan && pd.isActive,
    );
  }, [batch?.planDiscounts, selectedPlan]);

  // The actual applied discount values
  const appliedDiscount = useMemo(() => {
    if (discountType !== "none" && discountValue > 0) {
      return { type: discountType, value: discountValue, source: "manual" };
    }
    if (autoPlanDiscount) {
      return {
        type: autoPlanDiscount.discountType,
        value: autoPlanDiscount.discountValue,
        source: "auto",
      };
    }
    return { type: "none", value: 0, source: "none" };
  }, [discountType, discountValue, autoPlanDiscount]);

  // Discount-aware effective price — used in Payment Option display
  const effectivePrice = (() => {
    const base = batch?.totalPrice ?? 0;
    if (appliedDiscount.type === "none" || appliedDiscount.value <= 0)
      return base;
    if (appliedDiscount.type === "percentage")
      return Math.max(0, Math.round(base * (1 - appliedDiscount.value / 100)));
    return Math.max(0, base - appliedDiscount.value);
  })();

  // Per-installment amount (for multi-plan "1st Installment" suggestion)
  const installmentCount =
    selectedPlan === "3-plan" ? 3 : selectedPlan === "2-plan" ? 2 : 1;
  const firstInstallmentAmount = (() => {
    const opt = batch?.installmentOptions?.find(
      (o: any) => o.planType === selectedPlan,
    );
    if (opt?.amountPerInstallment) {
      if (appliedDiscount.type === "none" || appliedDiscount.value <= 0)
        return opt.amountPerInstallment;
      return Math.round(effectivePrice / installmentCount);
    }
    return Math.round(effectivePrice / installmentCount);
  })();

  const formatDate = (date: string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "BDT") => {
    return `${currency} ${amount?.toLocaleString() || 0}`;
  };

  // Get user password from enrollment (safely)
  const getUserPassword = (enrollment: IBatchEnrollment): string => {
    if (
      typeof enrollment.userId === "object" &&
      enrollment.userId?.plainPassword
    ) {
      return enrollment.userId.plainPassword;
    }
    // Fallback: use phone number as password (since that's how we generate it)
    return enrollment.studentInfo?.phone || "-";
  };

  // Copy password to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Password copied!");
  };

  // Send info via WhatsApp
  const sendWhatsAppMessage = (enrollment: IBatchEnrollment) => {
    const phone = enrollment.studentInfo?.phone?.replace(/\D/g, "");
    const courseName =
      typeof enrollment.courseId === "object"
        ? enrollment.courseId.title
        : "Course";
    const password = getUserPassword(enrollment);

    const message = `🎓 *IMMIGRANT JOBS WORLD Learning Portal - Account Information*

━━━━━━━━━━━━━━━━━━━━━━

👤 *Student Name:* ${enrollment.studentInfo?.name}
📧 *Email:* ${enrollment.studentInfo?.email}
🔑 *Password:* ${password}

━━━━━━━━━━━━━━━━━━━━━━

📚 *Course:* ${courseName}
📋 *Batch:* ${batch?.batchName}
🔢 *Batch Number:* ${batch?.batchNumber}
🎫 *Enrollment ID:* ${enrollment.enrollmentNumber}

━━━━━━━━━━━━━━━━━━━━━━

💰 *Payment Status:* ${enrollment.paymentStatus?.toUpperCase()}
✅ *Paid:* BDT ${enrollment.totalPaid?.toLocaleString()}
⏳ *Due:* BDT ${enrollment.totalDue?.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━

🔗 *Login URL:* ${window.location.origin}/login

Thank you for enrolling with IMMIGRANT JOBS WORLD! 🚀`;

    // Format phone for WhatsApp (add 88 for Bangladesh if not present)
    let whatsappPhone = phone;
    if (phone && !phone.startsWith("88") && phone.length === 11) {
      whatsappPhone = "88" + phone;
    }

    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (isLoadingBatch) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-96 bg-white rounded-xl shadow-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-200">
            <AlertCircle className="mx-auto text-amber-600 mb-3" size={40} />
            <p className="text-amber-800 font-semibold mb-2">Batch not found</p>
            <Link
              href="/dashboard/manage-batches"
              className="text-amber-700 hover:underline text-sm"
            >
              Go back to batches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Stats
  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e) => e.enrollmentStatus === "active").length,
    pendingPayment: enrollments.filter((e) => e.paymentStatus === "pending")
      .length,
    completed: enrollments.filter((e) => e.paymentStatus === "completed")
      .length,
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link
            href="/dashboard/manage-batches"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {batch.batchName} - Students
            </h1>
            <p className="text-sm text-gray-500">
              {batch.batchNumber} | {batch.currentStudentCount} students
              enrolled
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAddStudentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <UserPlus size={16} />
              Add Student
            </button>
            <button
              onClick={() => setBulkModalOpen(true)}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Import CSV/Excel
            </button>
            <ExportButton
              data={
                enrollments?.map((enrollment: IBatchEnrollment) => ({
                  "Student Name": enrollment.studentInfo?.name,
                  "Student Email": enrollment.studentInfo?.email,
                  "Student Phone": enrollment.studentInfo?.phone,
                  "Student ID": enrollment.enrollmentNumber || "N/A",
                  "Batch Name": (enrollment.batchId as any)?.batchName,
                  "Batch Number": (enrollment.batchId as any)?.batchNumber,
                  Course: (enrollment.courseId as any)?.title,
                  "Payment Status": enrollment.paymentStatus,
                  "Enrollment Status": enrollment.enrollmentStatus,
                  "Total Paid": enrollment.totalPaid,
                  "Total Due": enrollment.totalDue,
                  "Enrolled At": new Date(
                    enrollment.enrolledAt,
                  ).toLocaleDateString(),
                })) || []
              }
              filename={`batch-students-${batchId}`}
            />
            <Link
              href={`/dashboard/manage-batches/${batchId}/payments`}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <DollarSign size={16} />
              Payments
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Total Students
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Active Access
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.active}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Pending Payment
            </p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.pendingPayment}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-gray-500 uppercase">
              Fully Paid
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filterPaymentStatus}
              onChange={(e) => {
                setFilterPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterEnrollmentStatus}
              onChange={(e) => {
                setFilterEnrollmentStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">All Enrollment Status</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="payment_approved">Payment Approved</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Enrollments Table */}
        {isLoadingEnrollments ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {searchTerm || filterPaymentStatus || filterEnrollmentStatus
                ? "Try adjusting your filters"
                : "No students have enrolled in this batch yet"}
            </p>
            <button
              onClick={() => setAddStudentModalOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <UserPlus size={16} />
              Add First Student
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Credentials
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Plan & Fees
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrollments.map((enrollment: IBatchEnrollment) => (
                    <motion.tr
                      key={enrollment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Student Details */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-xs">
                            {enrollment.studentInfo?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {enrollment.studentInfo?.name || "Unknown"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                {enrollment.enrollmentNumber}
                              </span>
                              {enrollment.hasAccess ? (
                                <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                                  <CheckCircle size={10} /> Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                                  <XCircle size={10} /> No Access
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                              <Mail size={12} />
                            </div>
                            <span
                              className="truncate max-w-[180px]"
                              title={enrollment.studentInfo?.email}
                            >
                              {enrollment.studentInfo?.email || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0 text-gray-400">
                              <Phone size={12} />
                            </div>
                            <span className="font-mono">
                              {enrollment.studentInfo?.phone || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Credentials */}
                      <td className="px-4 py-3 align-middle text-center">
                        <div className="inline-block">
                          <PasswordCell
                            password={getUserPassword(enrollment)}
                          />
                        </div>
                      </td>

                      {/* Plan & Fees */}
                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                              {enrollment.selectedPlan?.replace(
                                "-plan",
                                " Pay",
                              )}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              <span>
                                Paid:{" "}
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(enrollment.totalPaid)}
                                </span>
                              </span>
                            </div>
                            {enrollment.totalDue > 0 && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                <span>
                                  Due:{" "}
                                  <span className="font-medium text-red-600">
                                    {formatCurrency(enrollment.totalDue)}
                                  </span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1.5 items-start">
                          <EnrollmentStatusBadge
                            status={enrollment.enrollmentStatus}
                          />
                          <PaymentStatusBadge
                            status={enrollment.paymentStatus}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-middle text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* View Details */}
                          <Link
                            href={`/dashboard/manage-batches/${batchId}/students/${enrollment._id}`}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 rounded-md transition-all"
                            title="View Details"
                          >
                            <Eye size={16} strokeWidth={1.5} />
                          </Link>

                          {/* WhatsApp */}
                          <button
                            onClick={() => sendWhatsAppMessage(enrollment)}
                            className="p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 rounded-md transition-all"
                            title="Send Info via WhatsApp"
                          >
                            <MessageCircle size={16} strokeWidth={1.5} />
                          </button>

                          {/* Remove */}
                          <button
                            onClick={() =>
                              handleRemoveClick(
                                enrollment._id,
                                enrollment.studentInfo?.name || "",
                              )
                            }
                            className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-all"
                            title="Remove from Batch"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              Showing page {page} of {meta.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 bg-white transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remove Student Modal */}
      <Modal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setRemoveTarget(null);
          setRemoveConfirmText("");
        }}
        title="Permanently Remove Student"
      >
        <div className="space-y-4">
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm border border-red-100">
            <p className="font-semibold mb-1">Warning: Permanent Action</p>
            <p>
              This will completely delete this enrollment, course progress,
              assignments, and certificates for this batch.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please type{" "}
              <span className="font-bold select-all bg-gray-100 px-1.5 py-0.5 rounded text-black border border-gray-200">
                {removeTarget?.name}
              </span>{" "}
              to confirm:
            </label>
            <input
              type="text"
              value={removeConfirmText}
              onChange={(e) => setRemoveConfirmText(e.target.value)}
              placeholder={removeTarget?.name}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setRemoveModalOpen(false);
                setRemoveTarget(null);
                setRemoveConfirmText("");
              }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmRemove}
              disabled={
                isRemoving || removeConfirmText.trim() !== removeTarget?.name
              }
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isRemoving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Confirm Remove
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Shift Student Modal */}
      <Modal
        isOpen={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        title="Shift Student to Another Batch"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">Shifting student:</p>
            <p className="font-semibold text-gray-900">
              {selectedEnrollment?.studentInfo?.name}
            </p>
            <p className="text-xs text-gray-500">
              {selectedEnrollment?.studentInfo?.email}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Batch *
            </label>
            <select
              value={selectedTargetBatch}
              onChange={(e) => setSelectedTargetBatch(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a batch</option>
              {allBatches.map((b: IBatch) => (
                <option key={b._id} value={b._id}>
                  {b.batchName} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              value={shiftReason}
              onChange={(e) => setShiftReason(e.target.value)}
              placeholder="Why is this student being shifted?"
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShiftModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleShift}
              disabled={isShifting || !selectedTargetBatch}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isShifting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Shifting...
                </>
              ) : (
                <>
                  <ArrowRightLeft size={16} />
                  Shift Student
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Add Student Modal */}
      <Modal
        isOpen={addStudentModalOpen}
        onClose={resetAddStudentForm}
        title="Add Student to Batch"
      >
        <div className="space-y-5">
          {/* Batch Info Header */}
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-800">
              Adding student to: <strong>{batch?.batchName}</strong>
              <span className="text-blue-600 ml-2">({batch?.batchNumber})</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Course Fee: BDT {batch?.totalPrice?.toLocaleString() || 0}
            </p>
          </div>

          {/* Tabs: Existing User / New User */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setAddStudentTab("existing")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                addStudentTab === "existing"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Select Existing User
            </button>
            <button
              onClick={() => setAddStudentTab("new")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                addStudentTab === "new"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* EXISTING USER TAB */}
          {addStudentTab === "existing" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Search User (by email, name, or phone) *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Type at least 2 characters to search..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {isSearching && (
                    <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.map((user: any) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setUserSearchTerm(user.name);
                        setSearchResults([]);
                      }}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${
                        selectedUserId === user._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {user.mobileNumber && (
                        <span className="text-xs text-gray-400">
                          {user.mobileNumber}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Selected User Display */}
              {selectedUserId && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      User Selected
                    </p>
                    <p className="text-xs text-green-600">{userSearchTerm}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUserId("");
                      setUserSearchTerm("");
                    }}
                    className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NEW USER TAB */}
          {addStudentTab === "new" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, name: e.target.value })
                    }
                    placeholder="Enter student's full name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, email: e.target.value })
                    }
                    placeholder="student@example.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, phone: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <p className="text-xs text-green-700">
                  <strong>✓ Auto Password:</strong> Password will be generated
                  automatically using the phone number. A welcome email with
                  login credentials will be sent to the student.
                </p>
              </div>
            </div>
          )}

          {/* PLAN SELECTOR */}
          {batch?.installmentOptions && batch.installmentOptions.length > 1 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Installment Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["1-plan", "2-plan", "3-plan"] as const).map((plan) => {
                  const opt = batch.installmentOptions?.find(
                    (o: any) => o.planType === plan,
                  );
                  if (!opt) return null;
                  return (
                    <button
                      key={plan}
                      onClick={() => {
                        setSelectedPlan(plan);
                        // If switching to single-install and user had partial selected, reset to full
                        if (plan === "1-plan" && paymentMode === "partial") {
                          setPaymentMode("full");
                        }
                        // Auto-update paidAmount suggestion for partial when plan changes
                        if (paymentMode === "partial" && plan !== "1-plan") {
                          const n = plan === "3-plan" ? 3 : 2;
                          setPaidAmount(Math.round(effectivePrice / n));
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        selectedPlan === plan
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <p className="text-xs font-semibold">
                        {opt.label || plan.replace("-plan", " install.")}
                      </p>
                      {opt.amountPerInstallment && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ৳{opt.amountPerInstallment?.toLocaleString()} ×
                          {plan.replace("-plan", "")}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DISCOUNT SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Discount / Scholarship
              </label>
              {appliedDiscount.type !== "none" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {appliedDiscount.source === "auto"
                    ? "Plan-Based Auto Discount"
                    : "Active"}
                </span>
              )}
            </div>

            {/* Tier Picker */}
            {batch?.discountTiers &&
              batch.discountTiers.filter((t: any) => t.isActive).length > 0 && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Quick-apply saved tier
                  </label>
                  <select
                    value={discountTierId}
                    onChange={(e) => {
                      const tierId = e.target.value;
                      setDiscountTierId(tierId);
                      if (tierId) {
                        const tier = batch.discountTiers?.find(
                          (t: any) => t._id === tierId,
                        );
                        if (tier) {
                          setDiscountType(
                            tier.discountType as "percentage" | "fixed",
                          );
                          setDiscountValue(tier.discountValue);
                        }
                      } else {
                        setDiscountType("none");
                        setDiscountValue(0);
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">— No preset tier —</option>
                    {batch.discountTiers
                      .filter((t: any) => t.isActive)
                      .map((t: any) => (
                        <option key={t._id} value={t._id}>
                          {t.name} (
                          {t.discountType === "percentage"
                            ? `${t.discountValue}%`
                            : `৳${t.discountValue}`}{" "}
                          off)
                        </option>
                      ))}
                  </select>
                </div>
              )}

            {/* Manual discount override */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(
                      e.target.value as "none" | "percentage" | "fixed",
                    );
                    setDiscountTierId("");
                    if (e.target.value === "none") setDiscountValue(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                >
                  <option value="none">None</option>
                  <option value="percentage">% Off</option>
                  <option value="fixed">৳ Fixed</option>
                </select>
              </div>
              {discountType !== "none" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {discountType === "percentage" ? "Percent" : "Amount"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
              {discountType !== "none" && selectedPlan !== "1-plan" && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Scope
                  </label>
                  <select
                    value={discountScope}
                    onChange={(e) =>
                      setDiscountScope(e.target.value as "all" | "first-only")
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="all">All installments</option>
                    <option value="first-only">First only</option>
                  </select>
                </div>
              )}
            </div>

            {/* Discount reason */}
            {discountType !== "none" && (
              <input
                type="text"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="Reason (e.g. Scholarship, Special offer)…"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            )}

            {/* Live price preview */}
            {appliedDiscount.type !== "none" &&
            appliedDiscount.value > 0 &&
            batch?.totalPrice ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 line-through">
                    ৳{batch.totalPrice.toLocaleString()}
                  </span>
                  <span className="text-amber-600 font-semibold">
                    −
                    {appliedDiscount.type === "percentage"
                      ? `${appliedDiscount.value}%`
                      : `৳${appliedDiscount.value}`}
                  </span>
                  <span className="text-green-700 font-bold">
                    = ৳{effectivePrice.toLocaleString()}
                  </span>
                </div>
                {appliedDiscount.source === "auto" && (
                  <p className="text-xs text-amber-700 font-medium mt-1">
                    ✨ A plan-based discount is automatically applied to this
                    installment plan. Look below at your initial payment
                    options.
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* PAYMENT OPTIONS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Initial Payment
              </label>
              {selectedPlan !== "1-plan" && (
                <span className="text-xs text-gray-400">
                  {installmentCount} installments · ৳
                  {firstInstallmentAmount.toLocaleString()} each
                </span>
              )}
            </div>
            <div
              className={`grid gap-2 ${selectedPlan === "1-plan" ? "grid-cols-2" : "grid-cols-3"}`}
            >
              <button
                onClick={() => setPaymentMode("skip")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMode === "skip"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <XCircle
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMode === "skip" ? "text-green-600" : "text-gray-400"}`}
                />
                <span className="text-xs font-medium">
                  {effectivePrice === 0
                    ? "Free / Scholarship"
                    : "No Payment Now"}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enroll first, pay later
                </p>
              </button>

              <button
                onClick={() => setPaymentMode("full")}
                className={`p-3 rounded-xl border text-center transition-all ${
                  paymentMode === "full"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <CheckCircle
                  className={`w-5 h-5 mx-auto mb-1 ${paymentMode === "full" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span className="text-xs font-medium">
                  {selectedPlan === "1-plan"
                    ? "Pay Full Amount"
                    : "Pay All at Once"}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedPlan === "1-plan"
                    ? `৳${effectivePrice.toLocaleString()}`
                    : `All ${installmentCount} · ৳${effectivePrice.toLocaleString()}`}
                </p>
              </button>

              {/* Only show 1st Installment option for multi-plan */}
              {selectedPlan !== "1-plan" && (
                <button
                  onClick={() => {
                    setPaymentMode("partial");
                    setPaidAmount(firstInstallmentAmount);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    paymentMode === "partial"
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <DollarSign
                    className={`w-5 h-5 mx-auto mb-1 ${paymentMode === "partial" ? "text-purple-600" : "text-gray-400"}`}
                  />
                  <span className="text-xs font-medium">1st Installment</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ৳{firstInstallmentAmount.toLocaleString()} now
                  </p>
                </button>
              )}
            </div>

            {/* Payment Details (for Full/Partial) */}
            {paymentMode !== "skip" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                {paymentMode === "partial" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      1st Installment Amount (BDT)
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      placeholder={`Suggested: ৳${firstInstallmentAmount.toLocaleString()}`}
                      className="w-full px-4 py-2.5 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Remaining ৳
                      {Math.max(
                        0,
                        effectivePrice - paidAmount,
                      ).toLocaleString()}{" "}
                      will be due next.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select method</option>
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {paymentMode === "full" && (
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>
                      Amount:{" "}
                      <strong>BDT {effectivePrice.toLocaleString()}</strong>{" "}
                      {discountType !== "none" && discountValue > 0 && (
                        <span className="text-amber-600 text-xs ml-1">
                          (after{" "}
                          {discountType === "percentage"
                            ? `${discountValue}% discount`
                            : `৳${discountValue} discount`}
                          )
                        </span>
                      )}
                    </p>
                    {discountType !== "none" && discountValue > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        Original: BDT {batch?.totalPrice?.toLocaleString() || 0}
                      </p>
                    )}
                  </div>
                )}
                {paymentMode === "partial" && paidAmount > 0 && (
                  <p className="text-sm text-gray-600">
                    Remaining:{" "}
                    <strong>
                      BDT{" "}
                      {Math.max(
                        0,
                        effectivePrice - paidAmount,
                      ).toLocaleString()}
                    </strong>
                    {discountType !== "none" && discountValue > 0 && (
                      <span className="text-xs text-amber-600 ml-1">
                        (discounted price)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={resetAddStudentForm}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddStudent}
              disabled={
                isAdding || (addStudentTab === "existing" && !selectedUserId)
              }
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                addStudentTab === "new"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isAdding ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  {addStudentTab === "new" ? "Creating..." : "Adding..."}
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  {addStudentTab === "new"
                    ? "Create & Add Student"
                    : "Add Student"}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Enrollment Modal */}
      <BulkEnrollmentModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        batchId={batchId}
        onSuccess={() => {
          refetch();
          // Optionally close modal here or it is handled in component
        }}
        batch={batch || null}
      />
    </div>
  );
}
