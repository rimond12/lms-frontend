"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Edit2,
  Users,
  Mail,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useAddExpertMutation,
  useUpdateExpertMutation,
  useDeleteExpertMutation,
} from "@/app/redux/api/CourseApi/CourseApi";
import { IExpert } from "@/types/course";
import { useImageUpload } from "@/hooks";
import { getImageUrl } from "@/utils/imageUtils";

interface ProgramExpertsSectionProps {
  courseId: string;
  experts: IExpert[];
  onExpertsChange: (experts: IExpert[]) => void;
}

export default function ProgramExpertsSection({
  courseId,
  experts,
  onExpertsChange,
}: ProgramExpertsSectionProps) {
  const [addExpert] = useAddExpertMutation();
  const [updateExpert] = useUpdateExpertMutation();
  const [deleteExpert] = useDeleteExpertMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    designation: "",
    profileImage: "",
    bio: "",
    specialization: [] as string[],
    social: {
      linkedIn: "",
      facebook: "",
      youtube: "",
      twitter: "",
    },
  });

  const [specializationInput, setSpecializationInput] = useState("");

  // Profile image upload
  const profileImage = useImageUpload({
    preset: 'AVATAR',
    onSuccess: (imageUrl) => {
      setForm({ ...form, profileImage: imageUrl });
      toast.success("Profile image uploaded!");
    },
    onError: (err) => {
      toast.error(`Upload failed: ${err.message}`);
    },
  });

  // Clear form
  const clearForm = () => {
    setForm({
      name: "",
      designation: "",
      profileImage: "",
      bio: "",
      specialization: [],
      social: {
        linkedIn: "",
        facebook: "",
        youtube: "",
        twitter: "",
      },
    });
    setSpecializationInput("");
    setIsAdding(false);
    setEditingId(null);
    profileImage.reset();
  };

  // Add specialization
  const addSpecialization = () => {
    if (specializationInput.trim() && !form.specialization.includes(specializationInput.trim())) {
      setForm({
        ...form,
        specialization: [...form.specialization, specializationInput.trim()],
      });
      setSpecializationInput("");
    }
  };

  // Remove specialization
  const removeSpecialization = (index: number) => {
    setForm({
      ...form,
      specialization: form.specialization.filter((_, i) => i !== index),
    });
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Speaker name is required");
      return;
    }
    if (!form.designation.trim()) {
      toast.error("Designation is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const expertData = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        profileImage: form.profileImage,
        bio: form.bio.trim(),
        specialization: form.specialization,
        social: form.social,
      };

      if (editingId) {
        if (!editingId) {
          toast.error("Invalid speaker ID. Please try again.");
          clearForm();
          return;
        }
        // Check if the expert still exists in the list
        const expertExists = experts.some(expert => expert._id === editingId);
        if (!expertExists) {
          toast.error("Speaker no longer exists. Please refresh the page.");
          clearForm();
          return;
        }
        console.log("Updating speaker:", { courseId, expertId: editingId, expert: expertData });
        await updateExpert({
          courseId,
          expertId: editingId,
          expert: expertData,
        }).unwrap();
        toast.success("Speaker updated successfully!");
      } else {
        await addExpert({
          courseId,
          expert: expertData,
        }).unwrap();
        toast.success("Speaker added successfully!");
      }

      clearForm();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save speaker");
      console.error("Speaker save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (expertId: string) => {
    if (!window.confirm("Are you sure you want to delete this speaker?")) {
      return;
    }

    try {
      await deleteExpert({
        courseId,
        expertId,
      }).unwrap();
      toast.success("Speaker deleted successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete speaker");
    }
  };

  // Handle edit
  const handleEdit = (expert: IExpert) => {
    setForm({
      name: expert.name,
      designation: expert.designation,
      profileImage: expert.profileImage || "",
      bio: expert.bio || "",
      specialization: expert.specialization || [],
      social: {
        linkedIn: expert.social?.linkedIn || "",
        facebook: expert.social?.facebook || "",
        youtube: expert.social?.youtube || "",
        twitter: expert.social?.twitter || "",
      },
    });
    setEditingId(expert._id || null);
    setIsAdding(true);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-black p-6">
     
      {/* Existing Speakers and Resource Persons */}
      {experts && experts.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Users size={20} className="text-red-800" />
              Our Speakers and Resource Persons ({experts.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr className="bg-red-800 text-white">
                  <th className="border border-black px-4 py-2 text-left">Name</th>
                  <th className="border border-black px-4 py-2 text-left">Designation</th>
                  <th className="border border-black px-4 py-2 text-left">Bio</th>
                  <th className="border border-black px-4 py-2 text-left">Specializations</th>
                  <th className="border border-black px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {experts.map((expert, index) => (
                  <tr key={expert._id} className="bg-white">
                    <td className="border border-black px-4 py-2 text-black">
                      <div className="flex items-center gap-2">
                        {expert.profileImage ? (
                          <img
                            src={getImageUrl(expert.profileImage)}
                            alt={expert.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {expert.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {expert.name}
                      </div>
                    </td>
                    <td className="border border-black px-4 py-2 text-black">{expert.designation}</td>
                    <td className="border border-black px-4 py-2 text-black max-w-xs truncate">{expert.bio || 'N/A'}</td>
                    <td className="border border-black px-4 py-2 text-black">
                      {expert.specialization && expert.specialization.length > 0
                        ? expert.specialization.join(', ')
                        : 'N/A'}
                    </td>
                    <td className="border border-black px-4 py-2 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleEdit(expert)}
                          className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(expert._id || "")}
                          className="px-3 py-1 bg-red-800 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <motion.div
        initial={false}
        animate={{ height: isAdding ? "auto" : 0, opacity: isAdding ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden mb-4"
      >
        {isAdding && (
          <div className="border border-black rounded-lg p-4 bg-white space-y-4">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Profile Image
              </label>

              {(profileImage.preview || form.profileImage) && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={profileImage.preview || form.profileImage}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-2 border-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      profileImage.reset();
                      setForm({ ...form, profileImage: "" });
                    }}
                    className="absolute top-0 right-0 bg-red-800 text-white p-1 rounded-full hover:bg-red-700 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-black rounded-lg hover:border-red-800 hover:bg-gray-50 cursor-pointer transition">
                <Upload size={18} className="text-red-800" />
                <span className="text-sm text-red-800 font-medium">
                  {profileImage.isUploading ? "Uploading..." : "Upload Photo"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) profileImage.uploadImage(file);
                  }}
                  disabled={profileImage.isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Name <span className="text-red-800">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Dr. John Smith"
                className="w-full px-4 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Designation <span className="text-red-800">*</span>
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g., Senior React Developer"
                className="w-full px-4 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Brief bio about the speaker..."
                rows={3}
                className="w-full px-4 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Specializations
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={specializationInput}
                  onChange={(e) => setSpecializationInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialization();
                    }
                  }}
                  placeholder="Add specialization..."
                  className="flex-1 px-3 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-3 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Add
                </button>
              </div>
              {form.specialization.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.specialization.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-white text-black border border-black px-3 py-1 rounded-full text-sm"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(idx)}
                        className="hover:text-red-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="border-t border-black pt-4">
              <h4 className="font-semibold text-black mb-3">Social Links</h4>
              <div className="space-y-2">
                {[
                  { key: "linkedIn", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
                  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
                  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
                  { key: "twitter", label: "Twitter", placeholder: "https://twitter.com/..." },
                ].map((social) => (
                  <input
                    key={social.key}
                    type="url"
                    value={form.social[social.key as keyof typeof form.social]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        social: {
                          ...form.social,
                          [social.key]: e.target.value,
                        },
                      })
                    }
                    placeholder={social.placeholder}
                    className="w-full px-3 py-2 border border-black rounded-lg text-sm focus:ring-2 focus:ring-red-800 focus:border-transparent transition"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                {isSubmitting ? "Saving..." : editingId ? "Update Speaker" : "Add Speaker"}
              </motion.button>
              <button
                type="button"
                onClick={clearForm}
                className="flex-1 px-4 py-2 border border-black text-black rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Button */}
      {!isAdding && (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full px-4 py-3 border-2 border-dashed border-red-800 text-red-800 rounded-lg hover:border-black hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={18} />
          Add Speaker and Resource Person
        </button>
      )}
    </div>
  );
}
