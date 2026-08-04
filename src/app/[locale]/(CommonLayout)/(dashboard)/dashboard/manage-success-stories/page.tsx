"use client";

import React, { useState } from 'react';
import {
  useGetAllSuccessStoriesQuery,
  useUpdateSuccessStoryMutation,
  useDeleteSuccessStoryMutation,
  TSuccessStory,
} from '@/app/redux/api/successStoryApi/successStoryApi';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Edit,
  Trash2,
  Save,
  User,
  Eye,
  EyeOff,
  Star,
  Globe,
  Briefcase,
  FileText,
  Upload,
  Video,
  Play,
  Film,
} from 'lucide-react';
import { SuccessStoryVideoModal } from '@/app/[locale]/(CommonLayout)/(home)/Landing-page/SuccessStories/SuccessStories';

export default function ManageSuccessStoriesPage() {
  const { data: storiesResponse, isLoading, error, refetch } = useGetAllSuccessStoriesQuery();
  const stories = storiesResponse?.data || [];

  const [updateStory] = useUpdateSuccessStoryMutation();
  const [deleteStory] = useDeleteSuccessStoryMutation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<TSuccessStory | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    image: '',
    country: '',
    profession: '',
    story: '',
    rating: 5,
    videoUrl: '',
    date: '',
    isApproved: false,
    order: 0,
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoInputMode, setVideoInputMode] = useState<'file' | 'url'>('file');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataObj = new FormData();
    formDataObj.append('image', file);

    setIsUploadingPhoto(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const response = await fetch(`${apiBaseUrl}/success-stories/upload-image`, {
        method: "POST",
        body: formDataObj,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error("Upload failed");

      const responseData = await response.json();
      const imageUrl = responseData?.data?.imageUrl;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Image uploaded successfully");
    } catch (err) {
      toast.error("Image upload failed");
      console.error(err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file must be less than 100MB");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('video', file);

    setIsUploadingVideo(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const response = await fetch(`${apiBaseUrl}/success-stories/upload-video`, {
        method: "POST",
        body: formDataObj,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error("Video upload failed");

      const responseData = await response.json();
      const videoUrl = responseData?.data?.videoUrl;

      setFormData((prev) => ({ ...prev, videoUrl }));
      toast.success("Video uploaded successfully");
    } catch (err) {
      toast.error("Video upload failed");
      console.error(err);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedStory?._id) return;

    if (!formData.fullName.trim() || !formData.country.trim() || !formData.profession.trim() || !formData.story.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateStory({
        id: selectedStory._id,
        data: formData,
      }).unwrap();
      toast.success('Success story updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to update success story');
      console.error('Update success story error:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedStory?._id) return;

    try {
      await deleteStory(selectedStory._id).unwrap();
      toast.success('Success story deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedStory(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete success story');
      console.error('Delete success story error:', err);
    }
  };

  const handleToggleApproval = async (story: TSuccessStory) => {
    if (!story._id) return;

    try {
      await updateStory({
        id: story._id,
        data: { isApproved: !story.isApproved },
      }).unwrap();
      toast.success(`Story ${!story.isApproved ? 'Approved' : 'Unapproved'} successfully`);
      refetch();
    } catch (err) {
      toast.error('Failed to toggle approval status');
      console.error('Toggle approval error:', err);
    }
  };

  const openEditDialog = (story: TSuccessStory) => {
    setSelectedStory(story);
    setFormData({
      fullName: story.fullName || '',
      image: story.image || '',
      country: story.country || '',
      profession: story.profession || '',
      story: story.story || '',
      rating: story.rating ?? 5,
      videoUrl: story.videoUrl || '',
      date: story.date || '',
      isApproved: story.isApproved ?? false,
      order: story.order ?? 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (story: TSuccessStory) => {
    setSelectedStory(story);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-slate-600 font-medium">Loading success stories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-red-600 font-medium">Error loading success stories</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Success Stories & Video Reviews</h1>
          <p className="text-gray-600 mt-1">Review, approve, edit, watch videos, or delete candidate success stories submitted from the landing page.</p>
        </div>
      </div>

      {/* Stories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Video Review</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Story Text</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stories.map((story: TSuccessStory) => (
              <tr key={story._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {story.image ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.immigrantjobsworld.com'}${story.image}`}
                        alt={story.fullName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = story.image || '';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{story.fullName}</div>
                      <div className="text-xs text-gray-500">{story.profession}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-500" /> {story.country}</span>
                    <span className="text-gray-400">Order: {story.order}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {story.videoUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewVideoUrl(story.videoUrl!)}
                      className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 flex items-center gap-1.5 font-semibold text-xs rounded-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-blue-700" /> Watch Video
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">No video</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 line-clamp-2 max-w-sm italic">
                    "{story.story}"
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: story.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={story.isApproved ? 'default' : 'secondary'} className={story.isApproved ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}>
                    {story.isApproved ? 'Approved' : 'Pending Review'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {story.date || (story.createdAt ? format(new Date(story.createdAt), 'yyyy-MM-dd') : '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleApproval(story)}
                      title={story.isApproved ? 'Reject / Hide' : 'Approve / Show'}
                      className={story.isApproved ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}
                    >
                      {story.isApproved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(story)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(story)}
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

      {stories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No success stories found</h3>
          <p className="text-gray-500">When users submit success stories on the landing page, they will show up here.</p>
        </div>
      )}

      {/* Edit Story Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Success Story & Video</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="profession">Profession / Company</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  placeholder="e.g. Senior Technician | Company Name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g. Saudi Arabia"
                />
              </div>
              <div>
                <Label htmlFor="date">Badge Date / Text</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="e.g. ২০২৪ সফল প্রার্থী or 2026-05-26"
                />
              </div>
            </div>

            <div>
              <Label>Candidate Photo</Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.immigrantjobsworld.com'}${formData.image}`}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = formData.image;
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-gray-200 flex items-center justify-center text-slate-400">
                    No Photo
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="imageFile" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 transition-colors">
                    <Upload className="w-4 h-4" /> {isUploadingPhoto ? 'Uploading...' : 'Upload Image'}
                  </Label>
                </div>
              </div>
            </div>

            {/* Video Review Input */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" /> Video Review File or YouTube Link
                </Label>
                <div className="flex gap-1 text-xs bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setVideoInputMode("file")}
                    className={`px-2 py-0.5 rounded transition-colors ${videoInputMode === "file" ? "bg-white text-blue-700 font-bold shadow-xs" : "text-slate-500"}`}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoInputMode("url")}
                    className={`px-2 py-0.5 rounded transition-colors ${videoInputMode === "url" ? "bg-white text-blue-700 font-bold shadow-xs" : "text-slate-500"}`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {videoInputMode === "file" ? (
                <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      id="adminVideoFile"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <Label htmlFor="adminVideoFile" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      {isUploadingVideo ? "Uploading Video..." : "Upload Video File"}
                    </Label>
                    {formData.videoUrl && (
                      <p className="text-xs text-emerald-600 font-semibold truncate mt-1">
                        Video Path: {formData.videoUrl}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <Input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="h-10 text-sm border-gray-300 rounded-md"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="story">Success Story / Experience</Label>
              <textarea
                id="story"
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="Enter success story..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating (1-5 Stars)</Label>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isApproved"
                checked={formData.isApproved}
                onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="isApproved" className="font-semibold text-slate-700">Approve this story (Visible on landing page)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={isUploadingPhoto || isUploadingVideo}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Success Story</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this success story? This action cannot be undone and will permanently remove it from the system.
          </p>
          <DialogFooter className="mt-4">
            <Button onClick={() => setIsDeleteDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Preview Modal for Admin */}
      <SuccessStoryVideoModal
        isOpen={!!previewVideoUrl}
        onClose={() => setPreviewVideoUrl(null)}
        videoUrl={previewVideoUrl || ""}
      />
    </div>
  );
}

