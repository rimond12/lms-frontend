"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  ChevronDown,
  Video,
  Eye,
  Briefcase,
  BookOpen,
} from 'lucide-react';

interface Material {
  _id?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  url?: string;
  type?: 'pdf' | 'video' | 'doc' | 'image' | 'link' | 'external-link';
  duration?: number;
  order?: number;
}

interface MaterialsSectionProps {
  materials?: Material[];
  isLocked?: boolean;
  onUnlock?: () => void;
  hasAccess?: boolean;
  enrollmentStatus?: string;
}

const getIconForType = (type?: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-red-800" />;
    case 'video':
      return <Video className="w-5 h-5 text-blue-600" />;
    case 'link':
    case 'external-link':
      return <Briefcase className="w-5 h-5 text-green-600" />;
    default:
      return <BookOpen className="w-5 h-5 text-purple-600" />;
  }
};

const getMaterialTypeLabel = (type?: string) => {
  switch (type) {
    case 'pdf':
      return 'PDF Document';
    case 'video':
      return 'Video Tutorial';
    case 'link':
    case 'external-link':
      return 'External Link';
    case 'doc':
      return 'Document';
    default:
      return 'Material';
  }
};

const MaterialCard: React.FC<{
  material: Material;
  index: number;
  isLocked?: boolean;
  onUnlock?: () => void;
  hasAccess?: boolean;
  enrollmentStatus?: string;
}> = ({ material, index, isLocked, onUnlock, hasAccess, enrollmentStatus }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-violet-50/30 rounded-2xl border border-slate-200/60 hover:border-violet-200 hover:shadow-xl transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-100/50 to-transparent rounded-bl-full"></div>
      <div
        className="flex items-center gap-4 p-6 cursor-pointer bg-white/60 hover:bg-white/80 relative z-10"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className="p-3 bg-violet-100 rounded-xl shadow-sm">
          {getIconForType(material.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
            {material.title}
            {material.type === 'video' && (
              <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-semibold border border-red-200/50">
                {material.duration ? `${material.duration}min` : 'Video'}
              </span>
            )}
          </h4>
        
        </div>

        {/* Status Icons */}
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-200/60 bg-slate-50/50 p-6 relative z-10"
          >
            <div className="space-y-4">
              {material.description && (
                <p className="text-sm text-slate-700 leading-relaxed">{material.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <span className="inline-block text-xs bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-700 font-medium">
                  {getMaterialTypeLabel(material.type)}
                </span>
                {material.duration && (
                  <span className="inline-block text-xs bg-white border border-slate-300 px-3 py-2 rounded-lg text-slate-700 font-medium">
                    ⏱️ {material.duration} minutes
                  </span>
                )}
              </div>

              {/* Locked message */}
              <div className="mt-4 p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-300 rounded-lg">
                    <BookOpen className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    {enrollmentStatus === 'pending_approval' ? (
                      <>
                        <p className="text-sm font-semibold text-amber-800">Enrollment Pending Approval</p>
                        <p className="text-xs text-amber-700 mt-1">Your enrollment is awaiting admin approval. You'll receive access once approved.</p>
                      </>
                    ) : enrollmentStatus === 'rejected' ? (
                      <>
                        <p className="text-sm font-semibold text-red-800">Enrollment Rejected</p>
                        <p className="text-xs text-red-700 mt-1">Your enrollment was not approved. Please contact support for more information.</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-800">Resource Locked</p>
                        <p className="text-xs text-slate-600 mt-1">Enroll in the program to access this material</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  materials = [],
  isLocked,
  onUnlock,
  hasAccess,
  enrollmentStatus,
}) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Materials Yet</h3>
        <p className="text-gray-600">Materials will be available soon</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {materials.map((material, index) => (
        <MaterialCard
          key={material._id || index}
          material={material}
          index={index}
          isLocked={isLocked}
          onUnlock={onUnlock}
          hasAccess={hasAccess}
          enrollmentStatus={enrollmentStatus}
        />
      ))}
    </div>
  );
};

export default MaterialsSection;
