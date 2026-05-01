"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay"; // Import the autoplay plugin
import type { EmblaOptionsType } from "embla-carousel";
import { ProfessionalAnimatedTitle } from "@/components/common/Commontitle/AnimationTitile";

// Define the type for a single mentor
type Mentor = {
  name: string;
  title: string;
  testimonial: string;
  imageUrl: string;
  company: string;
};

// Sample data for the mentors with new structure
// Sample data for the mentors with new structure
const mentors: Mentor[] = [
  {
    name: "Khurshid Al Meher",
    title: "Chief Executive Officer",
    company: "Kaymonto & Partners",
    testimonial:
      "Bangladesh Association of Structural Engineers (BASE) is a great initiative to enhance professional standards, improve safety and quality, and foster knowledge sharing, ultimately benefiting both the engineering profession and society.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "S.R. Touhidul Islam, PEng.",
    title: "Structural Engineer",
    company: "Architects and Civil Engineers",
    testimonial:
      "This group has been a game-changer for me. The regular discussions and resources on the latest structural engineering trends keep me updated and allow me to apply cutting-edge techniques in my projects.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Abdullah Al Hossain Chowdhury, PEng.",
    title: "Managing Director",
    company: "Inter Space Limited",
    testimonial:
      "I am honored to be a member of BASE, an insightful knowledge-sharing group where we can exchange ideas, experiences, innovations, and advanced technology. I wish it continued success in the future.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Md. Shams Al Rifat",
    title: "Assistant Structural Engineer",
    company: "SB Consultant Ltd.",
    testimonial:
      "I find this group to be an invaluable resource for young structural engineers like me. It's a fantastic way to gain knowledge from experienced engineers and build a strong professional network.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Rabeya Bari",
    title: "Principal Structural Engineer",
    company: "Flaming Stone",
    testimonial:
      "I've been able to expand my professional network significantly through this group. Learning directly from experts and discussing practical challenges has boosted my confidence as an engineer.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Md. Muhibbullah Kazi, Seng.",
    title: "Structural Engineer",
    company: "UBSP Consultants, DDC JV OCG",
    testimonial:
      "BASE is making it easy and enjoyable for members to share knowledge on practical, challenging and innovative structural problems. I am honored to be a part of this platform. I wish it continued progress.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Manzima Rahman Nowfi",
    title: "Junior Structural Engineer",
    company: "The Desingers and Managers",
    testimonial: "The knowledge-sharing sessions have been both practical and inspiring. Hearing about real-world challenges and solutions from senior engineers has broadened my perspective and equipped me with the skills to handle complex projects.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "AKM Saiful Bari, PEng.",
    title: "Principal Structural Engineer",
    company: "SB Consultant Ltd",
    testimonial: "This group has made continuous learning easy and enjoyable. The alternatives monthly seminars and active discussions have been instrumental in my growth as a structural engineer.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
    {
    name: "Nazmus Sakib Nazif",
    title: "Assistant Structural Engineer",
    company: "Inter Space Limited",
    testimonial: "As a young engineer, joining this group has given me a platform to learn from experts and gain insights that aren't readily available in textbooks. The mentorship and feedback I've received have been invaluable.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
  {
    name: "Shamsul Alam Bitu",
    title: "Principal Structural Engineer",
    company: "The Desingers and Managers",
    testimonial: "Being able to attend seminars led by experienced professionals without any fees has been a great advantage. I appreciate how inclusive this group is, providing learning opportunities for everyone.",
    imageUrl: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
  },
];


// Reusable Quote Icon Component
const QuoteIcon = () => (
    <svg className="w-8 h-8 text-teal-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
);


// Reusable Mentor Card Component with the new professional design
const MentorCard = ({ mentor }: { mentor: Mentor }) => (
  <div className="flex flex-col h-full bg-white  dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <div className="p-4 bg-[#AF4444] dark:bg-red-700 relative">
        <div className="absolute top-3 right-3 opacity-50">
            <QuoteIcon />
        </div>
        <div className="flex items-center space-x-3">
            <img
              src={mentor?.imageUrl}
              alt={`Photo of ${mentor.name}`}
              className="w-12 h-12 rounded-full object-cover border-3 border-white dark:border-slate-800"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/48x48/e2e8f0/64748b?text=??'; }}
            />
            <div>
                <h3 className="font-bold text-base text-white">{mentor.name}</h3>
                <p className="text-xs text-teal-100">{mentor.title} at <span className="font-semibold">{mentor.company}</span></p>
            </div>
        </div>
    </div>
    <div className="p-6 flex-grow">
      <p className="text-slate-600 dark:text-slate-300 italic">
        “{mentor.testimonial}”
      </p>
    </div>
  </div>
);


// Main Slider Component
export default function ExperiencedMentorsSlider() {
  const options: EmblaOptionsType = {
    loop: true,
    align: "start",
    slidesToScroll: 1,
  };
  
  // Initialize the carousel with the autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    Autoplay({ delay: 4000, stopOnInteraction: true })
  ]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="bg-slate-100 dark:bg-slate-900 py-12 sm:py-16 ">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Section Header */}
         <ProfessionalAnimatedTitle title="Our Members " subTitle="" />

        <div className="text-center mb-5">
           
            <h2 className="text-xl bg-[#AF4444] rounded-md text-gray-100 p-2 sm:text-xl font-extrabold uppercase dark:text-white tracking-tight">
            What our Members & Industry Experts Say about BASE
            </h2>

        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {mentors.map((mentor, index) => (
                <div className="flex-grow-0 flex-shrink-0 basis-full sm:basis-1/2 lg:basis-1/3 pl-4" key={index}>
                  <MentorCard mentor={mentor} />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-4 w-9 h-9 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
            aria-label="Previous Mentor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-4 w-9 h-9 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900"
            aria-label="Next Mentor"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
