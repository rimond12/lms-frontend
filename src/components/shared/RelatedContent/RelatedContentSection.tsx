"use client";

import React, { useState, useEffect } from 'react';
import { useGetRelatedItemsQuery } from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import RelatedContentCard from './RelatedContentCard';
import { Calendar, FileText, Newspaper, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlogEventNewsItem } from '@/types/blogEventNews';

interface RelatedContentSectionProps {
  currentItemId: string;
  category: 'blog' | 'news' | 'event';
  limit?: number;
  variant?: 'grid' | 'horizontal';
}

export default function RelatedContentSection({ 
  currentItemId, 
  category, 
  limit = 6,
  variant = 'grid'
}: RelatedContentSectionProps) {
  const { data, isLoading, error } = useGetRelatedItemsQuery({
    category,
    currentId: currentItemId,
    limit
  });

  const relatedItems = data?.data || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide functionality
  useEffect(() => {
    if (relatedItems.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % relatedItems.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [relatedItems.length, isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % relatedItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + relatedItems.length) % relatedItems.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const getSectionConfig = (category: string) => {
    switch (category) {
      case 'blog':
        return {
          title: 'Related Blog Posts',
          icon: <FileText className="w-6 h-6 text-emerald-600" />,
          gradient: 'from-emerald-50 to-teal-50',
          borderColor: 'border-emerald-100'
        };
      case 'news':
        return {
          title: 'Related News',
          icon: <Newspaper className="w-6 h-6 text-red-800" />,
          gradient: 'from-red-50 to-pink-50',
          borderColor: 'border-red-100'
        };
      case 'event':
        return {
          title: 'Related Events',
          icon: <Calendar className="w-6 h-6 text-blue-600" />,
          gradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-100'
        };
      default:
        return {
          title: 'Related Content',
          icon: <FileText className="w-6 h-6 text-gray-600" />,
          gradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-100'
        };
    }
  };

  // Don't render if no related items
  if (!isLoading && (!relatedItems || relatedItems.length === 0)) {
    return null;
  }

  const sectionConfig = getSectionConfig(category);

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className={`bg-gradient-to-br ${sectionConfig.gradient} rounded-2xl p-8 border ${sectionConfig.borderColor}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/60 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div className="h-8 bg-white/60 rounded-lg w-48 animate-pulse"></div>
          </div>
          {variant === 'horizontal' ? (
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="flex justify-center space-x-2 mt-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="w-2 h-2 bg-white/50 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(limit)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12 ">
        <div className={`bg-gradient-to-br ${sectionConfig.gradient} rounded-2xl p-8 border ${sectionConfig.borderColor}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/60 rounded-lg">
              {sectionConfig.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{sectionConfig.title}</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-500">Unable to load related content at this time.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12 " >
      <div className={`bg-gradient-to-br ${sectionConfig.gradient} rounded-2xl p-8 border ${sectionConfig.borderColor}`}>
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white/60 rounded-lg">
            {sectionConfig.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{sectionConfig.title}</h2>
        </div>

        {/* Related Content Grid/Carousel */}
        {variant === 'horizontal' ? (
          relatedItems.length > 0 && (
            <div 
              className="relative"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {relatedItems.map((item: BlogEventNewsItem, index: number) => (
                    <div key={item._id} className="flex-shrink-0 w-full">
                      <RelatedContentCard 
                        item={item}
                        className="h-full mx-2"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {relatedItems.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                    aria-label="Previous slide"
                  >
                    {/* <ChevronLeft className="w-5 h-5" /> */}
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                    aria-label="Next slide"
                  >
                    {/* <ChevronRight className="w-5 h-5" /> */}
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {relatedItems.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {relatedItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentSlide 
                          ? 'bg-white shadow-lg scale-125' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {relatedItems.map((item: BlogEventNewsItem) => (
              <RelatedContentCard 
                key={item._id} 
                item={item}
                className="h-full"
              />
            ))}
          </div>
        )}

        {/* View All Link */}
        {relatedItems.length >= limit && (
          <div className="text-center mt-8 pt-6 border-t border-white/30">
            <a
              href={`/${category}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white text-gray-700 hover:text-gray-900 font-medium rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              View All {sectionConfig.title.replace('Related ', '')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
