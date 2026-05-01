"use client";

import React, { useState } from 'react';
import {
  useGetAllStudentReviewsQuery,
  useCreateStudentReviewMutation,
  useUpdateStudentReviewMutation,
  useDeleteStudentReviewMutation,
  useToggleStudentReviewVisibilityMutation,
} from '@/app/redux/api/studentReviewApi/studentReviewApi';
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
  Save,
  MessageSquare,
  Video,
  User,
  Eye,
  EyeOff,
  Play,
} from 'lucide-react';

interface StudentReview {
  _id: string;
  studentName?: string;
  studentPhoto?: string;
  designation?: string;
  reviewText?: string;
  youtubeUrl?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Extract YouTube video ID for thumbnail
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getYouTubeThumbnail = (url: string): string => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
};

export default function ManageReviewPage() {
  const { data: reviewsResponse, isLoading, error, refetch } = useGetAllStudentReviewsQuery();
  const reviews = reviewsResponse?.data || [];
  
  const [createReview] = useCreateStudentReviewMutation();
  const [updateReview] = useUpdateStudentReviewMutation();
  const [deleteReview] = useDeleteStudentReviewMutation();
  const [toggleVisibility] = useToggleStudentReviewVisibilityMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<StudentReview | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    studentPhoto: '',
    designation: '',
    reviewText: '',
    youtubeUrl: '',
    isActive: true,
    order: 0,
  });

  const resetForm = () => {
    setFormData({
      studentName: '',
      studentPhoto: '',
      designation: '',
      reviewText: '',
      youtubeUrl: '',
      isActive: true,
      order: 0,
    });
  };

  const handleCreate = async () => {
    // Validate - at least reviewText or youtubeUrl required
    if (!formData.reviewText?.trim() && !formData.youtubeUrl?.trim()) {
      toast.error('Please provide either review text or a YouTube URL');
      return;
    }

    try {
      await createReview(formData).unwrap();
      toast.success('Review created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to create review');
      console.error('Create review error:', error);
    }
  };

  const handleEdit = async () => {
    if (!selectedReview) return;

    // Validate - at least reviewText or youtubeUrl required
    if (!formData.reviewText?.trim() && !formData.youtubeUrl?.trim()) {
      toast.error('Please provide either review text or a YouTube URL');
      return;
    }

    try {
      await updateReview({
        id: selectedReview._id,
        data: formData,
      }).unwrap();
      toast.success('Review updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Failed to update review');
      console.error('Update review error:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      await deleteReview(selectedReview._id).unwrap();
      toast.success('Review deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedReview(null);
      refetch();
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Delete review error:', error);
    }
  };

  const handleToggleVisibility = async (review: StudentReview) => {
    try {
      await toggleVisibility(review._id).unwrap();
      toast.success(`Review ${review.isActive ? 'hidden' : 'shown'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to toggle visibility');
      console.error('Toggle visibility error:', error);
    }
  };

  const openEditDialog = (review: StudentReview) => {
    setSelectedReview(review);
    setFormData({
      studentName: review.studentName || '',
      studentPhoto: review.studentPhoto || '',
      designation: review.designation || '',
      reviewText: review.reviewText || '',
      youtubeUrl: review.youtubeUrl || '',
      isActive: review.isActive ?? true,
      order: review.order ?? 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (review: StudentReview) => {
    setSelectedReview(review);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-red-600">Error loading reviews</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Student Reviews</h1>
          <p className="text-gray-600 mt-1">Manage testimonials and video reviews for the home page</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </Button>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
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
            {reviews.map((review: StudentReview) => (
              <tr key={review._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {review.youtubeUrl ? (
                    <div className="relative w-20 h-14 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={getYouTubeThumbnail(review.youtubeUrl)}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white" fill="white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-14 bg-gray-100 rounded flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {review.studentPhoto ? (
                      <img
                        src={review.studentPhoto}
                        alt={review.studentName || 'Student'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {review.studentName || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {review.designation || 'No designation'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {review.youtubeUrl && (
                      <Badge variant="outline" className="w-fit text-xs">
                        <Video className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    )}
                    {review.reviewText && (
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                        "{review.reviewText}"
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{review.order}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={review.isActive ? 'default' : 'secondary'}>
                    {review.isActive ? 'Active' : 'Hidden'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleVisibility(review)}
                      title={review.isActive ? 'Hide' : 'Show'}
                    >
                      {review.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(review)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(review)}
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

      {reviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first student review</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
      )}

      {/* Create Review Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name (Optional)</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation (Optional)</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Web Developer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="studentPhoto">Student Photo URL (Optional)</Label>
              <Input
                id="studentPhoto"
                value={formData.studentPhoto}
                onChange={(e) => setFormData({ ...formData, studentPhoto: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <Label htmlFor="youtubeUrl">YouTube Video URL (Optional)</Label>
              <Input
                id="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {formData.youtubeUrl && getYouTubeVideoId(formData.youtubeUrl) && (
                <div className="mt-2">
                  <img
                    src={getYouTubeThumbnail(formData.youtubeUrl)}
                    alt="Video preview"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="reviewText">Review Text (Optional)</Label>
              <textarea
                id="reviewText"
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                placeholder="Enter the review text..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">Active (Visible on home page)</Label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
              <strong>Note:</strong> At least a YouTube URL or Review Text is required.
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsCreateDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Save className="w-4 h-4 mr-2" />
              Create Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-studentName">Student Name (Optional)</Label>
                <Input
                  id="edit-studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="edit-designation">Designation (Optional)</Label>
                <Input
                  id="edit-designation"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Web Developer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-studentPhoto">Student Photo URL (Optional)</Label>
              <Input
                id="edit-studentPhoto"
                value={formData.studentPhoto}
                onChange={(e) => setFormData({ ...formData, studentPhoto: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>

            <div>
              <Label htmlFor="edit-youtubeUrl">YouTube Video URL (Optional)</Label>
              <Input
                id="edit-youtubeUrl"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {formData.youtubeUrl && getYouTubeVideoId(formData.youtubeUrl) && (
                <div className="mt-2">
                  <img
                    src={getYouTubeThumbnail(formData.youtubeUrl)}
                    alt="Video preview"
                    className="w-32 h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-reviewText">Review Text (Optional)</Label>
              <textarea
                id="edit-reviewText"
                value={formData.reviewText}
                onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                placeholder="Enter the review text..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <Label htmlFor="edit-isActive">Active (Visible on home page)</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              <Save className="w-4 h-4 mr-2" />
              Update Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          <DialogFooter>
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
    </div>
  );
}
