"use client";
import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  Users,
  Search,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  Mail,
  FileDown,
  UserPlus,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useBulkAssignUsersMutation,
  useGetCourseByIdQuery,
} from "@/app/redux/api/CourseApi/CourseApi";
import { useGetCourseEnrollmentsQuery } from "@/app/redux/api/enrollmentApi/enrollmentApi";
import {
  useApproveEnrollmentMutation,
  useRejectEnrollmentMutation,
} from "@/app/redux/api/enrollmentApi/enrollmentApi";
import { useGetAllUsersQuery } from "@/app/redux/api/users/userApi";
import BulkAssignModal from "@/components/enrollments/BulkAssignModal";

interface Enrollment {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  enrolledAt: string;
  status:
    | "completed"
    | "in-progress"
    | "not-started"
    | "pending_approval"
    | "active"
    | "cancelled";
  progress: number;
  certificateId?: string;
  completedAt?: string;
  score?: number;
  quizAttempts?: number;
  quizPassed?: boolean;
  materialsViewed?: number;
  totalMaterials?: number;
  courseDuration?: number;
  timeSpent?: number;
  lastActivity?: string;
  certificateIssueDate?: string;
}

export default function EnrollmentsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const {
    data: enrollmentsData,
    isLoading: isEnrollmentsLoading,
    error: enrollmentsError,
  } = useGetCourseEnrollmentsQuery(
    { courseId: courseId, page: 1, limit: 100 },
    { skip: !courseId }
  );

  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsersQuery(
    {}
  );
  const [bulkAssignUsers, { isLoading: isAssigning }] =
    useBulkAssignUsersMutation();
  const [approveEnrollment] = useApproveEnrollmentMutation();
  const [rejectEnrollment] = useRejectEnrollmentMutation();

  const course = courseData as any;

  // Transform and sanitize enrollment data to ensure no objects are rendered
  const transformEnrollmentData = (rawEnrollments: any[]): Enrollment[] => {
    if (!Array.isArray(rawEnrollments)) return [];

    return rawEnrollments.map((enrollment: any) => {
      // Extract user data - backend populates userId as object { _id, name, email }
      const userObj =
        typeof enrollment?.userId === "object" ? enrollment.userId : {};
      const userName = userObj?.name || "N/A";
      const userEmail = userObj?.email || "N/A";
      const userId = userObj?._id || String(enrollment?._id || "");

      // Extract progress object or individual fields
      const progress = enrollment?.progress || {};
      const materialsViewed = progress?.materialsViewed || 0;
      const totalMaterials = progress?.totalMaterials || 0;
      const quizzesCompleted = progress?.quizzesCompleted || 0;

      return {
        _id: String(enrollment?._id || ""),
        userId: String(userId),
        userName: String(userName),
        userEmail: String(userEmail),
        userPhone: String(userObj?.phone || ""),
        enrolledAt: String(enrollment?.enrollmentDate || ""),
        status: enrollment?.status || "not-started",
        progress:
          totalMaterials > 0
            ? Math.round((materialsViewed / totalMaterials) * 100)
            : 0,
        certificateId: String(enrollment?.certificateId || ""),
        completedAt: String(enrollment?.completedAt || ""),
        score: Number(progress?.score) || 0,
        quizAttempts: enrollment?.completedQuizzes?.length || 0,
        quizPassed: quizzesCompleted > 0,
        materialsViewed: Number(materialsViewed),
        totalMaterials: Number(totalMaterials),
        courseDuration: Number(progress?.courseDuration) || 0,
        timeSpent: Number(progress?.timeSpent) || 0,
        lastActivity: String(progress?.lastActivityDate || ""),
        certificateIssueDate: String(enrollment?.certificateIssueDate || ""),
      };
    });
  };

  const enrollments: Enrollment[] = transformEnrollmentData(
    enrollmentsData?.data || []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "completed"
    | "in-progress"
    | "not-started"
    | "pending_approval"
    | "active"
    | "cancelled"
  >("all");

  // Bulk assign state
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Debug: Log transformed data
  React.useEffect(() => {
    if (enrollments.length > 0) {
      console.log("Transformed enrollments:", enrollments);
      console.log("Raw enrollment data:", enrollmentsData?.data);
    }
    if (enrollmentsError) {
      console.error("Enrollments error:", enrollmentsError);
    }
  }, [enrollments, enrollmentsData?.data, enrollmentsError]);

  const isLoading = isCourseLoading || isEnrollmentsLoading;
  const error = courseError || enrollmentsError;

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      // Safe checks for undefined properties
      const userName = enrollment?.userName || "";
      const userEmail = enrollment?.userEmail || "";

      const matchesSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || enrollment?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "not-started":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={16} />;
      case "active":
        return <CheckCircle size={16} />;
      case "pending_approval":
        return <Clock size={16} />;
      case "in-progress":
        return <Clock size={16} />;
      case "not-started":
        return <AlertTriangle size={16} />;
      case "cancelled":
        return <X size={16} />;
      default:
        return null;
    }
  };
  const handleSendEmail = (email: string) => {
    toast.success(`Email reminder sent to ${email}`);
  };
  const handleDownloadCertificate = (enrollmentId: string, name: string) => {
    toast.success(`Certificate for ${name} downloaded`);
  };
  const handleExportEnrollments = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Status",
        "Progress",
        "Score",
        "Quiz Attempts",
        "Quiz Passed",
        "Materials Viewed",
        "Enrolled Date",
      ],
      ...enrollments.map((e) => [
        String(e.userName || "N/A"),
        String(e.userEmail || "N/A"),
        String(e.userPhone || "N/A"),
        String(e.status || "not-started"),
        `${Number(e.progress) || 0}%`,
        String(e.score || "N/A"),
        String(Number(e.quizAttempts) || 0),
        String(e.quizPassed ? "Yes" : "No"),
        `${Number(e.materialsViewed) || 0}/${Number(e.totalMaterials) || 0}`,
        String(
          e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "N/A"
        ),
      ]),
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enrollments-${courseId}.csv`;
    a.click();
    toast.success("Enrollments exported as CSV");
  };

  const handleBulkAssign = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    console.log("🔄 [handleBulkAssign] Starting bulk assign with:", {
      courseId,
      selectedUsersCount: selectedUsers.length,
      selectedUsers,
    });

    try {
      console.log("📡 [handleBulkAssign] Making API call...");
      const result = await bulkAssignUsers({
        courseId,
        userIds: selectedUsers,
      }).unwrap();

      console.log("✅ [handleBulkAssign] API call successful:", result);

      toast.success(
        `Successfully assigned ${result.success} users. ${result.failed} failed.`
      );
      setSelectedUsers([]);
      setIsBulkAssignModalOpen(false);
    } catch (error: any) {
      console.error("❌ [handleBulkAssign] API call failed:", error);
      console.error("❌ [handleBulkAssign] Error details:", {
        message: error?.message,
        data: error?.data,
        status: error?.status,
        fullError: error,
      });

      toast.error(error?.data?.message || "Failed to assign users");
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    try {
      await approveEnrollment(enrollmentId).unwrap();
      toast.success("Enrollment approved successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve enrollment");
    }
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading enrollments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-800" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm">
                  Failed to load enrollments. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/dashboard/manage-courses/${courseId}/details`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back to Details
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Enrollments
                </h1>
                <p className="text-gray-600">{course.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsBulkAssignModalOpen(true)}
                className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <UserPlus size={18} />
                Bulk Assign
              </button>
              <button
                onClick={handleExportEnrollments}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-medium"
              >
                <Download size={18} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Total Enrolled",
                value: enrollments.length,
                icon: Users,
                color: "text-blue-600",
              },
              {
                label: "Pending Approval",
                value: enrollments.filter(
                  (e) => e.status === "pending_approval"
                ).length,
                icon: Clock,
                color: "text-orange-600",
              },
              {
                label: "Active",
                value: enrollments.filter((e) => e.status === "active").length,
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                label: "Completed",
                value: enrollments.filter((e) => e.status === "completed")
                  .length,
                icon: CheckCircle,
                color: "text-emerald-600",
              },
              {
                label: "In Progress",
                value: enrollments.filter((e) => e.status === "in-progress")
                  .length,
                icon: Clock,
                color: "text-yellow-600",
              },
              {
                label: "Cancelled",
                value: enrollments.filter((e) => e.status === "cancelled")
                  .length,
                icon: X,
                color: "text-red-800",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <Icon size={20} className={stat.color} />
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "completed"
                      | "in-progress"
                      | "not-started"
                      | "pending_approval"
                      | "active"
                      | "cancelled"
                  )
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Enrollments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          {filteredEnrollments.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={32} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">No enrollments found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No users have enrolled in this program yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      User Details
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Progress
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Enrolled Date
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredEnrollments.map((enrollment, index) => (
                      <motion.tr
                        key={enrollment?._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <div>
                            <p className="font-semibold">
                              {enrollment?.userName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enrollment?.userId || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div>
                            <p>{enrollment?.userEmail || "N/A"}</p>
                            {enrollment?.userPhone && (
                              <p className="text-xs text-gray-500">
                                {enrollment.userPhone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              enrollment?.status || "not-started"
                            )}`}
                          >
                            {getStatusIcon(enrollment?.status || "not-started")}
                            {(enrollment?.status || "not-started")
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${enrollment?.progress || 0}%`,
                                }}
                                transition={{ duration: 0.5 }}
                                className={`h-2 rounded-full ${
                                  (enrollment?.progress || 0) === 100
                                    ? "bg-green-500"
                                    : (enrollment?.progress || 0) > 50
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {enrollment?.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {enrollment?.status === "completed"
                            ? `${enrollment?.score || 0}%`
                            : enrollment?.status === "in-progress"
                            ? "In Progress"
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {enrollment?.enrolledAt
                            ? new Date(
                                enrollment.enrolledAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {enrollment?.status === "pending_approval" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveEnrollment(enrollment._id)
                                  }
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                  title="Approve Enrollment"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    rejectEnrollment(enrollment._id)
                                  }
                                  className="p-2 text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Reject Enrollment"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() =>
                                handleSendEmail(enrollment?.userEmail || "")
                              }
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Send Reminder Email"
                            >
                              <Mail size={16} />
                            </button>
                            {enrollment?.certificateId && (
                              <button
                                onClick={() =>
                                  handleDownloadCertificate(
                                    enrollment._id,
                                    enrollment?.userName || "User"
                                  )
                                }
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Download Certificate"
                              >
                                <FileDown size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Results Summary */}
        {filteredEnrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm text-gray-600 text-center"
          >
            Showing {filteredEnrollments.length} of {enrollments.length}{" "}
            enrollments
          </motion.div>
        )}

        {/* Bulk Assign Modal */}
        <BulkAssignModal
          isOpen={isBulkAssignModalOpen}
          onClose={() => setIsBulkAssignModalOpen(false)}
          courseTitle={course.title}
          users={usersData?.data || []}
          isLoading={isUsersLoading}
          selectedUsers={selectedUsers}
          onUserToggle={handleUserSelect}
          onAssign={handleBulkAssign}
          isAssigning={isAssigning}
          enrolledUserIds={enrollments.map((e) => e.userId)}
        />
      </div>
    </div>
  );
}
