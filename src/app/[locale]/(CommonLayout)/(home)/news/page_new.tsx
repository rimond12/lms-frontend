"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { useGetItemsQuery } from "@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi";

type Item = {
  _id: string;
  title: string;
  slug: string;
  content: string;
  photoUrl?: string;
  createdAt: string;
  category?: string;
  tags?: string[];
  priority?: "breaking" | "featured" | "regular";
};

export default function NewsPage() {
  const { data, isLoading, error } = useGetItemsQuery({ category: "news" });
  const items: Item[] = (data?.data as Item[]) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const itemsPerPage = 12;

  // Extract all unique tags from items
  const allTags = useMemo<string[]>(() => {
    const tags = items.flatMap((item: Item) => item.tags || []);
    return ["all", ...Array.from(new Set(tags))];
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter((item: Item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag =
        selectedTag === "all" || (item.tags && item.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });

    // Sort items
    switch (sortBy) {
      case "newest":
        filtered.sort(
          (a: Item, b: Item) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
      case "oldest":
        filtered.sort(
          (a: Item, b: Item) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;
      case "title":
        filtered.sort((a: Item, b: Item) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  }, [items, searchTerm, sortBy, selectedTag]);

  // Separate featured and regular news
  const featuredNews = filteredAndSortedItems
    .filter((item: Item) => item.priority === "featured")
    .slice(0, 2);
  const breakingNews = filteredAndSortedItems
    .filter((item: Item) => item.priority === "breaking")
    .slice(0, 3);
  const regularNews = filteredAndSortedItems.filter(
    (item: Item) =>
      !["featured", "breaking"].includes(item.priority || "regular"),
  );

  // Pagination for regular news
  const totalPages = Math.ceil(regularNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = regularNews.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, selectedTag]);

  const LoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-3xl"></div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-16 h-16 text-red-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Unable to Load News
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              There was an error loading the latest news. Please check your
              connection and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const FeaturedCard = ({ item }: { item: Item }) => (
    <Link href={`/news/${item.slug}`} className="group block">
      <article className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        <div className="relative overflow-hidden">
          {item.photoUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}/${item.photoUrl.startsWith("/") ? item.photoUrl.slice(1) : item.photoUrl}`}
              alt={item.title}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-slate-200 via-gray-200 to-slate-300 flex items-center justify-center">
              <svg
                className="w-20 h-20 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-full shadow-lg">
              FEATURED
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>

        <div className="p-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {format(new Date(item.createdAt), "MMMM dd, yyyy")}
            <span className="mx-3 text-gray-300">•</span>
            <span className="text-blue-600 font-medium">Featured News</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
            {item.title}
          </h2>

          <div className="mb-6">
            <RichTextRenderer
              htmlString={item.content}
              className="text-gray-600 text-base leading-relaxed line-clamp-3"
            />
          </div>

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              5 min read
            </div>

            <span className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors duration-200">
              Read Article
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  const RegularCard = ({ item }: { item: Item }) => (
    <Link href={`/news/${item.slug}`} className="group block">
      <article
        className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
          viewMode === "list" ? "flex" : ""
        }`}
      >
        <div
          className={`relative overflow-hidden ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}
        >
          {item.photoUrl ? (
            <img
              src={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}/${item.photoUrl.startsWith("/") ? item.photoUrl.slice(1) : item.photoUrl}`}
              alt={item.title}
              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                viewMode === "list" ? "w-full h-full" : "w-full h-48"
              }`}
            />
          ) : (
            <div
              className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
                viewMode === "list" ? "w-full h-full" : "w-full h-48"
              }`}
            >
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="p-6 flex-1">
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {format(new Date(item.createdAt), "MMM dd, yyyy")}
            <span className="mx-2">•</span>
            <span className="text-red-800 font-medium">News</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-800 transition-colors duration-200">
            {item.title}
          </h3>

          <div className="mb-4">
            <RichTextRenderer
              htmlString={item.content}
              className="text-gray-600 text-sm leading-relaxed line-clamp-3"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              3 min read
            </div>

            <span className="text-sm font-semibold text-red-800 group-hover:text-red-700 transition-colors duration-200">
              Read More →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-800 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              Breaking <span className="text-red-200">News</span>
            </h1>
            <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto leading-relaxed mb-8">
              Stay ahead with real-time updates, in-depth analysis, and breaking
              stories from around the globe. Your trusted source for news that
              matters.
            </p>

            {/* Live News Ticker */}
            {breakingNews.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
                <div className="flex items-center mb-4">
                  <span className="bg-white text-red-800 px-4 py-2 rounded-full text-sm font-bold mr-4 animate-pulse">
                    🔴 LIVE
                  </span>
                  <span className="text-red-100 font-semibold">
                    Breaking News
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {breakingNews.map((item: Item) => (
                    <Link
                      key={item._id}
                      href={`/news/${item.slug}`}
                      className="block group text-left"
                    >
                      <h3 className="text-lg font-semibold group-hover:text-red-200 transition-colors duration-200 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-red-200 text-sm mt-2">
                        {format(new Date(item.createdAt), "HH:mm")} • Just now
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Search Bar */}
            <div className="lg:col-span-5 relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search News
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg"
                />
              </div>
            </div>

            {/* Tag Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-lg"
              >
                {allTags.map((tag) => (
                  <option key={String(tag)} value={tag}>
                    {tag === "all" ? "All Categories" : `#${tag}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 bg-white text-lg"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                View
              </label>
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 text-sm font-medium ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 text-sm font-medium ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="lg:col-span-1 text-center">
              <div className="text-sm text-gray-500 mb-1">Found</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredAndSortedItems.length}
              </div>
              <div className="text-sm text-gray-500">
                article{filteredAndSortedItems.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No Articles Found
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || selectedTag !== "all"
                ? "No articles match your search criteria. Try adjusting your filters."
                : "No news articles are available at the moment."}
            </p>
            {(searchTerm || selectedTag !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag("all");
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-800 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured News */}
            {featuredNews.length > 0 && (
              <section>
                <div className="flex items-center mb-12">
                  <div className="bg-blue-600 w-1 h-8 rounded-full mr-4"></div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Featured Stories
                  </h2>
                  <div className="ml-6 h-px bg-gradient-to-r from-blue-600 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {featuredNews.map((item: Item) => (
                    <FeaturedCard key={item._id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {/* Regular News */}
            {paginatedNews.length > 0 && (
              <section>
                <div className="flex items-center mb-12">
                  <div className="bg-red-800 w-1 h-8 rounded-full mr-4"></div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Latest News
                  </h2>
                  <div className="ml-6 h-px bg-gradient-to-r from-red-800 to-transparent flex-1"></div>
                </div>

                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                      : "space-y-6"
                  }
                >
                  {paginatedNews.map((item: Item) => (
                    <RegularCard key={item._id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-16">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg
                        className="w-4 h-4 mr-2 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                            currentPage === page
                              ? "bg-gradient-to-r from-red-800 to-red-700 text-white transform scale-105"
                              : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Next
                      <svg
                        className="w-4 h-4 ml-2 inline"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
