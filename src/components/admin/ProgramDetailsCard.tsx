"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Book,
  Users,
  FileText,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  ChevronRight,
  Lock,
  Eye,
} from "lucide-react";
import { ICourse } from "@/types/course";

interface ProgramDetailsCardProps {
  program: ICourse;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ProgramDetailsCard({
  program,
  onDelete,
  onEdit,
}: ProgramDetailsCardProps) {
  const materialCount = program.materials?.length || 0;
  const expertCount = program.experts?.length || 0;
  const quizCount = program.quizIds?.length || 0;
  const enrolledCount = program.enrolledCount || 0;
  const capacity = program.capacity || 0;
  const enrollmentPercentage =
    capacity > 0 ? Math.round((enrolledCount / capacity) * 100) : 0;

  const getAccessTypeColor = (type?: string) => {
    switch (type) {
      case "all-access":
        return "bg-red-50 text-red-700 border border-red-200";
      case "materials-only":
        return "bg-red-100 text-red-800 border border-red-300";
      case "quiz-only":
        return "bg-red-200 text-red-900 border border-red-400";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getAccessScopeColor = (scope?: string) => {
    switch (scope) {
      case "all-users":
        return "bg-red-50 text-red-700 border border-red-200";
      case "members-only":
        return "bg-red-100 text-red-800 border border-red-300";
      case "individual-users":
        return "bg-red-200 text-red-900 border border-red-400";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-4 sm:p-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {program.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {program.description}
            </p>
          </div>
          <div className="flex-shrink-0 px-3 py-1 bg-red-800 text-white rounded-full text-xs font-semibold">
            {program.type}
          </div>
        </div>
      </div>

      {/* Access Control Info */}
      <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-red-50/30">
        <div className="flex flex-wrap gap-2">
          {program.accessControl?.accessType && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getAccessTypeColor(
                program.accessControl.accessType
              )}`}
            >
              <Lock size={12} />
              {program.accessControl.accessType}
            </span>
          )}
          {program.accessControl?.accessScope && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getAccessScopeColor(
                program.accessControl.accessScope
              )}`}
            >
              <Users size={12} />
              {program.accessControl.accessScope}
            </span>
          )}
          {program.accessType && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 border border-red-300 rounded-md text-xs font-medium">
              <Eye size={12} />
              {program.accessType}
            </span>
          )}
        </div>
      </div>

      {/* Content Stats */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 mb-2">
              <FileText size={16} className="text-red-800" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{materialCount}</p>
            <p className="text-xs text-gray-600">Materials</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mb-2">
              <Users size={16} className="text-red-700" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{expertCount}</p>
            <p className="text-xs text-gray-600">Experts</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-200 mb-2">
              <Book size={16} className="text-red-800" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{quizCount}</p>
            <p className="text-xs text-gray-600">Quizzes</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-300 mb-2">
              <BarChart3 size={16} className="text-red-900" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{enrolledCount}</p>
            <p className="text-xs text-gray-600">Enrolled</p>
          </div>
        </div>

        {/* Enrollment Progress */}
        {capacity > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                Capacity
              </span>
              <span className="text-xs font-bold text-gray-900">
                {enrolledCount}/{capacity} ({enrollmentPercentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-400 to-red-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${enrollmentPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">Level:</span> {program.level || "N/A"}
          </div>
          <div>
            <span className="font-medium">Type:</span> {program.accessType || "N/A"}
          </div>
          <div>
            <span className="font-medium">Created:</span>{" "}
            {program.createdAt
              ? new Date(program.createdAt).toLocaleDateString()
              : "N/A"}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className={program.isActive ? "text-green-600" : "text-red-800"}>
              {program.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/manage-courses/${program._id}/details`}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors text-sm font-medium"
        >
          <Eye size={16} />
          <span className="hidden sm:inline">Details</span>
        </Link>

        <Link
          href={`/dashboard/manage-courses/${program._id}/edit`}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-800 border border-red-300 rounded-lg hover:bg-red-200 hover:border-red-400 transition-colors text-sm font-medium"
        >
          <Edit size={16} />
          <span className="hidden sm:inline">Edit</span>
        </Link>

        <Link
          href={`/dashboard/manage-courses/${program._id}/settings`}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-red-200 text-red-900 border border-red-400 rounded-lg hover:bg-red-300 hover:border-red-800 transition-colors text-sm font-medium"
        >
          <Settings size={16} />
          <span className="hidden sm:inline">Settings</span>
        </Link>

        <button
          onClick={() => onDelete?.(program._id || "")}
          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-red-950 transition-colors text-sm font-medium"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </motion.div>
  );
}
