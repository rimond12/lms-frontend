"use client";

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { BlogEventNewsItem } from '@/types/blogEventNews';
import AppImage from '@/components/ui/AppImage';

interface RelatedContentCardProps {
  item: BlogEventNewsItem;
  className?: string;
}

export default function RelatedContentCard({ item, className = "" }: RelatedContentCardProps) {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'blog':
        return {
          color: 'bg-emerald-500 text-white',
          icon: <User className="w-3 h-3" />,
          label: 'Blog Post'
        };
      case 'news':
        return {
          color: 'bg-red-800 text-white',
          icon: <Clock className="w-3 h-3" />,
          label: 'News'
        };
      case 'event':
        return {
          color: 'bg-blue-500 text-white',
          icon: <Calendar className="w-3 h-3" />,
          label: 'Event'
        };
      default:
        return {
          color: 'bg-gray-500 text-white',
          icon: <Clock className="w-3 h-3" />,
          label: 'Content'
        };
    }
  };

  const categoryConfig = getCategoryConfig(item.category);

  // Ensure we have a valid slug and category before creating the URL
  const isValidItem = item && item.slug && item.category && item._id;
  const linkUrl = isValidItem ? `/${item.category}/${item.slug}` : '#';

  // If the item is invalid, render a disabled card
  if (!isValidItem) {
    return (
      <div className={`group block ${className} opacity-50 cursor-not-allowed`}>
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="w-full h-full flex items-center justify-center">
              <div className="p-3 bg-white/20 rounded-full">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-500 text-base mb-3">
              Content not available
            </h3>
            <p className="text-gray-400 text-sm">
              This content is currently unavailable.
            </p>
          </div>
        </article>
      </div>
    );
  }

  return (
    <Link href={linkUrl} className={`group block ${className}`}>
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {item.photoUrl ? (
            <AppImage
              photoUrl={item.photoUrl}
              alt={item.title || 'Content image'}
              width={300}
              height={160}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="p-3 bg-white/20 rounded-full">
                {categoryConfig.icon}
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryConfig.color}`}>
              {categoryConfig.icon}
              {categoryConfig.label}
            </span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-gray-900 text-base mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {item.title || 'Untitled Content'}
          </h3>

          {/* Excerpt */}
          {item.excerpt && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {item.excerpt}
            </p>
          )}

          {/* Meta Information */}
          <div className="space-y-2">
            {/* Date */}
            {(item.createdAt || item.eventDate) && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {item.category === 'event' && item.eventDate
                    ? format(new Date(item.eventDate), 'MMM dd, yyyy')
                    : item.createdAt 
                      ? format(new Date(item.createdAt), 'MMM dd, yyyy')
                      : 'Date not available'
                  }
                </span>
              </div>
            )}

            {/* Event Specific Info */}
            {item.category === 'event' && item.organizerName && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <MapPin className="w-3.5 h-3.5" />
                <span>by {item.organizerName}</span>
              </div>
            )}
          </div>

          {/* Read More Link */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
              Read More
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
