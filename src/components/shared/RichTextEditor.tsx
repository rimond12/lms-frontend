"use client"

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline,  List, ListOrdered, Link2, Loader,
  AlignLeft, AlignCenter, AlignRight, Quote, Code, Palette,
  Type, ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onImageInserted?: (imagePath: string) => void;
}

const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
];

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  onImageUpload,
  onImageInserted
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  // Focus the editor when value changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        const headingElement = document.createElement(`h${level}`);
        headingElement.innerHTML = selectedText;
        headingElement.className = getHeadingClasses(level);
        
        range.deleteContents();
        range.insertNode(headingElement);
        
        // Clear selection and move cursor after heading
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(headingElement);
        newRange.collapse(true);
        selection.addRange(newRange);
      } else {
        formatText('formatBlock', `h${level}`);
      }
    }
    setShowHeadingMenu(false);
    handleContentChange();
  };

  const getHeadingClasses = (level: number) => {
    const baseClasses = "font-bold my-2";
    switch (level) {
      case 1: return `${baseClasses} text-2xl`;
      case 2: return `${baseClasses} text-xl`;
      case 3: return `${baseClasses} text-lg`;
      default: return baseClasses;
    }
  };

  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Quote text here...';
      
      const blockquote = document.createElement('blockquote');
      blockquote.innerHTML = selectedText;
      blockquote.className = "border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2 my-2 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
      
      if (selectedText !== 'Quote text here...') {
        range.deleteContents();
      }
      range.insertNode(blockquote);
      
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(blockquote);
      newRange.collapse(true);
      selection.addRange(newRange);
    }
    handleContentChange();
  };

  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString() || 'Your code here...';
      
      const codeBlock = document.createElement('pre');
      const code = document.createElement('code');
      code.innerHTML = selectedText;
      codeBlock.appendChild(code);
      codeBlock.className = "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3 my-2 text-sm font-mono overflow-x-auto";
      
      if (selectedText !== 'Your code here...') {
        range.deleteContents();
      }
      range.insertNode(codeBlock);
      
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(codeBlock);
      newRange.collapse(true);
      selection.addRange(newRange);
    }
    handleContentChange();
  };

  const setTextColor = (color: string) => {
    formatText('foreColor', color);
    setShowColorPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      let imageUrl: string;
      
      if (onImageUpload) {
        imageUrl = await onImageUpload(file);
        
        if (!imageUrl) {
          throw new Error('Image upload failed - no URL returned');
        }
        
        if (onImageInserted) {
          const relativePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
          onImageInserted(relativePath);
        }
      } else {
        imageUrl = URL.createObjectURL(file);
      }

      const imagePlaceholder = `<div class="image-placeholder" data-src="${imageUrl}" style="
        border: 2px dashed #ccc; 
        padding: 20px; 
        text-align: center; 
        margin: 10px 0; 
        border-radius: 8px;
        background: #f9f9f9;
        color: #666;
      ">
        <img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 4px;" />
        <p style="margin: 8px 0 0 0; font-size: 12px;">Image uploaded successfully</p>
      </div>`;
      
      editorRef.current?.focus();
      document.execCommand('insertHTML', false, imagePlaceholder);
      handleContentChange();
      
    } catch (error) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      let content = editorRef.current.innerHTML;
      content = content.replace(/<div class="image-placeholder"[^>]*>[\s\S]*?<\/div>/g, '[IMAGE_PLACEHOLDER]');
      content = content.replace(/<p><br><\/p>/g, '');
      content = content.replace(/<p>\s*<\/p>/g, '');
      onChange(content);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColorPicker || showHeadingMenu) {
        const target = event.target as Element;
        if (!target.closest('.color-picker-container') && !target.closest('.heading-menu-container')) {
          setShowColorPicker(false);
          setShowHeadingMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker, showHeadingMenu]);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Heading Dropdown */}
        <div className="relative heading-menu-container">
          <button
            type="button"
            onClick={() => setShowHeadingMenu(!showHeadingMenu)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-700 dark:text-gray-300"
            title="Headings"
          >
            <Type size={16} />
            <ChevronDown size={12} />
          </button>
          
          {showHeadingMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => insertHeading(1)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-2xl font-bold text-gray-900 dark:text-gray-100"
              >
                H1
              </button>
              <button
                onClick={() => insertHeading(2)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                H2
              </button>
              <button
                onClick={() => insertHeading(3)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-lg font-bold text-gray-900 dark:text-gray-100"
              >
                H3
              </button>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Basic Formatting */}
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Underline"
        >
          <Underline size={16} />
        </button>

        {/* Color Picker */}
        <div className="relative color-picker-container">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="Text Color"
          >
            <Palette size={16} />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 p-3">
              <div className="grid grid-cols-4 gap-2 w-48">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setTextColor(color.value)}
                    className="w-8 h-8 rounded border-2 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Text Alignment */}
        <button
          type="button"
          onClick={() => formatText('justifyLeft')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('justifyCenter')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('justifyRight')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Lists */}
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        
        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
        
        {/* Special Elements */}
        <button
          type="button"
          onClick={insertBlockquote}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Blockquote"
        >
          <Quote size={16} />
        </button>
        
        <button
          type="button"
          onClick={insertCodeBlock}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Code Block"
        >
          <Code size={16} />
        </button>
        
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) formatText('createLink', url);
          }}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Insert Link"
        >
          <Link2 size={16} />
        </button>
        
        {/* <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || !onImageUpload}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
          title="Insert Image"
        >
          {isUploading ? <Loader size={16} className="animate-spin" /> : <Image size={16} />}
        </button> */}
{/*         
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isUploading}
          className="hidden"
        /> */}
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          className="min-h-[120px] p-4 focus:outline-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
          suppressContentEditableWarning
        />
        
        {!value && (
          <div 
            className="absolute top-4 left-4 text-gray-400 dark:text-gray-500 pointer-events-none"
            style={{ display: value ? 'none' : 'block' }}
          >
            {placeholder}
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader size={20} className="animate-spin" />
              <span>Uploading image...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
