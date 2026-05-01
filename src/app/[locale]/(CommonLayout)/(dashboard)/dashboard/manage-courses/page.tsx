"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  PlusCircle,
  BarChart3,
  Users,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetCoursesQuery,
  useDeleteCourseMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import { ICourse } from "@/types/course";
import AppImage from "@/components/ui/AppImage";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ActionButton } from "@/components/ui/ActionButton";

export default function ManageProgramsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const [page, setPage] = useState(1);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseTitle: string;
  }>({ isOpen: false, courseId: "", courseTitle: "" });

  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading, error } = useGetCoursesQuery({
    page,
    limit: 10,
    searchTerm: searchTerm || undefined,
    type: filterType || undefined,
    level: filterLevel || undefined,
  });

  const [deleteProgram] = useDeleteCourseMutation();

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteProgram(deleteModal.courseId).unwrap();
      toast.success(" deleted successfully");
      setDeleteModal({ isOpen: false, courseId: "", courseTitle: "" });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete program");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-xl border border-gray-200 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500" size={20} />
              <p className="text-amber-700 font-medium">
                Error loading programs. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const programs = data?.data || [];
  const meta = data?.meta;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (isActive: boolean | undefined) => {
    return isActive !== false ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Inactive
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create, edit, and manage your courses
            </p>
          </div>
          <Link href="/dashboard/manage-courses/create">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gray-900 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-sm"
            >
              <PlusCircle size={18} />
              Create New
            </motion.button>
          </Link>
        </div>

        {/* Step-by-Step Guide */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              How to Create a Course
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  1
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Basic Info
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">
                Title, description, pricing
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  2
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Content
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">
                Curriculum, modules, videos
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  3
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Instructors
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">
                Add expert instructors
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  4
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Publish
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">Review and go live</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <Link
              href="/dashboard/manage-courses/create"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
            >
              Start creating a new course →
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {programs.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Courses
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {programs.filter((p: ICourse) => p.isActive !== false).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <BarChart3 className="text-emerald-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 bg-white"
            >
              <option value="">All Types</option>
              <option value="training">Training</option>
              <option value="seminar">Seminar</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="course">Course</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => {
                setFilterLevel(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 bg-white"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {searchTerm || filterType || filterLevel
                ? "Try adjusting your search filters"
                : "Create your first course to get started"}
            </p>
            <Link href="/dashboard/manage-courses/create">
              <button className="inline-flex items-center gap-2 bg-gray-900 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm">
                <PlusCircle size={16} />
                Create Course
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Level
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {programs.map((program: ICourse) => (
                    <motion.tr
                      key={program._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <AppImage
                              photoUrl={program.bannerImage || "CADDCORE"}
                              alt={program.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {program.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                          {program.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {program.level || "N/A"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {getStatusBadge(program.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {formatDate(program.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/manage-courses/${program._id}/details`}
                          >
                            <ActionButton
                              icon={Eye}
                              label="View Course Details"
                              variant="view"
                              showLabel={false}
                            />
                          </Link>
                          <Link
                            href={`/dashboard/manage-courses/${program._id}/edit`}
                          >
                            <ActionButton
                              icon={Edit}
                              label="Edit Course"
                              variant="edit"
                              showLabel={false}
                            />
                          </Link>
                          <Link
                            href={`/dashboard/manage-courses/${program._id}/modules`}
                          >
                            <ActionButton
                              icon={Layers}
                              label="Manage Modules"
                              variant="view"
                              showLabel={false}
                            />
                          </Link>

                          <ActionButton
                            icon={Trash2}
                            label="Delete Course"
                            variant="delete"
                            showLabel={false}
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                courseId: program._id!,
                                courseTitle: program.title,
                              })
                            }
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <div className="text-sm text-gray-500">
                Showing page {page} of {meta.totalPages} ({meta.total} total
                courses)
              </div>
            </div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 bg-white transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-gray-900 text-white shadow-sm"
                          : "border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 bg-white"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(meta.totalPages, page + 1))}
                disabled={page === meta.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, courseId: "", courseTitle: "" })
        }
        onConfirm={handleDelete}
        title="Delete Course?"
        description={`Are you sure you want to delete "${deleteModal.courseTitle}"? This will permanently remove the course and all associated data. This action cannot be undone.`}
        confirmText="Delete Course"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
