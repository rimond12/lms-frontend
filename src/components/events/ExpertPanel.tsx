"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import { User, Award, MapPin, BookOpen, ExternalLink } from "lucide-react";
import { useGetExpertsQuery } from "@/app/redux/api/expartPanelApi/expartPanelApi";
import Link from "next/link";
import AppImage from "../ui/AppImage";

export default function ExpertPanel() {
  const { data: expertsData, isLoading, error } = useGetExpertsQuery({});
  const experts = expertsData?.data || [];

  if (isLoading) { /* … your skeleton … */ }
  if (error) { /* … your error state … */ }
  if (experts.length === 0) { /* … your empty state … */ }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
            <Award className="w-4 h-4 text-red-800" />
            <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">
              Expert Panel
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase text-black mb-3">
            Panel of <span className="text-red-800">Experts</span>
          </h2>
          <div className="w-16 h-1 bg-red-800 mx-auto" />
        </div>

        {/* Marquee with Professional Design */}
        <div className="relative">
          <Marquee
            gradient={false}
            speed={40}
            pauseOnHover={true}
            className="py-4"
          >
            {experts.map((expert) => (
              <div
                key={expert._id}
                className="mx-3"
              >



                <Link
                  href={`/expert-panel/${expert.slugUrl}`}
                  className="group block w-80 h-96 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-red-200 transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Expert Image Section */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center shadow-lg overflow-hidden ring-4 ring-white">
                        {expert.photoUrl ? (
                          <AppImage
                            photoUrl={expert.photoUrl}
                            alt={expert.name}
                            className="w-full h-full object-cover"
                            width={500}
                            height={500}
                          />
                        ) : (
                          <User className="w-12 h-12 text-red-800" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-800 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Expert Information */}
                  <div className="flex flex-col h-full">
                    {/* Name and Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-800 transition-colors duration-300 mb-1 line-clamp-2">
                        {expert.name}
                      </h3>
                      <p className="text-red-800 font-semibold text-sm leading-tight">
                        {expert.designation}
                      </p>
                    </div>

                    {/* Institution */}
                    <div className="mb-4">
                      <div className="flex items-start justify-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-800 flex-shrink-0 mt-0.5" />
                        <span className="text-center leading-tight line-clamp-2">
                          {expert.institution}
                        </span>
                      </div>
                    </div>

                    {/* Specialization */}
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-full space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-medium">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="text-center line-clamp-1">
                          {expert.specialization}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4">
                      <div className="flex justify-center space-x-6 text-xs text-gray-500">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {expert.jobExperiences?.length || 0}
                          </div>
                          <div>Experience{expert.jobExperiences?.length !== 1 ? 's' : ''}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {expert.achievements?.length || 0}
                          </div>
                          <div>Achievement{expert.achievements?.length !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                    </div>

                  
                  </div>
                </Link>
              </div>
            ))}
          </Marquee>

          {/* Gradient Overlays for Smooth Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </section>
  );
}