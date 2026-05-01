"use client"
import React from 'react';
import Link from 'next/link';
import { useGetCoursesQuery } from '@/app/redux/api/CourseApi/CourseApi';
import AppImage from '@/components/ui/AppImage';
import { ICourse } from '@/types/course';
import { ProfessionalAnimatedTitle } from '@/components/common/Commontitle/AnimationTitile';

// --- Helper: Icon Component ---
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);



// Helper function to strip HTML tags and convert to plain text
const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return '';
  // Remove HTML tags and decode HTML entities
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// --- Single Card Component ---
interface CardProps {
  imageUrl: string;
  title: string;
  author: string;
  description: string;
  slug: string;
  type: string;
  level?: string;
  price?: number;
  discountedPrice?: number;
  accessType: string;
}

export const ProgramCard: React.FC<CardProps> = ({
  imageUrl,
  title,
  author,
  description,
  slug,
  type,
  level,
  price,
  discountedPrice,
  accessType
}) => {
  const displayPrice = discountedPrice || price;
  const originalPrice = price && discountedPrice ? price : undefined;

  return (
    <Link href={`/all-courses/${slug}`}>
      <div className="
        group
        bg-white
        border
        border-gray-200
        rounded-lg
        overflow-hidden
        shadow-md
        hover:shadow-xl
        transition-all
        duration-300
        ease-in-out
        hover:-translate-y-2
        flex flex-col
        cursor-pointer
      ">
        {/* Card Image with animated underline */}
        <div className="relative overflow-hidden rounded-b-lg">
          <AppImage
            photoUrl={imageUrl}
            alt={title}
            width={500}
            height={500}
            className="
              w-full
              h-40
              object-cover
              transition-transform
              duration-300
              ease-in-out
              group-hover:scale-105
            "
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image'; }}
          />
          {/* The decorative line that animates on hover */}
          <div className="
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            h-1
            bg-[#AF4444]
            w-0
            group-hover:w-full
            transition-all
            duration-300
            ease-out
          "></div>
          {/* Type badge */}
          <div className="absolute top-2 left-2 bg-[#AF4444] text-white text-xs font-semibold px-2 py-1 rounded">
            {type.toUpperCase()}
          </div>
          {/* Access type badge */}
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {accessType === 'free' ? 'FREE' : accessType === 'paid' ? 'PAID' : 'MEMBERS'}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 h-16 line-clamp-3">{title}</h3>

          <div className="flex items-center text-red-700 mb-3">
            <UserIcon className="w-3 h-3 mr-1" />
            <p className="text-xs font-medium uppercase tracking-wider">{author}</p>
          </div>

          <p className="text-gray-600 text-xs mb-4 flex-grow line-clamp-3">{description}</p>

          {/* Price and level info */}
          <div className="flex items-center justify-between mb-3">
            {displayPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">৳{displayPrice}</span>
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through">৳{originalPrice}</span>
                )}
              </div>
            ) : (
              <span className="text-sm text-gray-500">Free</span>
            )}
            {level && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {level}
              </span>
            )}
          </div>

          {/* Updated button style to match previous preference */}
          <button className="
            mt-auto
            w-full
            bg-transparent
            border-2
            border-red-800
            text-[#AF4444]
            font-semibold
            py-1.5
            px-3
            rounded-md
            hover:bg-[#AF4444]
            hover:text-white
            transition-all
            duration-300
            text-sm
          ">
            LEARN MORE
          </button>
        </div>
      </div>
    </Link>
  );
};

// --- Main App Component ---
export default function ProgramsSection() {
  // Use Redux to fetch programs
  const { data: coursesData, isLoading: loading } = useGetCoursesQuery({
    limit: 6,
  });
  const programs: ICourse[] = coursesData?.data || [];

  if (loading) {
    return (
      <div className="w-full mt-8 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
         
<ProfessionalAnimatedTitle
  title="Our Programs"
  subTitle='Discover our comprehensive learning programs.'
/>

         
          </div>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#AF4444] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="w-full mt-8 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-3xl font-black text-gray-900 uppercase tracking-wider">
              <span className="text-[#AF4444]">Our</span> Programs
            </h2>
            <p className="text-gray-600 mt-3 text-base">Discover our comprehensive learning programs.</p>
          </div>
          <div className="text-center py-16">
            <p className="text-gray-600">No programs available at the moment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Title Section */}
        <div className="text-center ">
                  
<ProfessionalAnimatedTitle
  title="Our Programs & Events"
  subTitle='Discover our comprehensive learning programs.'
/>

        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((course) => (
            <ProgramCard
              key={course._id}
              imageUrl={course.bannerImage || course.photoUrl || 'https://placehold.co/600x400/cccccc/ffffff?text=No+Image'}
              title={course.title}
              author={course.experts?.[0]?.name || 'BASE Team'}
              description={stripHtmlTags(course.description)}
              slug={course.slug}
              type={course.type}
              level={course.level}
              price={course.price}
              discountedPrice={course.discountedPrice}
              accessType={course.accessType}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link href="/all-courses">
            <button className="
              bg-transparent
              border-2
              border-[#AF4444]
              text-[#AF4444]
              font-semibold
              py-3
              px-8
              rounded-md
              hover:bg-[#AF4444]
              hover:text-white
              transition-all
              duration-300
              text-lg
              shadow-lg
              hover:shadow-xl
              uppercase
            ">
              View All 
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

