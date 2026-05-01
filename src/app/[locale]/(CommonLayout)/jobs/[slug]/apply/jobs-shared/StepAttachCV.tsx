"use client";

import React, { useRef, useState } from "react";
import { FormData } from "./types";

export function StepAttachCV({
  data,
  setData,
}: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  interface FormData {
    cvFile?: File | null;
    // ... other fields
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setData((p) => ({ ...p, cvFile: dropped }));
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white text-center">
        Add CV
      </h2>

      {!(data as any).cvFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors
            ${
              dragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-blue-400"
            }`}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="1.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Upload a PDF, Microsoft Word, Pages, RTF, or TXT file, or drag it
            here.
          </p>
          <button
            type="button"
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors"
          >
            Select file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.pages,.rtf,.txt"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] &&
              setData((p) => ({ ...p, cvFile: e.target.files![0] }))
            }
          />
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {!(data as any).cvFile ?.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Uploaded{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setData((p) => ({ ...p, cvFile: null }))}
            className="text-[11px] font-bold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            Remove File
          </button>
        </div>
      )}
    </div>
  );
}
