"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Check,
  ChevronDown,
  Users,
  Loader,
  AlertCircle,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  users: User[];
  isLoading: boolean;
  selectedUsers: string[];
  onUserToggle: (userId: string) => void;
  onAssign: () => void;
  isAssigning?: boolean;
  enrolledUserIds?: string[];
}

export default function BulkAssignModal({
  isOpen,
  onClose,
  courseTitle,
  users,
  isLoading,
  selectedUsers,
  onUserToggle,
  onAssign,
  isAssigning = false,
  enrolledUserIds = [],
}: BulkAssignModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "role">("name");
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(
    new Set(["admin", "user"])
  );

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "email":
          return (a.email || "").localeCompare(b.email || "");
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        default:
          return 0;
      }
    });
  }, [users, searchTerm, sortBy]);

  // Group users by role
  const usersByRole = useMemo(() => {
    const grouped: { [key: string]: User[] } = {};
    filteredAndSortedUsers.forEach((user) => {
      const role = user.role || "User";
      if (!grouped[role]) {
        grouped[role] = [];
      }
      grouped[role].push(user);
    });
    return grouped;
  }, [filteredAndSortedUsers]);

  const toggleRoleExpansion = useCallback((role: string) => {
    setExpandedRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  }, []);

  const selectAllInRole = useCallback(
    (role: string) => {
      const usersInRole = usersByRole[role] || [];
      const allSelected = usersInRole.every((u) =>
        selectedUsers.includes(u._id)
      );

      usersInRole.forEach((user) => {
        const isEnrolled = enrolledUserIds.includes(user._id);
        if (!isEnrolled) {
          if (allSelected && selectedUsers.includes(user._id)) {
            // Deselect
            onUserToggle(user._id);
          } else if (!allSelected && !selectedUsers.includes(user._id)) {
            // Select
            onUserToggle(user._id);
          }
        }
      });
    },
    [usersByRole, selectedUsers, enrolledUserIds, onUserToggle]
  );

  if (!isOpen) return null;

  const stats = {
    total: users.length,
    enrolled: enrolledUserIds.length,
    available: users.length - enrolledUserIds.length,
    selected: selectedUsers.length,
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-200 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Bulk Assign Users
                </h2>
                <p className="text-sm text-gray-600">
                  Assign access to{" "}
                  <span className="font-semibold text-red-700">"{courseTitle}"</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-xl transition-colors group"
              >
                <X
                  size={24}
                  className="text-gray-400 group-hover:text-red-800"
                />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">
                  Already Enrolled
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.enrolled}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">
                  Available
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.available}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-1">
                  Selected
                </p>
                <p className="text-2xl font-bold text-red-800">
                  {stats.selected}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 relative">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 appearance-none bg-white transition-all"
                >
                  <option value="name">Sort: Name</option>
                  <option value="email">Sort: Email</option>
                  <option value="role">Sort: Role</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader className="w-8 h-8 animate-spin text-red-800 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Loading users...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we fetch the user list
                </p>
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No users found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "There are no available users"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {Object.entries(usersByRole).map(([role, roleUsers]) => (
                  <div key={role}>
                    {/* Role Header */}
                    <div className="bg-gray-50 px-6 py-3 sticky top-0 z-10">
                      <button
                        onClick={() => toggleRoleExpansion(role)}
                        className="w-full flex items-center justify-between hover:text-red-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              expandedRoles.has(role) ? "rotate-180" : ""
                            }`}
                          />
                          <span className="font-semibold text-gray-900">
                            {role}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                            {roleUsers.length}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAllInRole(role);
                          }}
                          className="text-xs font-medium text-red-800 hover:text-red-700 px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Select All
                        </button>
                      </button>
                    </div>

                    {/* Role Users */}
                    <AnimatePresence>
                      {expandedRoles.has(role) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="divide-y divide-gray-200"
                        >
                          {roleUsers.map((user) => {
                            const isSelected = selectedUsers.includes(user._id);
                            const isEnrolled = enrolledUserIds.includes(user._id);

                            return (
                              <motion.div
                                key={user._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`px-6 py-3 hover:bg-gray-50 transition-colors ${
                                  isEnrolled ? "opacity-60 bg-green-50/20" : ""
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <button
                                      onClick={() =>
                                        !isEnrolled && onUserToggle(user._id)
                                      }
                                      disabled={isEnrolled}
                                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                        isSelected
                                          ? "bg-red-800 border-red-800"
                                          : "border-gray-300 hover:border-red-400"
                                      } ${
                                        isEnrolled
                                          ? "cursor-not-allowed opacity-50"
                                          : "cursor-pointer"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Check size={12} className="text-white" />
                                      )}
                                    </button>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-900 truncate">
                                        {user.name}
                                      </p>
                                      <p className="text-sm text-gray-600 truncate">
                                        {user.email}
                                      </p>
                                    </div>
                                  </div>
                                  {isEnrolled && (
                                    <span className="ml-3 text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full flex-shrink-0">
                                      Enrolled
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedUsers.length > 0 ? (
                    <span>
                      <span className="font-bold text-red-800">
                        {selectedUsers.length}
                      </span>{" "}
                      user{selectedUsers.length !== 1 ? "s" : ""} selected for
                      assignment
                    </span>
                  ) : (
                    "Select users to assign to this program"
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={onAssign}
                  disabled={selectedUsers.length === 0 || isAssigning}
                  className="px-6 py-2.5 bg-red-800 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Assign {selectedUsers.length > 0 && `${selectedUsers.length}`}{" "}
                      User{selectedUsers.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
