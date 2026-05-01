"use client";
import React from "react";
import Link from "next/link";
import { useGetCoursesQuery } from "@/app/redux/api/CourseApi/CourseApi";
import AppImage from "@/components/ui/AppImage";
import { ICourse } from "@/types/course";

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

type Course = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  bannerImage?: string;
  photoUrl?: string;
  type: string;
  level?: string;
  price?: number;
  discountedPrice?: number;
  accessType: string;
  experts?: Array<{ name: string; designation?: string }>;
};

const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

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

export const CourseCard: React.FC<CardProps> = ({
  imageUrl,
  title,
  author,
  description,
  slug,
  type,
  level,
  price,
  discountedPrice,
  accessType,
}) => {
  const displayPrice = discountedPrice || price;
  const originalPrice = price && discountedPrice ? price : undefined;

  return (
    <Link href={`/all-courses/${slug}`}>
      <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-2 flex flex-col cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden rounded-b-lg">
          <AppImage
            photoUrl={imageUrl}
            alt={title}
            width={500}
            height={500}
            className="w-full h-40 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/600x400/cccccc/ffffff?text=No+Image";
            }}
          />
          {/* ✅ Blue animated underline */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-[#1a4da1] w-0 group-hover:w-full transition-all duration-300 ease-out" />
          {/* ✅ Blue type badge */}
          <div className="absolute top-2 left-2 bg-[#1a4da1] text-white text-xs font-semibold px-2 py-1 rounded">
            {type.toUpperCase()}
          </div>
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {accessType === "free"
              ? "FREE"
              : accessType === "paid"
                ? "PAID"
                : "MEMBERS"}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 mb-2 h-16 line-clamp-3">
            {title}
          </h3>

          {/* ✅ Blue author */}
          <div className="flex items-center text-[#1a4da1] mb-3">
            <UserIcon className="w-3 h-3 mr-1" />
            <p className="text-xs font-medium uppercase tracking-wider">
              {author}
            </p>
          </div>

          <p className="text-gray-600 text-xs mb-4 flex-grow line-clamp-3">
            {description}
          </p>

          <div className="flex items-center justify-between mb-3">
            {displayPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  ৳{displayPrice}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ৳{originalPrice}
                  </span>
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

          {/* ✅ Royal blue button */}
          <button className="mt-auto w-full bg-transparent border-2 border-[#1a4da1] text-[#1a4da1] font-semibold py-1.5 px-3 rounded-md hover:bg-[#1a4da1] hover:text-white transition-all duration-300 text-sm">
            ENROLL NOW
          </button>
        </div>
      </div>
    </Link>
  );
};

export default function CoursesSection() {
  const { data: coursesData, isLoading: loading } = useGetCoursesQuery({
    type: "course",
    limit: 6,
  });
  const courses: ICourse[] = coursesData?.data || [];

  if (loading) {
    return (
      <div className="w-full mt-8 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wider">
              <span className="text-[#1a4da1]">Our</span> Courses
            </h2>
            <p className="text-gray-600 mt-3 text-base">
              Level up your skills with our expert-led courses.
            </p>
          </div>
          <div className="flex items-center justify-center py-16">
            {/* ✅ Blue spinner */}
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1a4da1] border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="w-full mt-8 p-3 sm:p-6">
        <div className="max-w-5xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wider">
            <span className="text-[#1a4da1]">Our</span> Courses
          </h2>
          <p className="text-gray-600 mt-3">
            Level up your skills with our expert-led courses.
          </p>
          <p className="text-gray-600 py-16">
            No courses available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-8 p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-wider">
            <span className="text-[#1a4da1]">Our</span> Courses
          </h2>
          <p className="text-gray-600 mt-3 text-base">
            Level up your skills with our expert-led courses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              imageUrl={
                course.bannerImage ||
                course.photoUrl ||
                "https://placehold.co/600x400/cccccc/ffffff?text=No+Image"
              }
              title={course.title}
              author={course.experts?.[0]?.name || "BASE Team"}
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
      </div>
    </div>
  );
}
