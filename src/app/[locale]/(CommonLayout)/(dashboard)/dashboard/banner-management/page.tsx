"use client";

import React, { useState } from "react";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} from "@/app/redux/api/BannerApi/BannerApi";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Save,
  Image as ImageIcon,
} from "lucide-react";

interface Banner {
  _id: string;
  title?: string;
  imageUrl: string;
  altText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function BannerManagementPage() {
  const {
    data: bannersResponse,
    isLoading,
    error,
    refetch,
  } = useGetBannersQuery();
  const banners = bannersResponse?.data || [];
  console.log("Banners query result:", { bannersResponse, isLoading, error });
  console.log("Banners array:", banners);
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [uploadBannerImage] = useUploadBannerImageMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    altText: "",
    isActive: true,
    order: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    console.log("Starting file upload for:", file.name);
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      console.log("Sending upload request...");
      const result = await uploadBannerImage(formDataUpload).unwrap();
      console.log("Upload result:", result);
      setFormData((prev) => {
        console.log("Setting imageUrl to:", result.data.imagePath);
        return { ...prev, imageUrl: result.data.imagePath };
      });
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, "size:", file.size);
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      handleFileUpload(file);
    }
  };

  const resetForm = () => {
    console.log("Resetting form");
    setFormData({
      title: "",
      imageUrl: "",
      altText: "",
      isActive: true,
      order: 0,
    });
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleCreate = async () => {
    console.log("Handle create called, formData:", formData);
    // Validate that an image URL is provided
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      console.log("Validation failed: no imageUrl");
      toast.error("Please provide an image URL");
      return;
    }

    // If a file is selected but still uploading, prevent submission
    if (selectedFile && isUploading) {
      console.log("Validation failed: still uploading");
      toast.error(
        "Please wait for the image upload to complete before creating the banner",
      );
      return;
    }

    console.log("Validation passed, creating banner...");
    try {
      await createBanner(formData).unwrap();
      toast.success("Banner created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
      console.log("Refetching banners after creation...");
      refetch();
    } catch (error) {
      toast.error("Failed to create banner");
      console.error("Create banner error:", error);
    }
  };

  const handleEdit = async () => {
    if (!selectedBanner) return;

    // Validate that an image URL is provided
    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      toast.error("Please provide an image URL");
      return;
    }

    // If a file is selected but still uploading, prevent submission
    if (selectedFile && isUploading) {
      toast.error(
        "Please wait for the image upload to complete before updating the banner",
      );
      return;
    }

    try {
      await updateBanner({
        id: selectedBanner._id,
        ...formData,
      }).unwrap();
      toast.success("Banner updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to update banner");
      console.error("Update banner error:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;

    try {
      await deleteBanner(selectedBanner._id).unwrap();
      toast.success("Banner deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedBanner(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete banner");
      console.error("Delete banner error:", error);
    }
  };

  const openEditDialog = (banner: Banner) => {
    console.log("Opening edit dialog for banner:", banner);
    setSelectedBanner(banner);
    setFormData({
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      altText: banner.altText || "",
      isActive: banner.isActive ?? true,
      order: banner.order ?? 0,
    });
    setSelectedFile(null); // Reset file selection for edit
    setPreviewUrl(null); // Reset preview URL for edit
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading banners...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-red-600">
          Error loading banners: {JSON.stringify(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Banner Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your website banners</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alt Text
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <img
                    src={
                      banner.imageUrl && banner.imageUrl.startsWith("http")
                        ? banner.imageUrl
                        : `https://api.immigrantjobsworld.com/${banner.imageUrl || ""}`
                    }
                    alt={banner.altText || banner.title || "Banner"}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {banner.title || "Untitled Banner"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {banner.altText || "No alt text"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{banner.order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={banner.isActive ? "default" : "secondary"}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(banner.createdAt), "MMM dd, yyyy")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(banner)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(banner)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No banners found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first banner
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>
      )}

      {/* Create Banner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter banner title"
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Enter image URL or upload a file"
                required={!selectedFile}
              />
              <div className="mt-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm text-gray-600">
                      {isUploading ? "Uploading..." : "Click to upload image"}
                    </span>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </Label>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }
                      }}
                      disabled={isUploading}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              {(previewUrl || formData.imageUrl) && (
                <div className="mt-2">
                  <Label>Preview</Label>
                  <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={
                        previewUrl ||
                        (formData.imageUrl &&
                        formData.imageUrl.startsWith("http")
                          ? formData.imageUrl
                          : `https://api.immigrantjobsworld.com/${formData.imageUrl || ""}`)
                      }
                      alt="Banner preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="altText">Alt Text (Optional)</Label>
              <Input
                id="altText"
                value={formData.altText}
                onChange={(e) =>
                  setFormData({ ...formData, altText: e.target.value })
                }
                placeholder="Enter alt text for accessibility"
              />
            </div>

            <div>
              <Label htmlFor="order">Order (Optional)</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <Label htmlFor="isActive">Active (Optional)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsCreateDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title (Optional)</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter banner title"
              />
            </div>

            <div>
              <Label htmlFor="edit-imageUrl">Image URL *</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Enter image URL or upload a file"
                required={!selectedFile}
              />
              <div className="mt-2">
                <Label htmlFor="edit-file-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 p-2 border border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm text-gray-600">
                      {isUploading ? "Uploading..." : "Click to upload image"}
                    </span>
                  </div>
                  <input
                    id="edit-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </Label>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }
                      }}
                      disabled={isUploading}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
              {(previewUrl || formData.imageUrl) && (
                <div className="mt-2">
                  <Label>Preview</Label>
                  <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={
                        previewUrl ||
                        (formData.imageUrl &&
                        formData.imageUrl.startsWith("http")
                          ? formData.imageUrl
                          : `https://api.immigrantjobsworld.com/${formData.imageUrl || ""}`)
                      }
                      alt="Banner preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.png"; // Fallback image
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-altText">Alt Text (Optional)</Label>
              <Input
                id="edit-altText"
                value={formData.altText}
                onChange={(e) =>
                  setFormData({ ...formData, altText: e.target.value })
                }
                placeholder="Enter alt text for accessibility"
              />
            </div>

            <div>
              <Label htmlFor="edit-order">Order (Optional)</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <Label htmlFor="edit-isActive">Active (Optional)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isUploading}>
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Update Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this banner? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
