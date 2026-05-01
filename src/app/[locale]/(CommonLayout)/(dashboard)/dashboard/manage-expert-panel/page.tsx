"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Plus, Search, Filter, Eye, User, MapPin, BookOpen, Table, Grid3X3, ExternalLinkIcon, EyeIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  useGetExpertsQuery, 
  IExpert, 
  useDeleteExpertPanelMemberMutation
} from '@/app/redux/api/expartPanelApi/expartPanelApi';
import ExpertPanelForm from '@/components/events/ExpertPanelForm';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';

export default function ManageExpertPanelPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'specialization' | 'institution'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [editingExpert, setEditingExpert] = useState<IExpert | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: expertsData, isLoading, error } = useGetExpertsQuery({});
  const [deleteExpert, { isLoading: isDeleting }] = useDeleteExpertPanelMemberMutation();

  const experts = expertsData?.data || [];

  // Filter experts based on search term and filter
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'specialization') return matchesSearch && expert.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterBy === 'institution') return matchesSearch && expert.institution.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleEdit = (expert: IExpert) => {
    setEditingExpert(expert);
    setShowEditModal(true);
  };

  const handleDelete = async (expert: IExpert) => {
    if (window.confirm(`Are you sure you want to delete ${expert.name}?`)) {
      try {
        await deleteExpert(expert._id).unwrap();
        toast.success('Expert deleted successfully!');
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to delete expert');
      }
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setEditingExpert(null);
    toast.success('Expert updated successfully!');
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingExpert(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-800">Error loading experts. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Manage Expert Panel</h1>
            <p className="text-gray-600 mt-2">Manage your expert panel members</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/add-expert-panel-member')}
            className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Expert</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search experts by name, designation, institution, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-colors"
              >
                <option value="all">All Fields</option>
                <option value="specialization">Specialization</option>
                <option value="institution">Institution</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-red-800 text-white'
                      : 'text-gray-600 hover:text-red-800'
                  }`}
                  title="Table View"
                >
                  <Table className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-red-800 text-white'
                      : 'text-gray-600 hover:text-red-800'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <User className="w-6 h-6 text-red-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Experts</p>
                <p className="text-2xl font-bold text-black">{experts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <MapPin className="w-6 h-6 text-red-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <p className="text-2xl font-bold text-black">
                  {new Set(experts.map(e => e.institution)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-red-800" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Specializations</p>
                <p className="text-2xl font-bold text-black">
                  {new Set(experts.map(e => e.specialization)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Experts Display */}
        {filteredExperts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black mb-2">No experts found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first expert'}
            </p>
            <button
              onClick={() => router.push('/dashboard/add-expart-panel-member')}
              className="bg-red-800 hover:bg-red-900 text-white px-6 py-2 rounded-lg shadow-lg transition-colors"
            >
              Add Expert
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Expert
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExperts.map((expert) => (
                    <tr key={expert._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {expert.photoUrl ? (
                              <AppImage 
                                photoUrl={expert.photoUrl}
                                alt={expert.name}
                                className="w-full h-full object-cover"
                                width={500}
                                height={500}
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-black">{expert.name}</div>
                            <div className="text-xs text-gray-500">
                              Added {new Date(expert.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-800 font-medium">{expert.designation}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{expert.institution}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                           <Link
                    href={`/expert-panel/${expert.slugUrl}`}
                    className="inline-flex items-center justify-center w-full py-1 px-2 bg-red-800 text-white hover:bg-red-900 font-semibold text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-xl"
                  >
                  
                    <EyeIcon className="w-4 h-4 ml-2" />
                  </Link>
                          <button
                            onClick={() => handleEdit(expert)}
                            className="text-gray-500 hover:text-red-800 transition-colors"
                            title="Edit Expert"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expert)}
                            disabled={isDeleting}
                            className="text-gray-500 hover:text-red-800 transition-colors disabled:opacity-50"
                            title="Delete Expert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div key={expert._id} className="bg-white rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                {/* Expert Card Header */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {expert.photoUrl ? (
                        <AppImage 
                          width={500}
                          height={500} 
                          photoUrl={expert.photoUrl} 
                          alt={expert.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold text-black">{expert.name}</h3>
                      <p className="text-red-800 font-semibold text-sm">{expert.designation}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{expert.institution}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{expert.specialization}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{expert.bio}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <span>{expert.jobExperiences?.length || 0} Experiences</span>
                    <span>{expert.academicQualifications?.length || 0} Qualifications</span>
                    <span>{expert.achievements?.length || 0} Achievements</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added {new Date(expert.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/expart-panel/${expert.slugUrl}`)}
                      className="p-2 text-gray-500 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(expert)}
                      className="p-2 text-gray-500 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Edit Expert"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expert)}
                      disabled={isDeleting}
                      className="p-2 text-gray-500 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Expert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingExpert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ExpertPanelForm
                expert={editingExpert}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
