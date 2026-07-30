"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  Building2,
  HelpCircle,
  Save,
  CheckCircle2,
  Loader2,
  RefreshCw,
  PhoneCall,
  Sparkles,
  Info,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetPaymentSettingQuery,
  useUpdatePaymentSettingMutation,
  IPaymentSetting,
} from "@/app/redux/api/paymentSettingApi/paymentSettingApi";

export default function PaymentSettingsManager() {
  const { data, isLoading, isError, refetch } = useGetPaymentSettingQuery();
  const [updatePaymentSetting, { isLoading: isUpdating }] =
    useUpdatePaymentSettingMutation();

  const [formData, setFormData] = useState<Partial<IPaymentSetting>>({
    bkashNumber: "",
    bkashType: "Personal",
    nagadNumber: "",
    nagadType: "Personal",
    rocketNumber: "",
    rocketType: "Personal",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankBranch: "",
    paymentInstructions: "",
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        bkashNumber: data.data.bkashNumber || "",
        bkashType: data.data.bkashType || "Personal",
        nagadNumber: data.data.nagadNumber || "",
        nagadType: data.data.nagadType || "Personal",
        rocketNumber: data.data.rocketNumber || "",
        rocketType: data.data.rocketType || "Personal",
        bankName: data.data.bankName || "",
        bankAccountName: data.data.bankAccountName || "",
        bankAccountNumber: data.data.bankAccountNumber || "",
        bankBranch: data.data.bankBranch || "",
        paymentInstructions: data.data.paymentInstructions || "",
      });
    }
  }, [data]);

  const handleChange = (
    field: keyof IPaymentSetting,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePaymentSetting(formData).unwrap();
      toast.success("Payment settings updated successfully!");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update payment settings"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mb-3" />
        <p className="text-gray-500 text-sm font-medium">
          Loading payment settings...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center max-w-xl mx-auto my-8">
        <p className="font-semibold mb-3">Failed to load payment settings.</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-300 mb-3">
              <Sparkles size={14} /> Global CMS Configuration
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Payment Settings
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Configure payment numbers, mobile banking details (bKash, Nagad, Rocket), and bank accounts displayed to students during enrollment.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 shrink-0"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mobile Banking Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 font-bold">
              <Wallet size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Mobile Banking Accounts
              </h2>
              <p className="text-xs text-gray-500">
                Set numbers for bKash, Nagad, and Rocket mobile payments
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* bKash Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/50 to-rose-50/30 border border-pink-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-pink-700 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center text-xs font-black">
                    b
                  </span>
                  bKash
                </span>
                <select
                  value={formData.bkashType}
                  onChange={(e) => handleChange("bkashType", e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-pink-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  bKash Number
                </label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={(e) => handleChange("bkashNumber", e.target.value)}
                  placeholder="e.g. 01712-345678"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Nagad Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/50 to-amber-50/30 border border-orange-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-orange-700 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                    N
                  </span>
                  Nagad
                </span>
                <select
                  value={formData.nagadType}
                  onChange={(e) => handleChange("nagadType", e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-orange-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Nagad Number
                </label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={(e) => handleChange("nagadNumber", e.target.value)}
                  placeholder="e.g. 01712-345678"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Rocket Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-indigo-50/30 border border-purple-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-700 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                    R
                  </span>
                  Rocket
                </span>
                <select
                  value={formData.rocketType}
                  onChange={(e) => handleChange("rocketType", e.target.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-purple-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="Personal">Personal</option>
                  <option value="Merchant">Merchant</option>
                  <option value="Agent">Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Rocket Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.rocketNumber}
                  onChange={(e) => handleChange("rocketNumber", e.target.value)}
                  placeholder="e.g. 01712-345678-9"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bank Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Direct Bank Transfer Details
              </h2>
              <p className="text-xs text-gray-500">
                Official bank account info for direct bank deposits / wire transfers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                placeholder="e.g. AIBL Bank / Islami Bank Bangladesh Ltd"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Account Name / Title
              </label>
              <input
                type="text"
                value={formData.bankAccountName}
                onChange={(e) => handleChange("bankAccountName", e.target.value)}
                placeholder="e.g. CADD CORE LTD"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Account Number
              </label>
              <input
                type="text"
                value={formData.bankAccountNumber}
                onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                placeholder="e.g. 1234567890"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                value={formData.bankBranch}
                onChange={(e) => handleChange("bankBranch", e.target.value)}
                placeholder="e.g. Uttara Branch, Dhaka"
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent transition-all"
              />
            </div>
          </div>
        </motion.div>

        {/* Payment Instructions Note */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
              <Info size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Payment Instructions & Guidelines
              </h2>
              <p className="text-xs text-gray-500">
                Custom note shown above transaction entry in checkout
              </p>
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={formData.paymentInstructions}
              onChange={(e) =>
                handleChange("paymentInstructions", e.target.value)
              }
              placeholder="e.g. Please send payment using bKash/Nagad Send Money option, then copy the Transaction ID..."
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all resize-none"
            />
          </div>
        </motion.div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Update Payment Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
