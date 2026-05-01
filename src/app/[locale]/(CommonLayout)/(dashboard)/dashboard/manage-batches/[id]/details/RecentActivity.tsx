"use client";

import React from "react";
import { User, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useGetBatchEnrollmentsQuery } from "@/app/redux/api/batchApi/batchEnrollmentApi";
import { useGetSubmissionsQuery } from "@/app/redux/api/AssignmentApi/AssignmentApi";

interface ActivityItem {
  id: string;
  type: "enrollment" | "submission";
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    image?: string;
  };
  link: string;
  status?: string;
}

// Simple time ago helper to avoid dependency issues
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

export default function RecentActivity({ batchId }: { batchId: string }) {
  // Fetch Enrollments
  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetBatchEnrollmentsQuery({
      batchId,
      limit: 5,
      page: 1,
    });

  // Fetch Submissions
  const { data: submissionsData, isLoading: submissionsLoading } =
    useGetSubmissionsQuery({
      batchId,
      limit: 5,
      page: 1,
    });

  const isLoading = enrollmentsLoading || submissionsLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={20} />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Process and merge data
  const activities: ActivityItem[] = [];

  // specific types for data items to avoid 'any'
  interface EnrollmentItem {
    _id: string;
    studentInfo: { name: string };
    userId: string | { profilePhoto?: string };
    createdAt: string;
  }

  interface SubmissionItem {
    _id: string;
    student: { name: string; profilePhoto?: string };
    assignment: { title: string };
    submittedAt: string;
    status: string;
  }

  // Process Enrollments
  if (enrollmentsData?.data) {
    enrollmentsData.data.forEach((enrollment: any) => {
      activities.push({
        id: enrollment._id,
        type: "enrollment",
        title: "New Student Enrolled",
        description: `${enrollment.studentInfo.name} joined the batch`,
        timestamp: enrollment.createdAt,
        user: {
          name: enrollment.studentInfo.name,
          image:
            typeof enrollment.userId === "object"
              ? enrollment.userId.profilePhoto
              : undefined,
        },
        link: `/dashboard/manage-batches/${batchId}/students`,
      });
    });
  }

  // Process Submissions
  if (submissionsData?.data) {
    submissionsData.data.forEach((submission: any) => {
      const studentName =
        submission.studentId?.name ||
        (typeof submission.studentId === "object"
          ? "Unknown Student"
          : "Unknown Student");

      const studentImage =
        submission.studentId?.profilePhoto ||
        (typeof submission.studentId === "object" ? undefined : undefined);

      const assignmentTitle =
        submission.assignmentId?.title ||
        (typeof submission.assignmentId === "object"
          ? "Unknown Assignment"
          : "Unknown Assignment");

      activities.push({
        id: submission._id,
        type: "submission",
        title: "Assignment Submitted",
        description: `${studentName} submitted "${assignmentTitle}"`,
        timestamp: submission.submittedAt,
        user: {
          name: studentName,
          image: studentImage,
        },
        link: `/dashboard/assignments`,
        status: submission.status,
      });
    });
  }

  // Sort by newest first
  const sortedActivities = activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5); // Take top 5

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} />
        Recent Activity
      </h2>

      {sortedActivities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedActivities.map((activity) => (
            <div key={activity.id} className="relative flex gap-4 group">
              {/* Timeline Line */}
              <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-100 last:hidden" />

              {/* Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${
                  activity.type === "enrollment"
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {activity.type === "enrollment" ? (
                  <User size={14} />
                ) : (
                  <FileText size={14} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>

                {activity.status && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${
                      activity.status === "graded"
                        ? "bg-green-100 text-green-700"
                        : activity.status === "submitted"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {activity.status.charAt(0).toUpperCase() +
                      activity.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div className="pt-2 text-center">
            <span className="text-xs text-gray-400">
              Showing last 5 activities
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
