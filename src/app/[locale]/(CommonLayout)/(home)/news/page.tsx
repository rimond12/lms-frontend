"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import { useGetItemsQuery } from "@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";

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
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useGetItemsQuery({ category: "news" });
  const {
    data: blogData,
    isLoading: blogLoading,
    error: blogError,
  } = useGetItemsQuery({ category: "blog" });

  const newsItems = newsData?.data || [];
  const blogItems = blogData?.data || [];
  const items = [...newsItems, ...blogItems];
  const isLoading = newsLoading || blogLoading;
  const error = newsError || blogError;

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState("all");
  const itemsPerPage = 12;

  // Extract all unique tags from items
  const allTags = useMemo<string[]>(() => {
    const tags: string[] = items.flatMap((item: Item) => item.tags || []);
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
    .slice(0, 3);
  const breakingNews = filteredAndSortedItems
    .filter((item: Item) => item.priority === "breaking")
    .slice(0, 2);
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
    <div className="space-y-12">
      {/* Breaking News Skeleton */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 animate-pulse">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-40 mb-6"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      {/* Featured News Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="h-56 bg-gradient-to-br from-gray-200 to-gray-300 relative">
              <div className="absolute top-6 right-6 w-16 h-6 bg-white/80 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-20 h-6 bg-black/20 rounded-full"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
              </div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Regular News Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative">
              <div className="absolute top-4 right-4 w-16 h-6 bg-white/80 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-16 h-6 bg-black/20 rounded-full"></div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-12"></div>
              </div>
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-14"></div>
                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-red-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Unable to load news
            </h1>
            <p className="text-gray-600 mb-8">
              There was an error loading the latest news. Please try again
              later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-red-800 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const NewsCard = ({
    item,
    featured = false,
    breaking = false,
  }: {
    item: Item;
    featured?: boolean;
    breaking?: boolean;
  }) => (
    <article
      className={`group relative bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-2xl hover:shadow-gray-300/30 transition-all duration-500 transform hover:-translate-y-2 ${
        breaking
          ? "border-red-300 bg-gradient-to-br from-red-50 to-white"
          : featured
            ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white"
            : "hover:border-gray-200"
      }`}
    >
      {/* Priority Badge */}
      {(breaking || featured) && (
        <div className="absolute top-6 left-6 z-20">
          <span
            className={`px-4 py-2 text-xs font-bold rounded-full backdrop-blur-sm border shadow-lg ${
              breaking
                ? "bg-gradient-to-r from-red-800 to-red-700 text-white border-red-400 animate-pulse shadow-red-200"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-400 shadow-blue-200"
            }`}
          >
            {breaking ? "🚨 BREAKING" : "⭐ FEATURED"}
          </span>
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-6 right-6 z-20">
        <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full border border-gray-200 shadow-sm">
          {item.category?.toUpperCase() || "ARTICLE"}
        </span>
      </div>

      {/* Image Container */}
      <div className="relative overflow-hidden">
        {item.photoUrl ? (
          <div className="relative">
            <img
              src={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}/${item.photoUrl.startsWith("/") ? item.photoUrl.slice(1) : item.photoUrl}`}
              alt={item.title}
              className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                featured ? "h-56" : "h-48"
              }`}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>

            {/* Reading Time Badge on Image */}
            <div className="absolute bottom-4 left-4 flex items-center space-x-2 text-white">
              <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                <svg
                  className="w-3 h-3 mr-1"
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
                <span className="text-xs font-medium">3 min</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`w-full bg-gradient-to-br from-gray-100 via-gray-150 to-gray-200 flex items-center justify-center relative ${
              featured ? "h-56" : "h-48"
            }`}
          >
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-2"
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
              <p className="text-xs text-gray-500 font-medium">
                No Image Available
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-6 space-y-4">
        {/* Date and Category Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            <div className="flex items-center bg-gray-50 rounded-full px-3 py-1">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
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
              <span className="font-medium">
                {format(new Date(item.createdAt), "MMM dd, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2
          className={`font-bold text-gray-900 leading-tight group-hover:text-red-800 transition-colors duration-300 ${
            featured ? "text-xl line-clamp-2" : "text-lg line-clamp-2"
          }`}
        >
          {item.title}
        </h2>

        {/* Content Preview */}
        <div className="relative">
          <RichTextRenderer
            htmlString={item.content}
            className="text-gray-600 text-sm leading-relaxed line-clamp-3"
          />
          <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent w-8 h-4"></div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-150 text-gray-700 text-xs rounded-full border border-gray-200 hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:border-red-200 transition-all duration-300 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Read More Button */}
          <Link
            href={`/news/${item.slug}`}
            className="group/btn inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span>Read Article</span>
            <svg
              className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300"
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
          </Link>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-red-200 transition-all duration-500 pointer-events-none"></div>
    </article>
  );

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-white">
      <div className="">
        {/* Header Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#B34644] via-[#D946EF] to-[#F59E0B] py-8">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#B34644]/90 via-[#8B1E1E]/90 to-[#B34644]/90"></div>

          {/* Floating Elements */}
          <div className="absolute top-4 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-float"></div>
          <div
            className="absolute top-8 right-1/3 w-12 h-12 bg-yellow-300/20 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-4 left-1/3 w-8 h-8 bg-purple-300/20 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute bottom-6 right-1/4 w-14 h-14 bg-white/10 rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          ></div>

          {/* Geometric Shapes */}
          <div
            className="absolute top-6 left-8 w-6 h-6 border-2 border-white/30 rotate-45 animate-spin"
            style={{ animationDuration: "8s" }}
          ></div>
          <div className="absolute bottom-8 right-8 w-4 h-4 bg-yellow-300/40 rotate-12 animate-bounce"></div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <div className="space-y-4">
              {/* News Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-bold animate-pulse-glow">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></span>
                📰 LATEST NEWS & BLOG ARTICLES
              </div>

              {/* Dynamic Heading */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight animate-fade-in">
                <span
                  className="inline-block animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  📖
                </span>
                <span className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 bg-clip-text text-transparent mx-2">
                  LATEST NEWS & BLOG ARTICLES
                </span>
                <span
                  className="inline-block animate-bounce"
                  style={{ animationDelay: "1s" }}
                >
                  🗞️
                </span>
              </h1>

              <p
                className="text-sm md:text-base text-white/90 max-w-xl mx-auto animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                Stay informed with the latest news and blog articles from our
                expert contributors.
                <span className="font-bold text-yellow-300">
                  Never miss a story!
                </span>
              </p>

              {/* Action Buttons */}
              <div
                className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-slide-up"
                style={{ animationDelay: "600ms" }}
              >
                <Button className="bg-gradient-to-r from-black to-black hover:from-blue-500 hover:to-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse-glow">
                  📰 Read Latest Content
                </Button>
                <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-[#B34644] px-6 py-2 rounded-full font-semibold transition-all duration-300">
                  📝 Browse Articles
                </Button>
              </div>

              {/* Quick Stats */}
              <div
                className="flex justify-center gap-6 pt-4 animate-fade-in"
                style={{ animationDelay: "900ms" }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-black">
                    {filteredAndSortedItems?.length}{" "}
                  </div>
                  <div className="text-xs text-white/80">Articles</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">20+</div>
                  <div className="text-xs text-white/80">Contributors</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">100K+</div>
                  <div className="text-xs text-white/80">Readers</div>
                </div>
              </div>
            </div>
          </div>

          {/* Wave Bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              className="w-full h-6 hidden md:block text-gray-50"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                fill="currentColor"
                transform="scale(1,-1) translate(0,-120)"
              />
            </svg>
          </div>
        </section>

        {/* Breaking News Banner */}
        {breakingNews.length > 0 && (
          <div className="bg-gradient-to-r from-red-800 to-red-700 rounded-2xl p-6 mb-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <span className="bg-white text-red-800 px-3 py-1 rounded-full text-sm font-bold mr-4 animate-pulse">
                  BREAKING NEWS
                </span>
                <svg
                  className="w-5 h-5 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {breakingNews.map((item: Item) => (
                  <Link
                    key={item._id}
                    href={`/news/${item.slug}`}
                    className="block group"
                  >
                    <h3 className="text-lg font-semibold mb-2 group-hover:underline line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-red-100 text-sm line-clamp-2">
                      {format(new Date(item.createdAt), "MMM dd, yyyy • HH:mm")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl  max-w-5xl mx-auto  mt-5 shadow-sm border border-gray-100 p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
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
                placeholder="Search news and blog articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Tag:
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[120px]"
              >
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag === "all" ? "All Tags" : `#${tag}`}
                  </option>
                ))}
              </select>

              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Sort:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-transparent transition-all duration-200 text-gray-900 bg-white min-w-[140px]"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {filteredAndSortedItems.length} article
              {filteredAndSortedItems.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-16 ">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTag !== "all"
                ? "No articles match your search criteria. Try adjusting your filters."
                : "No articles are available at the moment."}
            </p>
            {(searchTerm || selectedTag !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedTag("all");
                }}
                className="inline-flex items-center px-6 py-3 bg-red-800 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12 max-w-5xl mb-5 mx-auto">
            {/* Featured News */}
            {featuredNews.length > 0 && (
              <section>
                <div className="flex items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Featured Articles
                  </h2>
                  <div className="ml-4 h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {featuredNews.map((item: Item) => (
                    <NewsCard key={item._id} item={item} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Regular News */}
            {paginatedNews.length > 0 && (
              <section>
                <div className="flex items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">
                    All Articles
                  </h2>
                  <div className="ml-4 h-px bg-gray-200 flex-1"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedNews.map((item: Item) => (
                    <article
                      key={item._id}
                      className="group bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-2xl hover:shadow-gray-300/25 transition-all duration-500 transform hover:-translate-y-1"
                    >
                      {/* Image Container */}
                      <div className="relative overflow-hidden">
                        {item.photoUrl ? (
                          <div className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_FILE_URL || "https://api.caddcore.cloud"}/${item.photoUrl.startsWith("/") ? item.photoUrl.slice(1) : item.photoUrl}`}
                              alt={item.title}
                              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500"></div>

                            {/* Category Badge on Image */}
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-700 rounded-full border border-gray-200 shadow-sm">
                                {item.category?.toUpperCase() || "ARTICLE"}
                              </span>
                            </div>

                            {/* Reading Time on Image */}
                            <div className="absolute bottom-4 left-4">
                              <div className="flex items-center bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white">
                                <svg
                                  className="w-3 h-3 mr-1"
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
                                <span className="text-xs font-medium">
                                  3 min
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-gray-100 via-gray-150 to-gray-200 flex items-center justify-center relative">
                            <div className="text-center">
                              <svg
                                className="w-12 h-12 text-gray-400 mx-auto mb-2"
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
                              <p className="text-xs text-gray-500 font-medium">
                                No Image
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Date Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="flex items-center bg-gray-50 rounded-full px-3 py-1">
                              <svg
                                className="w-3 h-3 mr-1 text-gray-400"
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
                              <span className="font-medium text-xs">
                                {format(new Date(item.createdAt), "MMM dd")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 leading-tight group-hover:text-red-800 transition-colors duration-300">
                          {item.title}
                        </h3>

                        {/* Content Preview */}
                        <div className="relative">
                          <RichTextRenderer
                            htmlString={item.content}
                            className="text-gray-600 text-sm leading-relaxed line-clamp-2"
                          />
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-150 text-gray-700 text-xs rounded-full border border-gray-200 hover:from-red-50 hover:to-red-100 hover:text-red-700 hover:border-red-200 transition-all duration-300 cursor-pointer"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {/* Read More Link */}
                          <Link
                            href={`/news/${item.slug}`}
                            className="group/link inline-flex items-center text-sm font-semibold text-red-800 hover:text-red-700 transition-colors duration-300"
                          >
                            <span>Read</span>
                            <svg
                              className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-300"
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
                          </Link>
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-200/50 transition-all duration-500 pointer-events-none"></div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            currentPage === page
                              ? "bg-red-800 text-white"
                              : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
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
