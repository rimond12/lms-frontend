"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/AxiosInstance/client";
import { toast } from "react-hot-toast";
import { Trash2, Edit2, Plus, Check, X, Loader2 } from "lucide-react";

interface Rule {
  _id: string;
  trigger: string;
  keywords: string[];
  responseText: string;
  responseTextBn: string;
  actionType: string;
  actionValue: string;
  isActive: boolean;
  order: number;
}

export default function RulesManager() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState<Partial<Rule>>({
    trigger: "",
    keywords: [],
    responseText: "",
    responseTextBn: "",
    actionType: "none",
    actionValue: "",
    isActive: true,
    order: 0,
  });
  const [keywordInput, setKeywordInput] = useState("");

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/immigrant-ai/admin/rules");
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load rules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...currentRule,
      keywords: keywordInput.split(",").map((k) => k.trim()).filter((k) => k),
    };

    try {
      if (currentRule._id) {
        // Update
        const res = await axiosInstance.put(`/immigrant-ai/admin/rules/${currentRule._id}`, payload);
        if (res.data.success) {
          toast.success("Rule updated successfully");
          fetchRules();
          setIsEditing(false);
        }
      } else {
        // Create
        const res = await axiosInstance.post("/immigrant-ai/admin/rules", payload);
        if (res.data.success) {
          toast.success("Rule created successfully");
          fetchRules();
          setIsEditing(false);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save rule");
    }
  };

  const handleEdit = (rule: Rule) => {
    setCurrentRule(rule);
    setKeywordInput(rule.keywords.join(", "));
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      const res = await axiosInstance.delete(`/immigrant-ai/admin/rules/${id}`);
      if (res.data.success) {
        toast.success("Rule deleted successfully");
        fetchRules();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete rule");
    }
  };

  const startNew = () => {
    setCurrentRule({
      trigger: "",
      keywords: [],
      responseText: "",
      responseTextBn: "",
      actionType: "none",
      actionValue: "",
      isActive: true,
      order: 0,
    });
    setKeywordInput("");
    setIsEditing(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Q&A Rules Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Configure bot keyword matches and static replies</p>
        </div>
        {!isEditing && (
          <button
            onClick={startNew}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Plus size={18} /> Add New Rule
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {currentRule._id ? "Edit Chat Rule" : "Create Chat Rule"}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trigger Name / Intent</label>
              <input
                type="text"
                required
                value={currentRule.trigger || ""}
                onChange={(e) => setCurrentRule({ ...currentRule, trigger: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="e.g. visa_inquiry"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Order</label>
              <input
                type="number"
                value={currentRule.order ?? 0}
                onChange={(e) => setCurrentRule({ ...currentRule, order: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Trigger Keywords (comma separated)</label>
            <input
              type="text"
              required
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
              placeholder="e.g. visa, passport, verification"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Response Text (English)</label>
            <textarea
              required
              value={currentRule.responseText || ""}
              onChange={(e) => setCurrentRule({ ...currentRule, responseText: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 h-24"
              placeholder="Type English response..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Response Text (Bengali)</label>
            <textarea
              value={currentRule.responseTextBn || ""}
              onChange={(e) => setCurrentRule({ ...currentRule, responseTextBn: e.target.value })}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 h-24"
              placeholder="Type Bengali response..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Action Type</label>
              <select
                value={currentRule.actionType || "none"}
                onChange={(e) => setCurrentRule({ ...currentRule, actionType: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700 bg-white"
              >
                <option value="none">None</option>
                <option value="link">Link to Page</option>
                <option value="showCountries">Show Countries</option>
                <option value="showCourses">Show Courses</option>
                <option value="showContact">Show Contact Details</option>
                <option value="showAbout">Show About Details</option>
                <option value="consultantForm">Consultant Inquiry Form</option>
                <option value="customerCare">Talk to Human Form</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Action Value (e.g. Link URL)</label>
              <input
                type="text"
                value={currentRule.actionValue || ""}
                onChange={(e) => setCurrentRule({ ...currentRule, actionValue: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-700"
                placeholder="/visa-verification"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="isActive"
              checked={currentRule.isActive ?? true}
              onChange={(e) => setCurrentRule({ ...currentRule, isActive: e.target.checked })}
              className="rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Rule is Active</label>
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
              Save Rule
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
                <th className="p-4">Trigger</th>
                <th className="p-4">Keywords</th>
                <th className="p-4">Response (EN)</th>
                <th className="p-4">Action</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {rules.map((rule) => (
                <tr key={rule._id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-semibold text-slate-900">{rule.trigger}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((kw, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs truncate" title={rule.responseText}>{rule.responseText}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">
                      {rule.actionType}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {rule.isActive ? (
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
                        onClick={() => handleEdit(rule)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule._id)}
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
