"use client";
import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import RichTextRenderer from './RichTextRenderer';
import AppImage from '@/components/ui/AppImage';

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
  category?: string;
  tags?: string[];
  priority?: 'breaking' | 'featured' | 'regular';
}

interface NewsCardProps {
  item: NewsItem;
  variant?: 'featured' | 'compact' | 'breaking' | 'regular';
  className?: string;
}

export default function NewsCard({ item, variant = 'regular', className = '' }: NewsCardProps) {
  const isBreaking = variant === 'breaking' || item.priority === 'breaking';
  const isFeatured = variant === 'featured' || item.priority === 'featured';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <article className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 ${className}`}>
        <div className="flex">
          {/* Image */}
          <div className="w-32 h-24 flex-shrink-0">
            {item.photoUrl ? (
              <AppImage
                photoUrl={item.photoUrl}
                alt={item.title}
                width={128}
                height={96}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(item.createdAt), 'MMM dd')}
              {isBreaking && (
                <span className="ml-2 px-2 py-1 bg-red-800 text-white text-xs font-bold rounded-full animate-pulse">
                  BREAKING
                </span>
              )}
            </div>

            <Link href={`/news/${item.slug}`}>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-red-800 transition-colors duration-200 cursor-pointer">
                {item.title}
              </h3>
            </Link>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">3 min read</div>
              <Link 
                href={`/news/${item.slug}`}
                className="text-xs font-medium text-red-800 hover:text-red-700 transition-colors duration-200"
              >
                Read →
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`group bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative ${
      isBreaking ? 'border-red-200 bg-red-50/30' : isFeatured ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'
    } ${className}`}>
      {/* Priority Badge */}
      {(isBreaking || isFeatured) && (
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            isBreaking ? 'bg-red-800 text-white animate-pulse' : 'bg-blue-600 text-white'
          }`}>
            {isBreaking ? 'BREAKING' : 'FEATURED'}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden">
        <Link href={`/news/${item.slug}`}>
          {item.photoUrl ? (
            <AppImage
              photoUrl={item.photoUrl}
              alt={item.title}
              width={400}
              height={isFeatured ? 192 : 160}
              className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer ${
                isFeatured ? 'h-48' : 'h-40'
              }`}
            />
          ) : (
            <div className={`w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center cursor-pointer ${
              isFeatured ? 'h-48' : 'h-40'
            }`}>
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          )}
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          <span className="mx-2">•</span>
          <span>News</span>
        </div>

        <Link href={`/news/${item.slug}`}>
          <h2 className={`font-bold text-gray-900 mb-3 group-hover:text-red-800 transition-colors duration-200 cursor-pointer ${
            isFeatured ? 'text-xl line-clamp-2' : 'text-lg line-clamp-2'
          }`}>
            {item.title}
          </h2>
        </Link>

        <div className="mb-4">
          <RichTextRenderer 
            htmlString={item.content} 
            className="text-gray-600 text-sm leading-relaxed line-clamp-3" 
          />
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors duration-200"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            3 min read
          </div>
          
          <Link 
            href={`/news/${item.slug}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 hover:text-white hover:bg-red-800 border border-red-800 rounded-lg transition-all duration-200 group"
          >
            Read More
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export { NewsCard };
