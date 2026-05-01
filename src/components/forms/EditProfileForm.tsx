"use client";

import React, { useState, useRef } from 'react';
import { IUser } from '@/lib/types';
import { UpdateUserData } from '@/types/auth';
import { useUpdateMyProfileMutation, useUploadProfilePhotoMutation } from '@/app/redux/api/users/userApi';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  User as UserIcon, 
  Mail, 
  Phone, 
  CreditCard, 
  MapPin,
  Camera,
  X,
  FileText,
  GraduationCap,
  Briefcase,
  Calendar,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EditProfileFormProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Utility function to convert date format from yyyy-mm-dd to dd-mm-yyyy
  const formatDateForAPI = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return '';

    try {
      // Handle ISO date strings with time component
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        dateString = datePart; // Use just the date part
      }

      // If already in dd-mm-yyyy format, return as is
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const parts = dateString.split('-');
        if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
          // yyyy-mm-dd format
          const [year, month, day] = parts;
          return `${day}-${month}-${year}`;
        } else if (parts[2].length === 4 && parts[0].length === 2 && parts[1].length === 2) {
          // dd-mm-yyyy format
          return dateString;
        }
      }

      // Fallback: return original string
      return dateString;
    } catch (error) {
      console.error('Error formatting date for API:', error, dateString);
      return dateString;
    }
  };

  // Utility function to convert date format from dd-mm-yyyy to yyyy-mm-dd for date input
  const formatDateForInput = (dateString: string) => {
    if (!dateString || dateString.trim() === '') return '';

    try {
      // Handle ISO date strings with time component
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        return datePart; // Return just the date part (yyyy-mm-dd)
      }

      // If already in yyyy-mm-dd format, return as is
      if (dateString.includes('-') && dateString.split('-').length === 3) {
        const parts = dateString.split('-');
        if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
          // yyyy-mm-dd format
          return dateString;
        } else if (parts[2].length === 4 && parts[0].length === 2 && parts[1].length === 2) {
          // dd-mm-yyyy format
          const [day, month, year] = parts;
          return `${year}-${month}-${day}`;
        }
      }

      // Fallback: return original string
      return dateString;
    } catch (error) {
      console.error('Error formatting date for input:', error, dateString);
      return dateString;
    }
  };
  
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name || '',
    mobileNumber: user.mobileNumber || '',
    nid: user.nid || '',
    address: user.address || '',
    age: user.age || undefined,
    
    // Academic Qualifications
    degreeType: user.degreeType || '',
    universityName: user.universityName || '',
    degreeTitle: user.degreeTitle || '',
    
    // Previous Job Experience
    jobExperiences: (user.jobExperiences || []).map(job => ({
      organizationName: job.organizationName || '',
      startDate: job.startDate ? formatDateForInput(job.startDate) : '',
      position: job.position || '',
      endDate: job.endDate ? formatDateForInput(job.endDate) : ''
    })),
    
    // IEB Membership
    iebNo: user.iebNo || '',
    
    // Professional Affiliation / Recognition
    affiliationTitle: user.affiliationTitle || '',
    affiliationInstitution: user.affiliationInstitution || '',
    affiliationStartDate: user.affiliationStartDate ? formatDateForInput(user.affiliationStartDate) : '',
    affiliationValidTill: user.affiliationValidTill ? formatDateForInput(user.affiliationValidTill) : '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(user.profilePhoto || '');
  
  // Document file states
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [experienceCertificateFile, setExperienceCertificateFile] = useState<File | null>(null);
  const [universityCertificateFile, setUniversityCertificateFile] = useState<File | null>(null);
  const [affiliationDocumentFile, setAffiliationDocumentFile] = useState<File | null>(null);

  // Job experience management
  const addJobExperience = () => {
    setFormData(prev => ({
      ...prev,
      jobExperiences: [
        ...(prev.jobExperiences || []),
        {
          organizationName: '',
          startDate: '',
          position: '',
          endDate: ''
        }
      ]
    }));
  };

  const removeJobExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      jobExperiences: (prev.jobExperiences || []).filter((_, i) => i !== index)
    }));
  };

  const updateJobExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      jobExperiences: (prev.jobExperiences || []).map((job, i) => 
        i === index ? { ...job, [field]: value } : job
      )
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('File size should be less than 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedFile(null);
    setPreviewImage(user.profilePhoto || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Document file handlers
  const handleDocumentFileSelect = (file: File | null, fileType: 'cv' | 'experience' | 'university' | 'affiliation') => {
    if (!file) return;
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    // Validate file type (images, PDFs, and Word docs)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select an image file (JPEG, JPG, PNG, GIF, WebP), PDF, DOC, or DOCX file');
      return;
    }

    switch (fileType) {
      case 'cv':
        setCvFile(file);
        break;
      case 'experience':
        setExperienceCertificateFile(file);
        break;
      case 'university':
        setUniversityCertificateFile(file);
        break;
      case 'affiliation':
        setAffiliationDocumentFile(file);
        break;
    }
  };

  const removeDocumentFile = (fileType: 'cv' | 'experience' | 'university' | 'affiliation') => {
    switch (fileType) {
      case 'cv':
        setCvFile(null);
        break;
      case 'experience':
        setExperienceCertificateFile(null);
        break;
      case 'university':
        setUniversityCertificateFile(null);
        break;
      case 'affiliation':
        setAffiliationDocumentFile(null);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.name || !formData.mobileNumber) {
        toast.error('Name and mobile number are required');
        return;
      }

      // Clean up job experiences - remove empty entries and format dates
      const cleanedJobExperiences = (formData.jobExperiences || [])
        .filter(job => {
          // Only include jobs that have at least organization name and position
          const hasRequiredFields = job.organizationName?.trim() && job.position?.trim();
          if (!hasRequiredFields) {
          }
          return hasRequiredFields;
        })
        .map(job => {
          try {
            const formattedJob = {
              organizationName: job.organizationName.trim(),
              position: job.position.trim(),
              startDate: job.startDate ? formatDateForAPI(job.startDate) : '',
              endDate: job.endDate ? formatDateForAPI(job.endDate) : undefined
            };
            return formattedJob;
          } catch (error) {
            console.error('Error formatting job experience:', error, job);
            // Return a safe fallback
            return {
              organizationName: job.organizationName || '',
              position: job.position || '',
              startDate: job.startDate || '',
              endDate: job.endDate || undefined
            };
          }
        });


      // Create FormData to handle both text and file data
      const formDataForSubmit = new FormData();

      // Prepare data object (excluding jobExperiences for now to test)
      const dataToSend = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        nid: formData.nid || '',
        address: formData.address || '',
        age: formData.age,
        degreeType: formData.degreeType || '',
        universityName: formData.universityName || '',
        degreeTitle: formData.degreeTitle || '',
        iebNo: formData.iebNo || '',
        affiliationTitle: formData.affiliationTitle || '',
        affiliationInstitution: formData.affiliationInstitution || '',
        affiliationStartDate: formData.affiliationStartDate ? formatDateForAPI(formData.affiliationStartDate) : '',
        affiliationValidTill: formData.affiliationValidTill ? formatDateForAPI(formData.affiliationValidTill) : ''
      };


      // Add basic fields
      Object.entries(dataToSend).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formDataForSubmit.append(key, value.toString());
        }
      });

      // Add job experiences separately if they exist
      if (cleanedJobExperiences.length > 0) {
        try {
          const jobExperiencesJson = JSON.stringify(cleanedJobExperiences);
          formDataForSubmit.append('jobExperiences', jobExperiencesJson);
        } catch (jsonError) {
          console.error('Error serializing job experiences:', jsonError);
          // Continue without job experiences rather than failing completely
        }
      }      // Add files
      if (selectedFile) {
        formDataForSubmit.append('profilePhoto', selectedFile);
      }
      if (cvFile) {
        formDataForSubmit.append('cvFile', cvFile);
      }
      if (experienceCertificateFile) {
        formDataForSubmit.append('experienceCertificateFile', experienceCertificateFile);
      }
      if (universityCertificateFile) {
        formDataForSubmit.append('universityCertificateFile', universityCertificateFile);
      }
      if (affiliationDocumentFile) {
        formDataForSubmit.append('affiliationDocumentFile', affiliationDocumentFile);
      }


      // // Log the final FormData contents for debugging
      // for (let [key, value] of formDataForSubmit.entries()) {
      //   if (value instanceof File) {
      //     console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      //   } else {
      //     console.log(`${key}: ${value}`);
      //   }
      // }

      const result = await updateProfile({
        id: user._id,
        data: formDataForSubmit
      }).unwrap();

      toast.success('Profile updated successfully!');

      // If new token is received, it should be handled by the API middleware
      if (result.data?.accessToken) {
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Update error:', error);
      console.error('Error details:', error?.data, error?.message, error?.status);

      // More specific error handling
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else if (error?.status === 400) {
        toast.error('Invalid data provided. Please check your inputs.');
      } else if (error?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to update profile. Please check console for details.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon size={20} />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full p-1 hover:bg-red-800"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon size={30} className="text-gray-400" />
                </div>
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors"
              >
                <Camera size={14} />
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <p className="text-sm text-gray-500 text-center">
              Click the camera icon to upload a new profile photo
              <br />
              (Max size: 2MB)
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon size={16} />
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="flex items-center gap-2">
                <Phone size={16} />
                Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleInputChange}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nid" className="flex items-center gap-2">
                <CreditCard size={16} />
                National ID (NID)
              </Label>
              <Input
                id="nid"
                name="nid"
                value={formData.nid}
                onChange={handleInputChange}
                placeholder="Enter your NID number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar size={16} />
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age || ''}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </Label>
              <Input
                value={user.email}
                disabled
                className="bg-gray-100"
                title="Email cannot be changed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iebNo" className="flex items-center gap-2">
                <CreditCard size={16} />
                IEB Membership No
              </Label>
              <Input
                id="iebNo"
                name="iebNo"
                value={formData.iebNo || ''}
                onChange={handleInputChange}
                placeholder="Enter IEB Membership No"
              />
            </div>
          </div>

          {/* Academic Qualifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap size={18} />
              Academic Qualifications
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degreeType">
                  Degree Type
                </Label>
                <Input
                  id="degreeType"
                  name="degreeType"
                  value={formData.degreeType || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor's, Master's, PhD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="universityName">
                  University Name
                </Label>
                <Input
                  id="universityName"
                  name="universityName"
                  value={formData.universityName || ''}
                  onChange={handleInputChange}
                  placeholder="Enter university name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="degreeTitle">
                  Full Title of Degree with Discipline
                </Label>
                <Input
                  id="degreeTitle"
                  name="degreeTitle"
                  value={formData.degreeTitle || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor of Science in Computer Science"
                />
              </div>
            </div>
          </div>

          {/* Previous Job Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase size={18} />
                Previous Job Experience
              </h3>
              <Button
                type="button"
                onClick={addJobExperience}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Experience
              </Button>
            </div>
            
            <div className="space-y-4">
              {(formData.jobExperiences || []).map((job, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeJobExperience(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-800 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`organization-${index}`}>
                        Organization Name
                      </Label>
                      <Input
                        id={`organization-${index}`}
                        value={job.organizationName}
                        onChange={(e) => updateJobExperience(index, 'organizationName', e.target.value)}
                        placeholder="Enter organization name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`position-${index}`}>
                        Position / Title
                      </Label>
                      <Input
                        id={`position-${index}`}
                        value={job.position}
                        onChange={(e) => updateJobExperience(index, 'position', e.target.value)}
                        placeholder="Enter job title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${index}`}>
                        Start Date
                      </Label>
                      <Input
                        id={`startDate-${index}`}
                        type="date"
                        value={job.startDate}
                        onChange={(e) => updateJobExperience(index, 'startDate', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${index}`}>
                        End Date (leave empty if current position)
                      </Label>
                      <Input
                        id={`endDate-${index}`}
                        type="date"
                        value={job.endDate || ''}
                        onChange={(e) => updateJobExperience(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(formData.jobExperiences || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                  <p>No job experiences added yet</p>
                  <p className="text-sm">Click "Add Experience" to add your work history</p>
                </div>
              )}
            </div>
          </div>

          {/* Professional Affiliation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap size={18} />
              Professional Affiliation / Recognition
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="affiliationTitle">
                  Full Title of the Affiliation/Recognition
                </Label>
                <Input
                  id="affiliationTitle"
                  name="affiliationTitle"
                  value={formData.affiliationTitle || ''}
                  onChange={handleInputChange}
                  placeholder="Enter affiliation title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliationInstitution">
                  Name of the Institution
                </Label>
                <Input
                  id="affiliationInstitution"
                  name="affiliationInstitution"
                  value={formData.affiliationInstitution || ''}
                  onChange={handleInputChange}
                  placeholder="Enter institution name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliationStartDate">
                  Date of Start
                </Label>
                <Input
                  id="affiliationStartDate"
                  name="affiliationStartDate"
                  type="date"
                  value={formData.affiliationStartDate || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliationValidTill">
                  Valid Till
                </Label>
                <Input
                  id="affiliationValidTill"
                  name="affiliationValidTill"
                  type="date"
                  value={formData.affiliationValidTill || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={18} />
              Documents
            </h3>
            
            {/* CV / Resume Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase size={16} />
                CV / Resume
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleDocumentFileSelect(e.target.files?.[0] || null, 'cv')}
                  className="flex-1"
                />
                {cvFile && (
                  <button
                    type="button"
                    onClick={() => removeDocumentFile('cv')}
                    className="text-red-800 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {cvFile && (
                <p className="text-sm text-green-600">Selected: {cvFile.name}</p>
              )}
              {user.cvUrl && !cvFile && (
                <p className="text-sm text-blue-600">Current CV uploaded</p>
              )}
            </div>

            {/* Experience Certificate Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap size={16} />
                Experience Certificate
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleDocumentFileSelect(e.target.files?.[0] || null, 'experience')}
                  className="flex-1"
                />
                {experienceCertificateFile && (
                  <button
                    type="button"
                    onClick={() => removeDocumentFile('experience')}
                    className="text-red-800 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {experienceCertificateFile && (
                <p className="text-sm text-green-600">Selected: {experienceCertificateFile.name}</p>
              )}
              {user.experienceCertificateUrl && !experienceCertificateFile && (
                <p className="text-sm text-blue-600">Current experience certificate uploaded</p>
              )}
            </div>

            {/* University Certificate Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <GraduationCap size={16} />
                University Certificate
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleDocumentFileSelect(e.target.files?.[0] || null, 'university')}
                  className="flex-1"
                />
                {universityCertificateFile && (
                  <button
                    type="button"
                    onClick={() => removeDocumentFile('university')}
                    className="text-red-800 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {universityCertificateFile && (
                <p className="text-sm text-green-600">Selected: {universityCertificateFile.name}</p>
              )}
              {user.universityCertificateUrl && !universityCertificateFile && (
                <p className="text-sm text-blue-600">Current university certificate uploaded</p>
              )}
            </div>

            {/* Affiliation Document Upload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText size={16} />
                Affiliation Document
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => handleDocumentFileSelect(e.target.files?.[0] || null, 'affiliation')}
                  className="flex-1"
                />
                {affiliationDocumentFile && (
                  <button
                    type="button"
                    onClick={() => removeDocumentFile('affiliation')}
                    className="text-red-800 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {affiliationDocumentFile && (
                <p className="text-sm text-green-600">Selected: {affiliationDocumentFile.name}</p>
              )}
              {user.affiliationDocument && !affiliationDocumentFile && (
                <p className="text-sm text-blue-600">Current affiliation document uploaded</p>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Accepted formats: PDF, JPEG, JPG, PNG, GIF, WebP (Max size: 5MB each)
            </p>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin size={18} />
              Address Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isUploadingPhoto}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isUploadingPhoto}
              className="min-w-[100px]"
            >
              {(isLoading || isUploadingPhoto) ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileForm;
