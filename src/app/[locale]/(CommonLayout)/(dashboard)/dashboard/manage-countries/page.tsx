"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import {
  Globe,
  Plus,
  Trash2,
  Pencil,
  Search,
  Upload,
  Loader2,
  X,
  Sparkles,
  Flag,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";
import {
  useGetCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useUploadCountryFlagMutation,
  ICountry,
} from "@/app/redux/api/jobsApi/CountryApi";
import { getImageUrl } from "@/utils/imageUtils";
import { useLocale } from "next-intl";

export default function ManageCountriesPage() {
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState("");

  // RTK Query hooks
  const { data: countries = [], isLoading, isError, refetch } = useGetCountriesQuery();
  const [createCountry, { isLoading: isCreating }] = useCreateCountryMutation();
  const [updateCountry, { isLoading: isUpdating }] = useUpdateCountryMutation();
  const [deleteCountry, { isLoading: isDeleting }] = useDeleteCountryMutation();
  const [uploadFlag, { isLoading: isUploading }] = useUploadCountryFlagMutation();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<ICountry | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [code, setCode] = useState("");
  const [flagIcon, setFlagIcon] = useState("");

  // File Upload State
  const [flagPreview, setFlagPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingCountry(null);
    setName("");
    setNameBn("");
    setCode("");
    setFlagIcon("");
    setFlagPreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (country: ICountry) => {
    setEditingCountry(country);
    setName(country.name);
    setNameBn(country.nameBn || "");
    setCode(country.code || "");
    setFlagIcon(country.flagIcon || "");
    setFlagPreview(country.flagIcon ? getImageUrl(country.flagIcon) : null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ছবির আকার ৫ MB-র কম হতে হবে");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setFlagPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("flag", file);
      const flagUrl = await uploadFlag(fd).unwrap();
      setFlagIcon(flagUrl);
      toast.success("পতাকার ছবি আপলোড সম্পন্ন হয়েছে!");
    } catch {
      toast.error("আপলোড ব্যর্থ হয়েছে! ইউআরএল লিঙ্ক সরাসরি ব্যবহার করুন।");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nameBn.trim()) {
      toast.error("দেশের নাম (ইংরেজি ও বাংলা) আবশ্যক!");
      return;
    }

    const payload = {
      name: name.trim(),
      nameBn: nameBn.trim(),
      code: code.trim().toLowerCase() || name.slice(0, 2).toLowerCase(),
      flagIcon: flagIcon.trim() || "https://flagcdn.com/w160/un.png",
    };

    try {
      if (editingCountry) {
        await updateCountry({ id: editingCountry._id, data: payload }).unwrap();
        toast.success("দেশ সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await createCountry(payload).unwrap();
        toast.success("নতুন দেশ যুক্ত করা হয়েছে!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "কিছু সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCountry(id).unwrap();
      toast.success("দেশ সফলভাবে মুছে ফেলা হয়েছে!");
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "মুছে ফেলা সম্ভব হয়নি");
    }
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* ── Page Header ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a4da1] to-[#2B59C3] text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Globe size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                দেশ ব্যবস্থাপনা (Country Management)
              </h1>
              <span className="bg-blue-50 text-[#1a4da1] dark:bg-blue-950/60 dark:text-blue-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                {countries.length} টি দেশ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              চাকরির পেজে প্রদর্শিত দেশসমূহের তালিকা এবং পতাকার ছবি এডমিন প্যানেল থেকে পরিচালনা করুন।
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-5 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #1a4da1 0%, #2B59C3 100%)" }}
        >
          <Plus size={18} />
          নতুন দেশ যুক্ত করুন
        </button>
      </div>

      {/* ── Filter Bar & Stats ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="দেশের নাম বা কোড দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-[#1a4da1] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Sparkles size={14} className="text-[#1a4da1]" />
          <span>মোট {filteredCountries.length} টি দেশ প্রদর্শিত হচ্ছে</span>
        </div>
      </div>

      {/* ── Countries Grid / Table ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Loader2 size={36} className="animate-spin text-[#1a4da1] mb-3" />
          <p className="text-sm font-semibold text-gray-500">দেশসমূহের তথ্য লোড হচ্ছে...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-900/30 p-6">
          <p className="text-red-500 font-bold mb-2">দেশের ডেটা লোড করতে সমস্যা হয়েছে!</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-bold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      ) : filteredCountries.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Globe size={40} className="mx-auto text-gray-300 mb-3 opacity-60" />
          <p className="text-gray-700 dark:text-gray-200 font-bold text-base">কোন দেশ পাওয়া যায়নি</p>
          <p className="text-gray-400 text-xs mt-1">নতুন দেশ যুক্ত করতে উপরের বোতামটি ব্যবহার করুন</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCountries.map((country) => {
            const isCustomUpload = country.flagIcon?.startsWith("/uploads") || country.flagIcon?.startsWith("http");
            return (
              <div
                key={country._id}
                className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/40 transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-800 flex items-center justify-center shadow-inner">
                    {isCustomUpload ? (
                      <img
                        src={getImageUrl(country.flagIcon)}
                        alt={country.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "https://flagcdn.com/w160/un.png";
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{country.flagIcon || "🌐"}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                      {country.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {country.nameBn}
                    </p>
                    <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded mt-1">
                      {country.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <button
                    onClick={() => openEditModal(country)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                    title="সম্পাদনা করুন"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(country._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Flag size={18} className="text-[#1a4da1]" />
                {editingCountry ? "দেশের তথ্য আপডেট করুন" : "নতুন দেশ যুক্ত করুন"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1a4da1] dark:text-blue-400 mb-1.5 uppercase tracking-wide">
                  Country Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saudi Arabia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm outline-none focus:border-[#1a4da1] transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a4da1] dark:text-blue-400 mb-1.5 uppercase tracking-wide">
                  দেশের নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সৌদি আরব"
                  value={nameBn}
                  onChange={(e) => setNameBn(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm outline-none focus:border-[#1a4da1] transition-all dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a4da1] dark:text-blue-400 mb-1.5 uppercase tracking-wide">
                  Country Code (2 letters, e.g. sa, ae, qa)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="sa"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm outline-none focus:border-[#1a4da1] transition-all dark:text-white uppercase font-mono"
                />
              </div>

              {/* Flag Image / Icon */}
              <div>
                <label className="block text-xs font-bold text-[#1a4da1] dark:text-blue-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon size={14} /> পতাকার ছবি (Flag Image or URL)
                </label>

                {/* Preview */}
                {flagPreview && (
                  <div className="relative mb-3 rounded-xl overflow-hidden h-24 w-24 mx-auto border-2 border-blue-200 dark:border-blue-800 shadow-md">
                    <img
                      src={flagPreview}
                      alt="Flag Preview"
                      className="w-full h-full object-cover"
                      onError={() => setFlagPreview(null)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFlagIcon("");
                        setFlagPreview(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )}

                {/* Dropzone */}
                {!flagPreview && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#1a4da1] bg-blue-50 dark:bg-blue-950/40"
                        : "border-gray-200 dark:border-gray-700 hover:border-[#1a4da1] hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {isUploading ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <Loader2 size={18} className="animate-spin text-[#1a4da1]" />
                        <span className="text-xs font-bold text-[#1a4da1]">আপলোড হচ্ছে...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          ফাইল ড্রাগ বা{" "}
                          <span className="text-[#1a4da1] font-bold">ব্রাউজ করুন</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WebP — সর্বোচ্চ 5MB</p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-[10px] text-gray-400 font-bold">অথবা সরাসরি URL দিন</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                <input
                  type="text"
                  placeholder="https://flagcdn.com/w160/sa.png"
                  value={flagIcon}
                  onChange={(e) => {
                    setFlagIcon(e.target.value);
                    setFlagPreview(e.target.value || null);
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm outline-none focus:border-[#1a4da1] transition-all dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-[#1a4da1] hover:bg-[#133a7a] text-white text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-60 transition-all"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {editingCountry ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white">
                আপনি কি নিশ্চিত?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                এই দেশের রেকর্ড মুছে ফেলা হবে। এই কাজটি পুনরায় ফিরিয়ে আনা যাবে না।
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                না, বাতিল করুন
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
              >
                {isDeleting && <Loader2 size={12} className="animate-spin" />}
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
