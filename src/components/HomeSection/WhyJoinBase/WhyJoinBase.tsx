"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  Briefcase,
  Award,
  BookOpen,
  Wrench,
  Building,
  Lightbulb,
  Handshake,
  Newspaper,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Define the type for a single benefit
type Benefit = {
  icon: React.ElementType;
  title: string;
  description: string;
};

// Array of all benefits
const benefits: Benefit[] = [
  {
    icon: Users,
    title: "Networking Opportunities",
    description:
      "Connect with fellow professionals, industry leaders, and experts in the field of structural engineering to share knowledge, ideas, and opportunities.",
  },
  {
    icon: Briefcase,
    title: "Professional Development",
    description:
      "Access workshops, seminars, and training programs that enhance your skills and keep you updated on the latest industry trends and technologies.",
  },
  {
    icon: Handshake,
    title: "Advocacy and Representation",
    description:
      "Benefit from the association's efforts to advocate for the interests of structural engineers at local, national, and international levels.",
  },
  {
    icon: BookOpen,
    title: "Resource Access",
    description:
      "Gain exclusive access to research publications, technical resources, and industry guidelines that can support your projects and career.",
  },
  {
    icon: Wrench,
    title: "Collaboration on Projects",
    description:
      "Engage in collaborative projects that contribute to the advancement of the engineering profession and address challenges in the built environment.",
  },
  {
    icon: Award,
    title: "Certification and Recognition",
    description:
      "Opportunities for certification that enhance your professional credentials and demonstrate your commitment to excellence in structural engineering.",
  },
  {
    icon: Lightbulb,
    title: "Mentorship Programs",
    description:
      "Participate in mentorship opportunities that connect experienced engineers with newcomers to guide their professional journey.",
  },
  {
    icon: Building,
    title: "Community Engagement",
    description:
      "Contribute to community development initiatives and projects that aim to improve infrastructure and safety standards in Bangladesh.",
  },
  {
    icon: Newspaper,
    title: "Stay Informed",
    description:
      "Receive updates on industry news, regulatory changes, and events through newsletters and publications from the association.",
  },
  {
    icon: TrendingUp,
    title: "Contribute to the Future",
    description:
      "Be part of a collective effort to shape the future of structural engineering in Bangladesh, ensuring safety, sustainability, and innovation.",
  },
];

// Main component for the "Why Join" section
export default function WhyJoinBase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBenefit = benefits[activeIndex];
  const ActiveIcon = activeBenefit.icon;
  const listRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  useEffect(() => {
    if (listRef.current) {
      const activeButton = listRef.current.children[activeIndex] as HTMLElement;
      if (activeButton) {
        setIndicatorStyle({
          top: activeButton.offsetTop,
          height: activeButton.offsetHeight,
        });
      }
    }
  }, [activeIndex]);

  return (
    <div  className="bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      <section id="About" className="py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6">
            <p className="text-xs font-semibold text-[#AF4444] uppercase tracking-widest mb-2">
             
            </p>
            <h2 className="text-2xl uppercase sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Why Join BASE
            </h2>
            <div className="mt-2 h-0.5 w-16 bg-[#AF4444] mx-auto rounded-full"></div>
          </div>

          {/* Two Column Layout */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[500px]">
              
              {/* Left Column: Clickable Tabs */}
              <div className="w-full lg:w-2/5 bg-gray-50 dark:bg-gray-700/50 border-r border-gray-200 dark:border-gray-600">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-2">
                    Membership Benefits
                  </h3>
                  <div ref={listRef} className="relative space-y-1">
                    <div
                      className="absolute left-0 w-full bg-white dark:bg-gray-600 rounded-lg shadow-sm border-l-4 border-[#AF4444] transition-all duration-300 ease-in-out"
                      style={indicatorStyle}
                    />
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      const isActive = activeIndex === index;
                      return (
                        <button
                          key={benefit.title}
                          onClick={() => setActiveIndex(index)}
                          className={`relative z-10 cursor-pointer w-full text-left p-3 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#AF4444] focus-visible:ring-offset-1 hover:bg-white/50 dark:hover:bg-gray-600/50 ${
                            isActive ? 'bg-white dark:bg-gray-600' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon
                              className={`w-4 h-4 mr-3 transition-colors duration-200 flex-shrink-0 ${
                                isActive
                                  ? "text-[#AF4444]"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            />
                            <span
                              className={`font-medium text-sm transition-colors duration-200 leading-tight ${
                                isActive
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            >
                              {benefit.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Details Panel */}
              <div className="w-full lg:w-3/5 p-6">
                {/* Header with Action Button */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#AF4444] to-red-800 rounded-lg shadow-lg">
                      <ActiveIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                        {activeBenefit.title}
                      </h3>
                      <p className="text-xs text-[#AF4444] font-medium uppercase tracking-wide mt-1">
                        Membership Benefit
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Button - Top Right */}
                 
                </div>

                {/* Content Area */}
                <div 
                  key={activeBenefit.title}
                  className="animate-slideIn"
                >
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {activeBenefit.description}
                    </p>
                  </div>

                  {/* Additional Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                          Key Feature
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Professional networking and collaboration opportunities
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">
                          Impact
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Enhanced career growth and professional recognition
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Benefit {activeIndex + 1} of {benefits.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveIndex(activeIndex > 0 ? activeIndex - 1 : benefits.length - 1)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                          aria-label="Previous benefit"
                        >
                          <ArrowRight className="w-3 h-3 text-gray-600 dark:text-gray-300 rotate-180" />
                        </button>
                        <button
                          onClick={() => setActiveIndex(activeIndex < benefits.length - 1 ? activeIndex + 1 : 0)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
                          aria-label="Next benefit"
                        >
                          <ArrowRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Explore Membership Button - Right Side */}
                    <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#AF4444] to-red-800 text-white font-semibold rounded-lg shadow-lg hover:from-red-800 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-[#AF4444] focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 group text-sm">
                    <Link href={"/join-BASE"}> 
                      Explore Membership
                    </Link>

                      <ArrowRight className="w-3 h-3 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
