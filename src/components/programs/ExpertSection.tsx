"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Briefcase, Award, GraduationCap } from "lucide-react";
import { FaLinkedin, FaFacebook, FaTwitter, FaYoutube } from "react-icons/fa";
import AppImage from "@/components/ui/AppImage";

interface Expert {
  _id?: string;
  userId?: string;
  name: string;
  designation: string;
  photoUrl?: string;
  profileImage?: string;
  bio?: string;
  specialization?: string[];
  experience?: string;
  skills?: string[];
  social?: {
    linkedIn?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
}

interface ExpertSectionProps {
  experts?: Expert[];
  onExpertClick?: (expertId: string) => void;
}

export const ExpertSection: React.FC<ExpertSectionProps> = ({
  experts = [],
}) => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedExpert(null);
  };

  if (!experts || experts.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Experts Coming Soon
        </h3>
        <p className="text-sm text-gray-600">
          Expert instructors will be assigned soon
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
          <GraduationCap className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Course Instructors</h2>
      </div>

      {/* Passport Size Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {experts.map((expert, index) => (
          <motion.div
            key={expert._id || index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            viewport={{ once: true }}
            onClick={() => openModal(expert)}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group"
          >
            {/* Passport Size Photo */}
            <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
              {expert.photoUrl || expert.profileImage ? (
                <AppImage
                  photoUrl={expert.photoUrl || expert.profileImage}
                  alt={expert.name}
                  width={200}
                  height={260}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-300" />
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* View badge */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                View Profile
              </div>
            </div>

            {/* Name & Designation */}
            <div className="p-3 text-center bg-gradient-to-b from-white to-gray-50">
              <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                {expert.name}
              </h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {expert.designation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Full Details */}
      <AnimatePresence>
        {modalOpen && selectedExpert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors z-10 shadow-sm"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Header with Large Photo */}
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
                <div className="flex gap-5 items-start">
                  {/* Large Photo */}
                  <div className="w-28 h-36 rounded-xl overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
                    {selectedExpert.photoUrl || selectedExpert.profileImage ? (
                      <AppImage
                        photoUrl={
                          selectedExpert.photoUrl || selectedExpert.profileImage
                        }
                        alt={selectedExpert.name}
                        width={112}
                        height={144}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {selectedExpert.name}
                    </h3>
                    <p className="text-emerald-600 font-medium mb-3">
                      {selectedExpert.designation}
                    </p>
                    {/* Social Links */}
                    {selectedExpert.social && (
                      <div className="flex gap-2">
                        {selectedExpert.social.linkedIn && (
                          <a
                            href={selectedExpert.social.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <FaLinkedin className="w-4 h-4" />
                          </a>
                        )}
                        {selectedExpert.social.facebook && (
                          <a
                            href={selectedExpert.social.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                            <FaFacebook className="w-4 h-4" />
                          </a>
                        )}
                        {selectedExpert.social.twitter && (
                          <a
                            href={selectedExpert.social.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-sky-100 text-sky-500 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors"
                          >
                            <FaTwitter className="w-4 h-4" />
                          </a>
                        )}
                        {selectedExpert.social.youtube && (
                          <a
                            href={selectedExpert.social.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <FaYoutube className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-5">
                {/* Bio/Description */}
                {selectedExpert.bio && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-500" />
                      About
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedExpert.bio}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {selectedExpert.experience && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-500" />
                      Experience
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedExpert.experience}
                    </p>
                  </div>
                )}

                {/* Specialization */}
                {selectedExpert.specialization &&
                  selectedExpert.specialization.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-500" />
                        Specialization
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExpert.specialization.map((spec, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Skills */}
                {selectedExpert.skills && selectedExpert.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-500" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpert.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpertSection;
