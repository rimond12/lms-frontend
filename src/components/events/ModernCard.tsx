import React from 'react';
import { User as UserIcon } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

// Card Props Interface
interface CardProps {
  imageUrl: string;
  title: string;
  author: string;
  description: string;
}

// Modern Card Component
export const ModernCard: React.FC<CardProps> = ({ imageUrl, title, author, description }) => {
  return (
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
    ">
      {/* Card Image with animated underline */}
      <div className="relative overflow-hidden rounded-b-lg ">
        <AppImage
          photoUrl={imageUrl}
          alt={title}
          className="
            w-full
            h-40
            object-cover
            transition-transform
            duration-300
            ease-in-out
            group-hover:scale-105
          " width={600} height={400}
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400/ff0000/ffffff?text=Error'; }}
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
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 mb-2 h-16 line-clamp-3">{title}</h3>

        <div className="flex items-center text-red-700 mb-3">
          <UserIcon className="w-3 h-3 mr-1" />
          <p className="text-xs font-medium uppercase tracking-wider">{author}</p>
        </div>

        <p className="text-gray-600 text-xs mb-4 flex-grow line-clamp-3">{description}</p>

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
          KNOW MORE
        </button>
      </div>
    </div>
  );
};