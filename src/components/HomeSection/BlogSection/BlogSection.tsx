"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetItemsQuery } from "@/app/redux/api/BlogEventNewsApi/BlogEventNewsApi";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import { getImageUrl } from "@/utils/imageUtils";

type Category = "blog" | "news" | "event";

interface BlogEventNews {
  _id: string;
  title: string;
  content: string;
  category: Category;
  photoUrl?: string;
  createdAt: string;
  slug: string;
  author?: string;
}

type Props = {
  limit?: number;
  showPagination?: boolean;
};

const POSTS_PER_PAGE = 6;

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}

function calculateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(words / 200);
}

export default function BlogSection({ limit, showPagination = true }: Props) {
  const { data: apiResponse, isLoading, error } = useGetItemsQuery(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const blogs = useMemo(() => {
    if (!apiResponse?.data) return [];
    return apiResponse.data.filter(
      (item: BlogEventNews) => item.category === "blog",
    );
  }, [apiResponse]);

  const filteredBlogs = useMemo(() => {
    let filtered = [...blogs];
    filtered.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return limit ? filtered.slice(0, limit) : filtered;
  }, [blogs, limit]);

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = showPagination
    ? filteredBlogs.slice(startIndex, startIndex + POSTS_PER_PAGE)
    : filteredBlogs;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-lg">Unable to load articles.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Blog"
          title="Latest Articles"
          subtitle="Stay updated with the latest insights, tutorials, and industry news."
          viewAllLink="/blog"
          viewAllText="View All Articles"
        />

        {paginatedBlogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          >
            {paginatedBlogs.map((blog: BlogEventNews) => (
              <motion.article
                key={blog._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
                className="group"
              >
                <Link href={`/blog/${blog.slug}`}>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-40 lg:h-44 overflow-hidden">
                      <Image
                        src={getImageUrl(blog.photoUrl)}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded uppercase tracking-wide">
                          Blog
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 lg:p-5 flex flex-col flex-1">
                      {/* Meta */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{calculateReadTime(blog.content)} min</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs lg:text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {blog.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
                      </p>

                      {/* Read More */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900 transition-colors">
                          Read Article
                        </span>
                        <span className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:-rotate-45 transition-all" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === page
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
