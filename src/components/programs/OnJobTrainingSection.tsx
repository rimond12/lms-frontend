"use client";
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Briefcase } from "lucide-react";
import AppImage from "@/components/ui/AppImage";

interface OnJobTrainingSectionProps {
  imageUrl?: string;
  className?: string;
}

const trainingFeatures = [
  {
    label: "মোড",
    value: "অনলাইন বা অফলাইন",
  },
  {
    label: "অনলাইন",
    value: "ফুলটাইম (৯টা -৫টা, ৬ সপ্তাহ) অথবা পার্টটাইম (৬টা -১০টা, ৬ মাস)",
  },
  {
    label: "অফলাইন",
    value: "ফুলটাইম (৯টা -৫টা), নিজস্ব ল্যাপটপ আবশ্যক",
  },
  {
    label: "মূল্যায়ন",
    value: "ট্রেইনিংয়ে আগে কাজ পর্যালোচনা",
  },
  {
    label: "উপস্থিতি",
    value: "নিয়মিত উপস্থিতি বাধ্যতামূলক",
  },
  {
    label: "ফলাফল",
    value: "রিটি আপডেট ও জব সোল জয়",
  },
  {
    label: "উদ্দেশ্য",
    value: "বাস্তব কাজের প্রস্তুতি",
  },
];

const OnJobTrainingSection: React.FC<OnJobTrainingSectionProps> = ({
  imageUrl = "https://res.cloudinary.com/dbkwiwoll/image/upload/v1744107410/WhatsApp-Image-2024-08-29-at-11.45.03-AM-1536x1023.jpeg_pvewlx.webp",
  className = "",
}) => {
  return (
    <div className={`${className}`}>
      {/* Equal height grid with stretch */}
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        {/* Left - Image (Full height matching right side) */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="relative group h-full min-h-[320px]"
        >
          <div className="relative overflow-hidden rounded-xl h-full">
            <AppImage
              photoUrl={imageUrl}
              alt="On Job Training"
              width={600}
              height={450}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

            {/* Floating badge */}
            <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1a4da1] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    Real World
                  </p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">
                    Experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right - Content (Same height as image) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-col justify-between h-full"
        >
          {/* Description - Better readability */}
          <div className="mb-4">
            <p className="text-gray-700 text-[15px] leading-relaxed">
              অন-জব ট্রেনিং হলো একটি শিক্ষামূলক প্রক্রিয়া যেখানে একজন প্রতিটি
              একটি নির্দিষ্ট পেশায় বা কাজের ক্ষেত্রে প্রশিক্ষণ পায়, প্রকৃত
              কার্যক্ষেত্রে কাজ করার মাধ্যমে।
            </p>
          </div>

          {/* Features - Clean organized grid */}
          <div className="grid grid-cols-1 gap-2.5 mb-4">
            {trainingFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5"
              >
                <CheckCircle className="w-4 h-4 text-[#1a4da1] mt-0.5 shrink-0" />
                <p className="text-[14px] leading-snug">
                  <span className="font-semibold text-gray-900">
                    {feature.label}:
                  </span>{" "}
                  <span className="text-gray-600">{feature.value}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Note - Clean red accent */}
          <div className="bg-blue-50 border-l-4 border-[#1a4da1] rounded-r-lg p-4">
            <p className="text-[14px] font-semibold text-[#1a2e5a] leading-snug mb-1">
              মূল কোর্সে ৫০% সম্পন্ন করার সাথে সাথে অনজব ট্রেইনিংয়ের জন্য আবেদন
              করতে পারবেন।
            </p>
            <p className="text-[13px] text-[#1a4da1]/80 leading-snug">
              এই ট্রেনিংয়ে আপনি একজন অভিজ্ঞ প্রফেশনালের সরাসরি তত্ত্বাবধানে
              বাস্তব প্রকল্পগুলোর কাজ সম্পন্ন করার সুযোগ পাবেন।
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnJobTrainingSection;
