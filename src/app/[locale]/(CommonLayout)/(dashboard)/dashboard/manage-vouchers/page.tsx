"use client";

import React, { useState, useEffect } from 'react';
import {
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useUploadVoucherImageMutation,
  useGetGlobalVoucherSettingsQuery,
  useUpdateGlobalVoucherSettingsMutation,
  Voucher,
} from '@/app/redux/api/VoucherApi/voucherApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Save,
  Image as ImageIcon,
  Phone,
  MessageCircle,
  Tag,
  Settings,
} from 'lucide-react';

export default function VoucherManagementPage() {
  const { data: vouchersResponse, isLoading, error, refetch } = useGetVouchersQuery();
  const vouchers = vouchersResponse?.data || [];
  
  const { data: globalSettingsResponse, refetch: refetchSettings } = useGetGlobalVoucherSettingsQuery();
  const globalSettings = globalSettingsResponse?.data;
  
  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();
  const [uploadVoucherImage] = useUploadVoucherImageMutation();
  const [updateGlobalSettings] = useUpdateGlobalVoucherSettingsMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    instructionTitle: '',
    instructionDetails: '',
    contactPhoneNumber: '',
    prefilledMessage: '',
    imageUrl: '',
    price: 0,
    isActive: true,
    order: 0,
  });
  
  const [globalFormData, setGlobalFormData] = useState({
    defaultPhoneNumber: '',
    defaultPrefilledMessage: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update global form when data loads
  useEffect(() => {
    if (globalSettings) {
      setGlobalFormData({
        defaultPhoneNumber: globalSettings.defaultPhoneNumber || '',
        defaultPrefilledMessage: globalSettings.defaultPrefilledMessage || '',
      });
    }
  }, [globalSettings]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const result = await uploadVoucherImage(formDataUpload).unwrap();
      setFormData(prev => ({ ...prev, imageUrl: result.data.imagePath }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      handleFileUpload(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      instructionTitle: '',
      instructionDetails: '',
      contactPhoneNumber: '',
      prefilledMessage: '',
      imageUrl: '',
      price: 0,
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
    if (!formData.name.trim()) {
      toast.error('Please enter voucher name');
      return;
    }
    if (!formData.instructionTitle.trim()) {
      toast.error('Please enter instruction title');
      return;
    }
    if (!formData.instructionDetails.trim()) {
      toast.error('Please enter instruction details');
      return;
    }

    if (selectedFile && isUploading) {
      toast.error('Please wait for the image upload to complete');
      return;
    }

    try {
      await createVoucher({
        ...formData,
        price: formData.price || undefined,
        contactPhoneNumber: formData.contactPhoneNumber || undefined,
        prefilledMessage: formData.prefilledMessage || undefined,
      }).unwrap();
      toast.success('Voucher created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to create voucher');
      console.error('Create voucher error:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedVoucher) return;

    if (selectedFile && isUploading) {
      toast.error('Please wait for the image upload to complete');
      return;
    }

    try {
      await updateVoucher({
        id: selectedVoucher._id,
        ...formData,
        price: formData.price || undefined,
        contactPhoneNumber: formData.contactPhoneNumber || undefined,
        prefilledMessage: formData.prefilledMessage || undefined,
      }).unwrap();
      toast.success('Voucher updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to update voucher');
      console.error('Update voucher error:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;

    try {
      await deleteVoucher(selectedVoucher._id).unwrap();
      toast.success('Voucher deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedVoucher(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete voucher');
      console.error('Delete voucher error:', error);
    }
  };

  const handleSaveGlobalSettings = async () => {
    if (!globalFormData.defaultPhoneNumber.trim()) {
      toast.error('Please enter default phone number');
      return;
    }
    if (!globalFormData.defaultPrefilledMessage.trim()) {
      toast.error('Please enter default message');
      return;
    }

    try {
      await updateGlobalSettings(globalFormData).unwrap();
      toast.success('Global settings saved successfully');
      setIsSettingsDialogOpen(false);
      refetchSettings();
    } catch (error) {
      toast.error('Failed to save global settings');
      console.error('Save global settings error:', error);
    }
  };

  const openEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      name: voucher.name || '',
      instructionTitle: voucher.instructionTitle || '',
      instructionDetails: voucher.instructionDetails || '',
      contactPhoneNumber: voucher.contactPhoneNumber || '',
      prefilledMessage: voucher.prefilledMessage || '',
      imageUrl: voucher.imageUrl || '',
      price: voucher.price || 0,
      isActive: voucher.isActive ?? true,
      order: voucher.order ?? 0,
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteDialogOpen(true);
  };

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">Loading vouchers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Vouchers</h3>
          <p className="text-gray-600">Something went wrong. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">🎟️ Voucher Management</h1>
            <p className="text-blue-100">Create and manage certification vouchers with WhatsApp integration</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsSettingsDialogOpen(true)}
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Global Settings
            </Button>
            <Button
              onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Voucher
            </Button>
          </div>
        </div>
      </div>

      {/* Global Settings Info */}
      {globalSettings && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900">Default WhatsApp Settings</h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Phone:</strong> {globalSettings.defaultPhoneNumber} | 
                <strong className="ml-2">Message:</strong> {globalSettings.defaultPrefilledMessage.substring(0, 50)}...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                These will be used for vouchers without custom WhatsApp settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vouchers.length}</p>
              <p className="text-sm text-gray-500">Total Vouchers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vouchers.filter(v => v.isActive).length}</p>
              <p className="text-sm text-gray-500">Active Vouchers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{vouchers.filter(v => !v.isActive).length}</p>
              <p className="text-sm text-gray-500">Inactive Vouchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vouchers Grid */}
      {vouchers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vouchers Found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first voucher product</p>
          <Button 
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Voucher
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vouchers.map((voucher) => (
            <div 
              key={voucher._id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {voucher.imageUrl ? (
                  <img
                    src={getImageUrl(voucher.imageUrl)}
                    alt={voucher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={voucher.isActive ? 'default' : 'secondary'}
                    className={voucher.isActive ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {voucher.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {voucher.price && voucher.price > 0 && (
                  <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                    ৳{voucher.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{voucher.name}</h3>
                <p className="text-xs text-gray-400 mb-2">/{voucher.slug}</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-1">{voucher.instructionTitle}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  <span>{voucher.contactPhoneNumber || 'Using global settings'}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <span>Created: {format(new Date(voucher.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(voucher)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteDialog(voucher)}
                    className="hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              ⚙️ Global WhatsApp Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <p>These settings will be used as defaults for all vouchers that don&apos;t have custom WhatsApp settings.</p>
            </div>

            <div>
              <Label htmlFor="defaultPhoneNumber" className="text-sm font-medium">Default WhatsApp Phone Number *</Label>
              <Input
                id="defaultPhoneNumber"
                value={globalFormData.defaultPhoneNumber}
                onChange={(e) => setGlobalFormData({ ...globalFormData, defaultPhoneNumber: e.target.value })}
                placeholder="+8801XXXXXXXXX"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +880 for Bangladesh)</p>
            </div>

            <div>
              <Label htmlFor="defaultPrefilledMessage" className="text-sm font-medium">Default Pre-filled Message *</Label>
              <textarea
                id="defaultPrefilledMessage"
                value={globalFormData.defaultPrefilledMessage}
                onChange={(e) => setGlobalFormData({ ...globalFormData, defaultPrefilledMessage: e.target.value })}
                placeholder="Hello, I am interested in purchasing a certification voucher..."
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Use {'{voucherName}'} to include the voucher name in the message</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={() => setIsSettingsDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveGlobalSettings} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isEditDialogOpen ? '✏️ Edit Voucher' : '🎟️ Create New Voucher'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Voucher Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., CSWA Certification Voucher"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Slug will be auto-generated from name</p>
                </div>

                <div>
                  <Label htmlFor="price" className="text-sm font-medium">Price (BDT)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="2500"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructionTitle" className="text-sm font-medium">Instruction Title *</Label>
                <Input
                  id="instructionTitle"
                  value={formData.instructionTitle}
                  onChange={(e) => setFormData({ ...formData, instructionTitle: e.target.value })}
                  placeholder="e.g., How to Use This Voucher"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="instructionDetails" className="text-sm font-medium">Instruction Details *</Label>
                <textarea
                  id="instructionDetails"
                  value={formData.instructionDetails}
                  onChange={(e) => setFormData({ ...formData, instructionDetails: e.target.value })}
                  placeholder="Enter detailed instructions, terms and conditions..."
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* WhatsApp Section - Optional Override */}
            <div className="bg-green-50 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                WhatsApp Settings (Optional)
              </h3>
              <p className="text-sm text-gray-600 -mt-2">Leave empty to use global settings</p>

              <div>
                <Label htmlFor="contactPhoneNumber" className="text-sm font-medium">Custom WhatsApp Phone</Label>
                <Input
                  id="contactPhoneNumber"
                  value={formData.contactPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, contactPhoneNumber: e.target.value })}
                  placeholder="Leave empty for global default"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="prefilledMessage" className="text-sm font-medium">Custom Pre-filled Message</Label>
                <textarea
                  id="prefilledMessage"
                  value={formData.prefilledMessage}
                  onChange={(e) => setFormData({ ...formData, prefilledMessage: e.target.value })}
                  placeholder="Leave empty for global default"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Image Section */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Voucher Image
              </h3>

              <div>
                <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="Enter image URL or upload below"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 hover:bg-blue-100/50 transition-colors">
                    <Upload className="w-8 h-8 text-blue-500" />
                    <div className="text-center">
                      <span className="text-sm font-medium text-blue-600">
                        {isUploading ? 'Uploading...' : 'Click to upload image'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
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
                  <div className="mt-3 flex items-center gap-2 bg-white px-3 py-2 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 flex-1">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                          setPreviewUrl(null);
                        }
                      }}
                      disabled={isUploading}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>

              {(previewUrl || formData.imageUrl) && (
                <div className="mt-3">
                  <Label className="text-sm font-medium">Preview</Label>
                  <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <img
                      src={previewUrl || getImageUrl(formData.imageUrl)}
                      alt="Voucher preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order" className="text-sm font-medium">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                    Active (Visible to public)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
              variant="outline"
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={isEditDialogOpen ? handleEdit : handleCreate} 
              disabled={isUploading}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : isEditDialogOpen ? 'Update Voucher' : 'Create Voucher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              ⚠️ Delete Voucher
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{selectedVoucher?.name}</strong>?
            </p>
            <p className="text-sm text-red-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
