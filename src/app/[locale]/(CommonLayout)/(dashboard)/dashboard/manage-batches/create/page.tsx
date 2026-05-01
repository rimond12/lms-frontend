"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  Users,
  Layers,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useCreateBatchMutation } from "@/app/redux/api/batchApi/batchApi";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";

export default function CreateBatchPage() {
  const router = useRouter();
  const [createBatch, { isLoading: isCreating }] = useCreateBatchMutation();
  const { data: coursesData, isLoading: isLoadingCourses } = useGetCoursesQuery(
    {
      limit: 100,
    }
  );

  const [formData, setFormData] = useState({
    batchName: "",
    batchNumber: "",
    courseId: "",
    startDate: "",
    endDate: "",
    enrollmentDeadline: "",
    autoStart: true,
    maxStudents: "",
    totalPrice: "",
    currency: "BDT",
    installmentPlans: {
      onePlan: true,
      twoPlan: false,
      threePlan: false,
    },
    description: "",
    progressionType: "free" as 'free' | 'sequential',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith("installmentPlans.")) {
      const planKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        installmentPlans: {
          ...prev.installmentPlans,
          [planKey]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.batchName.trim()) {
      newErrors.batchName = "Batch name is required";
    }

    if (!formData.courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.totalPrice || parseFloat(formData.totalPrice) <= 0) {
      newErrors.totalPrice = "Price must be greater than 0";
    }

    // At least one installment plan must be enabled
    if (
      !formData.installmentPlans.onePlan &&
      !formData.installmentPlans.twoPlan &&
      !formData.installmentPlans.threePlan
    ) {
      newErrors.installmentPlans =
        "At least one installment plan must be enabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const submitData = {
        batchName: formData.batchName.trim(),
        batchNumber: formData.batchNumber.trim() || undefined,
        courseId: formData.courseId,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        enrollmentDeadline: formData.enrollmentDeadline || undefined,
        autoStart: formData.autoStart,
        maxStudents: formData.maxStudents
          ? parseInt(formData.maxStudents)
          : undefined,
        totalPrice: parseFloat(formData.totalPrice),
        currency: formData.currency,
        installmentPlans: formData.installmentPlans,
        description: formData.description.trim() || undefined,
        progressionType: formData.progressionType,
      };

      await createBatch(submitData).unwrap();
      toast.success("Batch created successfully!");
      router.push("/dashboard/manage-batches");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create batch");
    }
  };

  const courses = coursesData?.data || [];

  // Calculate installment amounts preview
  const totalPrice = parseFloat(formData.totalPrice) || 0;
  const installmentPreview = {
    onePlan: totalPrice,
    twoPlan: Math.ceil(totalPrice / 2),
    threePlan: Math.ceil(totalPrice / 3),
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <Link
            href="/dashboard/manage-batches"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Create New Batch
            </h1>
            <p className="text-sm text-gray-500">
              Set up a new batch for student enrollment
            </p>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              Creating a Batch in 4 Steps
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
                Name, course & description
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  2
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Schedule
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">Start & end dates</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  3
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Capacity
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">Max student limit</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded flex items-center justify-center">
                  4
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Pricing
                </span>
              </div>
              <p className="text-xs text-gray-500 pl-7">Price & installments</p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Layers size={18} className="text-blue-600" />
              </div>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch Name *
                </label>
                <input
                  type="text"
                  name="batchName"
                  value={formData.batchName}
                  onChange={handleInputChange}
                  placeholder="e.g., January 2025 Batch"
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.batchName
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.batchName && (
                  <p className="text-amber-600 text-xs mt-1.5">
                    {errors.batchName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Batch Number (Optional)
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if empty"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course *
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.courseId
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                  disabled={isLoadingCourses}
                >
                  <option value="">Select a course</option>
                  {courses.map((course: any) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="text-amber-600 text-xs mt-1.5">
                    {errors.courseId}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Optional batch description..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Progression Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Learning Progression
                </label>
                <select
                  name="progressionType"
                  value={formData.progressionType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free Access — Students can access any lesson</option>
                  <option value="sequential">Sequential — Students must complete modules in order</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.progressionType === 'sequential'
                    ? '🔒 Students must complete all items in a module before the next module unlocks.'
                    : '🔓 Students can freely navigate between all lessons and modules.'}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar size={18} className="text-green-600" />
              </div>
              Schedule
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.startDate
                      ? "border-amber-500 bg-amber-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-amber-600 text-xs mt-1.5">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enrollment Deadline
                </label>
                <input
                  type="date"
                  name="enrollmentDeadline"
                  value={formData.enrollmentDeadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="autoStart"
                    checked={formData.autoStart}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Auto-start batch on start date
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1.5 ml-8">
                  If enabled, the batch will automatically start and grant
                  access to approved students on the start date
                </p>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users size={18} className="text-purple-600" />
              </div>
              Capacity
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Maximum Students
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                min="1"
                className="w-full md:w-1/2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Leave empty to allow unlimited enrollments
              </p>
            </div>
          </div>

          {/* Pricing & Installment Plans */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <DollarSign size={18} className="text-amber-600" />
              </div>
              Pricing & Installment Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Total Price *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="totalPrice"
                    value={formData.totalPrice}
                    onChange={handleInputChange}
                    placeholder="e.g., 15000"
                    min="0"
                    step="0.01"
                    className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.totalPrice
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200"
                    }`}
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="BDT">BDT</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                {errors.totalPrice && (
                  <p className="text-amber-600 text-xs mt-1.5">
                    {errors.totalPrice}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Installment Plans *
              </label>
              {errors.installmentPlans && (
                <p className="text-amber-600 text-xs mb-3">
                  {errors.installmentPlans}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Payment */}
                <label
                  className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    formData.installmentPlans.onePlan
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Full Payment
                    </span>
                    <input
                      type="checkbox"
                      name="installmentPlans.onePlan"
                      checked={formData.installmentPlans.onePlan}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {formData.currency}{" "}
                    {installmentPreview.onePlan.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    One-time payment
                  </span>
                </label>

                {/* 2 Installments */}
                <label
                  className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    formData.installmentPlans.twoPlan
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      2 Installments
                    </span>
                    <input
                      type="checkbox"
                      name="installmentPlans.twoPlan"
                      checked={formData.installmentPlans.twoPlan}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {formData.currency}{" "}
                    {installmentPreview.twoPlan.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    per installment
                  </span>
                </label>

                {/* 3 Installments */}
                <label
                  className={`flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    formData.installmentPlans.threePlan
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      3 Installments
                    </span>
                    <input
                      type="checkbox"
                      name="installmentPlans.threePlan"
                      checked={formData.installmentPlans.threePlan}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {formData.currency}{" "}
                    {installmentPreview.threePlan.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    per installment
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-blue-600 mt-0.5 shrink-0"
                  size={18}
                />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">About Installment Plans</p>
                  <p className="mt-1 text-blue-600">
                    Students will be able to select from the enabled plans when
                    enrolling. The installment amounts are automatically
                    calculated based on the total price. Access is granted when
                    the first installment is approved and the batch starts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/manage-batches"
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isCreating}
              className="flex items-center gap-2 bg-gray-900 text-white font-medium px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Batch
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
