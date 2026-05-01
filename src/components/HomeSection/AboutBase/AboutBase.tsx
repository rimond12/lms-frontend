"use client"
import { ProfessionalAnimatedTitle } from '@/components/common/Commontitle/AnimationTitile';
import React, { useState, useEffect, useRef } from 'react';
// import Link from 'next/link'; // Removed to fix dependency error

// --- Helper: Arrow Icon for Button ---
const ArrowRightIcon = ({ className }: { className?: string }): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

// The video ID and URL base
const VIDEO_ID = '-Jter4o1Ffw';
const YT_EMBED_BASE_URL = `https://www.youtube.com/embed/${VIDEO_ID}`;

// --- New Component: Responsive Auto-Playing Video Column ---
const ResponsiveVideoPlayer = () => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const currentRef = videoRef.current;
        if (!currentRef) return;

        // Intersection Observer setup to detect when the video is in view
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Start playing if at least 50% of the video is intersecting
                if (entry.isIntersecting) {
                    setIsPlaying(true);
                } else {
                    // Pause when it scrolls out of view
                    setIsPlaying(false);
                }
            },
            {
                root: null, // use the viewport as the container
                rootMargin: '0px',
                threshold: 0.5, // 50% of the target element must be visible
            }
        );

        observer.observe(currentRef);

        // Cleanup function
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    // Construct the dynamic source URL.
    // Removed mute=1 and controls=0. Added modestbranding=1 and rel=0 for a clean look.
    // NOTE: Autoplay (even without mute) is often blocked by browsers until user interaction.
    const videoSrc = `${YT_EMBED_BASE_URL}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${VIDEO_ID}&modestbranding=1&rel=0&start=0`;
    
    return (
        <div ref={videoRef} className="relative w-full mx-auto max-w-4xl">
          {/* Gradient border wrapper for a polished professional look */}
          <div className="p-1 rounded-3xl bg-gradient-to-r from-[#AF4444] via-[#d96b6b] to-[#AF4444] shadow-lg">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl transition-all duration-700 ease-out group">
              {/* YouTube Iframe */}
              <iframe
                className="absolute inset-0 w-full h-full transform transition-opacity duration-500"
                src={videoSrc}
                title="BASE Promotional Video"
                frameBorder="0"
                // Crucial to allow necessary features
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                // Visually dim the video slightly when it's paused out of view
                style={{ opacity: isPlaying ? 1 : 0.65 }}
              ></iframe>

              {/* Professional Overlay Hint (shows when paused/out of view) */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-opacity duration-500 cursor-default">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 border border-white/20 shadow-lg">
                    <svg className="w-10 h-10 text-white/90" fill="currentColor" viewBox="0 0 24 24"><path d="M7 6v12l10-6z" /></svg>
                  </div>
                  <p className="mt-3 text-sm text-white/80 font-semibold">BASE Introduction — Auto-play (in view)</p>
                  <p className="mt-1 text-xs text-white/50">Scroll or click to activate sound</p>
                </div>
              )}

              {/* Subtle Corner Branding */}
              <div className="absolute bottom-0 right-0 p-2 text-xs font-bold text-white bg-[#AF4444] rounded-bl-lg opacity-95 shadow-md">BASE</div>
            </div>
          </div>
        </div>
    );
};


// --- About Section Component (Modern Refactored Version) ---
export const AboutBase = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slight delay to trigger CSS transition on load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-16 sm:py-20 overflow-hidden font-inter">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Increased max width to 7xl for a larger overall section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <ProfessionalAnimatedTitle
            title="About BASE"
            subTitle="Leading Excellence in Structural Engineering Across Bangladesh"
          />
        </div>

        {/* Adjusted grid for better video visibility (make the video visually larger) */}
        <div className="grid grid-cols-1 lg:grid-cols-12  items-start">
          
          {/* Content Column (Adjusted grid spans for mobile/desktop layout) */}
          <div className={`space-y-6 lg:col-span-5 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'} transition-all duration-1000 ease-out`}>
            
            {/* Mission Statement */}
            <div className="bg-white p-6 rounded-xl shadow-xs border-t-4 border-[#AF4444] hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl lg:text-mdxl font-bold text-gray-900 mb-2 uppercase">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-xs text-justify">
                The Bangladesh Association of Structural Engineers (BASE) is a professional organization dedicated to advancing
                the field of structural engineering in Bangladesh. We foster excellence in design, construction, and safety standards.
              </p>
            </div>

            {/* Key Points - Organized into a better visual flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Professional Excellence */}
              <div className="flex items-start space-x-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 bg-[#AF4444] rounded-full flex items-center justify-center mt-0.5 shadow-md">
                  <span className="text-white font-bold text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Professional Excellence</h4>
                  <p className="text-xs text-gray-600">Committed to highest standards in practice.</p>
                </div>
              </div>

              {/* Innovation */}
              <div className="flex items-start space-x-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 bg-[#AF4444] rounded-full flex items-center justify-center mt-0.5 shadow-md">
                  <span className="text-white font-bold text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Innovation</h4>
                  <p className="text-xs text-gray-600">Advancing modern engineering practices.</p>
                </div>
              </div>

              {/* Community */}
              <div className="flex items-start space-x-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 bg-[#AF4444] rounded-full flex items-center justify-center mt-0.5 shadow-md">
                  <span className="text-white font-bold text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Community</h4>
                  <p className="text-xs text-gray-600">Building strong professional networks.</p>
                </div>
              </div>

              {/* Safety First */}
              <div className="flex items-start space-x-2 p-2 rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 bg-[#AF4444] rounded-full flex items-center justify-center mt-0.5 shadow-md">
                  <span className="text-white font-bold text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Safety First</h4>
                  <p className="text-xs text-gray-600">Prioritizing structural integrity and public safety.</p>
                </div>
              </div>
            </div>

            {/* CTA Button
            <div className="pt-6 flex justify-start">
              <a href="#About" className="
                  group
                  inline-flex
                  items-center
                  px-8
                  py-3
                  bg-transparent
                  border-2
                  border-[#AF4444]
                  text-[#AF4444]
                  font-semibold
                  text-base
                  rounded-lg
                  hover:bg-[#AF4444]
                  hover:text-white
                  transition-all
                  duration-300
                  ease-in-out
                  shadow-lg
                  hover:shadow-xl
                  hover:-translate-y-1
                ">
                  Learn More About BASE
                  <ArrowRightIcon className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </div> */}
          </div>

          {/* Video Player Column (Larger on Desktop: lg:col-span-1 effectively making it 50% and increasing max-w) */}
           <div className={`relative flex justify-center items-center lg:col-span-7 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} transition-all duration-1000 ease-out delay-300`}>
             <div className="w-full max-w-4xl mx-auto px-4 lg:px-6">
             
               <ResponsiveVideoPlayer />
             </div>
             {/* Decorative Elements */}
             <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-[#AF4444] rounded-full opacity-20 -z-10 hidden lg:block" />
             <div className="absolute -top-8 -left-8 w-12 h-12 bg-[#AF4444] rounded-full opacity-30 -z-10 hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
};