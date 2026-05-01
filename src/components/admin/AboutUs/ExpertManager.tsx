'use client';

import { useState, useMemo } from 'react';
import {
  useGetExpertsQuery,
  useGetAboutUsCategoriesQuery,
  useToggleExpertPinMutation,
  useToggleShowOnAboutPageMutation,
  useUpdateExpertCategoryMutation,
  useDeleteExpertPanelMemberMutation,
  IExpert,
  ICategory
} from '@/app/redux/api/expartPanelApi/expartPanelApi';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Pin,
  Eye,
  EyeOff,
  Search,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ExpertManager() {
  const { data: expertsData, isLoading: expertsLoading } = useGetExpertsQuery({ limit: 100 });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAboutUsCategoriesQuery(true);
  
  const [togglePin] = useToggleExpertPinMutation();
  const [toggleAboutPage] = useToggleShowOnAboutPageMutation();
  const [updateCategory] = useUpdateExpertCategoryMutation();
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertPanelMemberMutation();

  const experts = expertsData?.data || [];
  const categories = categoriesData?.data || [];
  const loading = expertsLoading || categoriesLoading;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleTogglePin = async (expert: IExpert) => {
    try {
      await togglePin({
        id: expert._id,
        isPinned: !expert.isPinned,
        pinOrder: expert.pinOrder
      }).unwrap();
      toast.success(
        `Expert ${expert.isPinned ? 'unpinned' : 'pinned'} successfully`
      );
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to toggle pin');
    }
  };

  const handleToggleAboutPage = async (expert: IExpert) => {
    try {
      await toggleAboutPage({
        id: expert._id,
        showOnAboutPage: !expert.showOnAboutPage
      }).unwrap();
      toast.success(
        `Expert ${expert.showOnAboutPage ? 'hidden from' : 'shown on'} About page`
      );
    } catch (error: any) {
      console.error('Error toggling About page:', error);
      toast.error('Failed to toggle About page visibility');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expert?')) {
      return;
    }

    try {
      await deleteExpert(id).unwrap();
      toast.success('Expert deleted successfully');
    } catch (error: any) {
      console.error('Error deleting expert:', error);
      toast.error('Failed to delete expert');
    }
  };

  const handleCategoryChange = async (expertId: string, category: string) => {
    try {
      await updateCategory({ id: expertId, category }).unwrap();
      toast.success('Category updated successfully');
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const sortedExperts = useMemo(() => {
    const filtered = experts.filter((expert) => {
      const matchesSearch =
        expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.designation.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all' || expert.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      // Sort by pinned status first, then by pinOrder
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned) {
        return (a.pinOrder || 0) - (b.pinOrder || 0);
      }
      return 0;
    });
  }, [experts, searchTerm, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Link href="/admin/about-us/experts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or designation..."
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedExperts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No team members found.
          </div>
        ) : (
          sortedExperts.map((expert) => (
            <div
              key={expert._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {expert.photoUrl ? (
                  <Image
                    src={expert.photoUrl}
                    alt={expert.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <span className="text-4xl font-bold text-gray-400">
                      {expert.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  {expert.isPinned && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Pinned
                    </span>
                  )}
                  {!expert.showOnAboutPage && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Hidden
                    </span>
                  )}
                  {!expert.isActive && (
                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{expert.name}</h3>
                <p className="text-primary text-sm font-medium mb-2">
                  {expert.designation}
                </p>

                {/* Category Selector */}
                <select
                  value={expert.category || ''}
                  onChange={(e) => handleCategoryChange(expert._id, e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded mb-3"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTogglePin(expert)}
                    title={expert.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin
                      className={`w-4 h-4 ${expert.isPinned ? 'fill-current' : ''}`}
                    />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAboutPage(expert)}
                    title={
                      expert.showOnAboutPage ? 'Hide from About page' : 'Show on About page'
                    }
                  >
                    {expert.showOnAboutPage ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Link href={`/admin/about-us/experts/edit/${expert._id}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(expert._id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
