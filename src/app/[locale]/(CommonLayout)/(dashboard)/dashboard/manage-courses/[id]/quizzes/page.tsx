"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Loader,
  BookOpen,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetCourseByIdQuery } from "@/app/redux/api/CourseApi/CourseApi";
import {
  useDeleteQuizMutation,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  useAddQuizMutation,
  useRemoveQuizMutation,
} from "@/app/redux/api/CourseApi/CourseApi";

export default function QuizzesManagementPage() {
  const params = useParams();
  const courseId = params.id as string;

  // Queries
  const { data: programData, isLoading: programLoading, error: programError } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  // Mutations
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();
  const [addQuiz] = useAddQuizMutation();
  const [removeQuiz] = useRemoveQuizMutation();

  const program = programData as any;

  // Local state
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Initialize existing quizzes for the program and fetch all available quizzes
  useEffect(() => {
    const loadProgramQuizzes = async () => {
      if (!program) return;

      // Try to get quizzes from program.quizzes first (if it's already populated)
      if (program.quizzes && Array.isArray(program.quizzes) && program.quizzes.length > 0) {
        setExistingQuizzes(program.quizzes);
        return;
      }

      // If not, try to fetch using quizIds
      if (!program.quizIds || program.quizIds.length === 0) {
        setExistingQuizzes([]);
      } else {
        try {
          // Fetch each quiz by ID and collect them
          const quizzes = await Promise.all(
            program.quizIds.map((quizId: string | any) => {
              // Handle both string IDs and object IDs
              const actualId = typeof quizId === 'string' ? quizId : quizId?._id || quizId;
              
              if (!actualId || actualId === '[object Object]') {
                return null;
              }
              
              return fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${actualId}`)
                .then(res => res.json())
                .then(data => data.data?.quiz || null)
                .catch(() => null);
            })
          );
          
          // Filter out any null values and set the existing quizzes
          const validQuizzes = quizzes.filter(q => q !== null);
          setExistingQuizzes(validQuizzes);
        } catch (error) {
          console.error('Error loading program quizzes:', error);
          setExistingQuizzes([]);
        }
      }
    };

    // Also load all available quizzes for the "add existing" dropdown
    const loadAllQuizzes = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`);
        const data = await response.json();
        setAvailableQuizzes(data.data?.quizzes || []);
      } catch (error) {
        console.error('Error loading available quizzes:', error);
        setAvailableQuizzes([]);
      }
    };

    loadProgramQuizzes();
    loadAllQuizzes();
  }, [program]);

  // When editing quiz changes, populate the form
  useEffect(() => {
    if (editingQuizId) {
      const quizToEdit = existingQuizzes.find(q => q._id === editingQuizId);
      if (quizToEdit) {
        setEditFormData({
          title: quizToEdit.title || "",
          description: quizToEdit.description || "",
          classLink: quizToEdit.classLink || "",
          negativeMarkingPercentage: quizToEdit.negativeMarkingPercentage ?? 0,
          overallFeedback: quizToEdit.overallFeedback || "",
          canUserViewAnswers: quizToEdit.canUserViewAnswers ?? false,
        });
      }
    }
  }, [editingQuizId, existingQuizzes]);

  // Add existing quiz to program
  const handleAddExistingQuiz = async () => {
    if (!selectedQuizId) {
      toast.error("Please select a quiz");
      return;
    }

    // Check if quiz is already added
    if (existingQuizzes.find((q) => q._id === selectedQuizId)) {
      toast.error("This quiz is already added to the program");
      return;
    }

    try {
      setIsSaving(true);
      // Call API to add quiz to program
      await addQuiz({ courseId, quizId: selectedQuizId }).unwrap();
      
      // Fetch the quiz data to add to the list
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${selectedQuizId}`);
      const data = await response.json();
      const selectedQuiz = data.data?.quiz;
      if (selectedQuiz) {
        setExistingQuizzes([...existingQuizzes, selectedQuiz]);
      }
      toast.success("Quiz added to program successfully");
      setShowAddForm(false);
      setSelectedQuizId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add quiz");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete quiz from program (not delete the quiz itself)
  const handleRemoveQuizFromProgram = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to remove this quiz from the program?")) {
      return;
    }

    try {
      setIsSaving(true);
      await removeQuiz({ courseId, quizId }).unwrap();
      setExistingQuizzes(existingQuizzes.filter((q) => q._id !== quizId));
      toast.success("Quiz removed from program");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove quiz");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete entire quiz (not recommended, only for admin)
  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this quiz? This cannot be undone.")) {
      return;
    }

    try {
      setIsSaving(true);
      await deleteQuiz(quizId).unwrap();
      
      // Remove from program
      await handleRemoveQuizFromProgram(quizId);
      
      toast.success("Quiz permanently deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete quiz");
    } finally {
      setIsSaving(false);
    }
  };

  if (programLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading quizzes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (programError || !program) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-800" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm">
                  Failed to load program. Please try again.
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
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          href={`/dashboard/manage-courses/${courseId}/details`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft size={18} />
          Back to Program Details
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen size={24} className="text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manage Quizzes
                </h1>
                <p className="text-gray-600">{program.title}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Plus size={18} />
              Add Existing Quiz
            </button>
          </div>
        </motion.div>

        {/* Add Quiz Form */}
        {/* Add Quiz Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Quiz <span className="text-red-800">*</span>
                </label>
                <select
                  value={String(selectedQuizId || "")}
                  onChange={(e) => setSelectedQuizId(e.target.value ? e.target.value : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Select a quiz --</option>
                  {availableQuizzes
                    .filter((q: any) => !existingQuizzes.find((eq: any) => eq._id === q._id))
                    .map((quiz: any) => {
                      const description = quiz.description ? `- ${String(quiz.description).substring(0, 60)}` : '';
                      return (
                        <option key={String(quiz._id || "")} value={quiz._id}>
                          {quiz.title} {description}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddExistingQuiz}
                  disabled={isSaving || !selectedQuizId}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {isSaving ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Quiz
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedQuizId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Quiz Modal */}
        {editingQuizId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingQuizId(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 p-6 flex items-center justify-between border-b">
                <h2 className="text-xl font-bold text-white">Edit Quiz</h2>
                <button
                  onClick={() => setEditingQuizId(null)}
                  className="text-white hover:bg-purple-800 p-2 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Enter quiz description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class / Meeting Link
                  </label>
                  <input
                    type="text"
                    value={editFormData.classLink || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, classLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://meet.example.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negative Marking Percentage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.negativeMarkingPercentage ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, negativeMarkingPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Feedback Message
                  </label>
                  <textarea
                    value={editFormData.overallFeedback || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, overallFeedback: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Message shown to students after quiz completion"
                  />
                </div>

                <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editFormData.canUserViewAnswers ?? false}
                    onChange={(e) => setEditFormData({ ...editFormData, canUserViewAnswers: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Allow users to view correct answers after quiz completion
                  </span>
                </label>

                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Link
                    href={`/dashboard/manage-quiz/update-quiz/${editingQuizId}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Edit size={16} />
                    Edit Questions & Full Details
                  </Link>
                  <button
                    onClick={() => setEditingQuizId(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Click "Edit Questions & Full Details" to manage quiz questions and advanced settings
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Existing Quizzes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-black to-red-700 p-4 sm:p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={20} />
              Program Quizzes ({existingQuizzes.length})
            </h2>
          </div>

          {existingQuizzes.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 font-medium">No quizzes added to this program yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Click "Add Existing Quiz" above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Class Link</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Negative %</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">View Answers</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingQuizzes.map((quiz: any, index: number) => (
                    <motion.tr
                      key={quiz._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="cursor-pointer"
                          onClick={() => setEditingQuizId(quiz._id)}
                        >
                          <p className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                            {quiz.title}
                          </p>
                          {quiz.description && (
                            <p className="text-xs text-gray-600 line-clamp-1">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <a href={quiz.classLink || '#'} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block max-w-xs">{quiz.classLink || '—'}</a>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{quiz.negativeMarkingPercentage ?? '0'}%</td>
                      <td className="px-4 py-3 text-sm">{quiz.canUserViewAnswers ? <span className="text-green-700 text-xs bg-green-100 px-2 py-1 rounded">Yes</span> : <span className="text-gray-500 text-xs">No</span>}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/dashboard/manage-quiz/update-quiz/${quiz._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleRemoveQuizFromProgram(quiz._id)}
                            disabled={isSaving}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove from program"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteQuiz(quiz._id)}
                            disabled={isSaving}
                            className="p-2 text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm">
            <p className="font-semibold text-blue-900">Quiz Management Info</p>
            <p className="text-blue-800 mt-1">
              • <strong>Edit (Blue):</strong> Edit quiz settings and questions
            </p>
            <p className="text-blue-800">
              • <strong>Remove (Orange):</strong> Remove quiz from this program (quiz data remains)
            </p>
            <p className="text-blue-800">
              • <strong>Delete (Red):</strong> Permanently delete the quiz (cannot be undone)
            </p>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mt-6"
        >
          <Link
            href={`/dashboard/manage-courses/${courseId}/details`}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back to Program Details
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
