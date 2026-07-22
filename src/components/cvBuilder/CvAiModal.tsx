"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, X, RefreshCw, Edit3 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  originalText?: string;
  suggestedText: string;
  onAccept: (appliedText: string) => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  title?: string;
}

export const CvAiModal: React.FC<Props> = ({
  isOpen,
  onClose,
  originalText = "",
  suggestedText,
  onAccept,
  onRegenerate,
  isLoading = false,
  title = "AI Suggestions & Rewrite",
}) => {
  const [editedText, setEditedText] = useState("");

  useEffect(() => {
    setEditedText(suggestedText);
  }, [suggestedText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="text-xs text-slate-500">Review AI suggestions, edit if needed, and accept.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Comparison */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {originalText && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Original Text</label>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line">
                {originalText}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Edit3 size={14} />
                <span>AI Suggested Content (Editable)</span>
              </label>
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="p-8 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <p className="text-xs font-semibold text-blue-600">Generating AI response...</p>
              </div>
            ) : (
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={6}
                className="w-full p-4 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-500/40 focus:border-blue-600 focus:outline-none shadow-sm leading-relaxed"
                placeholder="AI suggestion will appear here..."
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-xl transition-all"
          >
            Reject / Cancel
          </button>
          <button
            onClick={() => {
              onAccept(editedText);
              onClose();
            }}
            disabled={isLoading || !editedText.trim()}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-102"
          >
            <Check size={16} />
            <span>Accept & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
