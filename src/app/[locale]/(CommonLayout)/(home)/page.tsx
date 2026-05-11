"use client";

import React from 'react';
import Link from 'next/link';
import { useGetActiveVouchersQuery } from '@/app/redux/api/VoucherApi/voucherApi';
import { Tag, Phone, ArrowRight, Sparkles, Award } from 'lucide-react';
import Hero from './Landing-page/hero/hero';
import StatsSection from './Landing-page/StatsSection/StatsSection';
// import SeminarSchedule from './Landing-page/SeminarSchedule/SeminarSchedule';
import PopularCourses from './Landing-page/PopularCourses/PopularCourses';
import OurServices from './Landing-page/OurServices/OurServices';
import OurJourney from './Landing-page/OurJourney/OurJourney';
// import JoinInstructor from './Landing-page/JoinInstructor/JoinInstructor';
import SuccessStories from './Landing-page/SuccessStories/SuccessStories';
import ApplySection from './Landing-page/ApplySection/ApplySection';
import RecruitmentServices from './Landing-page/RecruitmentServices/RecruitmentServices';
import TrainingSection from './Landing-page/TrainingSection/TrainingSection';
import ImmigrantJobsSection from './Landing-page/ImmigrantJobsSection/ImmigrantJobsSection';



export default function VouchersPage() {
  const { data: vouchersResponse, isLoading, error } = useGetActiveVouchersQuery();
  const vouchers = vouchersResponse?.data || [];

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/${imageUrl}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    // <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    //   {/* Hero Section */}
    //   <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">
    //     <div className="absolute inset-0 opacity-10">
    //       <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
    //       <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
    //     </div>
        
    //     <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
    //       <div className="max-w-4xl mx-auto text-center">
    //         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
    //           <Sparkles className="w-5 h-5 text-yellow-300" />
    //           <span className="text-white font-medium">Official Certification Vouchers</span>
    //         </div>
            
    //         <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
    //           SolidWorks Certification
    //           <br />
    //           <span className="text-blue-200">Vouchers</span>
    //         </h1>
            
    //         <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
    //           Get official CSWA, CSWP certifications at the best prices. 
    //           Direct purchase via WhatsApp with instant support.
    //         </p>
    //       </div>
    //     </div>
        
    //     {/* Wave SVG */}
    //     <div className="absolute bottom-0 left-0 right-0">
    //       <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    //         <path d="M0,64L48,69.3C96,75,192,85,288,90.7C384,96,480,96,576,85.3C672,75,768,53,864,48C960,43,1056,53,1152,64C1248,75,1344,85,1392,90.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
    //       </svg>
    //     </div>
    //   </div>

    //   {/* Vouchers Section */}
    //   <div className="container mx-auto px-4 py-12 md:py-16">
    //     {vouchers.length === 0 ? (
    //       <div className="text-center py-16">
    //         <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
    //           <Tag className="w-12 h-12 text-gray-400" />
    //         </div>
    //         <h3 className="text-2xl font-bold text-gray-900 mb-2">No Vouchers Available</h3>
    //         <p className="text-gray-600">Please check back later for available vouchers.</p>
    //       </div>
    //     ) : (
    //       <>
    //         <div className="text-center mb-12">
    //           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
    //             Available Vouchers
    //           </h2>
    //           <p className="text-gray-600 max-w-2xl mx-auto">
    //             Choose from our selection of certification vouchers and order directly via WhatsApp
    //           </p>
    //         </div>

    //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
    //           {vouchers.map((voucher) => (
    //             <Link 
    //               key={voucher._id} 
    //               href={`/vouchers/${voucher.slug}`}
    //               className="group"
    //             >
    //               <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group-hover:-translate-y-2">
    //                 {/* Image */}
    //                 <div className="relative h-56 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
    //                   {voucher.imageUrl ? (
    //                     <img
    //                       src={getImageUrl(voucher.imageUrl)}
    //                       alt={voucher.name}
    //                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
    //                     />
    //                   ) : (
    //                     <div className="w-full h-full flex items-center justify-center">
    //                       <Award className="w-20 h-20 text-blue-300" />
    //                     </div>
    //                   )}
                      
    //                   {/* Price Badge */}
    //                   {voucher.price && voucher.price > 0 && (
    //                     <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
    //                       ৳{voucher.price.toLocaleString()}
    //                     </div>
    //                   )}
    //                 </div>

    //                 {/* Content */}
    //                 <div className="p-6">
    //                   <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
    //                     {voucher.name}
    //                   </h3>
                      
    //                   <p className="text-gray-500 text-sm mb-4 line-clamp-2">
    //                     {voucher.instructionTitle}
    //                   </p>

    //                   <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
    //                     <Phone className="w-4 h-4 text-green-500" />
    //                     <span>WhatsApp Order Available</span>
    //                   </div>

    //                   <div className="flex items-center justify-between pt-4 border-t border-gray-100">
    //                     <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700">
    //                       View Details
    //                     </span>
    //                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
    //                       <ArrowRight className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>
    //             </Link>
    //           ))}
    //         </div>
    //       </>
    //     )}
    //   </div>

    //   {/* CTA Section */}
    //   <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-16">
    //     <div className="container mx-auto px-4 text-center">
    //       <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
    //         Need Help Choosing?
    //       </h2>
    //       <p className="text-gray-300 max-w-2xl mx-auto mb-8">
    //         Our team is ready to help you select the right certification voucher for your career goals.
    //       </p>
    //       <a 
    //         href="https://wa.me/+8801610473379" 
    //         target="_blank" 
    //         rel="noopener noreferrer"
    //         className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
    //       >
    //         <Phone className="w-5 h-5" />
    //         Contact Us on WhatsApp
    //       </a>
    //     </div>
    //   </div>
    // </div>
    <div>
      <Hero />
      <StatsSection />
      {/* <SeminarSchedule /> */}
      <ImmigrantJobsSection />
      <RecruitmentServices />
      <PopularCourses />
      <OurServices />
      <TrainingSection />
      <OurJourney />
      {/* <JoinInstructor /> */}
      <ApplySection />
      <SuccessStories />
    </div>
  );
}
