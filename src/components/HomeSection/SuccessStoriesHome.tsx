"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useGetApprovedSuccessStoriesQuery } from "@/app/redux/api/successStoryApi/successStoryApi";
import { TestimonialCard } from "@/app/[locale]/(CommonLayout)/(home)/Landing-page/SuccessStories/SuccessStories";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import { Button } from "../ui/Button";

export default function SuccessStoriesHome() {
  const { data: response, isLoading } = useGetApprovedSuccessStoriesQuery();
  const stories = response?.data || [];
  
  // Get top 3 success stories
  const featuredStories = stories.slice(0, 3);

  if (isLoading) {
    return (
      <div className="py-10 text-center text-slate-500 font-medium animate-pulse">
        Loading success stories...
      </div>
    );
  }

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 lg:py-12 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <ModernSectionHeader
          badge="সাফল্য"
          title="আমাদের শিক্ষার্থীদের সাফল্যের গল্প"
          subtitle="ইমিগ্র্যান্ট জবস ওয়ার্ল্ডের মাধ্যমে বিদেশে ক্যারিয়ার গড়া সফল প্রার্থীদের অনুপ্রেরণাদায়ক যাত্রা"
          align="center"
        />

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-10">
          {featuredStories.map((story, index) => (
            <motion.div
              key={story._id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group"
            >
              <TestimonialCard story={story} />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/success-stories">
              <Button
                size="lg"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all group"
              >
                সব সাফল্যের গল্প দেখুন
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/all-courses">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 px-6 py-3 text-sm font-semibold rounded-lg"
              >
                কোর্স দেখুন
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
