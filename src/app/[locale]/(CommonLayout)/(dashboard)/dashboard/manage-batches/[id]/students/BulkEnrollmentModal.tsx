"use client";

import React, { useState, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader,
  Download,
  Trash2,
  Search,
  User,
  AlertTriangle,
  Filter,
  DollarSign,
  XCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useBulkAddStudentsMutation } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import type { IBatch, IDiscountTier } from "@/app/redux/api/batchApi/batchApi";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BulkEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  onSuccess: () => void;
  batch?: IBatch | null;
}

interface ParsedStudent {
  id: string; // Unique ID for keying
  name: string;
  email: string;
  phone: string;
  studentId: string; // Optional: Custom Student ID from Excel
  paidAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  isValid: boolean;
  errors: string[];
}

export default function BulkEnrollmentModal({
  isOpen,
  onClose,
  batchId,
  onSuccess,
  batch,
}: BulkEnrollmentModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);

  // Separate loading states
  const [isParsing, setIsParsing] = useState(false);

  const [uploadStep, setUploadStep] = useState<"upload" | "preview" | "result">(
    "upload",
  );
  const [skipPayment, setSkipPayment] = useState(false);
  const [resultSummary, setResultSummary] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Global enrollment defaults applied to all students in this bulk import
  const [globalPlan, setGlobalPlan] = useState<"1-plan" | "2-plan" | "3-plan">(
    "1-plan",
  );
  const [globalDiscountType, setGlobalDiscountType] = useState<
    "none" | "percentage" | "fixed"
  >("none");
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number>(0);
  const [globalDiscountScope, setGlobalDiscountScope] = useState<
    "all" | "first-only"
  >("all");
  const [globalDiscountReason, setGlobalDiscountReason] = useState<string>("");
  const [selectedTierId, setSelectedTierId] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active discount tiers from batch
  const activeTiers = useMemo(() => {
    return (batch?.discountTiers || []).filter(
      (t: IDiscountTier) => t.isActive,
    );
  }, [batch?.discountTiers]);

  const handleTierChange = (tierId: string) => {
    setSelectedTierId(tierId);
    if (tierId === "" || tierId === "none") {
      setGlobalDiscountType("none");
      setGlobalDiscountValue(0);
      setGlobalDiscountReason("");
      return;
    }
    const tier = activeTiers.find((t: IDiscountTier) => t._id === tierId);
    if (tier) {
      setGlobalDiscountType(tier.discountType);
      setGlobalDiscountValue(tier.discountValue);
      setGlobalDiscountReason(tier.description || tier.name || "");
    }
  };

  // RTK Query Mutation
  const [bulkAddStudents, { isLoading: isSubmitting }] =
    useBulkAddStudentsMutation();

  // Computed Stats & Filtered Data
  const stats = useMemo(() => {
    const total = parsedData.length;
    const valid = parsedData.filter((s) => s.isValid).length;
    const invalid = total - valid;
    return { total, valid, invalid };
  }, [parsedData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return parsedData;
    const lower = searchTerm.toLowerCase();
    return parsedData.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.email.toLowerCase().includes(lower) ||
        s.phone.includes(searchTerm),
    );
  }, [parsedData, searchTerm]);

  // Check if there's an active plan auto-discount
  const autoPlanDiscount = useMemo(() => {
    return (batch?.planDiscounts || []).find(
      (pd: any) => pd.planType === globalPlan && pd.isActive,
    );
  }, [batch?.planDiscounts, globalPlan]);

  // The actual applied discount values
  const appliedDiscount = useMemo(() => {
    if (globalDiscountType !== "none" && globalDiscountValue > 0) {
      return {
        type: globalDiscountType,
        value: globalDiscountValue,
        source: "manual",
      };
    }
    if (autoPlanDiscount) {
      return {
        type: autoPlanDiscount.discountType,
        value: autoPlanDiscount.discountValue,
        source: "auto",
      };
    }
    return { type: "none", value: 0, source: "none" };
  }, [globalDiscountType, globalDiscountValue, autoPlanDiscount]);

  // Discount-aware effective price
  const effectivePrice = (() => {
    const base = batch?.totalPrice ?? 0;
    if (appliedDiscount.type === "none" || appliedDiscount.value <= 0)
      return base;
    if (appliedDiscount.type === "percentage")
      return Math.max(0, Math.round(base * (1 - appliedDiscount.value / 100)));
    return Math.max(0, base - appliedDiscount.value);
  })();

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".csv")
    ) {
      toast.error("Please upload a valid Excel or CSV file");
      return;
    }
    setFile(file);
    parseExcel(file);
  };

  const parseExcel = async (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const processed: ParsedStudent[] = jsonData.map(
          (row: any, idx: number) => {
            const name = row["Name"] || row["name"] || "";
            const email = row["Email"] || row["email"] || "";
            const phone =
              row["Phone"] ||
              row["phone"] ||
              row["Mobile"] ||
              row["mobile"] ||
              "";
            // Parse optional Student ID
            const studentId =
              row["Student ID"] ||
              row["student id"] ||
              row["StudentID"] ||
              row["studentId"] ||
              row["ID"] ||
              row["id"] ||
              "";

            // Parse Payment Info
            const paidAmountRaw =
              row["Paid Amount"] ||
              row["Amount"] ||
              row["paid amount"] ||
              row["amount"];
            const paidAmount = paidAmountRaw
              ? Number(paidAmountRaw)
              : undefined;

            const paymentMethod =
              row["Payment Method"] ||
              row["Method"] ||
              row["payment method"] ||
              row["method"] ||
              "";

            const transactionId =
              row["Transaction ID"] ||
              row["Transaction"] ||
              row["TrxID"] ||
              row["transaction id"] ||
              "";

            const errors = [];
            if (!name) errors.push("Name missing");
            if (!email) errors.push("Email missing");
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              errors.push("Invalid email");
            if (!phone) errors.push("Phone missing");

            // Basic phone cleanup
            const cleanPhone = String(phone).replace(/[^0-9+]/g, "");
            if (cleanPhone.length < 10) errors.push("Phone too short");

            return {
              id: `row-${idx}-${Date.now()}`,
              name,
              email,
              phone: cleanPhone,
              studentId,
              paidAmount,
              paymentMethod,
              transactionId,
              isValid: errors.length === 0,
              errors,
            };
          },
        );

        if (processed.length === 0) {
          toast.error("No data found in file");
          setFile(null);
          setIsParsing(false);
          return;
        }

        setParsedData(processed);
        setUploadStep("preview");
        setIsParsing(false);
      } catch (error) {
        console.error("Parse error:", error);
        toast.error("Failed to parse file");
        setFile(null);
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleRemoveRow = (id: string) => {
    const newData = parsedData.filter((item) => item.id !== id);
    setParsedData(newData);
    if (newData.length === 0) {
      setUploadStep("upload");
      setFile(null);
    }
  };

  const handleClearInvalid = () => {
    const validData = parsedData.filter((s) => s.isValid);
    if (validData.length === 0 && parsedData.length > 0) {
      toast.error("All rows are invalid!");
      return; // Or clear all? Let's just keep valid ones.
    }
    setParsedData(validData);
    if (validData.length === 0) {
      setUploadStep("upload");
      setFile(null);
    } else {
      toast.success(`Removed ${stats.invalid} invalid rows`);
    }
  };

  const handleFieldChange = (
    id: string,
    field: keyof ParsedStudent,
    value: string | number,
  ) => {
    setParsedData((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        let updatedValue: any = value;
        if (field === "paidAmount") {
          updatedValue = value === "" ? undefined : Number(value);
        }

        const updatedItem = { ...item, [field]: updatedValue };

        // Re-validate
        const errors = [];
        if (!updatedItem.name) errors.push("Name missing");
        if (!updatedItem.email) errors.push("Email missing");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedItem.email))
          errors.push("Invalid email");
        if (!updatedItem.phone) errors.push("Phone missing");
        if (updatedItem.phone.length < 10) errors.push("Phone too short");

        updatedItem.isValid = errors.length === 0;
        updatedItem.errors = errors;

        return updatedItem;
      }),
    );
  };

  const handleBulkEnroll = async () => {
    const validStudents = parsedData.filter((s) => s.isValid);
    if (validStudents.length === 0) {
      toast.error("No valid students to enroll");
      return;
    }

    try {
      const result = await bulkAddStudents({
        batchId,
        students: validStudents.map((s) => ({
          name: s.name,
          email: s.email,
          phone: s.phone,
          studentId: s.studentId,
          paidAmount: s.paidAmount,
          paymentMethod: s.paymentMethod,
          transactionId: s.transactionId,
          // Global discount defaults applied to all students
          selectedPlan: globalPlan,
          ...(globalDiscountType !== "none" && {
            discountType: globalDiscountType,
            discountValue: globalDiscountValue,
            discountScope: globalDiscountScope,
            discountReason: globalDiscountReason || undefined,
          }),
        })),
        skipPayment,
      }).unwrap();

      if (result.success) {
        setResultSummary(result.data);
        setUploadStep("result");
        toast.success("Bulk enrollment processed!");
        onSuccess();
      } else {
        toast.error(result.message || "Failed to process bulk enrollment");
      }
    } catch (error: any) {
      console.error("Bulk enroll error:", error);
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "01700000000",
        studentId: "E-2024-00101",
        "Paid Amount": 5000,
        "Payment Method": "Bkash",
        "Transaction ID": "TRX123456",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "01800000000",
        studentId: "",
        "Paid Amount": "",
        "Payment Method": "",
        "Transaction ID": "",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "bulk_student_with_payment_template.xlsx");
  };

  // Helper for avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-100 text-red-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-purple-100 text-purple-600",
      "bg-pink-100 text-pink-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!isOpen) return null;

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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-20">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileSpreadsheet className="text-blue-600" size={24} />
                Bulk Import Students
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Upload & manage bulk enrollments efficiently
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
            {/* STEP 1: UPLOAD */}
            {uploadStep === "upload" && (
              <div className="space-y-6 max-w-2xl mx-auto mt-8">
                {/* Download Template */}
                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                      <FileSpreadsheet size={24} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Need a format?
                      </p>
                      <p className="text-sm text-gray-500">
                        Use our standard template to avoid errors.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <Download size={16} />
                    Download Template
                  </button>
                </div>

                {/* Dropzone */}
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-400 hover:bg-white bg-white"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                  />
                  <div className="p-5 bg-blue-50 rounded-full text-blue-600 mb-5 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Click to upload
                  </h4>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Drag and drop your Excel (.xlsx) or CSV file here to start
                    processing
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: PREVIEW & EDIT */}
            {uploadStep === "preview" && (
              <div className="space-y-4 h-full flex flex-col">
                {/* Global Enrollment Defaults */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-blue-800 mb-3">
                    Global Enrollment Defaults — applied to all students in this
                    import
                  </p>
                  <div className="space-y-3">
                    {/* Discount Tier Picker */}
                    {activeTiers.length > 0 && (
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Quick-apply saved discount tier
                        </label>
                        <select
                          value={selectedTierId}
                          onChange={(e) => handleTierChange(e.target.value)}
                          className="w-full px-2 py-1.5 border border-blue-300 rounded-lg text-sm bg-white"
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

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Plan
                        </label>
                        <select
                          value={globalPlan}
                          onChange={(e) => setGlobalPlan(e.target.value as any)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                        >
                          <option value="1-plan">Full Payment</option>
                          <option value="2-plan">2 Installments</option>
                          <option value="3-plan">3 Installments</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Discount
                        </label>
                        <select
                          value={globalDiscountType}
                          onChange={(e) => {
                            setGlobalDiscountType(e.target.value as any);
                            setSelectedTierId("");
                          }}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                        >
                          <option value="none">None</option>
                          <option value="percentage">Percentage %</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      {globalDiscountType !== "none" && (
                        <>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">
                              Value
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={globalDiscountValue}
                              onChange={(e) => {
                                setGlobalDiscountValue(
                                  parseFloat(e.target.value) || 0,
                                );
                                setSelectedTierId("");
                              }}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">
                              Scope
                            </label>
                            <select
                              value={globalDiscountScope}
                              onChange={(e) =>
                                setGlobalDiscountScope(e.target.value as any)
                              }
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                            >
                              <option value="all">All installments</option>
                              <option value="first-only">First only</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">
                              Reason
                            </label>
                            <input
                              type="text"
                              value={globalDiscountReason}
                              placeholder="e.g. Scholarship"
                              onChange={(e) =>
                                setGlobalDiscountReason(e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>

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
                            ✨ A plan-based discount is automatically applied to
                            this installment plan.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Dashboard Stats & Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2 relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Stats */}
                  <div className="md:col-span-2 flex items-center justify-end gap-3">
                    <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium shadow-sm flex items-center gap-2">
                      <span className="text-gray-500">Total</span>
                      <span className="text-gray-900">{stats.total}</span>
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-100 text-sm font-medium shadow-sm flex items-center gap-2 text-green-700">
                      <CheckCircle size={14} />
                      <span>{stats.valid} Valid</span>
                    </div>

                    {stats.invalid > 0 && (
                      <button
                        onClick={handleClearInvalid}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100 text-sm font-medium shadow-sm flex items-center gap-2 text-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Clear {stats.invalid} Invalid</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm flex-1 flex flex-col min-h-0">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 backdrop-blur sticky top-0 z-10 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-24">
                            Status
                          </th>
                          <th className="px-6 py-4 font-semibold">
                            Student ID
                          </th>
                          <th className="px-6 py-4 font-semibold">
                            User Details
                          </th>
                          <th className="px-6 py-4 font-semibold">
                            Contact Info
                          </th>
                          <th className="px-6 py-4 font-semibold w-32">
                            Payment
                          </th>
                          <th className="px-6 py-4 font-semibold text-right w-20">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-600">
                        {filteredData.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-400"
                            >
                              No students found matching your search.
                            </td>
                          </tr>
                        ) : (
                          filteredData.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-gray-50 transition-colors group"
                            >
                              <td className="px-6 py-3 align-top pt-4">
                                {row.isValid ? (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200">
                                    <CheckCircle size={12} /> Valid
                                  </div>
                                ) : (
                                  <div className="group/tooltip relative inline-block">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold border border-red-200 cursor-help">
                                      <AlertCircle size={12} /> Invalid
                                    </div>
                                    <div className="absolute left-0 top-full mt-2 hidden group-hover/tooltip:block w-48 bg-gray-900/95 backdrop-blur text-white text-xs p-3 rounded-xl shadow-xl z-20 border border-white/10">
                                      <p className="font-semibold mb-1 pb-1 border-b border-white/10">
                                        Errors:
                                      </p>
                                      <ul className="list-disc pl-3 space-y-0.5">
                                        {row.errors.map((e, i) => (
                                          <li key={i}>{e}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <input
                                  type="text"
                                  value={row.studentId}
                                  placeholder="Auto"
                                  onChange={(e) =>
                                    handleFieldChange(
                                      row.id,
                                      "studentId",
                                      e.target.value,
                                    )
                                  }
                                  className="w-24 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 p-1 text-sm font-medium text-gray-700 placeholder-gray-400"
                                />
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center gap-3">
                                  {/* Smart Avatar */}
                                  <div
                                    className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                                      getAvatarColor(row.name || "U"),
                                    )}
                                  >
                                    {row.name ? (
                                      row.name.charAt(0).toUpperCase()
                                    ) : (
                                      <User size={16} />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={row.name}
                                      placeholder="Student Name"
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-gray-900 placeholder-gray-400"
                                    />
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Password: {row.phone || "..."}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div className="space-y-1">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={row.email}
                                      placeholder="Email Address"
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "email",
                                          e.target.value,
                                        )
                                      }
                                      className={cn(
                                        "w-full bg-transparent border-none focus:ring-0 p-0 text-sm transition-colors",
                                        !row.email ||
                                          (!row.isValid &&
                                            row.errors.includes(
                                              "Invalid email",
                                            ))
                                          ? "text-red-600 font-medium placeholder-red-300"
                                          : "text-gray-700",
                                      )}
                                    />
                                    {!row.isValid &&
                                      row.errors.includes("Invalid email") && (
                                        <AlertTriangle
                                          size={12}
                                          className="absolute right-0 top-1/2 -translate-y-1/2 text-red-500"
                                        />
                                      )}
                                  </div>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={row.phone}
                                      placeholder="Phone Number"
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "phone",
                                          e.target.value,
                                        )
                                      }
                                      className={cn(
                                        "w-full bg-transparent border-none focus:ring-0 p-0 text-xs transition-colors",
                                        !row.phone || row.phone.length < 10
                                          ? "text-red-500 placeholder-red-300"
                                          : "text-gray-500",
                                      )}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <div
                                  className={`space-y-2 ${skipPayment ? "opacity-40 pointer-events-none" : ""}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs w-8">
                                      Amt:
                                    </span>
                                    <input
                                      type="number"
                                      value={
                                        row.paidAmount !== undefined
                                          ? row.paidAmount
                                          : ""
                                      }
                                      placeholder="0"
                                      disabled={skipPayment}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "paidAmount",
                                          e.target.value,
                                        )
                                      }
                                      className="w-24 bg-transparent border-b border-gray-200 focus:border-green-500 focus:ring-0 p-1 text-sm font-semibold text-green-700 placeholder-gray-300 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs w-8">
                                      Via:
                                    </span>
                                    <input
                                      type="text"
                                      value={row.paymentMethod || ""}
                                      placeholder="Method"
                                      disabled={skipPayment}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "paymentMethod",
                                          e.target.value,
                                        )
                                      }
                                      className="w-24 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 p-1 text-xs text-gray-600 placeholder-gray-300 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs w-8">
                                      Trx:
                                    </span>
                                    <input
                                      type="text"
                                      value={row.transactionId || ""}
                                      placeholder="Trx ID"
                                      disabled={skipPayment}
                                      onChange={(e) =>
                                        handleFieldChange(
                                          row.id,
                                          "transactionId",
                                          e.target.value,
                                        )
                                      }
                                      className="w-24 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:ring-0 p-1 text-xs text-gray-600 placeholder-gray-300 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Remove row"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer: Payment Mode Selection */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Initial Payment Handling
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Use Excel Payment Data */}
                    <button
                      onClick={() => setSkipPayment(false)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !skipPayment
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign
                          size={14}
                          className={
                            !skipPayment ? "text-blue-600" : "text-gray-400"
                          }
                        />
                        <span
                          className={`text-sm font-medium ${!skipPayment ? "text-blue-700" : "text-gray-600"}`}
                        >
                          Record Payments from Excel
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 ml-[22px]">
                        Use per-row Amount, Method & Trx ID from the uploaded
                        file
                      </p>
                    </button>

                    {/* Option 2: No payment now */}
                    <button
                      onClick={() => setSkipPayment(true)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        skipPayment
                          ? "border-amber-500 bg-amber-50 ring-1 ring-amber-200"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle
                          size={14}
                          className={
                            skipPayment ? "text-amber-600" : "text-gray-400"
                          }
                        />
                        <span
                          className={`text-sm font-medium ${skipPayment ? "text-amber-700" : "text-gray-600"}`}
                        >
                          No Payment Now
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 ml-[22px]">
                        Enroll first, record payments later from each
                        student&apos;s profile
                      </p>
                    </button>
                  </div>

                  {skipPayment && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle
                        size={14}
                        className="text-amber-600 shrink-0"
                      />
                      <p className="text-xs text-amber-700">
                        Payment columns in the table above are disabled. All
                        students will be enrolled with{" "}
                        <strong>no payment recorded</strong>. You can add
                        payments later.
                      </p>
                    </div>
                  )}
                  {!skipPayment && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                      <CheckCircle
                        size={14}
                        className="text-blue-600 shrink-0"
                      />
                      <p className="text-xs text-blue-700">
                        Payment data from each row (Amount, Method, Trx ID) will
                        be recorded during enrollment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: RESULTS */}
            {uploadStep === "result" && resultSummary && (
              <div className="space-y-8 text-center py-12 max-w-xl mx-auto">
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle size={48} className="text-green-600" />
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Processing Complete!
                  </h3>
                  <p className="text-gray-500 mt-2">
                    We've finished processing your bulk enrollment request.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                      Total
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {resultSummary.totalProcessed}
                    </p>
                  </div>
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-100 shadow-sm">
                    <p className="text-xs text-green-600 uppercase tracking-wider font-semibold">
                      Success
                    </p>
                    <p className="text-3xl font-bold text-green-700 mt-1">
                      {resultSummary.totalSuccess}
                    </p>
                  </div>
                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100 shadow-sm">
                    <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">
                      Failed
                    </p>
                    <p className="text-3xl font-bold text-red-700 mt-1">
                      {resultSummary.totalFailed}
                    </p>
                  </div>
                </div>

                {resultSummary.failed.length > 0 && (
                  <div className="text-left border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-8">
                    <div className="bg-red-50 px-5 py-3 border-b border-red-100 font-semibold text-red-800 text-sm flex items-center gap-2">
                      <AlertTriangle size={16} /> Failure Report
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {resultSummary.failed.map((fail: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600 font-bold text-xs">
                            {fail.email
                              ? fail.email.charAt(0).toUpperCase()
                              : "!"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {fail.email || "Unknown Entry"}
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                              {fail.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-2xl">
            {uploadStep === "result" ? (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-xl"
              >
                Close Window
              </button>
            ) : parsedData.length > 0 && uploadStep === "preview" ? (
              <>
                <button
                  onClick={() => {
                    setUploadStep("upload");
                    setFile(null);
                    setParsedData([]);
                    setSearchTerm("");
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to Upload
                </button>
                <button
                  onClick={handleBulkEnroll}
                  disabled={
                    isParsing ||
                    isSubmitting ||
                    parsedData.filter((s) => s.isValid).length === 0
                  }
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      Enroll {parsedData.filter((s) => s.isValid).length}{" "}
                      Students
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
