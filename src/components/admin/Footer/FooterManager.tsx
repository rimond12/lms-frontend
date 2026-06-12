'use client';

import { useState, useEffect } from 'react';
import {
  useGetFooterQuery,
  useUpdateFooterMutation,
  IFooter,
  IFooterQuickLink
} from '@/app/redux/api/footerApi/footerApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FooterManager() {
  const { data: footerData, isLoading } = useGetFooterQuery();
  const [updateFooter, { isLoading: isSaving }] = useUpdateFooterMutation();

  const footer = footerData?.data;

  const [formData, setFormData] = useState<Omit<IFooter, '_id' | 'createdAt' | 'updatedAt'>>({
    hotline: '',
    whatsappLink: '',
    email: '',
    address: '',
    mobile: '',
    officeHours: '',
    socialLinks: {
      facebook: '',
      youtube: '',
      linkedin: '',
      tiktok: '',
      x: ''
    },
    copyrightText: '',
    quickLinks: []
  });

  const [newQuickLinkLabel, setNewQuickLinkLabel] = useState('');
  const [newQuickLinkUrl, setNewQuickLinkUrl] = useState('');

  // Sync state when data is fetched
  useEffect(() => {
    if (footer) {
      setFormData({
        hotline: footer.hotline || '',
        whatsappLink: footer.whatsappLink || '',
        email: footer.email || '',
        address: footer.address || '',
        mobile: footer.mobile || '',
        officeHours: footer.officeHours || '',
        socialLinks: {
          facebook: footer.socialLinks?.facebook || '',
          youtube: footer.socialLinks?.youtube || '',
          linkedin: footer.socialLinks?.linkedin || '',
          tiktok: footer.socialLinks?.tiktok || '',
          x: footer.socialLinks?.x || ''
        },
        copyrightText: footer.copyrightText || '',
        quickLinks: footer.quickLinks || []
      });
    }
  }, [footer]);

  const handleSave = async () => {
    // Simple validation
    if (!formData.hotline || !formData.whatsappLink || !formData.email || !formData.address) {
      toast.error('Hotline, WhatsApp Link, Email, and Address are required!');
      return;
    }

    try {
      await updateFooter(formData).unwrap();
      toast.success('Footer content saved successfully!');
    } catch (error: any) {
      console.error('Error saving footer:', error);
      toast.error(error.message || 'Failed to save footer content.');
    }
  };

  const handleSocialChange = (key: keyof typeof formData.socialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value
      }
    }));
  };

  const addQuickLink = () => {
    if (!newQuickLinkLabel.trim() || !newQuickLinkUrl.trim()) {
      toast.error('Both label and URL are required for a quick link!');
      return;
    }

    const newLink: IFooterQuickLink = {
      label: newQuickLinkLabel.trim(),
      url: newQuickLinkUrl.trim()
    };

    setFormData((prev) => ({
      ...prev,
      quickLinks: [...prev.quickLinks, newLink]
    }));

    setNewQuickLinkLabel('');
    setNewQuickLinkUrl('');
    toast.success('Quick link added to list!');
  };

  const removeQuickLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      quickLinks: prev.quickLinks.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        <p className="text-gray-500 font-medium">Loading footer settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Footer Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Update your website's contact info, support channels, social links, and quick links in real-time.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition duration-200">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save/Update
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col: Contact Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3 border-gray-100">
            <Phone className="w-5 h-5 text-red-600" />
            Contact & Support Channels
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Hotline Number *
              </label>
              <Input
                value={formData.hotline}
                onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                placeholder="+8809606810081"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">Displayed as the primary hotline (e.g. +8809606810081)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                WhatsApp Link *
              </label>
              <Input
                value={formData.whatsappLink}
                onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                placeholder="https://wa.me/8809606810081"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">Full redirection URL (e.g. https://wa.me/8809606810081)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Mobile / Support Phone
              </label>
              <Input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="01843-432352 (Available during business hours)"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Email Addresses *
              </label>
              <Textarea
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="support@immigrantjobsworld.com&#10;info@immigrantjobsworld.com"
                rows={2}
                className="rounded-xl font-sans"
              />
              <p className="text-xs text-gray-400 mt-1">Enter emails, one per line or separated by spaces.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Office Address *
              </label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="53, Beitul Abed Tower, Lift 5th Floor Purana Paltan, Dhaka, Bangladesh"
                rows={2}
                className="rounded-xl font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Office Hours
              </label>
              <Textarea
                value={formData.officeHours}
                onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                placeholder="Saturday - Thursday: 10:00 AM – 6:00 PM&#10;Friday: Closed"
                rows={2}
                className="rounded-xl font-sans"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Social & Copyright */}
        <div className="space-y-8">
          {/* Social Links Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3 border-gray-100">
              <Share2 className="w-5 h-5 text-red-600" />
              Social Media Links
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Facebook URL</label>
                <Input
                  value={formData.socialLinks.facebook}
                  onChange={(e) => handleSocialChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/immigrantjobsworld"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">YouTube URL</label>
                <Input
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@ImmigrantJobsWorld"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">LinkedIn URL</label>
                <Input
                  value={formData.socialLinks.linkedin}
                  onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/immigrant-jobs-world"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">TikTok URL</label>
                <Input
                  value={formData.socialLinks.tiktok}
                  onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                  placeholder="https://tiktok.com/@immigrantjobsworld"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">X (formerly Twitter) URL</label>
                <Input
                  value={formData.socialLinks.x}
                  onChange={(e) => handleSocialChange('x', e.target.value)}
                  placeholder="https://x.com/immigrantjobs"
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Copyright & Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3 border-gray-100">
              <Info className="w-5 h-5 text-red-600" />
              General Branding
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Copyright Company/Text</label>
              <Input
                value={formData.copyrightText}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                placeholder="IMMIGRANT JOBS WORLD"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-400 mt-1">This text will render after the copyright year (e.g. © 2026 [Text])</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width: Quick Links Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3 border-gray-100">
          <ExternalLink className="w-5 h-5 text-red-600" />
          Quick Links Management
        </h3>

        {/* Existing Quick Links */}
        {formData.quickLinks.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 text-sm">No quick links added yet. Add some below!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {formData.quickLinks.map((link, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition duration-200"
              >
                <div className="truncate pr-3">
                  <p className="font-semibold text-gray-800 text-sm truncate">{link.label}</p>
                  <p className="text-gray-400 text-xs truncate">{link.url}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuickLink(idx)}
                  className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-100 rounded-lg hover:border-red-100 transition duration-150 flex-shrink-0"
                  title="Remove Link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Quick Link Form */}
        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/80 space-y-4">
          <h4 className="text-sm font-bold text-gray-700">Add New Quick Link</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Link Label</label>
              <Input
                value={newQuickLinkLabel}
                onChange={(e) => setNewQuickLinkLabel(e.target.value)}
                placeholder="About Us"
                className="bg-white rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Redirect Path / URL</label>
              <Input
                value={newQuickLinkUrl}
                onChange={(e) => setNewQuickLinkUrl(e.target.value)}
                placeholder="/about-us"
                className="bg-white rounded-xl"
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={addQuickLink}
            variant="outline"
            className="border-gray-200 text-gray-700 hover:bg-gray-100 font-medium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add to List
          </Button>
        </div>
      </div>
    </div>
  );
}
