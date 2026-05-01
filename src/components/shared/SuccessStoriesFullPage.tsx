'use client';

import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Award } from 'lucide-react';
import { useState } from 'react';
import { VideoCard } from '@/components/shared/SuccessVideoCard';
import { SuccessStory } from '@/types/successStory';
import { successStoriesData, successStoriesFilters } from '@/data/successStoriesData';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

export default function SuccessStoriesFullPage() {
  const [activeFilter, setActiveFilter] = useState(successStoriesFilters[0].value);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter videos based on selected category
  const filteredVideos =
    activeFilter === 'সব'
      ? successStoriesData
      : successStoriesData.filter((video) => video.category === activeFilter);

  // Pagination logic
  const indexOfLastVideo = currentPage * itemsPerPage;
  const indexOfFirstVideo = indexOfLastVideo - itemsPerPage;
  const currentVideos = filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);

  const handleFilterChange = (filterValue: string) => {
    setActiveFilter(filterValue);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="relative py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            ক্যাড কোর <span className="text-[#F01A24]">সাফল্যের গল্প</span>
          </motion.h2>
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-[#F01A24] to-[#D4141E] mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            আমাদের ক্যাড কোর প্রশিক্ষণ কমিউনিটির যুগান্তকারী প্রকল্প এবং উদ্ভাবন আবিষ্কার করুন
          </motion.p>
        </motion.div>

        {/* Video Section */}
        <Card className="rounded-xl shadow-sm overflow-hidden border-0 bg-white">
          {/* Card Header with Filters */}
          <div className="bg-gradient-to-r from-[#F01A24] to-[#D4141E] p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#F01A24] opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#D4141E] opacity-20"></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
              <div>
                <motion.h3
                  className="text-2xl md:text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  ক্যাড কোর প্রশিক্ষণার্থীদের সাফল্য
                </motion.h3>
                <motion.p
                  className="text-white/90 mt-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  বাস্তব প্রকল্প, অসাধারণ অর্জন
                </motion.p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {successStoriesFilters.map((filter, index) => (
                  <motion.div
                    key={filter.value}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleFilterChange(filter.value)}
                      variant={filter.value === activeFilter ? 'default' : 'outline'}
                      className={`rounded-full font-medium px-4 py-2 text-sm md:text-base transition-all ${
                        filter.value === activeFilter
                          ? 'bg-white text-[#F01A24] hover:bg-white/90 shadow-md'
                          : 'bg-transparent text-white hover:bg-white/20 border-white/50 hover:border-white'
                      }`}
                    >
                      {filter.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentVideos.map((video, index) => (
                <motion.div
                  key={`${video.id}-${currentPage}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: 'easeOut',
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="rounded-lg overflow-hidden"
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>

            {filteredVideos.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700">কোনো প্রকল্প খুঁজে পাওয়া যায়নি</h3>
                <p className="text-gray-500 mt-2">অনুগ্রহ করে অন্য একটি বিভাগ নির্বাচন করুন</p>
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-2 sm:gap-4 p-6 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="outline"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <ArrowLeft size={18} />
              </Button>

              {pageNumbers.map((number) => (
                <Button
                  key={number}
                  variant={number === currentPage ? 'default' : 'outline'}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-medium transition-all ${
                    number === currentPage
                      ? 'bg-[#F01A24] hover:bg-[#D4141E] text-white shadow-md'
                      : 'hover:bg-[#F01A24]/10 border-gray-300'
                  }`}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </Button>
              ))}

              <Button
                variant="outline"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </Card>

        {/* CTA Section */}
        <motion.div
          className="text-center my-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h3
            className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            আপনার সাফল্যের গল্প শেয়ার করুন
          </motion.h3>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            আপনার উদ্ভাবনী প্রকল্প এবং সমাধান প্রদর্শন করে পরবর্তী প্রজন্মকে অনুপ্রাণিত করুন
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button className="bg-gradient-to-r from-[#F01A24] to-[#D4141E] hover:from-[#D4141E] hover:to-[#B8121B] text-white px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all">
              আপনার সাফল্য জমা দিন <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
