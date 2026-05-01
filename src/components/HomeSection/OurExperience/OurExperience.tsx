"use client";

import { Wind, BookOpenCheck, Users, Goal, PlayCircle } from "lucide-react";
import Image from "next/image"; // Using next/image for optimized images

// Define a type for our feature cards for better type-safety
type FeatureCardProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  iconColor: string;
};

// A reusable card component to keep the code DRY (Don't Repeat Yourself)
const FeatureCard = ({ icon: Icon, title, description, className, iconColor }: FeatureCardProps) => (
  <div className={`rounded-2xl p-6 flex flex-col justify-between text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300 ${className}`}>
    <div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4`} style={{ backgroundColor: iconColor }}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-gray-200 text-sm">{description}</p>
    </div>
  </div>
);

// The main component for the section
export default function OurExperienceSection() {
  const features = [
    {
      icon: Wind,
      title: "Expert Mentors",
      description: "Learn from the industry movers and shapers",
      bgColor: "bg-teal-600", // A nice teal color
      iconBg: "rgba(255, 255, 255, 0.1)",
    },
    {
      icon: BookOpenCheck,
      title: "Hybrid Learning",
      description: "On-demand lessons and LIVE classes",
      bgColor: "bg-slate-800",
      iconBg: "rgba(255, 255, 255, 0.1)",
    },
    {
      icon: Users,
      title: "Offline Meetups",
      description: "Grow your professional network",
      bgColor: "bg-slate-800",
      iconBg: "rgba(255, 255, 255, 0.1)",
    },
    {
      icon: Goal,
      title: "Success Manager",
      description: "Dedicated mentors for career guidance",
      bgColor: "bg-teal-800", // A darker teal
      iconBg: "rgba(255, 255, 255, 0.1)",
    },
  ];

  return (
    <section className="bg-white dark:bg-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white tracking-tight">
            Our Experience
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Helping you become the very best
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side: Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                className={feature.bgColor}
                iconColor={feature.iconBg}
              />
            ))}
          </div>

          {/* Right side: Video Player */}
          <div className="relative w-full h-full aspect-video rounded-2xl overflow-hidden shadow-2xl group cursor-pointer">
            <Image
              src="https://res.cloudinary.com/dalpf8iip/image/upload/v1754550555/403899892_1934ca2b-7400-4383-acb7-457913764fc6_vvzhal.jpg" // Placeholder for the video thumbnail
              alt="Our Experience Video Thumbnail"
              width={1280}
              height={720}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full transition-all duration-300 group-hover:bg-white/30">
                 <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Text on Video */}
            <div className="absolute bottom-6 right-6 text-right">
                {/* <p className="text-white font-bold text-2xl drop-shadow-md">Our Story</p>
                <p className="text-white text-lg drop-shadow-md">What & Why?</p> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
