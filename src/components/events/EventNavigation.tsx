"use client";

import React from 'react';
import Link from 'next/link';

export default function EventNavigation() {
  return (
    <nav className="border-b border-gray-200 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#B34644] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SIET</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link 
              href="/" 
              className="hover:text-[#B34644] transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/events" 
              className="hover:text-[#B34644] transition-colors duration-200 font-medium text-[#B34644]"
            >
              Events
            </Link>
            <Link 
              href="/news" 
              className="hover:text-[#B34644] transition-colors duration-200 font-medium"
            >
              News
            </Link>
            <Link 
              href="/blog" 
              className="hover:text-[#B34644] transition-colors duration-200 font-medium"
            >
              Blog
            </Link>
            <Link 
              href="/contact" 
              className="hover:text-[#B34644] transition-colors duration-200 font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm">
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2 text-[#B34644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              siet@gmail.com
            </span>
            <span className="text-gray-600">Seismic Analysis Management</span>
          </div>
          
          <button className="bg-[#B34644] hover:bg-[#8B1E1E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            Register
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden mt-4">
        <button className="text-gray-600 hover:text-[#B34644] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}