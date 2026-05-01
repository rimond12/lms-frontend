"use client";

import React from 'react';
import AppImage from '@/components/ui/AppImage';
import { Building2, Award, Handshake } from 'lucide-react';

interface EventSponsorsProps {
  sponsorName?: string;
  sponsorTitle?: string;
  sponsorPhotoUrl?: string;
}

export default function EventSponsors({ sponsorName, sponsorTitle, sponsorPhotoUrl }: EventSponsorsProps) {
  const sponsors = [
    { name: "Engineering Institute", category: "Title Sponsor" },
    { name: "Tech Solutions Ltd", category: "Gold Sponsor" },
    { name: "Construction Corp", category: "Silver Sponsor" },
    { name: "Research Foundation", category: "Academic Partner" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-4">
            <Handshake className="w-4 h-4 text-red-800" />
            <span className="text-red-800 font-semibold text-sm uppercase tracking-wide">Our Partners</span>
          </div>
          <h2 className="text-3xl md:text-4xl uppercase font-bold text-black mb-3">
            Event{' '}
            <span className="text-red-800">Sponsors</span>
          </h2>
          <div className="w-16 h-1 bg-red-800 mx-auto"></div>
        </div>

        {/* Main Sponsor */}
        {(sponsorName || sponsorPhotoUrl) && (
          <div className="mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-red-100 max-w-md mx-auto">
              <div className="text-center">
                {sponsorPhotoUrl ? (
                  <div className="mb-4">
                    <AppImage
                      photoUrl={sponsorPhotoUrl}
                      alt={sponsorName || 'Main Sponsor'}
                      width={200}
                      height={200}
                      className="mx-auto h-32 w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-24 h-16 bg-red-50 rounded-lg">
                      <Building2 className="w-8 h-8 text-red-800" />
                    </div>
                  </div>
                )}

                {sponsorName && (
                  <h4 className="text-lg font-bold text-black mb-1">{sponsorName}</h4>
                )}

                {sponsorTitle && (
                  <p className="text-black/70 text-sm mb-3">{sponsorTitle}</p>
                )}

                <div className="inline-flex items-center space-x-1 bg-red-50 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                  <Award className="w-3 h-3" />
                  <span>Title Sponsor</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Sponsors Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sponsors.map((sponsor, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-md border border-black/5 hover:shadow-lg transition-all duration-300 hover:border-red-200 text-center"
            >
              <div className="mb-3">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6 text-red-800" />
                </div>
              </div>

              <h4 className="font-semibold text-black text-sm mb-2 leading-tight">
                {sponsor.name}
              </h4>

              <div className="inline-flex items-center space-x-1 bg-red-50 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                <span>{sponsor.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simple CTA */}
        <div className="mt-12 text-center">
          <div className="bg-red-800 rounded-lg p-6 text-white max-w-lg mx-auto">
            <h3 className="text-lg font-bold mb-2">Become a Sponsor</h3>
            <p className="text-white/90 text-sm mb-4">
              Partner with us to reach industry professionals
            </p>
            <button className="bg-white text-red-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}