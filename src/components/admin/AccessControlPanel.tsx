"use client";

import React, { useState } from "react";
import {
  Users,
  Lock,
  Unlock,
  Share2,
  Copy,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface AccessControlPanelProps {
  courseId: string;
  currentAccessType?: "all-access" | "materials-only" | "quiz-only";
  currentAccessScope?: "all-users" | "members-only" | "individual-users";
  onAccessChange?: (
    accessType: "all-access" | "materials-only" | "quiz-only",
    accessScope: "all-users" | "members-only" | "individual-users"
  ) => void;
}

interface UserAccess {
  userId: string;
  userName: string;
  email: string;
  accessLevel: "all-access" | "materials-only" | "quiz-only";
  grantedDate: string;
  expiryDate?: string;
  isActive: boolean;
}

interface Invitation {
  _id: string;
  token: string;
  expiryDate: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}

export default function AccessControlPanel({
  courseId,
  currentAccessType = "all-access",
  currentAccessScope = "all-users",
  onAccessChange,
}: AccessControlPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "invitations"
  >("overview");
  const [accessType, setAccessType] = useState<
    "all-access" | "materials-only" | "quiz-only"
  >(currentAccessType);
  const [accessScope, setAccessScope] = useState<
    "all-users" | "members-only" | "individual-users"
  >(currentAccessScope);

  // User Access Management
  const [userAccesses, setUserAccesses] = useState<UserAccess[]>([
    {
      userId: "user_001",
      userName: "John Doe",
      email: "john@example.com",
      accessLevel: "all-access",
      grantedDate: "2025-11-01",
      isActive: true,
    },
    {
      userId: "user_002",
      userName: "Jane Smith",
      email: "jane@example.com",
      accessLevel: "materials-only",
      grantedDate: "2025-11-02",
      expiryDate: "2025-12-02",
      isActive: true,
    },
  ]);

  // Invitations
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      _id: "inv_001",
      token: "inv_abc123xyz456789abcdefghijklmnop",
      expiryDate: "2025-12-02",
      isUsed: false,
    },
    {
      _id: "inv_002",
      token: "inv_def456uvw789xyz123abcdefghijklm",
      expiryDate: "2025-12-03",
      isUsed: true,
      usedBy: "user_003",
      usedAt: "2025-11-05",
    },
  ]);

  const [showNewUser, setShowNewUser] = useState(false);
  const [showBulkInvite, setShowBulkInvite] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserAccessLevel, setNewUserAccessLevel] = useState<
    "all-access" | "materials-only" | "quiz-only"
  >("all-access");
  const [bulkInviteCount, setBulkInviteCount] = useState(1);
  const [bulkInviteExpiryDays, setBulkInviteExpiryDays] = useState(30);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Handle access control update
  const handleAccessUpdate = () => {
    onAccessChange?.(accessType, accessScope);
    toast.success("Access control updated successfully!");
  };

  // Handle adding user access
  const handleAddUserAccess = () => {
    if (!newUserEmail) {
      toast.error("Please enter user email");
      return;
    }

    const newAccess: UserAccess = {
      userId: `user_${Date.now()}`,
      userName: newUserEmail.split("@")[0],
      email: newUserEmail,
      accessLevel: newUserAccessLevel,
      grantedDate: new Date().toISOString().split("T")[0],
      isActive: true,
    };

    setUserAccesses([...userAccesses, newAccess]);
    toast.success("User access granted successfully!");
    setNewUserEmail("");
    setShowNewUser(false);
  };

  // Handle revoking user access
  const handleRevokeAccess = (userId: string) => {
    if (window.confirm("Are you sure you want to revoke this user's access?")) {
      setUserAccesses(
        userAccesses.map((access) =>
          access.userId === userId ? { ...access, isActive: false } : access
        )
      );
      toast.success("Access revoked successfully!");
    }
  };

  // Handle copying invitation token
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success("Token copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Handle creating bulk invitations
  const handleCreateBulkInvites = () => {
    if (bulkInviteCount < 1 || bulkInviteCount > 1000) {
      toast.error("Count must be between 1 and 1000");
      return;
    }

    const newInvitations: Invitation[] = Array.from({
      length: bulkInviteCount,
    }).map(() => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + bulkInviteExpiryDays);

      return {
        _id: `inv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        token: `inv_${Math.random().toString(36).substring(2, 40)}`,
        expiryDate: expiryDate.toISOString().split("T")[0],
        isUsed: false,
      };
    });

    setInvitations([...newInvitations, ...invitations]);
    toast.success(`Created ${bulkInviteCount} invitations!`);
    setShowBulkInvite(false);
    setBulkInviteCount(1);
  };

  // Handle deleting invitation
  const handleDeleteInvitation = (invitationId: string) => {
    if (window.confirm("Are you sure you want to delete this invitation?")) {
      setInvitations(invitations.filter((inv) => inv._id !== invitationId));
      toast.success("Invitation deleted!");
    }
  };

  const activeUsers = userAccesses.filter((u) => u.isActive).length;
  const unusedInvitations = invitations.filter((i) => !i.isUsed).length;
  const usedInvitations = invitations.filter((i) => i.isUsed).length;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Lock size={20} className="text-blue-600" />
          Access Control Configuration
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage who can access what in this program
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(
          ["overview", "users", "invitations"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "overview" && "Overview"}
            {tab === "users" && "Users"}
            {tab === "invitations" && "Invitations"}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      <AnimatePresence>
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-blue-600">
                      ACTIVE USERS
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {activeUsers}
                    </p>
                  </div>
                  <Users size={24} className="text-blue-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-green-600">
                      UNUSED INVITES
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {unusedInvitations}
                    </p>
                  </div>
                  <Share2 size={24} className="text-green-400" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-purple-600">
                      REDEEMED
                    </p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">
                      {usedInvitations}
                    </p>
                  </div>
                  <CheckCircle size={24} className="text-purple-400" />
                </div>
              </div>
            </div>

            {/* Access Control Configuration */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Access Control Rules
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Access Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What can users access?
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        "all-access",
                        "materials-only",
                        "quiz-only",
                      ] as const
                    ).map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value={type}
                          checked={accessType === type}
                          onChange={(e) =>
                            setAccessType(
                              e.target.value as typeof accessType
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">
                          {type === "all-access" && (
                            <>
                              <strong>All Access</strong> - Materials + Quizzes
                            </>
                          )}
                          {type === "materials-only" && (
                            <>
                              <strong>Materials Only</strong> - View materials
                              (no quizzes)
                            </>
                          )}
                          {type === "quiz-only" && (
                            <>
                              <strong>Quiz Only</strong> - Take quizzes (no
                              materials)
                            </>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Access Scope */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who can enroll?
                  </label>
                  <div className="space-y-2">
                    {(
                      [
                        "all-users",
                        "members-only",
                        "individual-users",
                      ] as const
                    ).map((scope) => (
                      <label
                        key={scope}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="accessScope"
                          value={scope}
                          checked={accessScope === scope}
                          onChange={(e) =>
                            setAccessScope(
                              e.target.value as typeof accessScope
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">
                          {scope === "all-users" && (
                            <>
                              <strong>All Users</strong> - Any authenticated user
                            </>
                          )}
                          {scope === "members-only" && (
                            <>
                              <strong>Members Only</strong> - Only premium
                              members
                            </>
                          )}
                          {scope === "individual-users" && (
                            <>
                              <strong>Invited Only</strong> - Via invitation
                              tokens
                            </>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAccessUpdate}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Access Control
              </button>
            </div>

            {/* Info Cards */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      Users cannot change their access level during enrollment
                    </li>
                    <li>
                      Backend automatically applies these rules to all users
                    </li>
                    <li>
                      You can manually grant/revoke access for individual users
                    </li>
                    <li>Invitation tokens must be redeemed to gain access</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* USERS TAB */}
      <AnimatePresence>
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Add User Button */}
            <button
              onClick={() => setShowNewUser(!showNewUser)}
              className="mb-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Grant Access to User
            </button>

            {/* Add User Form */}
            <AnimatePresence>
              {showNewUser && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Level
                      </label>
                      <select
                        value={newUserAccessLevel}
                        onChange={(e) =>
                          setNewUserAccessLevel(
                            e.target.value as typeof newUserAccessLevel
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all-access">All Access</option>
                        <option value="materials-only">Materials Only</option>
                        <option value="quiz-only">Quiz Only</option>
                      </select>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleAddUserAccess}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-medium text-sm"
                      >
                        Grant Access
                      </button>
                      <button
                        onClick={() => setShowNewUser(false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Users List */}
            {userAccesses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users granted access yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                        User
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                        Access Level
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                        Granted
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userAccesses.map((access) => (
                      <tr
                        key={access.userId}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {access.userName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {access.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {access.accessLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">
                          {access.grantedDate}
                          {access.expiryDate && (
                            <p className="text-red-800">
                              Exp: {access.expiryDate}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {access.isActive ? (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-800 text-xs">
                              <AlertCircle size={14} />
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {access.isActive && (
                            <button
                              onClick={() =>
                                handleRevokeAccess(access.userId)
                              }
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Revoke"
                            >
                              <Unlock size={14} className="text-red-800" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* INVITATIONS TAB */}
      <AnimatePresence>
        {activeTab === "invitations" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Create Invitations Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowBulkInvite(!showBulkInvite)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Create Invitations
              </button>
            </div>

            {/* Bulk Create Form */}
            <AnimatePresence>
              {showBulkInvite && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Invitations
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={bulkInviteCount}
                        onChange={(e) =>
                          setBulkInviteCount(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">1-1000</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={bulkInviteExpiryDays}
                        onChange={(e) =>
                          setBulkInviteExpiryDays(parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">Days until expiry</p>
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleCreateBulkInvites}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors font-medium text-sm"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowBulkInvite(false)}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Invitations List */}
            {invitations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Share2 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No invitations created yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invitations.map((invite) => (
                  <div
                    key={invite._id}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-300 text-gray-900 flex-1 overflow-hidden text-ellipsis">
                          {invite.token}
                        </code>
                        <button
                          onClick={() => handleCopyToken(invite.token)}
                          className={`p-2 rounded transition-colors ${
                            copiedToken === invite.token
                              ? "bg-green-100"
                              : "hover:bg-gray-200"
                          }`}
                          title="Copy token"
                        >
                          {copiedToken === invite.token ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} className="text-gray-600" />
                          )}
                        </button>
                      </div>

                      <div className="flex gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Exp: {invite.expiryDate}
                        </span>
                        <span>
                          {invite.isUsed ? (
                            <span className="text-green-600">
                              ✓ Redeemed by {invite.usedBy} on{" "}
                              {invite.usedAt}
                            </span>
                          ) : (
                            <span className="text-blue-600">○ Unused</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {!invite.isUsed && (
                      <button
                        onClick={() => handleDeleteInvitation(invite._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-800" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Invitation Info */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">How Invitations Work:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Admin creates invitation tokens (single or bulk)
                  </li>
                  <li>Share tokens with users via email/message</li>
                  <li>Users redeem token to gain access to program</li>
                  <li>
                    Tokens expire after specified days
                  </li>
                  <li>Each token can only be used once</li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
