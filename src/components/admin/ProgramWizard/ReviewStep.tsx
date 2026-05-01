"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, BookOpen, Users, FileText, BarChart3 } from "lucide-react";

interface ProgramData {
  title: string;
  slug: string;
  type: "training" | "seminar" | "webinar" | "workshop" | "course";
  description: string;
  shortDescription: string;
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  duration: string;
  price?: number;
  discountedPrice?: number;
  capacity?: number;
  tags: string[];
  bannerImage?: string;
}

interface Curriculum {
  moduleTitle: string;
  description: string;
  topics: any[];
}

interface Expert {
  name: string;
  designation: string; // Backend requires: designation
  bio: string;
}

interface Project {
  title?: string;
  description?: string;
  image?: string;
}

interface Material {
  title: string;
  description: string;
  fileUrl: string; // Backend requires: fileUrl
  type: string;
  duration?: number;
}

interface Question {
  questionText: string;
  marks: number;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

interface Quiz {
  title: string;
  description: string;
  subject: string;
  totalQuestions: number;
  passingScore: number;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  questions: Question[];
}

interface AccessControl {
  accessType: "all-access" | "materials-only" | "quiz-only";
  accessScope: "all-users" | "members-only" | "individual-users";
}

interface CertificateRule {
  minPercentage: number;
  issueAutomatically?: boolean;
  validityDays?: number;
  certificateTitle?: string;
  templateUrl?: string;
}

interface ReviewStepProps {
  programData: ProgramData;
  curriculum: Curriculum[];
  experts: Expert[];
  projects: Project[];
  materials: Material[];
  quizzes: Quiz[];
  accessControl?: AccessControl;
  certificateRule?: CertificateRule;
}

/**
 * Step 8: Review & Publish
 * Final review before publishing - shows all content summary
 */
export const ReviewStep: React.FC<ReviewStepProps> = ({
  programData,
  curriculum,
  experts,
  projects,
  materials,
  quizzes,
  accessControl,
  certificateRule,
}) => {
  const isMissing =
    curriculum.length === 0 ||
    experts.length === 0 ||
    projects.length === 0 ||
    materials.length === 0 ||
    quizzes.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Program Overview Card */}
      <motion.div
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} className="text-blue-600" />
          Course Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Title</p>
            <p className="font-bold text-gray-900 mt-1">{programData.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Type</p>
            <p className="font-bold text-gray-900 mt-1 capitalize">
              {programData.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Level</p>
            <p className="font-bold text-gray-900 mt-1 capitalize">
              {programData.level}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-bold text-gray-900 mt-1">
              {programData.duration}
            </p>
          </div>
          {programData.price && (
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="font-bold text-gray-900 mt-1">
                ${programData.price}
                {programData.discountedPrice && (
                  <span className="ml-2 line-through text-gray-500">
                    ${programData.discountedPrice}
                  </span>
                )}
              </p>
            </div>
          )}
          {programData.capacity && (
            <div>
              <p className="text-sm text-gray-600">Capacity</p>
              <p className="font-bold text-gray-900 mt-1">
                {programData.capacity} participants
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content Summary */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <motion.div
          className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-600">Curriculum Modules</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {curriculum.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {curriculum.reduce((acc, c) => acc + c.topics.length, 0)} topics
            total
          </p>
        </motion.div>

        <motion.div
          className="bg-green-50 rounded-lg p-4 border-2 border-green-200"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-600">Experts Assigned</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {experts.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {experts.length > 0 ? "Ready to teach" : "None added"}
          </p>
        </motion.div>

        <motion.div
          className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-600">Course Projects</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {projects.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {projects.length > 0 ? "Hands-on learning" : "None added"}
          </p>
        </motion.div>

        <motion.div
          className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-600">Learning Materials</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {materials.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Various formats included
          </p>
        </motion.div>

        <motion.div
          className="bg-red-50 rounded-lg p-4 border-2 border-red-200"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm text-gray-600">Quizzes</p>
          <p className="text-3xl font-bold text-red-800 mt-2">
            {quizzes.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {quizzes.reduce((acc, q) => acc + q.totalQuestions, 0)} total
            questions
          </p>
        </motion.div>
      </motion.div>

      {/* Missing Content Warning */}
      {isMissing && (
        <motion.div
          className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300 flex gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle
            size={24}
            className="text-yellow-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-bold text-yellow-900">Missing Required Content</p>
            <p className="text-sm text-yellow-800 mt-1">
              Please add at least one item to each section before publishing:
            </p>
            <ul className="text-sm text-yellow-800 mt-2 ml-4 space-y-1">
              {curriculum.length === 0 && <li>• Add curriculum modules</li>}
              {experts.length === 0 && <li>• Add program experts</li>}
              {projects.length === 0 && <li>• Add course projects</li>}
              {materials.length === 0 && <li>• Add learning materials</li>}
              {quizzes.length === 0 && <li>• Add quizzes</li>}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Content Details Sections */}
      <div className="space-y-4">
        {/* Curriculum Details */}
        {curriculum.length > 0 && (
          <motion.div
            className="bg-white rounded-lg p-4 border-2 border-purple-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-purple-600" />
              Curriculum
            </h4>
            <div className="space-y-2">
              {curriculum.map((module, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-900">{module.moduleTitle}</p>
                  <p className="text-gray-600 text-xs mt-1">
                    {module.topics.length} topics
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Experts Details */}
        {experts.length > 0 && (
          <motion.div
            className="bg-white rounded-lg p-4 border-2 border-green-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={18} className="text-green-600" />
              Experts
            </h4>
            <div className="space-y-2">
              {experts.map((expert, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-900">{expert.name}</p>
                  <p className="text-gray-600 text-xs">{expert.designation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Materials Details */}
        {materials.length > 0 && (
          <motion.div
            className="bg-white rounded-lg p-4 border-2 border-orange-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-orange-600" />
              Materials
            </h4>
            <div className="space-y-2">
              {materials.map((material, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-900">{material.title}</p>
                  <p className="text-gray-600 text-xs capitalize">
                    {material.type}
                    {material.duration && material.duration > 0 && ` • ${material.duration} min`}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quizzes Details */}
        {quizzes.length > 0 && (
          <motion.div
            className="bg-white rounded-lg p-4 border-2 border-red-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-red-800" />
              Quizzes
            </h4>
            <div className="space-y-2">
              {quizzes.map((quiz, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="font-medium text-gray-900">{quiz.title}</p>
                  <p className="text-gray-600 text-xs">
                    {quiz.questions.length} questions • {quiz.duration} min •
                    Pass: {quiz.passingScore}%
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Access Control Settings */}
      {accessControl && (
        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" />
            Access Control Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">What Users Can Access</p>
              <p className="font-bold text-indigo-900 capitalize">
                {accessControl.accessType.replace("-", " ")}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Who Can Enroll</p>
              <p className="font-bold text-indigo-900 capitalize">
                {accessControl.accessScope.replace("-", " ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Certificate Rules */}
      {certificateRule && (
        <motion.div
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-amber-600" />
            Certificate Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Minimum Passing %</p>
              <p className="font-bold text-amber-900">{certificateRule.minPercentage}%</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-1">Auto-Issue</p>
              <p className="font-bold text-amber-900">
                {certificateRule.issueAutomatically ? "Yes" : "Manual"}
              </p>
            </div>
            {certificateRule.validityDays && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Validity Period</p>
                <p className="font-bold text-amber-900">{certificateRule.validityDays} days</p>
              </div>
            )}
            {certificateRule.certificateTitle && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Certificate Title</p>
                <p className="font-bold text-amber-900">{certificateRule.certificateTitle}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Final Check */}
      {!isMissing && (
        <motion.div
          className="bg-green-50 rounded-lg p-4 border-2 border-green-300 flex gap-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle
            size={24}
            className="text-green-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-bold text-green-900">Ready to Publish!</p>
            <p className="text-sm text-green-800 mt-1">
              Your program has all required content. Click "Publish Program" to
              make it live.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReviewStep;
