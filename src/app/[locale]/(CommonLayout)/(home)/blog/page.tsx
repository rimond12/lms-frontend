"use client";
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { useGetItemsQuery } from '@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi';
import { format } from 'date-fns';
import AppImage from '@/components/ui/AppImage';

type Item = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
  category?: string;
  tags?: string[];
};

export default function BlogPage() {
  const { data, isLoading, error } = useGetItemsQuery({ category: 'blog' });
  const items = data?.data || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item: Item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort items
    switch (sortBy) {
      case 'newest':
        filtered.sort((a: Item, b: Item) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a: Item, b: Item) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title':
        filtered.sort((a: Item, b: Item) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [items, searchTerm, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Determine Featured Post (First item on page 1)
  const featuredPost = currentPage === 1 && paginatedItems.length > 0 ? paginatedItems[0] : null;
  const gridPosts = currentPage === 1 && featuredPost ? paginatedItems.slice(1) : paginatedItems;

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const LoadingSkeleton = () => (
    <div className="space-y-12">
      {/* Featured Skeleton */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
        <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-200"></div>
            <div className="w-full md:w-1/2 p-8 md:p-12 space-y-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4 space-y-4">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Temporarily Unavailable</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">We're having trouble loading our latest stories. Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-100 pb-12 gap-8">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2 block">Our Journal</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-black mb-6">
              Insights & <br/><span className="text-gray-400">Updates</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore the latest thoughts, tutorials, and trends from our team.
            </p>
          </div>

          {/* Search and Sort - Compact */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-0 text-gray-900 placeholder-gray-400 transition-all duration-300 group-hover:bg-gray-100"
                />
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
             </div>
             <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-0 text-gray-900 cursor-pointer hover:bg-gray-100 transition-all duration-300"
            >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title">A-Z</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-3xl">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">We couldn't find any posts matching your search.</p>
            {searchTerm && (
                <button
                onClick={() => setSearchTerm('')}
                className="mt-6 text-black font-medium hover:underline underline-offset-4"
                >
                Clear filters
                </button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Featured Post (Only on Page 1) */}
            {featuredPost && (
                <article className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100">
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2/5 relative overflow-hidden h-56 md:h-[300px]">
                             {featuredPost.photoUrl ? (
                                <AppImage
                                    photoUrl={featuredPost.photoUrl}
                                    alt={featuredPost.title}
                                    width={600}
                                    height={300}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                             ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                            <div className="flex items-center space-x-3 mb-3">
                                <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-bold tracking-wide uppercase rounded-md">
                                    Featured
                                </span>
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                                    {format(new Date(featuredPost.createdAt), 'MMM dd, yyyy')}
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-amber-600 transition-colors duration-300">
                                <Link href={`/blog/${featuredPost.slug}`}>
                                    {featuredPost.title}
                                </Link>
                            </h2>
                            <div className="mb-5 text-gray-500 line-clamp-2 leading-relaxed text-sm">
                                <RichTextRenderer htmlString={featuredPost.content} />
                            </div>
                            <div>
                                <Link 
                                    href={`/blog/${featuredPost.slug}`}
                                    className="inline-flex items-center text-xs font-bold text-black hover:text-amber-600 transition-colors group/link uppercase tracking-wide"
                                >
                                    Read Article
                                    <svg className="w-3.5 h-3.5 ml-2 transform group-hover/link:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </article>
            )}

            {/* Grid Posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridPosts.map((item: Item) => (
                <article key={item._id} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                  {/* Image Container */}
                  <Link href={`/blog/${item.slug}`} className="block relative overflow-hidden h-40">
                    {item.photoUrl ? (
                      <AppImage
                        photoUrl={item.photoUrl}
                        alt={item.title}
                        width={400}
                        height={160}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                            Article
                        </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-4">
                    <div className="flex items-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                       {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug group-hover:text-amber-600 transition-colors duration-200 line-clamp-2">
                      <Link href={`/blog/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>

                    <div className="mb-3 flex-1">
                      <RichTextRenderer 
                        htmlString={item.content} 
                        className="text-gray-500 line-clamp-2 text-xs leading-relaxed" 
                      />
                    </div>

                    <Link 
                      href={`/blog/${item.slug}`}
                      className="inline-flex items-center text-[11px] font-bold text-black hover:text-amber-600 transition-colors uppercase tracking-wide mt-auto"
                    >
                      Read now
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center pt-12 border-t border-gray-100">
                <div className="flex space-x-2">
                    <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-3 text-gray-900 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ${
                        currentPage === page
                            ? 'bg-black text-white shadow-lg'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                    ))}
                    
                    <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-3 text-gray-900 hover:bg-gray-50 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}