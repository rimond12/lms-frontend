/**
 * ModuleScheduler Component
 * Inline scheduler for configuring module unlock settings
 */

"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Users, Zap, Save, X } from "lucide-react";
import {
  IBatchModule,
  IScheduleUpdateRequest,
  UnlockType,
} from "@/app/redux/api/batchModuleApi/batchModuleApi";

interface ModuleSchedulerProps {
  module: IBatchModule;
  batchStartDate?: string;
  onSave: (schedule: IScheduleUpdateRequest) => void;
  onCancel: () => void;
}

const UNLOCK_TYPES: {
  value: UnlockType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "immediate",
    label: "Immediately",
    icon: <Zap className="w-4 h-4" />,
    description: "Available as soon as student enrolls",
  },
  {
    value: "fixed-date",
    label: "Fixed Date",
    icon: <Calendar className="w-4 h-4" />,
    description: "Unlock on a specific date",
  },
  {
    value: "days-after-enrollment",
    label: "Days After Enrollment",
    icon: <Users className="w-4 h-4" />,
    description: "Relative to each student's enrollment date",
  },
  {
    value: "days-after-batch-start",
    label: "Days After Batch Start",
    icon: <Clock className="w-4 h-4" />,
    description: "Relative to batch start date",
  },
];

export default function ModuleScheduler({
  module,
  batchStartDate,
  onSave,
  onCancel,
}: ModuleSchedulerProps) {
  const [unlockType, setUnlockType] = useState<UnlockType>(
    module.unlockType || "immediate",
  );
  const [unlockDate, setUnlockDate] = useState<string>(
    module.unlockDate
      ? new Date(module.unlockDate).toISOString().split("T")[0]
      : "",
  );
  const [daysAfterEnrollment, setDaysAfterEnrollment] = useState<number>(
    module.unlockDaysAfterEnrollment || 0,
  );
  const [daysAfterBatchStart, setDaysAfterBatchStart] = useState<number>(
    module.unlockDaysAfterBatchStart || 0,
  );

  // Calculate computed unlock date for preview
  const getComputedUnlockDate = (): string | null => {
    if (unlockType === "immediate") return null;
    if (unlockType === "fixed-date" && unlockDate) {
      return new Date(unlockDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    if (unlockType === "days-after-batch-start" && batchStartDate) {
      const startDate = new Date(batchStartDate);
      startDate.setDate(startDate.getDate() + daysAfterBatchStart);
      return startDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return null;
  };

  const handleSave = () => {
    const schedule: IScheduleUpdateRequest = {
      unlockType,
      unlockDate: unlockType === "fixed-date" ? unlockDate : undefined,
      unlockDaysAfterEnrollment:
        unlockType === "days-after-enrollment"
          ? daysAfterEnrollment
          : undefined,
      unlockDaysAfterBatchStart:
        unlockType === "days-after-batch-start"
          ? daysAfterBatchStart
          : undefined,
    };
    onSave(schedule);
  };

  const computedDate = getComputedUnlockDate();

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-indigo-900">
        Configure Unlock Schedule
      </h4>

      {/* Unlock Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        {UNLOCK_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setUnlockType(type.value)}
            className={`
              flex items-start gap-3 p-3 rounded-lg border text-left transition-all
              ${
                unlockType === type.value
                  ? "border-indigo-500 bg-white ring-2 ring-indigo-200"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }
            `}
          >
            <div
              className={`
              p-1.5 rounded-lg ${unlockType === type.value ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"}
            `}
            >
              {type.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium ${unlockType === type.value ? "text-indigo-900" : "text-gray-700"}`}
              >
                {type.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {type.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Type-specific inputs */}
      <div className="pt-2">
        {unlockType === "fixed-date" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unlock Date
            </label>
            <input
              type="date"
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        )}

        {unlockType === "days-after-enrollment" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days After Enrollment
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={daysAfterEnrollment}
                onChange={(e) =>
                  setDaysAfterEnrollment(parseInt(e.target.value) || 0)
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">
                days after student enrolls
              </span>
            </div>
          </div>
        )}

        {unlockType === "days-after-batch-start" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days After Batch Start
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={daysAfterBatchStart}
                onChange={(e) =>
                  setDaysAfterBatchStart(parseInt(e.target.value) || 0)
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">
                days after batch starts
              </span>
            </div>
            {batchStartDate && (
              <p className="text-xs text-gray-500 mt-2">
                Batch starts: {new Date(batchStartDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Computed date preview */}
        {computedDate && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-indigo-600 font-medium">
              Unlock Date Preview
            </p>
            <p className="text-sm text-indigo-900 mt-1">{computedDate}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Schedule
        </button>
      </div>
    </div>
  );
}
