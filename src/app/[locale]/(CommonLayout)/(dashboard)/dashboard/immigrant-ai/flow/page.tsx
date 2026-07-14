"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/AxiosInstance/client";
import { toast } from "react-hot-toast";
import { Trash2, Edit2, Plus, Check, X, Loader2 } from "lucide-react";

interface MenuItem {
  _id: string;
  label: string;
  labelBn: string;
  icon: string;
  actionType: string;
  actionValue: string;
  isActive: boolean;
  order: number;
}

export default function FlowBuilder() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem>>({
    label: "",
    labelBn: "",
    icon: "💬",
    actionType: "none",
    actionValue: "",
    isActive: true,
    order: 0,
  });

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/immigrant-ai/admin/menu");
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load flow menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem._id) {
        // Update
        const res = await axiosInstance.put(`/immigrant-ai/admin/menu/${currentItem._id}`, currentItem);
        if (res.data.success) {
          toast.success("Menu item updated");
          fetchMenu();
          setIsEditing(false);
        }
      } else {
        // Create
        const res = await axiosInstance.post("/immigrant-ai/admin/menu", currentItem);
        if (res.data.success) {
          toast.success("Menu item created");
          fetchMenu();
          setIsEditing(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      const res = await axiosInstance.delete(`/immigrant-ai/admin/menu/${id}`);
      if (res.data.success) {
        toast.success("Menu item deleted");
        fetchMenu();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item");
    }
  };

  const startNew = () => {
    setCurrentItem({
      label: "",
      labelBn: "",
      icon: "💬",
      actionType: "none",
      actionValue: "",
      isActive: true,
      order: menuItems.length + 1,
    });
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flow Menu Builder</h1>
          <p className="text-slate-500 text-sm mt-1">Configure top-level quick-reply button triggers</p>
        </div>
        {!isEditing && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Add Menu Button
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {currentItem._id ? "Edit Quick Reply Item" : "Create Quick Reply Item"}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Label (English)</label>
              <input
                type="text"
                required
                value={currentItem.label || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, label: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="e.g. Find Jobs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Label (Bengali)</label>
              <input
                type="text"
                required
                value={currentItem.labelBn || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, labelBn: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="e.g. চাকরি খুঁজুন"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Icon Emoji / Name</label>
              <input
                type="text"
                value={currentItem.icon || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="e.g. 💼"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sort Order</label>
              <input
                type="number"
                value={currentItem.order ?? 0}
                onChange={(e) => setCurrentItem({ ...currentItem, order: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Action Type</label>
              <select
                value={currentItem.actionType || "none"}
                onChange={(e) => setCurrentItem({ ...currentItem, actionType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 bg-white"
              >
                <option value="none">None</option>
                <option value="link">Link to Page</option>
                <option value="showCountries">Show Country Selector</option>
                <option value="showCourses">Show Training Selector</option>
                <option value="showContact">Show Contact details</option>
                <option value="showAbout">Show About details</option>
                <option value="consultantForm">Consultant Form</option>
                <option value="customerCare">Human Live Agent Form</option>
                <option value="triggerRule">Trigger Chat Rule Match</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Action Payload Value</label>
              <input
                type="text"
                value={currentItem.actionValue || ""}
                onChange={(e) => setCurrentItem({ ...currentItem, actionValue: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="/contact or visa"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="isActive"
              checked={currentItem.isActive ?? true}
              onChange={(e) => setCurrentItem({ ...currentItem, isActive: e.target.checked })}
              className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Button is Active</label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold"
            >
              Save Button
            </button>
          </div>
        </form>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-700" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="p-4 w-16 text-center">Order</th>
                <th className="p-4 w-16 text-center">Icon</th>
                <th className="p-4">Label (EN)</th>
                <th className="p-4">Label (BN)</th>
                <th className="p-4">Trigger Action</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {menuItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50">
                  <td className="p-4 text-center font-bold text-slate-500">{item.order}</td>
                  <td className="p-4 text-center text-lg">{item.icon}</td>
                  <td className="p-4 font-semibold text-slate-900">{item.label}</td>
                  <td className="p-4">{item.labelBn}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                      {item.actionType} {item.actionValue && `(${item.actionValue})`}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 text-xs font-semibold px-2 py-1 rounded">
                        <Check size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 text-xs font-semibold px-2 py-1 rounded">
                        <X size={12} /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
