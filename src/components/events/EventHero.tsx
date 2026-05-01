"use client";

import React, { useState } from 'react';
import CountdownTimer from '@/components/shared/CountdownTimer';
import AppImage from '@/components/ui/AppImage';
import RichTextRenderer from '../shared/RichTextRenderer';
import { Calendar } from 'lucide-react';

interface EventHeroProps {
  title: string;
  content: string;
  photoUrl?: string;
  eventDate?: string;
  category: string;
  EventsJoinLink?: string;
}

export default function EventHero({ title, content, photoUrl, eventDate, category ,EventsJoinLink }: EventHeroProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  
  // Calculate event date for countdown (using eventDate or fallback to 30 days from now)
  const targetDate = eventDate ? new Date(eventDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Function to truncate HTML content for preview and return plain text
  const getTruncatedPlainText = (htmlString: string, maxLength: number = 450) => {
    const plainText = htmlString.replace(/<[^>]*>/g, '');
    if (plainText.length <= maxLength) return plainText;
    const truncated = plainText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    const safeTruncated = lastSpaceIndex > 0 ? truncated.substring(0, lastSpaceIndex) : truncated;
    return safeTruncated + '...';
  };




  return (
    <section className="relative   w-full overflow-hidden bg-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {photoUrl && (

            
            <AppImage
              photoUrl={photoUrl}
              alt={title}
              width={1920}
              height={1080}
              className="w-full h-full object-cover opacity-30"
            />
          )}
          {/* Glass morphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/30 backdrop-blur-sm"></div>
        </div>

        {/* 3D Glass Pattern Overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(220, 38, 38, 0.08) 0%, transparent 50%)
            `,
          }}></div>
        </div>

        {/* Geometric 3D Glass Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-red-800/20 to-transparent rounded-3xl backdrop-blur-lg transform rotate-12 animate-float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-black/10 to-transparent rounded-2xl backdrop-blur-lg transform -rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-br from-red-800/15 to-transparent rounded-xl backdrop-blur-lg transform rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-br from-black/8 to-transparent rounded-2xl backdrop-blur-lg transform -rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col mb-16">
        {/* Header Section */}
        <div className="flex-none px-8 pt-8">
          <div className="flex items-center justify-between">
            {/* Category Badge */}
            <div className="animate-fade-in">
              <span className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold bg-red-800 text-white shadow-lg border border-red-700">
                <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                {category === 'event' ? 'Live Event' : category.toUpperCase()}
              </span>
            </div>
            
            {/* Date Badge */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-black/80 text-white px-6 py-2 rounded-full text-sm font-medium backdrop-blur-lg border border-black/20">
                {targetDate.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 py-2 mx-auto ">
          {/* Left Column - Event Details */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Title */}
            <div className="animate-slide-up">
              <h1 className="text-3xl lg:text-3xl xl:text-3xl font-bold leading-tight text-black">
                {title || "Seismic Analysis, Design, and Detailing of Shear Wall"}
              </h1>
              <div className="mt-2 w-24 h-1 bg-red-800"></div>
            </div>

            {/* Description */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                <div className="space-y-3">
                  <div>
                    {isContentExpanded ? (
                      <RichTextRenderer htmlString={content} />
                    ) : (
                      <RichTextRenderer htmlString={getTruncatedPlainText(content)} />
                    )}
                  </div>
                  {content.replace(/<[^>]*>/g, '').length > 150 && (
                    <button
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="text-[#B34644] hover:text-red-800 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
                    >
                      <span>{isContentExpanded ? 'See Less' : 'See More'}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${isContentExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Event Info Cards */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-2 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Venue</p>
                    <p className="text-black font-semibold">University of Asia Pacific</p>
                  </div>
                </div>
              </div>
              
              <div className=" backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="text-black font-semibold">Expert Panel</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button className="group bg-red-800 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
               
{/*                
                <span>Register Now</span> */}
               
               
{EventsJoinLink ? (
                <>
                
                  <a 
                    href={EventsJoinLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  
                  >
                  
                    Register Now
                  </a>
                </>
              ) : (
                <>
                  <p>• Registration details coming soon</p>
                  <p>• Stay tuned for updates</p>
                  <p>• Follow us for announcements</p>
                </>
              )}
               
               
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              







              <button className="group bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Info</span>
              </button>
            </div>
          </div>

          {/* Right Column - Countdown & Image */}
          <div className="flex flex-col justify-center items-center space-y-8">
            {/* Enhanced Event Image */}
            {photoUrl && (
              <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  {/* Glass frame effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-red-800/20 via-transparent to-black/10 rounded-3xl backdrop-blur-lg"></div>
                  <div className="relative w-80 h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/30 backdrop-blur-lg">
                    <AppImage
                      photoUrl={photoUrl}
                      alt={title}
                      width={320}
                      height={256}
                      className="w-full h-full object-cover"
                    />
                    {/* Glass overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Countdown Timer */}
            <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <div className=" rounded-2xl p-6  border-white/30 ">
             
                <CountdownTimer targetDate={targetDate.toISOString()} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar
        <div className="flex-none px-8 pb-8">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-black/20 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="grid grid-cols-3 divide-x divide-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-300">Expected Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">6</div>
                <div className="text-sm text-gray-300">Expert Speakers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">8hrs</div>
                <div className="text-sm text-gray-300">Duration</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}