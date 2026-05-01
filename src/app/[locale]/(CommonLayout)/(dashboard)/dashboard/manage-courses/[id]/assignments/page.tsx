"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  FileText,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useGetAssignmentsByCourseQuery } from "@/app/redux/api/AssignmentApi/AssignmentApi";
import { useGetCourseByIdQuery } from "@/app/redux/api/CourseApi/CourseApi";

export default function CourseAssignmentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: courseData, isLoading: loadingCourse } = useGetCourseByIdQuery(
    courseId,
    { skip: !courseId }
  );

  const {
    data: assignments,
    isLoading: loadingAssignments,
    error: assignmentsError,
  } = useGetAssignmentsByCourseQuery({ courseId, includeUnpublished: true });

  const course = courseData as any;
  const isLoading = loadingCourse || loadingAssignments;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (assignmentsError || !assignments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-xl border border-red-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Failed to load assignments
          </h3>
          <Link
            href={`/dashboard/manage-courses/${courseId}/details`}
            className="text-blue-600 hover:underline"
          >
            Back to Course Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href={`/dashboard/manage-courses/${courseId}/details`}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Course Details
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardList className="text-blue-600" />
              {course?.title || "Course"} Assignments
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and grade all assignments for this course
            </p>
          </div>
          <Link
            href={`/dashboard/manage-courses/${courseId}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Add New Assignment
          </Link>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Assignments Yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Get started by adding an assignment to your course modules.
              </p>
              <Link
                href={`/dashboard/manage-courses/${courseId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Go to Course Editor
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Assignment Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignments.map((assignment: any) => (
                    <motion.tr
                      key={assignment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {assignment.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {assignment.description || "No description"}
                            </p>
                            {assignment.dueDate && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                Due:{" "}
                                {new Date(
                                  assignment.dueDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            assignment.isPublished
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {assignment.isPublished ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {assignment.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium">
                          {assignment.totalPoints} Points
                        </div>
                        <div className="text-xs text-gray-500">
                          Pass: {assignment.passingPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/manage-courses/${courseId}/assignments/${assignment._id}/submissions`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Eye size={16} />
                            View Submissions
                          </Link>
                          {/* <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <MoreVertical size={18} />
                          </button> */}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
