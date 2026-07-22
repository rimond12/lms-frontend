"use client";

import React, { useState, useEffect } from "react";
import {
  useGetCvBuilderCmsQuery,
  useUpdateCvBuilderCmsMutation,
} from "@/app/redux/api/cvBuilderApi/cvBuilderApi";
import { ICvBuilderCMS, ICvSectionConfig } from "@/types/cvBuilder.types";
import {
  FileText,
  Save,
  HelpCircle,
  Layers,
  Bot,
  ToggleLeft,
  ToggleRight,
  Layout,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ManageCvBuilderAdminPage() {
  const { data: cmsResponse, isLoading, refetch } = useGetCvBuilderCmsQuery();
  const [updateCms, { isLoading: isUpdating }] = useUpdateCvBuilderCmsMutation();

  const [activeTab, setActiveTab] = useState<"sections" | "tips" | "ai" | "templates">("sections");
  const [cmsConfig, setCmsConfig] = useState<ICvBuilderCMS>({
    sections: [],
    aiConfig: {
      isEnabled: true,
      modelName: "gemini-2.0-flash",
      promptTemplates: {},
      systemPrompt: "",
    },
    templates: [],
  });

  useEffect(() => {
    if (cmsResponse?.data) {
      // Deep clone RTK Query response to ensure all state objects are mutable
      setCmsConfig(JSON.parse(JSON.stringify(cmsResponse.data)));
    }
  }, [cmsResponse]);

  const handleSaveConfig = async () => {
    try {
      await updateCms(cmsConfig).unwrap();
      toast.success("CV Builder settings saved successfully!");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update CV Builder settings.");
    }
  };

  const toggleSection = (index: number) => {
    const updated = (cmsConfig.sections || []).map((sec, i) =>
      i === index ? { ...sec, isEnabled: !sec.isEnabled } : { ...sec }
    );
    setCmsConfig({ ...cmsConfig, sections: updated });
  };

  const updateSectionField = (index: number, field: keyof ICvSectionConfig, value: any) => {
    const updated = (cmsConfig.sections || []).map((sec, i) =>
      i === index ? { ...sec, [field]: value } : { ...sec }
    );
    setCmsConfig({ ...cmsConfig, sections: updated });
  };

  const toggleTemplate = (index: number) => {
    const updated = (cmsConfig.templates || []).map((tpl, i) =>
      i === index ? { ...tpl, isEnabled: !tpl.isEnabled } : { ...tpl }
    );
    setCmsConfig({ ...cmsConfig, templates: updated });
  };

  const updateAiPrompt = (key: string, value: string) => {
    setCmsConfig({
      ...cmsConfig,
      aiConfig: {
        ...cmsConfig.aiConfig,
        promptTemplates: {
          ...(cmsConfig.aiConfig?.promptTemplates || {}),
          [key]: value,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading CV Builder Settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              CV Builder CMS Management
            </h1>
            <p className="text-xs text-slate-500">
              Manage CV sections, instructions, tips, examples, AI prompts & templates.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isUpdating}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all disabled:opacity-50"
        >
          <Save size={16} />
          <span>{isUpdating ? "Saving Changes..." : "Save All Changes"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "sections"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Layers size={16} />
          <span>Sections & Fields</span>
        </button>
        <button
          onClick={() => setActiveTab("tips")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "tips"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <HelpCircle size={16} />
          <span>Instructions & Tips</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "ai"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Bot size={16} />
          <span>AI Assistant Config</span>
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "templates"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Layout size={16} />
          <span>CV Templates</span>
        </button>
      </div>

      {/* Tab 1: Sections & Fields */}
      {activeTab === "sections" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            CV Sections Enablement & Order
          </h2>
          <div className="space-y-3">
            {(cmsConfig.sections || []).map((sec, idx) => (
              <div
                key={sec.key}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {sec.nameEn} ({sec.nameBn})
                    </h3>
                    <p className="text-[11px] text-slate-500">Key: {sec.key}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sec.nameEn}
                      onChange={(e) => updateSectionField(idx, "nameEn", e.target.value)}
                      placeholder="Title (English)"
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      value={sec.nameBn}
                      onChange={(e) => updateSectionField(idx, "nameBn", e.target.value)}
                      placeholder="Title (Bengali)"
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  <button
                    onClick={() => toggleSection(idx)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      sec.isEnabled
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {sec.isEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    <span>{sec.isEnabled ? "Enabled" : "Disabled"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Instructions & Tips */}
      {activeTab === "tips" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Edit Helpful Instructions, Tips & Example Content
          </h2>

          {(cmsConfig.sections || []).map((sec, idx) => (
            <div
              key={sec.key}
              className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Section: {sec.nameEn} ({sec.nameBn})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Instructions (English)</label>
                  <textarea
                    rows={2}
                    value={sec.instructionsEn || ""}
                    onChange={(e) => updateSectionField(idx, "instructionsEn", e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Instructions (Bengali)</label>
                  <textarea
                    rows={2}
                    value={sec.instructionsBn || ""}
                    onChange={(e) => updateSectionField(idx, "instructionsBn", e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pro Tip (English)</label>
                  <input
                    type="text"
                    value={sec.tipEn || ""}
                    onChange={(e) => updateSectionField(idx, "tipEn", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Pro Tip (Bengali)</label>
                  <input
                    type="text"
                    value={sec.tipBn || ""}
                    onChange={(e) => updateSectionField(idx, "tipBn", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Example Text (English)</label>
                  <input
                    type="text"
                    value={sec.exampleEn || ""}
                    onChange={(e) => updateSectionField(idx, "exampleEn", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Example Text (Bengali)</label>
                  <input
                    type="text"
                    value={sec.exampleBn || ""}
                    onChange={(e) => updateSectionField(idx, "exampleBn", e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: AI Assistant Config */}
      {activeTab === "ai" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                AI Assistant Settings & Prompts
              </h2>
              <p className="text-xs text-slate-500">Configure Gemini model settings and prompt templates.</p>
            </div>
            <button
              onClick={() =>
                setCmsConfig({
                  ...cmsConfig,
                  aiConfig: { ...cmsConfig.aiConfig, isEnabled: !cmsConfig.aiConfig?.isEnabled },
                })
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                cmsConfig.aiConfig?.isEnabled
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-300 text-slate-700"
              }`}
            >
              <Bot size={16} />
              <span>{cmsConfig.aiConfig?.isEnabled ? "AI Assistant Active" : "AI Assistant Disabled"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">AI Model Name</label>
              <input
                type="text"
                value={cmsConfig.aiConfig?.modelName || "gemini-2.0-flash"}
                onChange={(e) =>
                  setCmsConfig({
                    ...cmsConfig,
                    aiConfig: { ...cmsConfig.aiConfig, modelName: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Global System Prompt</label>
              <input
                type="text"
                value={cmsConfig.aiConfig?.systemPrompt || ""}
                onChange={(e) =>
                  setCmsConfig({
                    ...cmsConfig,
                    aiConfig: { ...cmsConfig.aiConfig, systemPrompt: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Prompt Templates
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Summary Enhancement Prompt</label>
              <textarea
                rows={2}
                value={cmsConfig.aiConfig?.promptTemplates?.enhanceSummary || ""}
                onChange={(e) => updateAiPrompt("enhanceSummary", e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Career Objective Prompt</label>
              <textarea
                rows={2}
                value={cmsConfig.aiConfig?.promptTemplates?.generateObjective || ""}
                onChange={(e) => updateAiPrompt("generateObjective", e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Work Experience Bullets Prompt</label>
              <textarea
                rows={2}
                value={cmsConfig.aiConfig?.promptTemplates?.generateWorkExperienceBullets || ""}
                onChange={(e) => updateAiPrompt("generateWorkExperienceBullets", e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Skills Suggestions Prompt</label>
              <textarea
                rows={2}
                value={cmsConfig.aiConfig?.promptTemplates?.improveSkills || ""}
                onChange={(e) => updateAiPrompt("improveSkills", e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Templates */}
      {activeTab === "templates" && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Manage CV Templates
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(cmsConfig.templates || []).map((tpl, idx) => (
              <div
                key={tpl.id}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{tpl.name}</h3>
                  <p className="text-[11px] text-slate-500">ID: {tpl.id} | Category: {tpl.category}</p>
                </div>

                <button
                  onClick={() => toggleTemplate(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tpl.isEnabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {tpl.isEnabled ? "Active" : "Disabled"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
