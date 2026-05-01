'use client';

import { useState, useEffect } from 'react';
import {
  useGetActiveAboutUsContentQuery,
  useCreateAboutUsContentMutation,
  useUpdateAboutUsContentMutation,
  IAboutUsContent
} from '@/app/redux/api/expartPanelApi/expartPanelApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Save, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContentFormData {
  title: string;
  description: string;
  mission: string;
  vision: string;
  coreValues: string[];
  additionalSections: { title: string; content: string }[];
  isActive: boolean;
}

export default function AboutUsContentManager() {
  const { data: contentData, isLoading } = useGetActiveAboutUsContentQuery();
  const [createContent, { isLoading: isCreating }] = useCreateAboutUsContentMutation();
  const [updateContent, { isLoading: isUpdating }] = useUpdateAboutUsContentMutation();

  const content = contentData?.data;
  const saving = isCreating || isUpdating;

  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    mission: '',
    vision: '',
    coreValues: [],
    additionalSections: [],
    isActive: true,
  });

  const [newCoreValue, setNewCoreValue] = useState('');
  const [newSection, setNewSection] = useState({ title: '', content: '' });

  // Populate form when data loads
  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        description: content.description || '',
        mission: content.mission || '',
        vision: content.vision || '',
        coreValues: content.coreValues || [],
        additionalSections: content.additionalSections || [],
        isActive: content.isActive !== false,
      });
    }
  }, [content]);

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    try {
      if (content?._id) {
        await updateContent({ id: content._id, data: formData }).unwrap();
        toast.success('Content updated successfully');
      } else {
        await createContent(formData).unwrap();
        toast.success('Content created successfully');
      }
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(error.data?.message || 'Failed to save content');
    }
  };

  const addCoreValue = () => {
    if (newCoreValue.trim()) {
      setFormData({
        ...formData,
        coreValues: [...(formData.coreValues || []), newCoreValue.trim()],
      });
      setNewCoreValue('');
    }
  };

  const removeCoreValue = (index: number) => {
    setFormData({
      ...formData,
      coreValues: formData.coreValues?.filter((_, i) => i !== index),
    });
  };

  const addSection = () => {
    if (newSection.title.trim() && newSection.content.trim()) {
      setFormData({
        ...formData,
        additionalSections: [
          ...(formData.additionalSections || []),
          newSection,
        ],
      });
      setNewSection({ title: '', content: '' });
    }
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      additionalSections: formData.additionalSections?.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Organization Information</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('/about-us', '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="About Our Organization"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Tell your organization's story..."
            rows={6}
          />
        </div>

        {/* Mission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mission
          </label>
          <Textarea
            value={formData.mission}
            onChange={(e) =>
              setFormData({ ...formData, mission: e.target.value })
            }
            placeholder="Our mission statement..."
            rows={4}
          />
        </div>

        {/* Vision */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vision
          </label>
          <Textarea
            value={formData.vision}
            onChange={(e) =>
              setFormData({ ...formData, vision: e.target.value })
            }
            placeholder="Our vision statement..."
            rows={4}
          />
        </div>

        {/* Core Values */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Core Values
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newCoreValue}
              onChange={(e) => setNewCoreValue(e.target.value)}
              placeholder="Add a core value"
              onKeyPress={(e) => e.key === 'Enter' && addCoreValue()}
            />
            <Button type="button" onClick={addCoreValue}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.coreValues?.map((value, index) => (
              <div
                key={index}
                className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-2"
              >
                <span>{value}</span>
                <button onClick={() => removeCoreValue(index)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Sections */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Sections
          </label>
          
          {/* Existing sections */}
          <div className="space-y-4 mb-4">
            {formData.additionalSections?.map((section, index) => (
              <div key={index} className="border rounded-lg p-4 relative">
                <button
                  onClick={() => removeSection(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
                <h4 className="font-semibold mb-2">{section.title}</h4>
                <p className="text-sm text-gray-600">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Add new section */}
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
            <Input
              value={newSection.title}
              onChange={(e) =>
                setNewSection({ ...newSection, title: e.target.value })
              }
              placeholder="Section title"
            />
            <Textarea
              value={newSection.content}
              onChange={(e) =>
                setNewSection({ ...newSection, content: e.target.value })
              }
              placeholder="Section content"
              rows={3}
            />
            <Button type="button" onClick={addSection} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
