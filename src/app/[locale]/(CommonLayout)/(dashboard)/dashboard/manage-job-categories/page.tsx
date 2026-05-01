"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle,
  X,
  ToggleLeft,
  ToggleRight,
  Briefcase,
} from "lucide-react";
import {
  useGetJobCategoriesQuery,
  useCreateJobCategoryMutation,
  useUpdateJobCategoryMutation,
  useDeleteJobCategoryMutation,
  useToggleJobCategoryMutation,
  type IJobCategory,
} from "@/app/redux/api/jobsApi/JobCategoryApi";

const EMOJI_OPTIONS = [
  "💼",
  "🏗️",
  "⚡",
  "✈️",
  "🔧",
  "🏥",
  "💻",
  "🎨",
  "🚢",
  "🏭",
  "📐",
  "🌍",
];
const COLOR_OPTIONS = [
  "#1a4da1",
  "#059669",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#374151",
];

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all";

// ─── Category Form Modal ──────────────────────────────────────
function CategoryModal({
  cat,
  onClose,
  onSave,
  isSaving,
}: {
  cat?: IJobCategory;
  onClose: () => void;
  onSave: (d: Partial<IJobCategory>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    name: cat?.name ?? "",
    slug: cat?.slug ?? "",
    icon: cat?.icon ?? "💼",
    color: cat?.color ?? "#1a4da1",
    description: cat?.description ?? "",
    order: cat?.order ?? 0,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  // Auto slug from name
  const handleName = (v: string) => {
    set("name", v);
    if (!cat) {
      set(
        "slug",
        v
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Tag size={16} className="text-blue-600" />
            {cat ? "Edit Category" : "New Category"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Icon picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => set("icon", e)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.icon === e
                      ? "bg-blue-100 ring-2 ring-blue-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => set("color", c)}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Category Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => handleName(e.target.value)}
              placeholder="যেমন: Engineering, Aviation"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="engineering"
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Optional description..."
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
              Order
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => set("order", Number(e.target.value))}
              className={inputCls}
            />
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: form.color + "20" }}
            >
              {form.icon}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">
                {form.name || "Category Name"}
              </p>
              <p className="text-xs text-gray-400">
                {form.slug || "category-slug"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            {cat ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function ManageJobCategoriesPage() {
  const { data: categories = [], isLoading } = useGetJobCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateJobCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateJobCategoryMutation();
  const [deleteCategory] = useDeleteJobCategoryMutation();
  const [toggleCategory] = useToggleJobCategoryMutation();

  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<IJobCategory | undefined>(undefined);

  const handleSave = async (data: Partial<IJobCategory>) => {
    try {
      if (editCat) {
        await updateCategory({ id: editCat._id, ...data }).unwrap();
        toast.success("Updated ✅");
      } else {
        await createCategory(data).unwrap();
        toast.success("Category created ✅");
      }
      setShowModal(false);
      setEditCat(undefined);
    } catch {
      toast.error("সমস্যা হয়েছে");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" delete করবেন?`)) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success("Deleted ✅");
    } catch {
      toast.error("Delete সমস্যা");
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleCategory(id).unwrap();
      toast.success("Status updated ✅");
    } catch {
      toast.error("Update সমস্যা");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Tag className="text-blue-600" size={22} /> Job Categories
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Job posting এর জন্য categories manage করুন
            </p>
          </div>
          <button
            onClick={() => {
              setEditCat(undefined);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors"
          >
            <Plus size={16} /> New Category
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Tag size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="font-bold text-slate-600 mb-1">কোনো category নেই</p>
            <p className="text-sm text-gray-400 mb-4">নতুন category যোগ করুন</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700"
            >
              <Plus size={14} className="inline mr-1" /> Create First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 transition-all ${
                  cat.isActive
                    ? "border-gray-100"
                    : "border-gray-100 opacity-60"
                }`}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: (cat.color || "#1a4da1") + "15" }}
                >
                  {cat.icon || "💼"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 truncate">
                      {cat.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        cat.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{cat.slug}</p>
                  {cat.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(cat._id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    title={cat.isActive ? "Deactivate" : "Activate"}
                  >
                    {cat.isActive ? (
                      <ToggleRight size={18} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={18} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditCat(cat);
                      setShowModal(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CategoryModal
          cat={editCat}
          onClose={() => {
            setShowModal(false);
            setEditCat(undefined);
          }}
          onSave={handleSave}
          isSaving={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
