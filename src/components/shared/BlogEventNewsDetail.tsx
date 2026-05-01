"use client";

import React, { useState } from 'react';
import { useGetItemBySlugQuery } from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { RelatedContentSection } from '@/components/shared/RelatedContent';
import EventDetailsPage from '@/components/events/EventDetailsPage';
import { format } from 'date-fns';
import Link from 'next/link';
import { Calendar, Clock, Share2, ArrowLeft, User, Tag } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

interface DetailPageProps {
  slug: string;
}

export default function BlogEventNewsDetail({ slug }: DetailPageProps) {
  const { data, isLoading, error } = useGetItemBySlugQuery(slug);
  const item = data?.data;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Content Not Found</h1>
          <p className="text-gray-600 mb-6">The content you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-5 py-2.5 bg-[#B34644] text-white font-medium rounded-lg hover:bg-[#8B1E1E] transition-colors duration-200"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  // If it's an event, use the dedicated EventDetailsPage
  if (item.category === 'event') {
    return <EventDetailsPage eventData={item} />;
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blog':
        return 'bg-blue-100 text-blue-800';
      case 'news':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#B34644] transition-colors duration-200">
          Home
        </Link>
        <span>/</span>
        <Link href={`/${item.category}`} className="hover:text-[#B34644] transition-colors duration-200 capitalize">
          {item.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header Section */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${getCategoryColor(item.category)}`}>
                {item.category}
              </span>
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(item?.createdAt), 'MMMM dd, yyyy')}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                5 min read
              </div>
              {item.author && (
                <div className="flex items-center text-gray-600 text-sm">
                  <User className="w-4 h-4 mr-2" />
                  {item.author}
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {item.title}
            </h1>

            {/* Excerpt/Summary */}
            {item.excerpt && (
              <p className="text-gray-700 text-xl mb-8 leading-relaxed">{item.excerpt}</p>
            )}
          </header>

          {/* Cover Image */}
          {item.photoUrl && (
            <div className="mb-8">
              <div className="relative overflow-hidden rounded-2xl shadow-lg border border-gray-100">
                <AppImage
                  photoUrl={item.photoUrl}
                  alt={item.title}
                  width={800}
                  height={400}
                  className="w-full h-48 md:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <article className="mb-10">
            <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-100 shadow-sm">
              <div className="prose prose-lg prose-gray max-w-none">
                <RichTextRenderer htmlString={item?.content} />
              </div>
            </div>
          </article>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="text-base font-semibold text-gray-800">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {item.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-8 px-6 bg-gray-50 rounded-2xl mb-10 border border-gray-100">
            <span className="text-base font-semibold text-gray-800 mb-4 sm:mb-0">Share this article:</span>
            <div className="flex space-x-3">
              <button className="p-3 text-gray-600 hover:text-[#B34644] hover:bg-white transition-all duration-200 rounded-xl hover:shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </button>
              <button className="p-3 text-gray-600 hover:text-[#B34644] hover:bg-white transition-all duration-200 rounded-xl hover:shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                </svg>
              </button>
              <button className="p-3 text-gray-600 hover:text-[#B34644] hover:bg-white transition-all duration-200 rounded-xl hover:shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button className="p-3 text-gray-600 hover:text-[#B34644] hover:bg-white transition-all duration-200 rounded-xl hover:shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 21c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9-4.029 9-9 9zm4-13.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm-9 0c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm9 7.5c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-.171.018-.34.049-.505.352-.978 1.298-1.657 2.351-1.657.159 0 .316.023.471.067.414-.386.928-.621 1.5-.621.827 0 1.548.429 1.97 1.074.058.113.159.229.159.371 0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5c0-.276.083-.531.218-.745-.09.047-.184.083-.277.131-.724.373-1.216 1.086-1.316 1.897-.033.172-.055.346-.055.524 0 1.105.895 2 2 2s2-.895 2-2zm-9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3c0-.171.018-.34.049-.505.352-.978 1.298-1.657 2.351-1.657.159 0 .316.023.471.067.414-.386.928-.621 1.5-.621.827 0 1.548.429 1.97 1.074.058.113.159.229.159.371 0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5c0-.276.083-.531.218-.745-.09.047-.184.083-.277.131-.724.373-1.216 1.086-1.316 1.897-.033.172-.055.346-.055.524 0 1.105.895 2 2 2s2-.895 2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to {item.category}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Related Content Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Related Content</h3>
            <RelatedContentSection 
              currentItemId={item._id}
              category={item.category as "blog" | "news" | "event"}
              limit={3}
              variant="horizontal"
            />
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-br from-[#B34644] to-[#8B1E1E] rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="text-base opacity-90 mb-6 leading-relaxed">Subscribe to our newsletter for the latest updates and insights.</p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-3 text-gray-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-200 border"
              />
              <button
                type="submit"
                className="w-full bg-white text-[#B34644] text-sm font-semibold py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Author Bio (if available) */}
          {item.author && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{item.author}</h4>
                  <p className="text-gray-600 mt-2 leading-relaxed">Content writer specializing in industry insights and trends.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}