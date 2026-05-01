"use client";
import React from "react";
import { motion } from "framer-motion";
import { Award, Loader2, ArrowRight } from "lucide-react";
import ModernSectionHeader from "@/components/shared/ModernSectionHeader";
import { useGetExpertsForAboutPageQuery } from "@/app/redux/api/expartPanelApi/expartPanelApi";
import AppImage from "@/components/ui/AppImage";
import Link from "next/link";

const Instructors: React.FC = () => {
  const {
    data: expertsData,
    isLoading,
    error,
  } = useGetExpertsForAboutPageQuery();

  const allExperts = React.useMemo(() => {
    if (!expertsData?.data) return [];

    const experts: any[] = [];
    Object.values(expertsData.data).forEach((categoryExperts: any) => {
      if (Array.isArray(categoryExperts)) {
        experts.push(...categoryExperts);
      }
    });

    return experts.sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 4);
  }, [expertsData]);

  if (isLoading) {
    return (
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </section>
    );
  }

  if (error || allExperts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <ModernSectionHeader
          badge="Team"
          title="Meet Our Experts"
          subtitle="Learn from industry professionals with years of real-world engineering experience."
          viewAllLink="/about-us"
          viewAllText="View All Team"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {allExperts.map((expert, index) => (
            <motion.div
              key={expert._id || index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
              className="group"
            >
              <Link href={`/about-us/${expert?.slugUrl || expert?._id}`}>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-40 lg:h-48 overflow-hidden">
                    {expert.photoUrl ? (
                      <AppImage
                        photoUrl={expert.photoUrl}
                        alt={expert.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-3xl font-bold text-gray-400">
                          {expert.name?.charAt(0) || "E"}
                        </span>
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 lg:p-5 flex flex-col flex-1">
                    <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-1">
                      {expert.name}
                    </h3>
                    <p className="text-xs lg:text-sm text-red-600 font-medium mb-2">
                      {expert.designation || expert.role || "Expert"}
                    </p>

                    {expert.shortBio && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-auto">
                        {expert.shortBio}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All - Mobile */}
        <div className="flex justify-center mt-8 lg:hidden">
          <Link
            href="/about-us"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            View All Team Members
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Instructors;
