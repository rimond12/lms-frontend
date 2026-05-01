"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Users, Check } from "lucide-react";

interface AccessControlData {
  accessType: "all-access" | "materials-only" | "quiz-only";
  accessScope: "all-users" | "members-only" | "individual-users";
}

interface AccessControlStepProps {
  data: AccessControlData;
  onUpdate: (data: AccessControlData) => void;
}

export const AccessControlStep: React.FC<AccessControlStepProps> = ({
  data,
  onUpdate,
}) => {
  const accessTypeOptions = [
    {
      id: "all-access",
      label: "All Access",
      description: "Users can access materials AND take quizzes",
      icon: Check,
      color: "from-green-500 to-green-600",
    },
    {
      id: "materials-only",
      label: "Materials Only",
      description: "Users can only view materials (quizzes restricted)",
      icon: Lock,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "quiz-only",
      label: "Quiz Only",
      description: "Users can only take quizzes (materials restricted)",
      icon: Lock,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const accessScopeOptions = [
    {
      id: "all-users",
      label: "All Users",
      description: "Any authenticated user can enroll",
      icon: Users,
    },
    {
      id: "members-only",
      label: "Members Only",
      description: "Only BaseMember users can enroll",
      icon: Shield,
    },
    {
      id: "individual-users",
      label: "Invited Users Only",
      description: "Only invited users via invitation tokens can enroll",
      icon: Lock,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Access Control Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Define who can access what in your program
        </p>
      </div>

      {/* Access Type Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          What Can Users Access?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessTypeOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                onUpdate({
                  ...data,
                  accessType: option.id as AccessControlData["accessType"],
                })
              }
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.accessType === option.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    data.accessType === option.id
                      ? "bg-blue-100 dark:bg-blue-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <option.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Access Scope Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          Who Can Enroll?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accessScopeOptions.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                onUpdate({
                  ...data,
                  accessScope: option.id as AccessControlData["accessScope"],
                })
              }
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                data.accessScope === option.id
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    data.accessScope === option.id
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <option.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          📋 Access Configuration Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              What Users Access:
            </span>
            <span className="ml-2 text-blue-600 dark:text-blue-400 font-semibold">
              {accessTypeOptions.find((o) => o.id === data.accessType)?.label}
            </span>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Who Can Enroll:
            </span>
            <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
              {accessScopeOptions.find((o) => o.id === data.accessScope)?.label}
            </span>
          </div>
          <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong>Note:</strong> These settings will be locked for all enrolled users.
            Change these settings with caution after users have enrolled.
          </div>
        </div>
      </motion.div>

      {/* Information Box */}
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-900 dark:text-amber-200">
          <strong>💡 Tip:</strong> Access control is enforced server-side. These rules apply
          to all enrolled users automatically. Materials-only programs will block quiz access
          at the API level, and quiz-only programs will block material access.
        </p>
      </div>
    </motion.div>
  );
};
