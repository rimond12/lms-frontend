"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CreditCard,
  Key,
  Shield,
  Loader,
  Save,
  DollarSign,
  Calendar,
  AlertTriangle,
  Hash,
  Percent,
  Tag,
  RefreshCw,
  Pencil,
  Trash2,
  Check,
  XCircle,
  History,
  Receipt,
  Settings2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useUpdateEnrollmentByAdminMutation,
  useSetInstallmentDueDateMutation,
  useEditPaymentMutation,
  useDeletePaymentMutation,
} from "@/app/redux/api/batchApi/batchEnrollmentApi";
import type { IBatch, IDiscountTier } from "@/app/redux/api/batchApi/batchApi";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: any;
  onSuccess: () => void;
  batchPrice: number;
  batch?: IBatch | null;
}

type TabType = "basic" | "payment" | "account";
type PaymentSubTab = "pricing" | "add-payment" | "history" | "installments";

export default function EditStudentModal({
  isOpen,
  onClose,
  enrollment,
  onSuccess,
  batchPrice,
  batch,
}: EditStudentModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [paymentSubTab, setPaymentSubTab] = useState<PaymentSubTab>("pricing");

  // ─── Basic Info ────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [educationalInfo, setEducationalInfo] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");

  // ─── Pricing / Discount ────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState<
    "1-plan" | "2-plan" | "3-plan"
  >("1-plan");
  const [discountType, setDiscountType] = useState<
    "none" | "percentage" | "fixed"
  >("none");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountScope, setDiscountScope] = useState<"all" | "first-only">(
    "all",
  );
  const [discountReason, setDiscountReason] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [overridePrice, setOverridePrice] = useState<number | "">("");
  const [useOverride, setUseOverride] = useState(false);

  // ─── Payment ───────────────────────────────────────────
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  // ─── Account ───────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [manualAccess, setManualAccess] = useState(false);

  // ─── Installment Due Dates ─────────────────────────────
  const [dueDates, setDueDates] = useState<Record<number, string>>({});

  // ─── Edit Payment State ────────────────────────────────
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editMethod, setEditMethod] = useState("");
  const [editTrxId, setEditTrxId] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // ─── API Mutations ─────────────────────────────────────
  const [updateEnrollment, { isLoading }] =
    useUpdateEnrollmentByAdminMutation();
  const [setInstallmentDueDate, { isLoading: isSettingDueDate }] =
    useSetInstallmentDueDateMutation();
  const [editPaymentApi, { isLoading: isEditingPayment }] =
    useEditPaymentMutation();
  const [deletePaymentApi, { isLoading: isDeletingPayment }] =
    useDeletePaymentMutation();

  // ─── Discount tiers from batch ─────────────────────────
  const activeTiers = useMemo(() => {
    return (batch?.discountTiers || []).filter(
      (t: IDiscountTier) => t.isActive,
    );
  }, [batch?.discountTiers]);

  // ─── Available plans from batch ────────────────────────
  const availablePlans = useMemo(() => {
    const plans: {
      key: "1-plan" | "2-plan" | "3-plan";
      label: string;
      payments: number;
    }[] = [];
    if (batch?.installmentPlans?.onePlan?.enabled !== false) {
      plans.push({ key: "1-plan", label: "Full Payment", payments: 1 });
    }
    if (batch?.installmentPlans?.twoPlan?.enabled) {
      plans.push({ key: "2-plan", label: "2 Installments", payments: 2 });
    }
    if (batch?.installmentPlans?.threePlan?.enabled) {
      plans.push({ key: "3-plan", label: "3 Installments", payments: 3 });
    }
    if (plans.length === 0) {
      plans.push({ key: "1-plan", label: "Full Payment", payments: 1 });
    }
    return plans;
  }, [batch]);

  // ─── Effective price calculation ───────────────────────
  const originalPrice = enrollment?.originalPrice || batchPrice || 0;
  const computedDiscount = useMemo(() => {
    if (useOverride)
      return { discountAmount: 0, effectivePrice: Number(overridePrice) || 0 };
    if (discountType === "none" || discountValue <= 0) {
      return { discountAmount: 0, effectivePrice: originalPrice };
    }
    if (discountType === "percentage") {
      const pct = Math.min(discountValue, 100);
      const amt = Math.round((originalPrice * pct) / 100);
      return {
        discountAmount: amt,
        effectivePrice: Math.max(0, originalPrice - amt),
      };
    }
    const amt = Math.min(discountValue, originalPrice);
    return {
      discountAmount: amt,
      effectivePrice: Math.max(0, originalPrice - amt),
    };
  }, [discountType, discountValue, originalPrice, useOverride, overridePrice]);

  // ─── Populate due dates from enrollment ────────────────
  useEffect(() => {
    if (enrollment?.payments) {
      const map: Record<number, string> = {};
      enrollment.payments.forEach((p: any) => {
        if (p.dueDate) map[p.installmentNumber] = p.dueDate.split("T")[0];
      });
      setDueDates(map);
    }
  }, [enrollment]);

  // ─── Initialize all form fields from enrollment ────────
  useEffect(() => {
    if (enrollment) {
      const student = enrollment.studentInfo || {};
      setName(student.name || "");
      setEmail(student.email || "");
      setPhone(student.phone || "");
      setAddress(student.address || "");
      setEducationalInfo(student.educationalInfo || "");
      setEnrollmentNumber(enrollment.enrollmentNumber || "");
      setManualAccess(enrollment.hasAccess || false);

      // Pricing
      setSelectedPlan(enrollment.selectedPlan || "1-plan");
      setDiscountType(enrollment.discountType || "none");
      setDiscountValue(enrollment.discountValue || 0);
      setDiscountScope(enrollment.discountScope || "all");
      setDiscountReason(enrollment.discountReason || "");
      setSelectedTierId(enrollment.discountTierId || "");

      setUseOverride(false);
      setOverridePrice("");
    }
  }, [enrollment]);

  // ─── Tier Selection ────────────────────────────────────
  const handleTierChange = (tierId: string) => {
    setSelectedTierId(tierId);
    if (tierId === "" || tierId === "none") {
      setDiscountType("none");
      setDiscountValue(0);
      setDiscountReason("");
      return;
    }
    const tier = activeTiers.find((t: IDiscountTier) => t._id === tierId);
    if (tier) {
      setDiscountType(tier.discountType);
      setDiscountValue(tier.discountValue);
      setDiscountReason(tier.description || tier.name || "");
      setUseOverride(false);
    }
  };

  // ─── Save: Basic Info + Enrollment Number ──────────────
  const handleSaveBasicInfo = async () => {
    if (!name || !email || !phone) {
      toast.error("Name, Email, and Phone are required");
      return;
    }
    try {
      const payload: any = {
        studentInfo: { name, email, phone, address, educationalInfo },
      };
      if (
        enrollmentNumber &&
        enrollmentNumber !== enrollment?.enrollmentNumber
      ) {
        payload.enrollmentNumber = enrollmentNumber;
      }
      await updateEnrollment({
        enrollmentId: enrollment._id,
        data: payload,
      }).unwrap();
      toast.success("Student info updated!");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update");
    }
  };

  // ─── Save: Pricing (Plan + Discount + Override) ────────
  const handleSavePricing = async () => {
    try {
      const payload: any = {};

      if (selectedPlan !== enrollment?.selectedPlan) {
        payload.selectedPlan = selectedPlan;
      }

      const hasDiscountChange =
        discountType !== (enrollment?.discountType || "none") ||
        discountValue !== (enrollment?.discountValue || 0) ||
        discountScope !== (enrollment?.discountScope || "all") ||
        discountReason !== (enrollment?.discountReason || "");

      if (hasDiscountChange && !useOverride) {
        payload.adjustDiscount = {
          discountType,
          discountValue: discountType !== "none" ? discountValue : 0,
          discountScope,
          discountReason: discountReason || undefined,
        };
      }

      if (useOverride && overridePrice !== "" && Number(overridePrice) >= 0) {
        payload.overridePrice = Number(overridePrice);
        delete payload.adjustDiscount;
      }

      if (Object.keys(payload).length === 0) {
        toast("No pricing changes to save", { icon: "ℹ️" });
        return;
      }

      await updateEnrollment({
        enrollmentId: enrollment._id,
        data: payload,
      }).unwrap();
      toast.success("Pricing updated!");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update pricing");
    }
  };

  // ─── Add Payment ───────────────────────────────────────
  const handleAddPayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    try {
      await updateEnrollment({
        enrollmentId: enrollment._id,
        data: {
          addPayment: {
            amount: Number(paymentAmount),
            paymentMethod,
            transactionId: transactionId || undefined,
            notes: paymentNotes || undefined,
          },
        },
      }).unwrap();
      toast.success("Payment added!");
      setPaymentAmount("");
      setTransactionId("");
      setPaymentNotes("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add payment");
    }
  };

  // ─── Reset Password ────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword) {
      toast.error("Enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await updateEnrollment({
        enrollmentId: enrollment._id,
        data: { newPassword },
      }).unwrap();
      toast.success("Password updated!");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };

  // ─── Toggle Access ─────────────────────────────────────
  const handleToggleAccess = async () => {
    try {
      await updateEnrollment({
        enrollmentId: enrollment._id,
        data: { manualAccessGrant: !manualAccess },
      }).unwrap();
      setManualAccess(!manualAccess);
      toast.success(`Access ${!manualAccess ? "granted" : "revoked"}!`);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update access");
    }
  };

  // ─── Edit Payment ─────────────────────────────────────
  const startEditPayment = (payment: any) => {
    setEditingPaymentId(payment._id);
    setEditAmount(payment.amount || 0);
    setEditMethod(payment.paymentMethod || "");
    setEditTrxId(payment.bankTransactionId || "");
    setEditNotes(payment.adminNotes || "");
  };

  const handleSaveEditPayment = async () => {
    if (!editingPaymentId) return;
    try {
      await editPaymentApi({
        enrollmentId: enrollment._id,
        paymentId: editingPaymentId,
        data: {
          amount: editAmount,
          paymentMethod: editMethod,
          transactionId: editTrxId,
          notes: editNotes,
        },
      }).unwrap();
      toast.success("Payment updated!");
      setEditingPaymentId(null);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update payment");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this payment record? This cannot be undone.",
      )
    )
      return;
    try {
      await deletePaymentApi({
        enrollmentId: enrollment._id,
        paymentId,
      }).unwrap();
      toast.success("Payment deleted!");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete payment");
    }
  };

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "payment", label: "Payment & Pricing", icon: CreditCard },
    { id: "account", label: "Account", icon: Key },
  ];

  const totalAmount =
    enrollment?.effectivePrice ||
    enrollment?.totalPaid + enrollment?.totalDue ||
    batchPrice;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-slate-800 to-slate-700">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <User size={24} />
                Edit Student — Complete Panel
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                {enrollment?.studentInfo?.name || "Student"} •{" "}
                {enrollment?.enrollmentNumber || ""} •{" "}
                <span className="text-blue-300">
                  {enrollment?.selectedPlan}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap px-2 ${
                  activeTab === tab.id
                    ? "border-slate-800 text-slate-800 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* ═══════ BASIC INFO TAB ═══════ */}
            {activeTab === "basic" && (
              <div className="space-y-5">
                {/* Enrollment Number (Student ID) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash size={14} className="inline mr-1" /> Student ID /
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-blue-50/30"
                    placeholder="E-2026-00112"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Editable — change the student&apos;s enrollment ID
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={14} className="inline mr-1" /> Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                      placeholder="Student Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={14} className="inline mr-1" /> Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={14} className="inline mr-1" /> Phone *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap size={14} className="inline mr-1" />{" "}
                      Education
                    </label>
                    <input
                      type="text"
                      value={educationalInfo}
                      onChange={(e) => setEducationalInfo(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                      placeholder="BSc in Architecture"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={14} className="inline mr-1" /> Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Full Address"
                  />
                </div>

                <button
                  onClick={handleSaveBasicInfo}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Basic Info
                </button>
              </div>
            )}

            {/* ═══════ PAYMENT & PRICING TAB ═══════ */}
            {activeTab === "payment" && (
              <div className="space-y-4">
                {/* ── Current Pricing Snapshot (Always visible) ── */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-800 mb-3">
                    Current Pricing Snapshot
                  </h4>
                  <div className="grid grid-cols-5 gap-3 text-center">
                    <div className="p-2 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500">Original</p>
                      <p className="text-sm font-bold text-gray-800">
                        ৳{" "}
                        {(
                          enrollment?.originalPrice || batchPrice
                        )?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border">
                      <p className="text-xs text-green-600">Discount</p>
                      <p className="text-sm font-bold text-green-700">
                        - ৳{" "}
                        {(enrollment?.discountAmount || 0)?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border">
                      <p className="text-xs text-blue-600">Final Price</p>
                      <p className="text-sm font-bold text-blue-700">
                        ৳{" "}
                        {(
                          enrollment?.effectivePrice || totalAmount
                        )?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-xs text-green-600">Paid</p>
                      <p className="text-sm font-bold text-green-700">
                        ৳ {enrollment?.totalPaid?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600">Due</p>
                      <p className="text-sm font-bold text-red-700">
                        ৳ {enrollment?.totalDue?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  {enrollment?.discountReason && (
                    <p className="text-xs text-gray-500 mt-2">
                      Discount Reason: {enrollment.discountReason}
                    </p>
                  )}
                </div>

                {/* ── Sub-Tab Navigation ── */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  {[
                    {
                      id: "pricing" as PaymentSubTab,
                      label: "Pricing",
                      icon: Settings2,
                    },
                    {
                      id: "add-payment" as PaymentSubTab,
                      label: "Add Payment",
                      icon: DollarSign,
                    },
                    {
                      id: "history" as PaymentSubTab,
                      label: "History",
                      icon: History,
                    },
                    {
                      id: "installments" as PaymentSubTab,
                      label: "Installments",
                      icon: Calendar,
                    },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setPaymentSubTab(st.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-lg transition-all ${
                        paymentSubTab === st.id
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <st.icon size={13} />
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* ── Sub-Tab: Pricing ── */}
                {paymentSubTab === "pricing" && (
                  <div className="space-y-5">
                    {/* ═══════════════════════════════════════════════════ */}
                    {/* SECTION 1: Plan & Discount (blue themed)           */}
                    {/* ═══════════════════════════════════════════════════ */}
                    <div className="rounded-xl border-2 border-blue-200 bg-blue-50/30 overflow-hidden">
                      <div className="px-5 py-3 bg-blue-100/60 border-b border-blue-200 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <h4 className="text-sm font-bold text-blue-900">
                          Plan & Discount Settings
                        </h4>
                        <span className="ml-auto text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                          Changes enrollment pricing
                        </span>
                      </div>
                      <div className="p-5 space-y-5">
                        {/* Payment Plan */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <CreditCard size={14} className="inline mr-1" />{" "}
                            Payment Plan
                          </label>
                          <div className="grid grid-cols-3 gap-3">
                            {availablePlans.map((plan) => {
                              const perInstallment = Math.ceil(
                                computedDiscount.effectivePrice / plan.payments,
                              );
                              return (
                                <button
                                  key={plan.key}
                                  type="button"
                                  onClick={() => setSelectedPlan(plan.key)}
                                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                                    selectedPlan === plan.key
                                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                      : "border-gray-200 hover:border-blue-300 bg-white"
                                  }`}
                                >
                                  <p className="font-semibold text-sm">
                                    {plan.label}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    ৳{perInstallment.toLocaleString()} ×
                                    {plan.payments}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Discount / Override */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            <Tag size={14} className="inline mr-1" /> Discount &
                            Price Adjustment
                          </h4>

                          {/* Mode Toggle */}
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border mb-4">
                            <button
                              type="button"
                              onClick={() => setUseOverride(false)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                !useOverride
                                  ? "bg-blue-50 shadow text-blue-700 border border-blue-200"
                                  : "text-gray-500"
                              }`}
                            >
                              <Percent size={14} className="inline mr-1" />{" "}
                              Adjust Discount
                            </button>
                            <button
                              type="button"
                              onClick={() => setUseOverride(true)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                                useOverride
                                  ? "bg-amber-50 shadow text-amber-700 border border-amber-200"
                                  : "text-gray-500"
                              }`}
                            >
                              <DollarSign size={14} className="inline mr-1" />{" "}
                              Set Custom Price
                            </button>
                          </div>

                          {/* Discount Controls */}
                          {!useOverride && (
                            <div className="space-y-4">
                              {activeTiers.length > 0 && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Quick-apply saved tier
                                  </label>
                                  <select
                                    value={selectedTierId}
                                    onChange={(e) =>
                                      handleTierChange(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                  >
                                    <option value="">— No preset tier —</option>
                                    {activeTiers.map((tier: IDiscountTier) => (
                                      <option key={tier._id} value={tier._id}>
                                        {tier.name} (
                                        {tier.discountType === "percentage"
                                          ? `${tier.discountValue}%`
                                          : `৳${tier.discountValue}`}
                                        )
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    Type
                                  </label>
                                  <select
                                    value={discountType}
                                    onChange={(e) => {
                                      setDiscountType(e.target.value as any);
                                      setSelectedTierId("");
                                    }}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                  >
                                    <option value="none">None</option>
                                    <option value="percentage">
                                      Percentage %
                                    </option>
                                    <option value="fixed">Fixed Amount</option>
                                  </select>
                                </div>
                                {discountType !== "none" && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                      Value{" "}
                                      {discountType === "percentage"
                                        ? "(%)"
                                        : "(৳)"}
                                    </label>
                                    <input
                                      type="number"
                                      min={0}
                                      max={
                                        discountType === "percentage"
                                          ? 100
                                          : originalPrice
                                      }
                                      value={discountValue}
                                      onChange={(e) => {
                                        setDiscountValue(
                                          parseFloat(e.target.value) || 0,
                                        );
                                        setSelectedTierId("");
                                      }}
                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                  </div>
                                )}
                              </div>

                              {discountType !== "none" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                      Scope
                                    </label>
                                    <select
                                      value={discountScope}
                                      onChange={(e) =>
                                        setDiscountScope(e.target.value as any)
                                      }
                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                      <option value="all">
                                        All installments
                                      </option>
                                      <option value="first-only">
                                        First installment only
                                      </option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                      Reason
                                    </label>
                                    <input
                                      type="text"
                                      value={discountReason}
                                      onChange={(e) =>
                                        setDiscountReason(e.target.value)
                                      }
                                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                      placeholder="e.g. Scholarship, Early Bird"
                                    />
                                  </div>
                                </div>
                              )}

                              {discountType !== "none" && discountValue > 0 && (
                                <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                                  <p className="text-xs font-semibold text-green-700 mb-2">
                                    <RefreshCw
                                      size={12}
                                      className="inline mr-1"
                                    />{" "}
                                    Updated Price Preview
                                  </p>
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500 line-through">
                                      ৳{originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-green-600">
                                      -৳
                                      {computedDiscount.discountAmount.toLocaleString()}
                                    </span>
                                    <span className="font-bold text-green-800 text-base">
                                      = ৳
                                      {computedDiscount.effectivePrice.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Override Price */}
                          {useOverride && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                  Custom Total Price (৳)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  value={overridePrice}
                                  onChange={(e) =>
                                    setOverridePrice(
                                      e.target.value === ""
                                        ? ""
                                        : Number(e.target.value),
                                    )
                                  }
                                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-amber-50/30"
                                  placeholder="Enter custom total price"
                                />
                                <p className="text-xs text-amber-600 mt-1">
                                  This overrides the original price. Discount
                                  will be ignored.
                                </p>
                              </div>
                              {overridePrice !== "" && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                  <p className="text-xs font-semibold text-amber-700 mb-1">
                                    Custom Price Preview
                                  </p>
                                  <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-500">
                                      Original: ৳
                                      {originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-lg font-bold text-amber-800">
                                      → ৳
                                      {Number(overridePrice).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleSavePricing}
                          disabled={isLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
                        >
                          {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}
                          Save Plan & Discount
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Sub-Tab: Add Payment ── */}
                {paymentSubTab === "add-payment" && (
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600" />
                      <h4 className="text-sm font-bold text-green-900">
                        Record a New Payment
                      </h4>
                      <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                        Adds money to paid balance
                      </span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Amount (৳) *
                          </label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) =>
                              setPaymentAmount(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            placeholder="5000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                          >
                            <option value="Bkash">Bkash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Bank">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            placeholder="TRX123456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            placeholder="Optional notes"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleAddPayment}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 shadow-sm"
                      >
                        {isLoading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <DollarSign size={18} />
                        )}
                        Record Payment
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Sub-Tab: Payment History ── */}
                {paymentSubTab === "history" && (
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
                      <History size={16} className="text-slate-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Payment History
                      </h4>
                      <span className="ml-auto text-xs text-slate-500">
                        {enrollment?.payments?.length || 0} records
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {(!enrollment?.payments ||
                        enrollment.payments.length === 0) && (
                        <p className="p-5 text-sm text-gray-400 italic text-center">
                          No payments recorded yet.
                        </p>
                      )}
                      {enrollment?.payments?.map(
                        (payment: any, idx: number) => (
                          <div key={payment._id || idx} className="p-4">
                            {editingPaymentId === payment._id ? (
                              /* ── Editing Mode ── */
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-2">
                                  <Pencil size={12} /> Editing Payment #
                                  {payment.installmentNumber}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Amount (৳)
                                    </label>
                                    <input
                                      type="number"
                                      value={editAmount}
                                      onChange={(e) =>
                                        setEditAmount(Number(e.target.value))
                                      }
                                      className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Method
                                    </label>
                                    <input
                                      type="text"
                                      value={editMethod}
                                      onChange={(e) =>
                                        setEditMethod(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Transaction ID
                                    </label>
                                    <input
                                      type="text"
                                      value={editTrxId}
                                      onChange={(e) =>
                                        setEditTrxId(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                      Notes
                                    </label>
                                    <input
                                      type="text"
                                      value={editNotes}
                                      onChange={(e) =>
                                        setEditNotes(e.target.value)
                                      }
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={handleSaveEditPayment}
                                    disabled={isEditingPayment}
                                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  >
                                    {isEditingPayment ? (
                                      <Loader
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Check size={12} />
                                    )}
                                    Save Changes
                                  </button>
                                  <button
                                    onClick={() => setEditingPaymentId(null)}
                                    className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                  >
                                    <XCircle size={12} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ── View Mode ── */
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-800">
                                      ৳{payment.amount?.toLocaleString()}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        payment.status === "approved"
                                          ? "bg-green-100 text-green-700"
                                          : payment.status === "rejected"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {payment.status}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      #{payment.installmentNumber}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                    {payment.paymentMethod && (
                                      <span>Via: {payment.paymentMethod}</span>
                                    )}
                                    {payment.bankTransactionId && (
                                      <span>
                                        Trx: {payment.bankTransactionId}
                                      </span>
                                    )}
                                    <span>
                                      {new Date(
                                        payment.paymentDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {payment.adminNotes && (
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                      Note: {payment.adminNotes}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => startEditPayment(payment)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Payment"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeletePayment(payment._id)
                                    }
                                    disabled={isDeletingPayment}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete Payment"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* ── Sub-Tab: Installments ── */}
                {paymentSubTab === "installments" && (
                  <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="px-5 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Installment Due Dates
                      </h4>
                    </div>
                    <div className="p-5">
                      {enrollment?.accessRevokedDueToOverdue && (
                        <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 border border-red-200 rounded-xl">
                          <AlertTriangle size={16} className="text-red-600" />
                          <p className="text-sm text-red-700 font-medium">
                            Access revoked due to overdue installment.
                            {enrollment.accessRevokedAt &&
                              ` (${new Date(enrollment.accessRevokedAt).toLocaleDateString()})`}
                          </p>
                        </div>
                      )}

                      {(!enrollment?.payments ||
                        enrollment.payments.length === 0) &&
                        enrollment?.selectedPlan === "1-plan" && (
                          <p className="text-sm text-gray-400 italic">
                            Single payment plan — no installment schedule
                            needed.
                          </p>
                        )}
                      <div className="space-y-3">
                        {Array.from(
                          {
                            length:
                              enrollment?.selectedPlan === "3-plan"
                                ? 3
                                : enrollment?.selectedPlan === "2-plan"
                                  ? 2
                                  : 1,
                          },
                          (_, idx) => {
                            const num = idx + 1;
                            const existingPayment = enrollment?.payments?.find(
                              (p: any) => p.installmentNumber === num,
                            );
                            const status = existingPayment?.status;
                            return (
                              <div
                                key={num}
                                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    Installment #{num}
                                  </p>
                                  {existingPayment && (
                                    <p className="text-xs text-gray-500">
                                      ৳{" "}
                                      {existingPayment.amount?.toLocaleString()}
                                      {status === "approved" && (
                                        <span className="ml-2 text-green-600">
                                          ✓ Approved
                                        </span>
                                      )}
                                      {status === "pending" && (
                                        <span className="ml-2 text-amber-600">
                                          ⏳ Pending
                                        </span>
                                      )}
                                      {status === "rejected" && (
                                        <span className="ml-2 text-red-600">
                                          ✗ Rejected
                                        </span>
                                      )}
                                    </p>
                                  )}
                                  {existingPayment?.isOverdue && (
                                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
                                      <AlertTriangle size={10} /> Overdue
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="date"
                                    value={dueDates[num] || ""}
                                    onChange={(e) =>
                                      setDueDates((prev) => ({
                                        ...prev,
                                        [num]: e.target.value,
                                      }))
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  />
                                  <button
                                    type="button"
                                    disabled={
                                      isSettingDueDate || !dueDates[num]
                                    }
                                    onClick={async () => {
                                      try {
                                        await setInstallmentDueDate({
                                          enrollmentId: enrollment._id,
                                          installmentNumber: num,
                                          dueDate: dueDates[num],
                                        }).unwrap();
                                        toast.success(
                                          `Due date set for installment #${num}`,
                                        );
                                        onSuccess();
                                      } catch (err: any) {
                                        toast.error(
                                          err?.data?.message ||
                                            "Failed to set due date",
                                        );
                                      }
                                    }}
                                    className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-900 disabled:opacity-40 transition-colors"
                                  >
                                    {isSettingDueDate ? (
                                      <Loader
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      "Set Date"
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════ ACCOUNT TAB ═══════ */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${manualAccess ? "bg-green-100" : "bg-gray-200"}`}
                      >
                        <Shield
                          size={20}
                          className={
                            manualAccess ? "text-green-600" : "text-gray-500"
                          }
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Course Access
                        </p>
                        <p className="text-sm text-gray-500">
                          {manualAccess
                            ? "Student has access"
                            : "Student does not have access"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleAccess}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        manualAccess
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {manualAccess ? "Revoke Access" : "Grant Access"}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Key size={16} />
                    Reset Password
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <Key size={18} />
                      )}
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
