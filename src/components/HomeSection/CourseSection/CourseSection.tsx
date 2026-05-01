"use client";
// components/CourseCard.tsx
// You need to install lucide-react for icons: npm install lucide-react
import React from "react";
import { Star, Users } from "lucide-react";

interface CourseCardProps {
  imageUrl: string;
  category: string;
  instructor: { name: string; title: string; company: string };
  tags: string[];
  title: string;
  description: string;
  rating: number;
  enrolled: number;
  price: number;
  originalPrice: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  imageUrl,
  category,
  instructor,
  tags,
  title,
  description,
  rating,
  enrolled,
  price,
  originalPrice,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-2 max-w-sm mx-auto">
      {/* Image */}
      <div className="relative">
        <img
          className="w-full h-48 object-cover"
          src={imageUrl}
          alt={title}
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.onerror = null;
            t.src = `https://placehold.co/400x240/2d3748/ffffff?text=Image+Not+Found`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-between text-white">
          <div>
            {/* ✅ Blue category */}
            <h3 className="font-bold text-xl tracking-wider">{category}</h3>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full border-2 border-white overflow-hidden">
              <svg
                className="w-full h-full text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">{instructor.name}</p>
              <p className="text-xs text-gray-200">{`${instructor.title}, ${instructor.company}`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-[#1a4da1] text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <h4 className="text-lg font-bold text-gray-800 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm mb-4 h-10">{description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <span className="text-yellow-500 font-bold mr-1">
              {rating.toFixed(1)}
            </span>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Users size={16} className="mr-1.5" />
            <span>{enrolled.toLocaleString()} Enrolled</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-green-600">৳{price}</span>
            <span className="text-sm text-gray-400 line-through ml-2">
              ৳{originalPrice}
            </span>
          </div>
          {/* ✅ Royal blue button */}
          <button className="px-6 py-2 border-2 border-[#1a4da1] rounded-full text-[#1a4da1] font-semibold text-sm transition-all duration-300 hover:bg-[#1a4da1] hover:text-white">
            Enroll
          </button>
        </div>
      </div>
    </div>
  );
};
