"use client";

import React, { useState } from 'react';
import { Search, User, MapPin, BookOpen, ExternalLink } from 'lucide-react';
import { useGetExpertsQuery } from '@/app/redux/api/expartPanelApi/expartPanelApi';
import Link from 'next/link';
import Image from 'next/image';
import AppImage from '@/components/ui/AppImage';

export default function ExpertPanelPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: expertsData, isLoading, error } = useGetExpertsQuery({
    page: currentPage,
    limit: itemsPerPage,
    searchTerm: searchTerm || undefined
  });
  
  const experts = expertsData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="h-12 bg-gray-100 rounded w-1/4 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 animate-pulse">
                <div className="w-20 h-20 bg-gray-100 rounded-full mb-6 mx-auto"></div>
                <div className="h-6 bg-gray-100 rounded mb-3"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <User className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-black mb-4">Error Loading Experts</h1>
          <p className="text-gray-600 text-lg">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Banner Section */}
        <div className="relative mb-10 mt-10">
          <div className="relative h-80 md:h-64 lg:h-80 overflow-hidden rounded-xl  bg-white border-2 border-red-100">
            {/* Background Animations */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50 to-white"></div>
            
            {/* Floating Emojis Animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-10 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
                <span className="text-4xl opacity-20">👨‍💼</span>
              </div>
              <div className="absolute top-20 right-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>
                <span className="text-3xl opacity-20">👩‍🏫</span>
              </div>
             
              
            
            </div>
            
            {/* Subtle Red Accent Lines */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-200 via-red-300 to-red-200"></div>
            <div className=" absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-200 via-red-300 to-red-200"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-black px-6 max-w-4xl mx-auto relative z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl uppercase font-extrabold mb-4 tracking-tight text-black drop-shadow-sm">
                  Expert Panel
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light">
                  Meet our distinguished panel of experts who bring years of experience and deep knowledge
                  in their respective fields to guide and mentor our community.
                </p>
                <div className="mt-6">
                  <div className="inline-flex items-center px-6 py-3 bg-red-100 backdrop-blur-sm rounded-full text-sm font-medium text-red-800 border border-red-200">
                    <span className="mr-2">👥</span>
                    Trusted Professionals
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search experts by name, specialization, or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 border-2 border-gray-200 rounded-xl focus:border-red-800 focus:ring-4 focus:ring-red-100 text-lg transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {experts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No Experts Found</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              We couldn't find any experts matching your search. Try adjusting your search criteria or browse all experts.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-6 px-6 py-3 bg-red-800 text-white font-semibold rounded-lg hover:bg-red-900 transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid mb-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {experts.map((expert) => (
              <div key={expert._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-red-800 hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
                {/* Expert Photo */}
                <div className="flex justify-center mb-6">
                  <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {expert.photoUrl ? (
                      <AppImage
                        photoUrl={expert.photoUrl}
                        alt={expert.name}
                        width={112}
                        height={112}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expert Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-800 transition-colors">{expert.name}</h3>
                  <p className="text-red-800 font-semibold text-lg">{expert.designation}</p>
                </div>

                {/* Expert Details */}
                <div className="space-y-4 mb-4">
                  <div className="flex items-start text-gray-700">
                    <MapPin className="w-5 h-5 mr-3 text-red-800 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{expert.institution}</span>
                  </div>
                  <div className="flex items-start text-gray-700">
                    <BookOpen className="w-5 h-5 mr-3 text-red-800 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{expert.specialization}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {expert.bio}
                </p>

                {/* View Profile Link */}
                <div className="text-center">
                  <Link
                    href={`/expert-panel/${expert.slugUrl}`}
                    className="inline-flex items-center justify-center w-full py-3 px-6 bg-red-800 text-white hover:bg-red-900 font-semibold text-sm rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:shadow-xl"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}