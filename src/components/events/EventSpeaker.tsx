"use client";

import React, { useState } from 'react';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { User, Award, GraduationCap, Building2, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Speaker } from "@/types/blogEventNews";
import AppImage from '../ui/AppImage';

interface EventSpeakerProps {
  speakers?: Speaker[];
  speaker?: string; // Legacy field
  speakerDetails?: string; // Legacy field
}

export default function EventSpeaker({ speakers, speaker, speakerDetails }: EventSpeakerProps) {
  const [expandedSpeakers, setExpandedSpeakers] = useState<{ [key: number]: boolean }>({});
  
  // Use new speakers array if available, otherwise fall back to legacy fields
  const displaySpeakers = speakers && speakers.length > 0 ? speakers : (speaker ? [{
    name: speaker,
    details: speakerDetails || '',
    speakerDegree: '',
    speakerPhotoUrl: '',
    speakerCertification: '',
    speakerInstitution: ''
  }] : []);

  if (displaySpeakers.length === 0) {
    return null; // Don't render if no speakers
  }

  const truncateText = (text: string, maxWords: number = 20) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const toggleExpanded = (index: number) => {
    setExpandedSpeakers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <section className="mb-10 bg-white relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-red-800" />
            <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">
              {displaySpeakers.length > 1 ? 'Featured Speakers' : 'Featured Speaker'}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3 uppercase">
            {displaySpeakers.length > 1 ? 'Meet Our Experts' : 'Meet Our Expert'}
          </h2>
          <div className="w-16 h-1 bg-red-800 mx-auto"></div>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 gap-8">
          {displaySpeakers.map((speakerItem, index) => {
            const isExpanded = expandedSpeakers[index] || false;
            
            // Create dynamic achievements based on available data
            const achievements = [
              ...(speakerItem.speakerDegree ? [{ icon: <GraduationCap className="w-5 h-5" />, text: speakerItem.speakerDegree }] : []),
              ...(speakerItem.speakerCertification ? [{ icon: <Award className="w-5 h-5" />, text: speakerItem.speakerCertification }] : []),
              ...(speakerItem.speakerInstitution ? [{ icon: <Building2 className="w-5 h-5" />, text: speakerItem.speakerInstitution }] : [])
            ];

            // Fallback achievements if no data available
            if (achievements.length === 0) {
              achievements.push(
                { icon: <GraduationCap className="w-5 h-5" />, text: "Academic Expert" },
                { icon: <Award className="w-5 h-5" />, text: "Industry Professional" },
                { icon: <Building2 className="w-5 h-5" />, text: "Research Institution" }
              );
            }

            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
                  {/* Profile Section */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-red-50 to-white p-8 flex flex-col items-center justify-center">
                    <div className="relative">
                      {speakerItem.speakerPhotoUrl ? (
                        <AppImage 
                          photoUrl={speakerItem.speakerPhotoUrl}
                          alt={speakerItem.name}
                          width={500}
                          height={500}
                          className="w-62 h-62 rounded-xl object-cover shadow-lg border-4 border-white"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-white to-red-50 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                          <User className="w-16 h-16 text-black/60" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-red-800 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="lg:col-span-3 p-8">
                    <div className="space-y-6">
                      {/* Name and Title */}
                      <div>
                        <h3 className="text-2xl lg:text-3xl font-bold text-black mb-2">
                          {speakerItem.name}
                        </h3>
                        {speakerItem.speakerDegree && (
                          <p className="text-lg font-semibold text-red-800 mb-1">{speakerItem.speakerDegree}</p>
                        )}
                        {speakerItem.speakerInstitution && (
                          <p className="text-sm text-black/70">{speakerItem.speakerInstitution}</p>
                        )}
                      </div>

                      {/* Achievements */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {achievements.slice(0, 3).map((achievement, achievementIndex) => (
                          <div key={achievementIndex} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-red-800">
                              {achievement.icon}
                            </div>
                            <span className="text-black text-sm font-medium">{achievement.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bio */}
                      {speakerItem.details && (
                        <div className="bg-black/5 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="text-black/80 leading-relaxed text-sm">
                              {isExpanded ? (
                                <RichTextRenderer htmlString={speakerItem.details} />
                              ) : (
                                <div dangerouslySetInnerHTML={{ 
                                  __html: truncateText(speakerItem.details.replace(/<[^>]*>/g, ''), 30) 
                                }} />
                              )}
                            </div>
                            {speakerItem.details.split(' ').length > 30 && (
                              <button
                                onClick={() => toggleExpanded(index)}
                                className="flex items-center space-x-2 text-red-800 hover:text-red-700 font-medium text-sm transition-colors duration-200"
                              >
                                <span>{isExpanded ? 'See Less' : 'See More'}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}