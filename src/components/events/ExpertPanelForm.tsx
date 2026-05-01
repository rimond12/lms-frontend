"use client";

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Minus, Upload, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCreateExpertMutation,  IExpertInput, IExpert, useUpdateExpertPanelMemberMutation } from '@/app/redux/api/expartPanelApi/expartPanelApi';

interface ExpertPanelFormProps {
  expert?: IExpert;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExpertPanelForm({ expert, onSuccess, onCancel }: ExpertPanelFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(expert?.photoUrl || '');
  
  const [createExpert, { isLoading: isCreating }] = useCreateExpertMutation();
  const [updateExpert, { isLoading: isUpdating }] = useUpdateExpertPanelMemberMutation();
  
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!expert;

  const { 
    register, 
    handleSubmit, 
    control, 
    formState: { errors },
    reset,
    watch
  } = useForm<IExpertInput>({
    defaultValues: expert ? {
      name: expert.name,
      designation: expert.designation,
      institution: expert.institution,
      specialization: expert.specialization,
      bio: expert.bio,
      jobExperiences: expert.jobExperiences || [{ organization: '', position: '', startDate: '', endDate: '', description: '' }],
      academicQualifications: expert.academicQualifications || [{ degree: '', field: '', institution: '', passingYear: new Date().getFullYear(), grade: '' }],
      socialLinks: expert.socialLinks || { linkedin: '', twitter: '', website: '' },
      achievements: expert.achievements || [''],
      publications: expert.publications || ['']
    } : {
      name: '',
      designation: '',
      institution: '',
      specialization: '',
      bio: '',
      jobExperiences: [{ organization: '', position: '', startDate: '', endDate: '', description: '' }],
      academicQualifications: [{ degree: '', field: '', institution: '', passingYear: new Date().getFullYear(), grade: '' }],
      socialLinks: { linkedin: '', twitter: '', website: '' },
      achievements: [''],
      publications: ['']
    }
  });

  const { 
    fields: jobFields, 
    append: appendJob, 
    remove: removeJob 
  } = useFieldArray({
    control,
    name: "jobExperiences"
  });

  const { 
    fields: academicFields, 
    append: appendAcademic, 
    remove: removeAcademic 
  } = useFieldArray({
    control,
    name: "academicQualifications"
  });

  const [achievements, setAchievements] = useState<string[]>(
    expert?.achievements && expert.achievements.length > 0 
      ? expert.achievements 
      : ['']
  );

  const [publications, setPublications] = useState<string[]>(
    expert?.publications && expert.publications.length > 0 
      ? expert.publications 
      : ['']
  );

  const addAchievement = () => {
    setAchievements([...achievements, '']);
  };

  const removeAchievement = (index: number) => {
    if (achievements.length > 1) {
      setAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const updateAchievement = (index: number, value: string) => {
    const updated = [...achievements];
    updated[index] = value;
    setAchievements(updated);
  };

  const addPublication = () => {
    setPublications([...publications, '']);
  };

  const removePublication = (index: number) => {
    if (publications.length > 1) {
      setPublications(publications.filter((_, i) => i !== index));
    }
  };

  const updatePublication = (index: number, value: string) => {
    const updated = [...publications];
    updated[index] = value;
    setPublications(updated);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: IExpertInput) => {
    try {
      const formData = new FormData();
      
      // Add photo if selected
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      // Filter out empty achievements and publications
      const filteredData = {
        ...data,
        jobExperiences: data.jobExperiences?.filter(exp => 
          exp.organization?.trim() && exp.position?.trim() && exp.startDate
        ) || [],
        academicQualifications: data.academicQualifications?.filter(qual => 
          qual.degree?.trim() && qual.field?.trim() && qual.institution?.trim() && qual.passingYear
        ) || [],
        achievements: achievements.filter(item => item?.trim() !== '') || [],
        publications: publications.filter(item => item?.trim() !== '') || [],
      };

      // Validate required fields
      if (!filteredData.name?.trim()) {
        toast.error('Name is required');
        return;
      }
      if (!filteredData.designation?.trim()) {
        toast.error('Designation is required');
        return;
      }
      if (!filteredData.institution?.trim()) {
        toast.error('Institution is required');
        return;
      }
      if (!filteredData.specialization?.trim()) {
        toast.error('Specialization is required');
        return;
      }
      if (!filteredData.bio?.trim()) {
        toast.error('Bio is required');
        return;
      }
      
      // Add form data as JSON
      Object.entries(filteredData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      let result;
      if (isEditMode && expert) {
        result = await updateExpert({ id: expert._id, formData }).unwrap();
      } else {
        result = await createExpert(formData).unwrap();
      }

      toast.success(`Expert ${isEditMode ? 'updated' : 'created'} successfully!`);
      onSuccess?.();
      if (!isEditMode) {
        reset();
        setPhotoFile(null);
        setPhotoPreview('');
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} expert`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Edit Expert' : 'Add New Expert'}
        </h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
          <div className="flex items-center space-x-4">
            {photoPreview && (
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <label className="cursor-pointer bg-black hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-800 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
            <input
              {...register('designation', { required: 'Designation is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Professor, Associate Professor"
            />
            {errors.designation && <p className="text-red-800 text-sm mt-1">{errors.designation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
            <input
              {...register('institution', { required: 'Institution is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Institution name"
            />
            {errors.institution && <p className="text-red-800 text-sm mt-1">{errors.institution.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
            <input
              {...register('specialization', { required: 'Specialization is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Field of expertise"
            />
            {errors.specialization && <p className="text-red-800 text-sm mt-1">{errors.specialization.message}</p>}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
          <textarea
            {...register('bio', { required: 'Bio is required' })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description about the expert"
          />
          {errors.bio && <p className="text-red-800 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        {/* Job Experiences */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Job Experiences</label>
            <button
              type="button"
              onClick={() => appendJob({ organization: '', position: '', startDate: '', endDate: '', description: '' })}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {jobFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Experience #{index + 1}</h4>
                {jobFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeJob(index)}
                    className="text-red-800 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  {...register(`jobExperiences.${index}.organization` as const)}
                  placeholder="Organization"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`jobExperiences.${index}.position` as const)}
                  placeholder="Position"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`jobExperiences.${index}.startDate` as const)}
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`jobExperiences.${index}.endDate` as const)}
                  type="date"
                  placeholder="End Date (optional)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <textarea
                {...register(`jobExperiences.${index}.description` as const)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Academic Qualifications */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Academic Qualifications</label>
            <button
              type="button"
              onClick={() => appendAcademic({ degree: '', field: '', institution: '', passingYear: new Date().getFullYear(), grade: '' })}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {academicFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-700">Qualification #{index + 1}</h4>
                {academicFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAcademic(index)}
                    className="text-red-800 hover:text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  {...register(`academicQualifications.${index}.degree` as const)}
                  placeholder="Degree (e.g., Ph.D., M.Sc.)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`academicQualifications.${index}.field` as const)}
                  placeholder="Field of study"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`academicQualifications.${index}.institution` as const)}
                  placeholder="Institution"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`academicQualifications.${index}.passingYear` as const, { valueAsNumber: true })}
                  type="number"
                  placeholder="Passing Year"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  {...register(`academicQualifications.${index}.grade` as const)}
                  placeholder="Grade/CGPA (optional)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Social Links</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              {...register('socialLinks.linkedin')}
              placeholder="LinkedIn URL"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              {...register('socialLinks.twitter')}
              placeholder="Twitter URL"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              {...register('socialLinks.website')}
              placeholder="Website URL"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Achievements</label>
            <button
              type="button"
              onClick={addAchievement}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                value={achievement}
                onChange={(e) => updateAchievement(index, e.target.value)}
                placeholder="Achievement description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {achievements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAchievement(index)}
                  className="text-red-800 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Publications */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">Publications</label>
            <button
              type="button"
              onClick={addPublication}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          
          {publications.map((publication, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                value={publication}
                onChange={(e) => updatePublication(index, e.target.value)}
                placeholder="Publication title/reference"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {publications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePublication(index)}
                  className="text-red-800 hover:text-red-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : isEditMode ? 'Update Expert' : 'Create Expert'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}