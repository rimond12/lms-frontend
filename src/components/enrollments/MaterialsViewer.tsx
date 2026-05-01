"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Play,
  Download,
  ExternalLink,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface Material {
  _id: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'doc' | 'image' | 'link' | 'external-link' | 'audio';
  fileUrl: string;
  url?: string;
  duration?: string;
}

interface MaterialsViewerProps {
  materials: Material[];
  viewedMaterials: Set<string>;
  onMaterialView: (materialId: string) => Promise<void>;
  index: number;
  isViewed: boolean;
}

export default function MaterialsViewer({
  materials,
  viewedMaterials,
  onMaterialView,
  index,
  isViewed,
}: MaterialsViewerProps) {
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [isMarkingViewed, setIsMarkingViewed] = useState(false);

  const material = materials[index];

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-800" />;
      case 'video':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'audio':
        return <Play className="w-5 h-5 text-purple-600" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'image':
        return <FileText className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleViewMaterial = async (material: Material) => {
    setIsMarkingViewed(true);
    try {
      await onMaterialView(material._id);

      if (material.type === 'external-link' || material.fileUrl?.startsWith('http')) {
        window.open(material.fileUrl || material.url, '_blank');
      } else {
        window.open(material.fileUrl || material.url, '_blank');
      }
    } catch (error) {
      console.error('Error marking material as viewed:', error);
    } finally {
      setIsMarkingViewed(false);
    }
  };

  if (!material) return null;

  // If it's a video, show the expanded video player
  if (material.type === 'video' && expandedVideoId === material._id) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4"
      >
        {/* Back Button & Material Info */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setExpandedVideoId(null)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to Materials
          </button>
          <span className="text-xs text-gray-500">
            {index + 1} of {materials.length}
          </span>
        </div>

        {/* Video Player */}
        <VideoPlayer
          url={material.fileUrl || material.url || ''}
          title={material.title}
          description={material.description}
          materialId={material._id}
          hasViewed={viewedMaterials.has(material._id)}
          onViewed={async () => {
            try {
              await onMaterialView(material._id);
            } catch (error) {
              console.error('Error marking as viewed:', error);
            }
          }}
        />

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              const prevIndex = index - 1;
              if (prevIndex >= 0 && materials[prevIndex]) {
                setExpandedVideoId(materials[prevIndex]._id);
              }
            }}
            disabled={index === 0}
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg transition-colors"
          >
            ← Previous
          </button>

          <button
            onClick={() => setExpandedVideoId(null)}
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
          >
            Back to List
          </button>

          <button
            onClick={() => {
              const nextIndex = index + 1;
              if (nextIndex < materials.length && materials[nextIndex]) {
                setExpandedVideoId(materials[nextIndex]._id);
              }
            }}
            disabled={index === materials.length - 1}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            Next →
          </button>
        </div>
      </motion.div>
    );
  }

  // Otherwise show the material list item
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <button
        onClick={() => {
          if (material.type === 'video') {
            setExpandedVideoId(material._id);
            try {
              onMaterialView(material._id);
            } catch (error) {
              console.error('Error marking as viewed:', error);
            }
          } else {
            handleViewMaterial(material);
          }
        }}
        disabled={isMarkingViewed}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {/* Icon & Status */}
        <div className="flex-shrink-0 mt-1 relative">
          <div className="p-3 bg-gray-100 rounded-lg">
            {getFileIcon(material.type)}
          </div>
          {viewedMaterials.has(material._id) && (
            <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                {index + 1}. {material.title}
              </h4>
              {material.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {material.description}
                </p>
              )}
            </div>
            {viewedMaterials.has(material._id) && (
              <span className="inline-block flex-shrink-0 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                Viewed
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            {material.duration && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.829 2.828a1 1 0 101.415 1.415L9 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {material.duration}
              </span>
            )}

            {/* Material Type Actions */}
            {material.type === 'video' ? (
              <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                <Play className="w-3 h-3" />
                {isMarkingViewed ? 'Loading...' : 'Watch Video'}
              </span>
            ) : material.type === 'audio' ? (
              <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                <Play className="w-3 h-3" />
                {isMarkingViewed ? 'Loading...' : 'Play Audio'}
              </span>
            ) : material.type === 'external-link' ||
              material.fileUrl?.startsWith('http') ? (
              <span className="text-xs font-semibold text-red-800 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Open Link
              </span>
            ) : (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <Download className="w-3 h-3" />
                Download
              </span>
            )}
          </div>

          {/* Type Badge */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium capitalize">
              {material.type}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transform group-hover:translate-y-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
