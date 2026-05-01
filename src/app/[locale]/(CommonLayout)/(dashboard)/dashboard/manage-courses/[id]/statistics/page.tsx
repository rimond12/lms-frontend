"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  BarChart3,
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";
import { useGetCourseByIdQuery, useGetCourseStatsQuery } from "@/app/redux/api/CourseApi/CourseApi";

export default function ProgramStatisticsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data, isLoading, error } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetCourseStatsQuery(courseId, {
    skip: !courseId,
  });

  const course = data as any;
  const stats = statsData as any;

  const statCards = [
    {
      label: "Total Enrolled",
      value: stats?.totalEnrolled || 0,
      icon: Users,
    },
    {
      label: "Completed",
      value: stats?.completed || 0,
      icon: Award,
    },
    {
      label: "In Progress",
      value: stats?.inProgress || 0,
      icon: BookOpen,
    },
    {
      label: "Certificates",
      value: stats?.certificatesIssued || 0,
      icon: Award,
    },
    {
      label: "Average Score",
      value: `${stats?.averageScore || 0}%`,
      icon: TrendingUp,
    },
    {
      label: "Completion Rate",
      value: `${stats?.completionRate || 0}%`,
      icon: BarChart3,
    },
  ];

  if (isLoading || statsLoading) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-red-800 mx-auto mb-4" />
              <p className="text-black">Loading statistics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || statsError || !course || !stats) {
    return (
      <div className="p-4 bg-white min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-800 border border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-white" size={24} />
              <div>
                <h3 className="font-semibold text-white">Error</h3>
                <p className="text-white text-sm">
                  Failed to load program statistics. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/dashboard/manage-courses/${courseId}/details`}
          className="inline-flex items-center gap-2 text-red-800 hover:text-black font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Program Details
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-black p-4 mb-4"
        >
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-red-800" />
            <div>
              <h1 className="text-xl font-bold text-black">
                Program Statistics
              </h1>
              <p className="text-black">{course.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg border border-black p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-black">
                    {card.label}
                  </p>
                  <div className="bg-red-800 p-2 rounded-lg">
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-black">
                  {card.value}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Enrollment Status Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-black p-4"
          >
            <h2 className="text-lg font-bold text-black mb-4">
              Enrollment Status
            </h2>

            <div className="space-y-4">
              {[
                {
                  label: "Not Started",
                  value: stats.notStarted || 0,
                  percentage: stats.totalEnrolled > 0 ? Math.round(((stats.notStarted || 0) / stats.totalEnrolled) * 100) : 0,
                  color: "bg-black",
                },
                {
                  label: "In Progress",
                  value: stats.inProgress || 0,
                  percentage: stats.totalEnrolled > 0 ? Math.round(((stats.inProgress || 0) / stats.totalEnrolled) * 100) : 0,
                  color: "bg-red-800",
                },
                {
                  label: "Completed",
                  value: stats.completed || 0,
                  percentage: stats.totalEnrolled > 0 ? Math.round(((stats.completed || 0) / stats.totalEnrolled) * 100) : 0,
                  color: "bg-black",
                },
              ].map((status, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black">
                      {status.label}
                    </span>
                    <span className="text-sm font-bold text-black">
                      {status.value} ({status.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${status.percentage}%` }}
                      transition={{ duration: 0.8, delay: i * 0.2 }}
                      className={`h-2 rounded-full ${status.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-black">
              <p className="text-xs text-black">
                Data updated in real-time based on user progress
              </p>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-black p-4"
          >
            <h2 className="text-lg font-bold text-black mb-4">
              Performance Metrics
            </h2>

            <div className="space-y-6">
              {[
                {
                  label: "Average Score",
                  value: stats.averageScore || 0,
                  max: 100,
                  color: "bg-red-800",
                },
                {
                  label: "Completion Rate",
                  value: stats.completionRate || 0,
                  max: 100,
                  color: "bg-black",
                },
                {
                  label: "Dropout Rate",
                  value: stats.dropoutRate || 0,
                  max: 100,
                  color: "bg-red-800",
                },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-black">
                      {metric.label}
                    </span>
                    <span className="text-lg font-bold text-black">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-black rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(metric.value / metric.max) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.2 }}
                      className={`h-3 rounded-full ${metric.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-black">
              <p className="text-xs text-black">
                Metrics calculated from enrolled users
              </p>
            </div>
          </motion.div>
        </div>

        {/* More Information Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-black p-4"
        >
          <h2 className="text-lg font-bold text-black mb-4">
            More Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-black mb-1">Program Type</p>
              <p className="text-base font-semibold text-black">
                {course.type || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Level</p>
              <p className="text-base font-semibold text-black">
                {course.level || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Total Capacity</p>
              <p className="text-base font-semibold text-black">
                {stats.capacity || "Unlimited"}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Available Seats</p>
              <p className="text-base font-semibold text-black">
                {stats.availableSeats || "Unlimited"}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Materials</p>
              <p className="text-base font-semibold text-black">
                {stats.totalMaterials || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Experts</p>
              <p className="text-base font-semibold text-black">
                {stats.totalExperts || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Modules</p>
              <p className="text-base font-semibold text-black">
                {stats.totalModules || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-black mb-1">Quizzes</p>
              <p className="text-base font-semibold text-black">
                {stats.totalQuizzes || 0}
              </p>
            </div>
          </div>
        </motion.div>

        {/* View Full Enrollments Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <Link
            href={`/dashboard/manage-courses/${courseId}/enrollments`}
            className="flex items-center justify-center gap-2 w-full bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors font-medium"
          >
            <Users size={18} />
            View All Enrollments
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
