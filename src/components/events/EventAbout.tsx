"use client";

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import RichTextRenderer from '@/components/shared/RichTextRenderer';
import { Download, Award, Users, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface EventAboutProps {
  content: string;
  photoUrl?: string;
  title: string;
}

export default function EventAbout({ content, photoUrl,title }: EventAboutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncateText = (text: string, maxWords: number = 20) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };
  const features = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Expert Knowledge",
      description: "Learn from industry-leading professionals with decades of experience"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Networking",
      description: "Connect with peers and build lasting professional relationships"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Practical Skills",
      description: "Gain hands-on experience with real-world engineering solutions"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Career Growth",
      description: "Advance your career with cutting-edge knowledge and certifications"
    }
  ];

  return (
    <section className="py-20  bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#B34644]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 text-[#B34644] font-semibold text-sm tracking-wide uppercase">
               
              </div>
              
              <h2 className="text-3xl md:text-3xl font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-950 to-red-800">
                  {title}
                </span>
              </h2>
            </div>

            <div className="space-y-4">
              {isExpanded ? (
                <div className="prose prose-lg text-sm text-gray-600 max-w-none">
                  <RichTextRenderer htmlString={content} />
                </div>
              ) : (
                <div className="text-gray-600 text-sm leading-relaxed">
                  <div dangerouslySetInnerHTML={{ 
                    __html: truncateText(content.replace(/<[^>]*>/g, ''), 40) 
                  }} />
                </div>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 text-[#B34644] hover:text-[#B34644]/80 font-medium text-sm transition-colors duration-200"
              >
                <span>{isExpanded ? 'See Less' : 'See More'}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#B34644]/20 transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#B34644]/10 rounded-lg flex items-center justify-center text-[#B34644] group-hover:bg-[#B34644] group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
           
           
          </div>
          
          {/* Image Side */}
          <div className="relative">
            {photoUrl ? (
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <AppImage
                    photoUrl={photoUrl}
                    alt="Event Image"
                    width={600}
                    height={400}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#B34644] rounded-2xl opacity-20 animate-float"></div>
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
                
                {/* Floating Card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-6 shadow-xl border border-gray-100 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#B34644]/10 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-[#B34644]" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Certified Event</div>
                      <div className="text-sm text-gray-600">Professional Development</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Event Content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}