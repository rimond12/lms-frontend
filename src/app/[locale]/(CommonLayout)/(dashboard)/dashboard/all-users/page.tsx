"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  UserPlus,
} from "lucide-react";
import {
  useGetAllUsersQuery,
  useDeleteusersMutation,
  useUpdateusersMutation,
} from "@/app/redux/api/users/userApi";
import { getImageUrl, getFullDocumentUrl } from "@/utils/imageUtils";
import { User } from "@/types/auth";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import AppImage from "@/components/ui/AppImage";

// User Card Component for better mobile view
const UserCard = ({
  user,
  onView,
  onEdit,
  onDelete,
}: {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) => {
  const getProfilePhotoUrl = (photoPath?: string): string => {
    return getImageUrl(photoPath);
  };

  const getFileUrl = (filePath?: string): string | null => {
    if (!filePath) return null;
    return getFullDocumentUrl(filePath);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <AppImage
            photoUrl={user.profilePhoto}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            width={40}
            height={40}
          />
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onView(user)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit User"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 text-gray-400 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Role
          </p>
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              user.role === "ADMIN"
                ? "bg-purple-100 text-purple-800"
                : user.role === "TEACHER"
                  ? "bg-blue-100 text-blue-800"
                  : user.role === "STUDENT"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {user.role}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Status
          </p>
          <span
            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
              user.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {user.status === "ACTIVE" ? (
              <CheckCircle size={12} className="mr-1" />
            ) : (
              <XCircle size={12} className="mr-1" />
            )}
            {user.status}
          </span>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {user.mobileNumber && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone size={14} className="mr-2 text-gray-400" />
            {user.mobileNumber}
          </div>
        )}
        {user.address && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-2 text-gray-400" />
            {user.address}
          </div>
        )}
        {user.age && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={14} className="mr-2 text-gray-400" />
            Age: {user.age}
          </div>
        )}
      </div>

      {/* Documents */}
      {(user.cvUrl ||
        user.experienceCertificateUrl ||
        user.universityCertificateUrl) && (
        <div className="border-t pt-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
            Documents
          </p>
          <div className="flex flex-wrap gap-2">
            {user.cvUrl && (
              <a
                href={getFileUrl(user.cvUrl) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
              >
                <FileText size={12} className="mr-1" />
                CV
              </a>
            )}
            {user.experienceCertificateUrl && (
              <a
                href={getFileUrl(user.experienceCertificateUrl) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100"
              >
                <FileText size={12} className="mr-1" />
                Experience
              </a>
            )}
            {user.universityCertificateUrl && (
              <a
                href={getFileUrl(user.universityCertificateUrl) || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
              >
                <FileText size={12} className="mr-1" />
                University
              </a>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-3 mt-4">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {user.emailVerified ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle size={12} className="mr-1" />
                Verified
              </span>
            ) : (
              <span className="text-red-800 flex items-center">
                <XCircle size={12} className="mr-1" />
                Unverified
              </span>
            )}
          </span>
          <span>
            Joined:{" "}
            {user.createdAt
              ? format(new Date(user.createdAt), "MMM dd, yyyy")
              : "N/A"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
export default function AllUsersPage() {
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllUsersQuery(undefined);
  const [deleteUser] = useDeleteusersMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateusersMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<{
    name: string;
    role: User["role"];
    status: User["status"];
    mobileNumber?: string;
    nid?: string;
    address?: string;
    age?: number | "";
    // membershipId removed
  }>({
    name: "",
    role: "USER",
    status: "ACTIVE",
    mobileNumber: "",
    nid: "",
    address: "",
    age: "",
    // membershipId removed
  });

  const users: User[] = usersResponse?.data || [];

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.mobileNumber && user.mobileNumber.includes(searchTerm));

    const matchesStatus =
      statusFilter === "ALL" || user.status === statusFilter;
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditData({
      name: user.name || "",
      role: user.role,
      status: user.status,
      mobileNumber: user.mobileNumber || "",
      nid: user.nid || "",
      address: user.address || "",
      age: user.age ?? "",
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteUser(user._id).unwrap();
        toast.success(`${user.name} has been deleted successfully`);
        refetch();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const payload: any = {
      name: editData.name?.trim(),
      role: editData.role,
      status: editData.status,
      mobileNumber: editData.mobileNumber || undefined,
      nid: editData.nid || undefined,
      address: editData.address || undefined,
      age: editData.age === "" ? undefined : Number(editData.age),
      // membershipId removed?.trim() || undefined,
    };
    try {
      await updateUser({ id: selectedUser._id, usersData: payload }).unwrap();
      toast.success("User updated successfully");
      setShowEditModal(false);
      setSelectedUser(null);
      refetch();
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to update user";
      toast.error(msg);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Email",
      "Role",
      "Status",
      "Mobile",
      "NID",
      "Address",
      "Age",
      "Membership ID",
      "Email Verified",
      "Created Date",
    ];

    const csvData = filteredUsers.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.mobileNumber || "",
      user.nid || "",
      user.address || "",
      user.age || "",
      user.emailVerified ? "Yes" : "No",
      user.createdAt ? format(new Date(user.createdAt), "yyyy-MM-dd") : "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-800 mb-2">Error loading users</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" size={28} />
              All Users
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view all registered users ({filteredUsers.length} of{" "}
              {users.length} users)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-black transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export CSV
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <UserPlus size={16} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="USER">User</option>
          </select>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          ))}
        </div>
      ) : (
        /* Users Table - will be implemented if needed */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const getProfilePhotoUrl = (photoPath?: string): string => {
                    return getImageUrl(photoPath);
                  };

                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <AppImage
                            photoUrl={user.profilePhoto}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            width={40}
                            height={40}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.mobileNumber || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.address || "No address"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "TEACHER"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "STUDENT"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                        <br />
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            user.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status === "ACTIVE" ? (
                            <CheckCircle size={12} className="mr-1" />
                          ) : (
                            <XCircle size={12} className="mr-1" />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Age: {user.age || "N/A"}</div>
                        <div>NID: {user.nid || "N/A"}</div>

                        <div className="text-xs text-gray-500">
                          {user.emailVerified
                            ? "Email Verified"
                            : "Email Unverified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {user.cvUrl && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                              <FileText size={10} className="mr-1" />
                              CV
                            </span>
                          )}
                          {user.experienceCertificateUrl && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                              <FileText size={10} className="mr-1" />
                              Experience
                            </span>
                          )}
                          {user.universityCertificateUrl && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                              <FileText size={10} className="mr-1" />
                              University
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit User"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-800 hover:text-red-900"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== "ALL" || roleFilter !== "ALL"
              ? "Try adjusting your search or filters."
              : "Get started by creating a new user."}
          </p>
        </div>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  User Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <AppImage
                    photoUrl={selectedUser.profilePhoto}
                    width={80}
                    height={80}
                    alt={selectedUser.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                  />

                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUser?.name}
                    </h3>
                    <p className="text-gray-600">{selectedUser?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedUser.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : selectedUser.role === "TEACHER"
                              ? "bg-blue-100 text-blue-800"
                              : selectedUser.role === "STUDENT"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedUser.role}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedUser.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mobile Number
                    </label>
                    <p className="text-gray-900">
                      {selectedUser.mobileNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Age
                    </label>
                    <p className="text-gray-900">{selectedUser.age || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      NID
                    </label>
                    <p className="text-gray-900">{selectedUser.nid || "N/A"}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email Verified
                    </label>
                    <p className="text-gray-900">
                      {selectedUser.emailVerified ? "Yes" : "No"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900">
                    {selectedUser.address || "N/A"}
                  </p>
                </div>

                {(selectedUser.cvUrl ||
                  selectedUser.experienceCertificateUrl ||
                  selectedUser.universityCertificateUrl) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-2 block">
                      Documents
                    </label>
                    <div className="space-y-2">
                      {selectedUser.cvUrl && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}${selectedUser.cvUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                        >
                          <FileText size={16} className="mr-2" />
                          CV Document
                        </a>
                      )}
                      {selectedUser.experienceCertificateUrl && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}${selectedUser.experienceCertificateUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                        >
                          <FileText size={16} className="mr-2" />
                          Experience Certificate
                        </a>
                      )}
                      {selectedUser.universityCertificateUrl && (
                        <a
                          href={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}${selectedUser.universityCertificateUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                        >
                          <FileText size={16} className="mr-2" />
                          University Certificate
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <p className="text-gray-900">
                      {selectedUser.createdAt
                        ? format(new Date(selectedUser.createdAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Updated At
                    </label>
                    <p className="text-gray-900">
                      {selectedUser.updatedAt
                        ? format(new Date(selectedUser.updatedAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleUpdateSubmit} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, name: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) =>
                      setEditData((s) => ({
                        ...s,
                        role: e.target.value as User["role"],
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                    <option value="USER">User</option>
                    <option value="HR">HR</option>
                    <option value="MARKETING_TEAM">Marketing Team</option>
                    <option value="CUSTOMER_SERVICE_TEAM">
                      Customer Service Team
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData((s) => ({
                        ...s,
                        status: e.target.value as User["status"],
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="BLOCKED">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editData.mobileNumber || ""}
                    onChange={(e) =>
                      setEditData((s) => ({
                        ...s,
                        mobileNumber: e.target.value,
                      }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NID
                  </label>
                  <input
                    type="text"
                    value={editData.nid || ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, nid: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editData.age === "" ? "" : String(editData.age)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditData((s) => ({
                        ...s,
                        age: v === "" ? "" : Number(v),
                      }));
                    }}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={editData.address || ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, address: e.target.value }))
                    }
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-lg text-white ${isUpdating ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
