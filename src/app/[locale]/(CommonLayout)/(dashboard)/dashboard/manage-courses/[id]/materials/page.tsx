"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader,
  FileText,
  Plus,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useGetCourseByIdQuery, useUpdateCourseMutation } from "@/app/redux/api/CourseApi/CourseApi";
import AddMaterialsSection from "@/components/admin/AddMaterialsSection";
import { IMaterial } from "@/types/course";

export default function MaterialsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { data, isLoading, error } = useGetCourseByIdQuery(courseId, {
    skip: !courseId,
  });

  const [updateProgram] = useUpdateCourseMutation();

  const program = data as any;
  const [materials, setMaterials] = useState<IMaterial[]>(program?.materials || []);
  const [isSaving, setIsSaving] = useState(false);

  // Debug: Log materials changes
  React.useEffect(() => {
    console.log("🔄 Materials state updated:", materials);
  }, [materials]);

  React.useEffect(() => {
    console.log("📥 Program data loaded:", program);
    if (program?.materials) {
      console.log("📚 Setting materials from program:", program.materials);
      // Ensure materials have url field for frontend compatibility
      const materialsWithUrl = program.materials.map((material: IMaterial) => ({
        ...material,
        url: material.url || material.fileUrl // Ensure url is set for frontend
      }));
    
      setMaterials(materialsWithUrl);
    } else {
      console.log("📭 No materials found in program data");
      setMaterials([]);
    }
  }, [program]);

  const handleSaveMaterials = async () => {
    console.log("🔄 handleSaveMaterials called");
    console.log("📊 Current materials state:", materials);
    console.log("🆔 Program ID:", courseId);

    if (materials.length === 0) {
      console.warn("⚠️ No materials to save");
      toast.error("Please add at least one material");
      return;
    }

    // Filter out temporary IDs and prepare materials for API
    const cleanMaterials: IMaterial[] = materials.map(material => {
      const { _id, url, ...materialData } = material;
      // Remove temporary IDs (those starting with 'temp-')
      if (_id && _id.startsWith('temp-')) {
        return {
          ...materialData,
          fileUrl: url, // Map 'url' to 'fileUrl' for backend compatibility
          title: materialData.title || '',
          type: materialData.type || 'video'
        } as IMaterial;
      }
      return {
        ...material,
        fileUrl: url || material.fileUrl, // Ensure fileUrl is set
        title: material.title || '',
        type: material.type || 'video'
      } as IMaterial;
    });

    console.log("🧹 Cleaned materials for API:", cleanMaterials);

    // Validate each material has required fields
    const validTypes: IMaterial['type'][] = ['pdf', 'video', 'doc', 'image', 'link', 'external-link'];
    for (const material of cleanMaterials) {
      if (!material.title || !material.fileUrl) {
        console.error("❌ Validation failed for material:", material);
        toast.error(`Material "${material.title || 'Untitled'}" is missing required fields`);
        return;
      }
      if (!material.type || !validTypes.includes(material.type as IMaterial['type'])) {
        console.error("❌ Validation failed - invalid type for material:", material);
        toast.error(`Material "${material.title}" has invalid type: ${material.type}`);
        return;
      }
    }

    console.log("✅ All materials validated successfully");

    setIsSaving(true);
    try {
      console.log("🚀 Calling updateProgram API...");
      console.log("📦 Payload being sent:", {
        id: courseId,
        materials: cleanMaterials
      });
      const result = await updateProgram({
        id: courseId,
        materials: cleanMaterials
      }).unwrap();

      console.log("✅ API call successful:", result);
      toast.success("Materials updated successfully!");

      // Optionally redirect back to program details
      // router.push(`/dashboard/manage-courses/${courseId}/details`);
    } catch (error: any) {
      console.error("❌ API call failed:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        data: error?.data,
        status: error?.status
      });
      toast.error(error?.data?.message || "Failed to update materials");
    } finally {
      console.log("🏁 Save operation completed");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading materials...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
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
          <div className="flex items-center gap-3 mb-2">
            <FileText size={24} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Materials
              </h1>
              <p className="text-gray-600">{program.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Materials Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AddMaterialsSection
            courseId={courseId}
            materials={materials}
            onMaterialsChange={setMaterials}
            readOnly={false}
          />
        </motion.div>

        {/* Save Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mt-6"
        >
          <button
            onClick={handleSaveMaterials}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
          >
            {isSaving ? (
              <>
                <Loader size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Materials
              </>
            )}
          </button>

          <Link
            href={`/dashboard/manage-courses/${courseId}/details`}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
