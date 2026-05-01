"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Play,
  Download,
  ExternalLink,
  ChevronDown,
  Volume2,
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

interface EnrollmentMaterialsLayoutProps {
  materials: Material[];
  viewedMaterials: Set<string>;
  onMaterialView: (materialId: string) => Promise<void>;
  isViewed: boolean;
}

export default function EnrollmentMaterialsLayout({
  materials,
  viewedMaterials,
  onMaterialView,
  isViewed,
}: EnrollmentMaterialsLayoutProps) {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMarkingViewed, setIsMarkingViewed] = useState(false);

  const playingMaterial = materials.find((m) => m._id === playingVideoId && m.type === 'video');

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-800" />;
      case 'video':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'audio':
        return <Volume2 className="w-5 h-5 text-purple-600" />;
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

  return (
    <div className="space-y-6">
      {/* Video Player - Show when video is selected */}
      <AnimatePresence mode="wait">
        {playingMaterial && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className=" top-4 z-30 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setPlayingVideoId(null)}
                className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                ✕ Close Player
              </button>
            </div>

            {/* Video Player Component */}
            <VideoPlayer
              url={playingMaterial.fileUrl || playingMaterial.url || ''}
              title={playingMaterial.title}
              description={playingMaterial.description}
              materialId={playingMaterial._id}
              hasViewed={viewedMaterials.has(playingMaterial._id)}
              onViewed={async () => {
                try {
                  await onMaterialView(playingMaterial._id);
                } catch (error) {
                  console.error('Error marking as viewed:', error);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Materials List - Always visible */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {playingMaterial ? '📚 Materials - ' + playingMaterial.title + ' Playing' : '📚 Materials'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {materials.length} material{materials.length !== 1 ? 's' : ''} •{' '}
            {viewedMaterials.size} completed
          </p>
        </div>

        {/* Materials Grid/List */}
        <div className="space-y-3">
          {materials.map((material, index) => {
            const isCurrentlyPlaying = playingVideoId === material._id;
            const isViewed = viewedMaterials.has(material._id);

            return (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className={`rounded-lg border-2 overflow-hidden transition-all duration-300 cursor-pointer group ${
                  isCurrentlyPlaying
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : isViewed
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:shadow-lg hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => {
                    if (material.type === 'video') {
                      setPlayingVideoId(material._id);
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
                  className="w-full text-left p-4 flex items-start gap-4 hover:bg-opacity-70 transition-colors disabled:opacity-50"
                >
                  {/* Icon & Status */}
                  <div className="flex-shrink-0 mt-0.5 relative">
                    <div
                      className={`p-3 rounded-lg ${
                        isCurrentlyPlaying
                          ? 'bg-blue-200'
                          : isViewed
                            ? 'bg-emerald-100'
                            : 'bg-gray-100'
                      }`}
                    >
                      {getFileIcon(material.type)}
                    </div>

                    {/* Playing Indicator */}
                    {isCurrentlyPlaying && (
                      <div className="absolute -top-2 -right-2 flex items-center gap-1">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                        <span className="text-xs font-bold text-blue-600">Playing</span>
                      </div>
                    )}

                    {/* Viewed Indicator */}
                    {isViewed && !isCurrentlyPlaying && (
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
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold line-clamp-2 ${
                              isCurrentlyPlaying
                                ? 'text-blue-900'
                                : isViewed
                                  ? 'text-emerald-900'
                                  : 'text-gray-900'
                            }`}
                          >
                            {index + 1}. {material.title}
                          </h4>
                          {material.type === 'video' && isCurrentlyPlaying && (
                            <span className="inline-block flex-shrink-0 animate-pulse">
                              🔊
                            </span>
                          )}
                        </div>

                        {material.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {material.description}
                          </p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end gap-1">
                        {isCurrentlyPlaying && (
                          <span className="inline-block flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                            ▶ Playing
                          </span>
                        )}
                        {isViewed && !isCurrentlyPlaying && (
                          <span className="inline-block flex-shrink-0 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                            ✓ Viewed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Details Row */}
                    <div className="flex items-center gap-4 mt-3">
                      {material.duration && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.829 2.828a1 1 0 101.415 1.415L9 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {material.duration}
                        </span>
                      )}

                      {/* Material Type Label */}
                      {material.type === 'video' ? (
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Video
                        </span>
                      ) : material.type === 'audio' ? (
                        <span className="text-xs font-semibold text-purple-600 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          Audio
                        </span>
                      ) : material.type === 'external-link' ||
                        material.fileUrl?.startsWith('http') ? (
                        <span className="text-xs font-semibold text-red-800 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Link
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
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                          isCurrentlyPlaying
                            ? 'bg-blue-200 text-blue-700'
                            : isViewed
                              ? 'bg-emerald-200 text-emerald-700'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {material.type}
                      </span>

                      {/* Click Hint */}
                      {material.type === 'video' && !isCurrentlyPlaying && (
                        <span className="text-xs text-gray-500 italic">
                          Click to play
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Course Progress</h4>
            <p className="text-sm text-gray-600 mt-1">
              {viewedMaterials.size} of {materials.length} materials completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(viewedMaterials.size / materials.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              />
            </div>
            <span className="text-sm font-bold text-gray-900 min-w-fit">
              {Math.round((viewedMaterials.size / materials.length) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
