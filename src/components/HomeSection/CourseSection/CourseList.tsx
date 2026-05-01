"use client";

import { Title3DFlip } from "@/components/common/Commontitle/Commontitle";
import { CourseCard } from "./CourseSection";
import { motion } from "framer-motion";

export default function CourseList() {
  const courses = [
    {
      imageUrl: "https://placehold.co/400x240/1a202c/ffffff?text=English",
      category: "EVERYDAY ENGLISH",
      instructor: {
        name: "Elita Karim",
        title: "Former Editor",
        company: "The Daily Star",
      },
      tags: ["Communication", "Skill Development"],
      title: "Everyday English",
      description: "একটি কোর্সের মাধ্যমে আপনার ইংরেজিভীতির দশা বাড়িয়ে ফেলুন।",
      rating: 4.9,
      enrolled: 26738,
      price: 649,
      originalPrice: 1750,
    },
    {
      imageUrl: "https://placehold.co/400x240/1a4da1/ffffff?text=Excel",
      category: "Microsoft Excel",
      instructor: {
        name: "Rifatul Maksud",
        title: "Manager",
        company: "Products & Technology",
      },
      tags: ["Tools and Technology"],
      title: "MS Excel for Professionals",
      description:
        "This course enables you to utilize MS Excel more efficiently and confidently.",
      rating: 4.8,
      enrolled: 16799,
      price: 649,
      originalPrice: 1750,
    },
    {
      imageUrl: "https://placehold.co/400x240/276749/ffffff?text=Sales",
      category: "TERRITORY SALES",
      instructor: {
        name: "Imtiaz Ahmed Chowdhury",
        title: "Sales Director",
        company: "Syngenta Bangladesh",
      },
      tags: ["Sales and Marketing"],
      title: "Territory Sales Management",
      description:
        "হয়ে উঠুন একজন সফল সেলার, গ্রেড মার্কেটিং ও ডিস্ট্রিবিউশন প্রোফেশনাল।",
      rating: 4.9,
      enrolled: 4544,
      price: 649,
      originalPrice: 1750,
    },
  ];

  return (
    <div className="py-12 max-w-6xl mx-auto">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Title3DFlip />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.title} {...course} />
          ))}
        </div>
        <div className="text-center mt-12">
          {/* ✅ Royal blue button */}
          <button className="bg-[#1a4da1] text-white font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-[#133a7a] hover:scale-105">
            Explore All Courses
          </button>
        </div>
      </div>
    </div>
  );
}
