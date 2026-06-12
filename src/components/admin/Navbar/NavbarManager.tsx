'use client';

import { useState, useEffect } from 'react';
import {
  useGetNavbarQuery,
  useUpdateNavbarMutation,
  INavbar,
  INavLink,
  INavLinkDropdown
} from '@/app/redux/api/navbarApi/navbarApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  Globe,
  Sun,
  Moon,
  MoveUp,
  MoveDown,
  ExternalLink,
  Layers,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import React from 'react';

// Common icons list for quick click selection
const COMMON_ICONS = [
  'Home',
  'BookOpen',
  'Briefcase',
  'FileText',
  'Users',
  'Mail',
  'HelpCircle',
  'GraduationCap',
  'Calendar',
  'Settings',
  'Info',
  'Phone',
  'Award'
];

export default function NavbarManager() {
  const { data: navbarData, isLoading } = useGetNavbarQuery();
  const [updateNavbar, { isLoading: isSaving }] = useUpdateNavbarMutation();

  const navbar = navbarData?.data;

  const [showLanguageToggle, setShowLanguageToggle] = useState(true);
  const [navLinks, setNavLinks] = useState<INavLink[]>([]);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Currently editing index (null if none, otherwise number)
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);
  const [selectedSubLinkIndex, setSelectedSubSubLinkIndex] = useState<{linkIdx: number, subIdx: number} | null>(null);

  // Sync state when data is fetched
  useEffect(() => {
    if (navbar) {
      setShowLanguageToggle(navbar.showLanguageToggle ?? true);
      setNavLinks(navbar.navLinks ? JSON.parse(JSON.stringify(navbar.navLinks)) : []);
    }
  }, [navbar]);

  const handleSave = async () => {
    try {
      await updateNavbar({
        showLanguageToggle,
        navLinks
      }).unwrap();
      toast.success('Navbar settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving navbar:', error);
      toast.error(error.message || 'Failed to save navbar configuration.');
    }
  };

  // Helper to render Lucide Icon by name
  const renderIconPreview = (iconName: string, size = 16) => {
    if (!iconName) return null;
    const IconComp = (Icons as any)[iconName];
    if (IconComp) {
      return React.createElement(IconComp, { size });
    }
    return <HelpCircle size={size} className="text-gray-300" />;
  };

  // Main Link Operations
  const addMainLink = () => {
    const newLink: INavLink = {
      nameEn: 'New Link',
      nameBn: 'নতুন লিংক',
      href: '/',
      icon: 'Home',
      dropdown: []
    };
    const updated = [...navLinks, newLink];
    setNavLinks(updated);
    setSelectedLinkIndex(updated.length - 1);
    setSelectedSubSubLinkIndex(null);
    toast.success('New navigation link added!');
  };

  const removeMainLink = (idx: number) => {
    const updated = navLinks.filter((_, i) => i !== idx);
    setNavLinks(updated);
    if (selectedLinkIndex === idx) {
      setSelectedLinkIndex(null);
      setSelectedSubSubLinkIndex(null);
    } else if (selectedLinkIndex !== null && selectedLinkIndex > idx) {
      setSelectedLinkIndex(selectedLinkIndex - 1);
    }
    toast.success('Navigation link removed.');
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === navLinks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...navLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setNavLinks(updated);
    if (selectedLinkIndex === index) {
      setSelectedLinkIndex(targetIndex);
    } else if (selectedLinkIndex === targetIndex) {
      setSelectedLinkIndex(index);
    }
  };

  // Sub Link Operations
  const addSubLink = (linkIdx: number) => {
    const newSub: INavLinkDropdown = {
      nameEn: 'Sub Item',
      nameBn: 'সাব আইটেম',
      href: '#',
      descriptionEn: 'Item description',
      descriptionBn: 'আইটেম বিবরণ',
      icon: 'BookOpen',
      featured: false
    };

    const updated = [...navLinks];
    if (!updated[linkIdx].dropdown) {
      updated[linkIdx].dropdown = [];
    }
    updated[linkIdx].dropdown!.push(newSub);
    setNavLinks(updated);
    setSelectedSubSubLinkIndex({ linkIdx, subIdx: updated[linkIdx].dropdown!.length - 1 });
    toast.success('Sub-menu item added!');
  };

  const removeSubLink = (linkIdx: number, subIdx: number) => {
    const updated = [...navLinks];
    if (updated[linkIdx].dropdown) {
      updated[linkIdx].dropdown = updated[linkIdx].dropdown!.filter((_, i) => i !== subIdx);
      setNavLinks(updated);
      if (selectedSubLinkIndex?.linkIdx === linkIdx && selectedSubLinkIndex?.subIdx === subIdx) {
        setSelectedSubSubLinkIndex(null);
      }
      toast.success('Sub-menu item removed.');
    }
  };

  // Field value changes helpers
  const handleMainLinkChange = (field: keyof INavLink, value: any) => {
    if (selectedLinkIndex === null) return;
    const updated = [...navLinks];
    updated[selectedLinkIndex] = {
      ...updated[selectedLinkIndex],
      [field]: value
    };
    setNavLinks(updated);
  };

  const handleSubLinkChange = (field: keyof INavLinkDropdown, value: any) => {
    if (selectedSubLinkIndex === null) return;
    const { linkIdx, subIdx } = selectedSubLinkIndex;
    const updated = [...navLinks];
    if (updated[linkIdx].dropdown && updated[linkIdx].dropdown![subIdx]) {
      updated[linkIdx].dropdown![subIdx] = {
        ...updated[linkIdx].dropdown![subIdx],
        [field]: value
      };
      setNavLinks(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading navbar CMS...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Navbar CMS</h2>
          <p className="text-gray-500 text-sm mt-1">
            Configure menu items, support dropdown layouts, and manage the language selector in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'edit' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit Navbar
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === 'preview' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> Live Preview
            </button>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-md transition duration-200">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Config
              </>
            )}
          </Button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* LIVE MOCKUP PREVIEW */
        <div className="bg-slate-50 border border-dashed border-gray-250 p-8 rounded-2xl shadow-inner space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100/50 p-4 max-w-4xl mx-auto overflow-hidden">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm tracking-wider">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white"><Layers className="w-4 h-4" /></div>
                IMMIGRANT WORLD
              </div>

              {/* Navigation Center */}
              <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link, i) => (
                  <div key={i} className="relative group px-3 py-1.5 text-xs font-semibold uppercase text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1">
                    {link.icon && renderIconPreview(link.icon, 12)}
                    {link.nameEn}
                    {link.dropdown && link.dropdown.length > 0 && <ChevronDown size={10} />}
                  </div>
                ))}
              </div>

              {/* Right Side Toggle / Logins */}
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-gray-100 text-gray-600"><Moon size={14} /></button>
                {showLanguageToggle && (
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-slate-600 text-xs font-semibold uppercase">
                    <Globe size={12} />
                    EN
                  </button>
                )}
                <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">Login</button>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400">Interactive live mockup matching the current dynamic structure</p>
        </div>
      ) : (
        /* EDITOR LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* General Config & Links Tree (Left Col) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-gray-150">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Navbar Hierarchy
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold uppercase">Language Selector:</span>
                <Checkbox
                  checked={showLanguageToggle}
                  onCheckedChange={(checked) => setShowLanguageToggle(checked === true)}
                />
              </div>
            </div>

            {/* Links List */}
            <div className="space-y-3">
              {navLinks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-400 text-sm">No navigation links added. Seed one using the button below!</p>
                </div>
              ) : (
                navLinks.map((link, idx) => (
                  <div key={idx} className="space-y-2">
                    {/* Main Link Box */}
                    <div
                      onClick={() => {
                        setSelectedLinkIndex(idx);
                        setSelectedSubSubLinkIndex(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                        selectedLinkIndex === idx && selectedSubLinkIndex === null
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                          : 'border-gray-100 hover:border-gray-250 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="p-2 bg-white rounded-lg border border-gray-100 text-gray-500">
                          {link.icon ? renderIconPreview(link.icon, 14) : <Layers className="w-3.5 h-3.5" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-gray-800 text-sm truncate">{link.nameEn}</p>
                          <p className="text-gray-400 text-xs truncate">{link.href}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => moveLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLink(idx, 'down')}
                          disabled={idx === navLinks.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMainLink(idx)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sub Links List (Nested Dropdown) */}
                    {link.dropdown && link.dropdown.length > 0 && (
                      <div className="ml-8 space-y-1.5 border-l-2 border-gray-150 pl-3">
                        {link.dropdown.map((subLink, subIdx) => (
                          <div
                            key={subIdx}
                            onClick={() => setSelectedSubSubLinkIndex({ linkIdx: idx, subIdx })}
                            className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer text-xs ${
                              selectedSubLinkIndex?.linkIdx === idx && selectedSubLinkIndex?.subIdx === subIdx
                                ? 'border-purple-500 bg-purple-50/40 shadow-sm'
                                : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="p-1 bg-gray-50 rounded text-gray-400">
                                {subLink.icon ? renderIconPreview(subLink.icon, 12) : <Layers className="w-3 h-3" />}
                              </span>
                              <span className="font-medium text-gray-750 truncate">{subLink.nameEn}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubLink(idx, subIdx);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Nested Sub Link Trigger */}
                    {selectedLinkIndex === idx && (
                      <div className="ml-8 pl-3">
                        <button
                          type="button"
                          onClick={() => addSubLink(idx)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition"
                        >
                          <Plus className="w-3 h-3" /> Add Dropdown Link
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <Button
              type="button"
              onClick={addMainLink}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Main Navigation Item
            </Button>
          </div>

          {/* Configuration Form (Right Col) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {selectedSubLinkIndex !== null ? (
              /* SUB LINK EDITOR FORM */
              (() => {
                const { linkIdx, subIdx } = selectedSubLinkIndex;
                const subLink = navLinks[linkIdx]?.dropdown?.[subIdx];
                if (!subLink) return <div className="text-center py-20 text-gray-400">Dropdown Item details not found.</div>;

                return (
                  <div className="space-y-6">
                    <div className="border-b pb-4 border-gray-150 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase">Dropdown Link Editor</span>
                        <h3 className="text-lg font-bold text-gray-800 mt-1">Editing "{subLink.nameEn}"</h3>
                      </div>
                      <button
                        onClick={() => setSelectedSubSubLinkIndex(null)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Back to Parent Link
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Label (English) *</label>
                        <Input
                          value={subLink.nameEn}
                          onChange={(e) => handleSubLinkChange('nameEn', e.target.value)}
                          placeholder="e.g. Blog"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">লেবেল (Bangla) *</label>
                        <Input
                          value={subLink.nameBn}
                          onChange={(e) => handleSubLinkChange('nameBn', e.target.value)}
                          placeholder="যেমন: ব্লগ"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Redirect URL / Path *</label>
                      <Input
                        value={subLink.href}
                        onChange={(e) => handleSubLinkChange('href', e.target.value)}
                        placeholder="e.g. /blog or https://domain.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description (English)</label>
                        <Input
                          value={subLink.descriptionEn || ''}
                          onChange={(e) => handleSubLinkChange('descriptionEn', e.target.value)}
                          placeholder="Articles & insights"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">বর্ণনা (Bangla)</label>
                        <Input
                          value={subLink.descriptionBn || ''}
                          onChange={(e) => handleSubLinkChange('descriptionBn', e.target.value)}
                          placeholder="নিবন্ধ এবং অন্তর্দৃষ্টি"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Badge Text (English)</label>
                        <Input
                          value={subLink.badgeEn || ''}
                          onChange={(e) => handleSubLinkChange('badgeEn', e.target.value)}
                          placeholder="e.g. New"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ব্যাজ টেক্সট (Bangla)</label>
                        <Input
                          value={subLink.badgeBn || ''}
                          onChange={(e) => handleSubLinkChange('badgeBn', e.target.value)}
                          placeholder="যেমন: নতুন"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Featured Style</p>
                        <p className="text-xs text-gray-400">Highlights this item with the brand primary color</p>
                      </div>
                      <Checkbox
                        checked={subLink.featured ?? false}
                        onCheckedChange={(checked) => handleSubLinkChange('featured', checked === true)}
                      />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Icon</label>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={subLink.icon || ''}
                          onChange={(e) => handleSubLinkChange('icon', e.target.value)}
                          placeholder="Lucide Icon name (e.g. Mail)"
                          className="flex-1"
                        />
                        <div className="w-10 h-10 border rounded-xl flex items-center justify-center bg-gray-50">
                          {subLink.icon ? renderIconPreview(subLink.icon, 20) : null}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-24 overflow-y-auto">
                        {COMMON_ICONS.map((ico) => (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => handleSubLinkChange('icon', ico)}
                            className={`px-2.5 py-1 text-xs bg-white hover:bg-purple-50 hover:text-purple-600 rounded border transition flex items-center gap-1 ${subLink.icon === ico ? 'border-purple-500 text-purple-600' : 'border-gray-150'}`}
                          >
                            {renderIconPreview(ico, 12)} {ico}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : selectedLinkIndex !== null ? (
              /* MAIN LINK EDITOR FORM */
              (() => {
                const link = navLinks[selectedLinkIndex];
                if (!link) return <div className="text-center py-20 text-gray-400">Select a link to configure.</div>;

                return (
                  <div className="space-y-6">
                    <div className="border-b pb-4 border-gray-150">
                      <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">Main Link Editor</span>
                      <h3 className="text-lg font-bold text-gray-800 mt-1">Editing "{link.nameEn}"</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Label (English) *</label>
                        <Input
                          value={link.nameEn}
                          onChange={(e) => handleMainLinkChange('nameEn', e.target.value)}
                          placeholder="e.g. Home"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">লেবেল (Bangla) *</label>
                        <Input
                          value={link.nameBn}
                          onChange={(e) => handleMainLinkChange('nameBn', e.target.value)}
                          placeholder="যেমন: হোম"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Redirect URL / Path *</label>
                      <Input
                        value={link.href}
                        onChange={(e) => handleMainLinkChange('href', e.target.value)}
                        placeholder="e.g. /all-courses (Use '#' if you only want this to trigger a dropdown)"
                      />
                      <p className="text-xs text-gray-400 mt-1">Set to `#` if this serves as a folder dropdown containing other links.</p>
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Icon</label>
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          value={link.icon || ''}
                          onChange={(e) => handleMainLinkChange('icon', e.target.value)}
                          placeholder="Lucide Icon name (e.g. BookOpen)"
                          className="flex-1"
                        />
                        <div className="w-10 h-10 border rounded-xl flex items-center justify-center bg-gray-50">
                          {link.icon ? renderIconPreview(link.icon, 20) : null}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100 max-h-24 overflow-y-auto">
                        {COMMON_ICONS.map((ico) => (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => handleMainLinkChange('icon', ico)}
                            className={`px-2.5 py-1 text-xs bg-white hover:bg-blue-50 hover:text-blue-600 rounded border transition flex items-center gap-1 ${link.icon === ico ? 'border-blue-500 text-blue-600' : 'border-gray-150'}`}
                          >
                            {renderIconPreview(ico, 12)} {ico}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* EMPTY FORM fallback */
              <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
                <Layers className="w-12 h-12 text-gray-250" />
                <p className="text-gray-400 font-medium">Select a navigation link from the left panel to configure its details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
