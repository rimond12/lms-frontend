"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, MapPin, BookOpen, Calendar, Award, 
  Briefcase, GraduationCap, ExternalLink, Linkedin, 
  Twitter, Globe, Trophy, FileText 
} from 'lucide-react';
import { useGetExpertBySlugQuery } from '@/app/redux/api/expartPanelApi/expartPanelApi';
import AppImage from '@/components/ui/AppImage';

export default function ExpertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: expertData, isLoading, error } = useGetExpertBySlugQuery(slug);
  const expert = expertData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="ml-6 flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Expert Not Found</h1>
          <p className="text-gray-600 mb-6">The expert you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Expert Panel</span>
        </button>

        {/* Expert Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4 md:mb-0">
              {expert.photoUrl ? (
                <AppImage 
                                photoUrl={expert.photoUrl}
                                alt={expert.name}
                                className="w-full h-full object-cover"
                                width={500}
                                height={500}
                              />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </div>
            
            <div className="md:ml-6 flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
              <p className="text-xl text-red-800 font-semibold mb-2">{expert.designation}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{expert.institution}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{expert.specialization}</span>
                </div>
              </div>

              {/* Social Links */}
              {(expert.socialLinks?.linkedin || expert.socialLinks?.twitter || expert.socialLinks?.website) && (
                <div className="flex space-x-3 mt-4">
                  {expert.socialLinks.linkedin && (
                    <a
                      href={expert.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </a>
                  )}
                  {expert.socialLinks.twitter && (
                    <a
                      href={expert.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-sky-100 hover:bg-sky-200 rounded-full transition-colors"
                    >
                      <Twitter className="w-5 h-5 text-sky-600" />
                    </a>
                  )}
                  {expert.socialLinks.website && (
                    <a
                      href={expert.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <Globe className="w-5 h-5 text-gray-600" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-700 leading-relaxed">{expert.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Experiences */}
          {expert.jobExperiences && expert.jobExperiences.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Professional Experience</h3>
              </div>
              
              <div className="space-y-6">
                {expert.jobExperiences.map((job, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-900">{job.position}</h4>
                    <p className="text-blue-600 font-medium">{job.organization}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(job.startDate).toLocaleDateString()} - {' '}
                        {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-gray-600 text-sm mt-2">{job.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Academic Qualifications */}
          {expert.academicQualifications && expert.academicQualifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Education</h3>
              </div>
              
              <div className="space-y-6">
                {expert.academicQualifications.map((qualification, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-4">
                    <h4 className="font-semibold text-gray-900">{qualification.degree}</h4>
                    <p className="text-green-600 font-medium">{qualification.field}</p>
                    <p className="text-gray-600">{qualification.institution}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{qualification.passingYear}</span>
                      </div>
                      {qualification.grade && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {qualification.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Achievements and Publications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Achievements */}
          {expert.achievements && expert.achievements.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Achievements</h3>
              </div>
              
              <div className="space-y-3">
                {expert.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start">
                    <Award className="w-4 h-4 text-yellow-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{achievement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publications */}
          {expert.publications && expert.publications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">Publications</h3>
              </div>
              
              <div className="space-y-3">
                {expert.publications.map((publication, index) => (
                  <div key={index} className="flex items-start">
                    <FileText className="w-4 h-4 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{publication}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact or Action Section */}
        <div className="bg-gradient-to-r from-red-800 to-red-800 rounded-lg shadow-sm p-8 mt-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Connect with {expert.name}</h3>
          <p className="text-red-100 mb-6">
            Interested in learning more about {expert.specialization}? 
            Connect with our expert for insights and collaboration opportunities.
          </p>
          
          {expert.socialLinks && (expert.socialLinks.linkedin || expert.socialLinks.website) ? (
            <div className="flex justify-center space-x-4">
              {expert.socialLinks.linkedin && (
                <a
                  href={expert.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-red-800 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <Linkedin className="w-5 h-5" />
                  <span>Connect on LinkedIn</span>
                </a>
              )}
              {expert.socialLinks.website && (
                <a
                  href={expert.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-red-800 transition-colors flex items-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>
          ) : (
            <button className="bg-white text-red-800 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
              Contact Expert
            </button>
          )}
        </div>
      </div>
    </div>
  );
}