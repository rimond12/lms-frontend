"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  Users,
  Award,
  DollarSign,
  Calendar,
  MapPin,
  BookOpen,
  FileText,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { useGetCourseBySlugQuery } from '@/app/redux/api/CourseApi/CourseApi';

export default function CourseDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: course, isLoading, error } = useGetCourseBySlugQuery(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF4444] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the course you're looking for.</p>
          <Link
            href="/all-courses"
            className="inline-block px-6 py-2 bg-[#AF4444] text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = course.discountedPrice || course.price;
  const originalPrice = course.price && course.discountedPrice ? course.price : undefined;
  const discountPercentage = originalPrice && course.discountedPrice
    ? Math.round(((originalPrice - course.discountedPrice) / originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
    

      {/* Tabs Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'curriculum', label: 'Curriculum', icon: FileText },
            { id: 'quizzes', label: 'Quizzes', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#AF4444] border-b-2 border-[#AF4444]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Description */}
              {course.description && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Course</h2>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>
              )}

              {/* Course Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {course.startDate && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-6 h-6 text-[#AF4444] flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                          <p className="text-gray-700">
                            {new Date(course.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {course.endDate && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-6 h-6 text-[#AF4444] flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
                          <p className="text-gray-700">
                            {new Date(course.endDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {course.venueName && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-6 h-6 text-[#AF4444] flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Venue</h3>
                          <p className="text-gray-700">{course.venueName}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {course.locations && (
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-6 h-6 text-[#AF4444] flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                          <p className="text-gray-700">{course.locations}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sponsor Info */}
              {course.sponsorTitle && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sponsor</h3>
                  <p className="text-gray-700">{course.sponsorTitle}</p>
                </div>
              )}

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-[#AF4444]/10 text-[#AF4444] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              {course.curriculum && course.curriculum.length > 0 ? (
                course.curriculum.map((module: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#AF4444]/10 to-transparent p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{module.moduleTitle}</h3>
                        <span className="bg-[#AF4444] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Module {idx + 1}
                        </span>
                      </div>
                      {module.description && (
                        <p className="text-gray-700 text-sm">{module.description}</p>
                      )}
                    </div>

                    {module.topics && module.topics.length > 0 && (
                      <div className="divide-y divide-gray-100 p-6">
                        {module.topics.map((topic: any, topicIdx: number) => (
                          <div key={topicIdx} className="py-3 first:pt-0 last:pb-0">
                            <div className="flex items-start space-x-3">
                              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-grow">
                                <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                                {topic.description && (
                                  <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
                                )}
                                {topic.duration && (
                                  <p className="text-xs text-gray-500 mt-2">Duration: {topic.duration} mins</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No curriculum available for this course.</p>
                </div>
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              {course.quizIds && course.quizIds.length > 0 ? (
                course.quizIds.map((quiz: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#AF4444] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Quiz ID: {quiz._id}</p>
                      </div>
                      <Link
                        href={`/give-quiz/${quiz._id}`}
                        className="inline-block px-4 py-2 bg-[#AF4444] text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Take Quiz
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No quizzes available for this course.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Meta Information */}
      {(course.metaDescription || course.metaKeywords) && (
        <div className="bg-gray-100 border-t border-gray-200 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {course.metaDescription && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">META DESCRIPTION</p>
                  <p className="text-gray-700 text-sm">{course.metaDescription}</p>
                </div>
              )}
              {course.metaKeywords && course.metaKeywords.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">KEYWORDS</p>
                  <div className="flex flex-wrap gap-2">
                    {course.metaKeywords.map((keyword: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
