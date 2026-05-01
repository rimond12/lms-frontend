'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetExpertsQuery } from '@/app/redux/api/expartPanelApi/expartPanelApi';
import AppImage from '../ui/AppImage';
import { motion } from 'framer-motion';

const EducationHero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Computer CSE');
  const [currentExpertIndex, setCurrentExpertIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ✅ Fetch expert data from Redux API
  const { data, isLoading, isError } = useGetExpertsQuery({});
  const experts = data?.data || []; // assuming your backend response structure { data: IExpert[] }

  // Auto slide logic
  useEffect(() => {
    if (!isAutoPlaying || experts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentExpertIndex((prev) => (prev + 1) % experts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, experts.length]);

  const nextExpert = () => {
    setIsAutoPlaying(false);
    setCurrentExpertIndex((prev) => (prev + 1) % experts.length);
  };

  const prevExpert = () => {
    setIsAutoPlaying(false);
    setCurrentExpertIndex((prev) => (prev - 1 + experts.length) % experts.length);
  };

  const handleSearch = () => {
    console.log('Search:', searchQuery, 'Category:', selectedCategory);
  };

  const students = [
    { id: 1, bg: 'bg-blue-500' },
    { id: 2, bg: 'bg-pink-500' },
    { id: 3, bg: 'bg-teal-500' },
    { id: 4, bg: 'bg-orange-600' },
  ];

  const currentExpert = experts[currentExpertIndex];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading expert data...
      </div>
    );
  }

  if (isError || experts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        No expert data available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2  items-center">

          {/* LEFT SIDE - Content */}
         <div className="space-y-6">
  <div className="flex">
   <motion.h1
                  className="text-3xl sm:text-4xl lg:text-3xl uppercase  font-bold leading-tight tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <span className="text-gray-900 dark:text-gray-100">
                    Bangladesh </span>
                  <span className="bg-gradient-to-r from-[#B34644] via-[#B34644] to-red-800 bg-clip-text text-transparent">
                    Association
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#B34644] via-[#B34644] to-red-800 bg-clip-text text-transparent">
                    of
                  </span>
                  <span className="text-gray-900 dark:text-gray-100"> Structural</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#B34644] via-[#B34644] to-[#B34644] bg-clip-text text-transparent">
                    Engineers
                  </span>
                </motion.h1>

  </div>

  <p className="text-gray-600 leading-relaxed text-base">
    BASE (Bangladesh Association of Structural Engineers) is dedicated to shaping the future of online education
    by empowering learners with the knowledge and freedom that drive real-world innovation.
  </p>

            {/* Search Bar */}
            <div className="flex items-stretch bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-orange-500 rounded-full"></div>
                  ))}
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none cursor-pointer pr-4 appearance-none"
                >
                  <option> Stuctural Engineering </option>
                  <option>All Courses</option>
                  <option>Web Development</option>
                  <option>Data Science</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-500 -ml-4 pointer-events-none" />
              </div>

              <input
                type="text"
                placeholder="Enter Course Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />

              <button
                onClick={handleSearch}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 transition-colors"
              >
                Search
              </button>
            </div>

            {/* Student Avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`w-10 h-10 rounded-full ${student.bg} border-2 border-white shadow-md`}
                  ></div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-semibold">
                  +
                </div>
              </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">A Fast-Growing Member Base</p>
                </div>
            </div>
          </div>

          {/* RIGHT SIDE - Expert Slider */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs">

              {/* Expert Card */}
              <div className="bg-white rounded-2xl border-2 border-[#B44645] overflow-hidden">
                <div className="relative h-80 bg-gradient-to-br from-orange-100 to-purple-100">
                  <AppImage
                    photoUrl={currentExpert.photoUrl}
                    alt={currentExpert.name}
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover transition-opacity duration-500"
                  />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                </div>

                <div className="p-4 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {currentExpert.name}
                  </h3>
                  <p className="text-orange-600 font-semibold mb-1 text-sm">
                    {currentExpert.specialization}
                  </p>
                  <p className="text-gray-600 text-sm">{currentExpert.designation}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                    <button
                      onClick={prevExpert}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex gap-1">
                      {experts.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentExpertIndex(index);
                            setIsAutoPlaying(false);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${index === currentExpertIndex
                              ? 'w-6 bg-orange-600'
                              : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextExpert}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-62 -right-1 bg-white rounded-xl shadow-lg px-4 py-2 flex items-center gap-2 border border-gray-100">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                {/* <div>
                  <p className="text-xl font-bold text-gray-900"> OUR EXPERTS</p>
                  <p className="text-xs text-gray-500 font-medium"> </p>
                </div> */}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationHero;
