"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Globe, Users, Award, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

export default function EventFooter() {
  const footerSections = [
    {
      title: "Useful Links",
      links: [
        { name: "Events", href: "/events" },
        { name: "News", href: "/news" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
        { name: "About Us", href: "/about" }
      ]
    },
    {
      title: "Community",
      links: [
        { name: "Discussion", href: "#" },
        { name: "Discord", href: "#" },
        { name: "Forums", href: "#" },
        { name: "Support", href: "#" },
        { name: "Feedback", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Research Papers", href: "#" },
        { name: "Case Studies", href: "#" },
        { name: "Downloads", href: "#" },
        { name: "Guidelines", href: "#" }
      ]
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", name: "Facebook" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", name: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", name: "LinkedIn" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", name: "YouTube" }
  ];

  return (
    <footer className="bg-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-[#B34644] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-2xl">SIET</span>
              </Link>
              
              <p className="text-gray-400 leading-relaxed mb-6">
                Advancing seismic engineering knowledge through innovative research, 
                professional development, and collaborative learning experiences for 
                engineers worldwide.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold text-white mb-4">Contact Information</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Mail className="w-5 h-5 text-[#B34644]" />
                  <span>siet@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <Phone className="w-5 h-5 text-[#B34644]" />
                  <span>+880 1234-567890</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
                  <MapPin className="w-5 h-5 text-[#B34644]" />
                  <span>University of Asia Pacific, Dhaka</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="font-semibold text-white text-lg">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href} 
                      className="text-gray-400 hover:text-[#B34644] transition-colors duration-200 hover:underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 my-12"></div>
        
        {/* Social Media & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h4 className="font-semibold text-white text-lg mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-[#B34644] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 transform hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white text-lg mb-4">Stay Updated</h4>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-[#B34644] focus:outline-none transition-colors"
              />
              <button className="bg-[#B34644] hover:bg-[#8B1E1E] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span>© 2024 SIET. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#B34644]" />
                <span>Made with ❤️ for Engineers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Accent */}
      <div className="h-1 bg-gradient-to-r from-[#B34644] via-red-800 to-[#B34644]"></div>
    </footer>
  );
}