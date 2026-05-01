"use client";

import React, { useState, useEffect } from 'react';
import {
  useGetAllCategoriesAdminQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryPhotoMutation,
  useToggleCategoryStatusMutation,
} from '@/app/redux/api/CategoryApi/CategoryApi';
import { ICategory, ICategoryFormData, defaultCategoryFormData, CATEGORY_ICONS, CATEGORY_COLORS } from '@/types/category';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import AppImage from '@/components/ui/AppImage';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  Image as ImageIcon,
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Move,
  Layers,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  GripVertical,
} from 'lucide-react';

export default function CategoryManagementPage() {
  // API Hooks - Use Admin endpoint to get ALL categories (including inactive)
  const { data: hierarchyData, isLoading, error, refetch } = useGetAllCategoriesAdminQuery();
  const categories = hierarchyData?.data || [];
  
  // Debug logging
  console.log('🔍 Debug Info:', {
    hierarchyData,
    categories,
    categoriesLength: categories.length,
    isLoading,
    error
  });
  
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [uploadCategoryPhoto, { isLoading: isUploading }] = useUploadCategoryPhotoMutation();
  const [toggleCategoryStatus] = useToggleCategoryStatusMutation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState<ICategoryFormData>(defaultCategoryFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Expand all by default
  useEffect(() => {
    if (categories.length > 0) {
      setExpandedCategories(new Set(categories.map(c => c._id)));
    }
  }, [categories]);

  // Reset form
  const resetForm = () => {
    setFormData(defaultCategoryFormData);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  // Open create dialog
  const openCreateDialog = (parentId?: string) => {
    resetForm();
    if (parentId) {
      const parent = categories.find(c => c._id === parentId);
      setFormData({
        ...defaultCategoryFormData,
        parentId,
        level: 1,
      });
    }
    setIsCreateDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category: ICategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      shortName: category.shortName || '',
      description: category.description || '',
      photoUrl: category.photoUrl || '',
      icon: category.icon || '',
      color: category.color || '#9333ea',
      parentId: category.parentId || null,
      level: category.level,
      order: category.order || 0,
      isActive: category.isActive,
    });
    if (category.photoUrl) {
      setPreviewUrl(category.photoUrl);
    }
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category: ICategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter category name');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Please enter category slug');
      return;
    }

    try {
      const result = await createCategory({
        name: formData.name,
        slug: formData.slug,
        shortName: formData.shortName || undefined,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
        parentId: formData.parentId || undefined,
        order: formData.order,
        isActive: formData.isActive,
      }).unwrap();

      // Upload photo if selected
      if (selectedFile && result.data?._id) {
        try {
          await uploadCategoryPhoto({
            id: result.data._id,
            file: selectedFile,
          }).unwrap();
        } catch (uploadError) {
          toast.error('Category created but failed to upload photo');
        }
      }

      toast.success('Category created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create category');
      console.error('Create category error:', error);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    if (!selectedCategory) return;

    if (!formData.name.trim()) {
      toast.error('Please enter category name');
      return;
    }

    try {
      await updateCategory({
        id: selectedCategory._id,
        data: {
          name: formData.name,
          slug: formData.slug,
          shortName: formData.shortName || undefined,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
          parentId: formData.parentId || undefined,
          order: formData.order,
          isActive: formData.isActive,
        },
      }).unwrap();

      // Upload photo if selected
      if (selectedFile) {
        try {
          await uploadCategoryPhoto({
            id: selectedCategory._id,
            file: selectedFile,
          }).unwrap();
        } catch (uploadError) {
          toast.error('Category updated but failed to upload photo');
        }
      }

      toast.success('Category updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update category');
      console.error('Update category error:', error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await deleteCategory(selectedCategory._id).unwrap();
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete category');
       console.log('Deleting ID:', selectedCategory._id);
       console.log('Full error:', JSON.stringify(error, null, 2));
      console.error('Delete category error:', error);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (category: ICategory) => {
    try {
      await toggleCategoryStatus({
        id: category._id,
        isActive: !category.isActive,
      }).unwrap();
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to toggle category status');
    }
  };

  // Render category row
  const renderCategoryRow = (category: ICategory, isSubCategory = false) => {
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
      <React.Fragment key={category._id}>
        <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!category.isActive ? 'opacity-60' : ''}`}>
          {/* Expand/Name */}
          <td className="px-4 py-3">
            <div className={`flex items-center gap-2 ${isSubCategory ? 'pl-8' : ''}`}>
              {!isSubCategory && hasSubCategories ? (
                <button
                  onClick={() => toggleExpand(category._id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              
              {/* Icon/Photo */}
              {category.photoUrl ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                  <AppImage
                    photoUrl={category.photoUrl}
                    alt={category.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : category.icon ? (
                <span className="text-xl">{category.icon}</span>
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: category.color || '#9333ea' + '20' }}
                >
                  {isSubCategory ? (
                    <Folder className="w-4 h-4" style={{ color: category.color || '#9333ea' }} />
                  ) : (
                    <FolderOpen className="w-4 h-4" style={{ color: category.color || '#9333ea' }} />
                  )}
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{category.name}</span>
                {category.shortName && category.shortName !== category.name && (
                  <span className="text-xs text-gray-500">({category.shortName})</span>
                )}
              </div>
            </div>
          </td>

          {/* Slug */}
          <td className="px-4 py-3">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
              {category.slug}
            </code>
          </td>

          {/* Level Badge */}
          <td className="px-4 py-3">
            <Badge className={category.level === 0 ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
              {category.level === 0 ? 'Category' : 'Sub-Category'}
            </Badge>
          </td>

          {/* Course Count */}
          <td className="px-4 py-3 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
              {category.courseCount || 0}
            </span>
          </td>

          {/* Status */}
          <td className="px-4 py-3">
            <button
              onClick={() => handleToggleStatus(category)}
              className="flex items-center gap-1.5"
            >
              {category.isActive ? (
                <>
                  <ToggleRight className="w-5 h-5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium">Inactive</span>
                </>
              )}
            </button>
          </td>

          {/* Actions */}
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              {!isSubCategory && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openCreateDialog(category._id)}
                  title="Add Sub-Category"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openEditDialog(category)}
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDeleteDialog(category)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </td>
        </tr>

        {/* Sub-categories */}
        {hasSubCategories && isExpanded && (
          category.subCategories?.map(subCategory => renderCategoryRow(subCategory, true))
        )}
      </React.Fragment>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
        <p className="text-lg font-medium">Failed to load categories</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-7 h-7 text-purple-600" />
            Category Management
          </h1>
          <p className="text-gray-600 mt-1">
            Organize your courses with categories and sub-categories
          </p>
        </div>
        <Button
          onClick={() => openCreateDialog()}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              <p className="text-sm text-gray-500">Main Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((acc, c) => acc + (c.subCategories?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Sub-Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.isActive).length + 
                  categories.reduce((acc, c) => acc + (c.subCategories?.filter(s => s.isActive)?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">Active Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">No categories yet</p>
                      <Button onClick={() => openCreateDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Category
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map(category => renderCategoryRow(category))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditDialogOpen ? (
                <>
                  <Edit className="w-5 h-5 text-purple-600" />
                  Edit {formData.level === 0 ? 'Category' : 'Sub-Category'}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-purple-600" />
                  Create {formData.level === 0 ? 'Category' : 'Sub-Category'}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Parent Category (for sub-categories) */}
            {formData.parentId && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Creating sub-category under: <strong>{categories.find(c => c._id === formData.parentId)?.name}</strong>
                </p>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Civil Engineering"
              />
            </div>

            {/* Short Name */}
            <div className="space-y-2">
              <Label htmlFor="shortName">Short Name</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                placeholder="e.g., Civil (optional)"
              />
              <p className="text-xs text-gray-500">Used in tabs and compact displays</p>
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="civil-engineering"
              />
              <p className="text-xs text-gray-500">URL-friendly identifier (auto-generated from name)</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this category..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
            </div>

            {/* Icon Selector */}
            <div className="space-y-2">
              <Label>Icon (Emoji)</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                      formData.icon === icon
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs text-gray-500 transition-all ${
                    !formData.icon
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  None
                </button>
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? 'border-gray-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Category Photo</Label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                  {previewUrl ? (
                    <img
                      src={previewUrl.startsWith('blob:') ? previewUrl : previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                
                {/* Upload Button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700">
                      <Upload className="w-4 h-4" />
                      {previewUrl ? 'Change Photo' : 'Upload Photo'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Max 2MB. JPG, PNG, WebP, AVIF
                  </p>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(previewUrl);
                        }
                        setPreviewUrl(null);
                        setFormData(prev => ({ ...prev, photoUrl: '' }));
                      }}
                      className="text-xs text-red-600 hover:text-red-700 mt-1"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                min={0}
              />
              <p className="text-xs text-gray-500">Lower numbers appear first</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label>Active Status</Label>
                <p className="text-xs text-gray-500">Inactive categories won't be shown to users</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className="flex items-center gap-2"
              >
                {formData.isActive ? (
                  <ToggleRight className="w-10 h-10 text-green-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isEditDialogOpen ? handleUpdate : handleCreate}
              disabled={isCreating || isUpdating || isUploading}
              className="min-w-[100px]"
            >
              {(isCreating || isUpdating || isUploading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditDialogOpen ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Category
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?
            </p>
            {selectedCategory?.subCategories && selectedCategory.subCategories.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ This category has {selectedCategory.subCategories.length} sub-categories. 
                  Please delete them first.
                </p>
              </div>
            )}
            {selectedCategory?.courseCount && selectedCategory.courseCount > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ This category has {selectedCategory.courseCount} courses assigned. 
                  Please reassign them first.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || 
                Boolean(selectedCategory?.subCategories && selectedCategory.subCategories.length > 0) ||
                Boolean(selectedCategory?.courseCount && selectedCategory.courseCount > 0)}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
