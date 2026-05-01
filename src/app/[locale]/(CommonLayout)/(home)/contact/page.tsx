"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetAllContactsQuery } from "@/app/redux/api/contactApi";
import { ContactItem } from "@/types/contact";
import {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Clock,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Phone,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Clock,
};

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="h-10 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 shadow-lg animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl" />
                <div className="h-6 w-32 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-4 w-full bg-gray-200 rounded mt-4" />
              <div className="h-4 w-2/3 bg-gray-200 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const { data: contactsData, isLoading } = useGetAllContactsQuery({});

  const contacts = contactsData?.data || [];
  const contactItems = contacts.filter(
    (c: ContactItem) => c.category === "contact"
  );
  const socialItems = contacts.filter(
    (c: ContactItem) => c.category === "social"
  );

  // Render icon based on icon name or URL
  const renderIcon = (contact: ContactItem) => {
    if (contact.icon.startsWith("http")) {
      return (
        <Image
          src={contact.icon}
          alt={contact.title}
          width={28}
          height={28}
          className="w-7 h-7 object-contain"
        />
      );
    }

    const IconComponent = iconMap[contact.icon];
    if (IconComponent) {
      return <IconComponent className="w-7 h-7" />;
    }
    return <Mail className="w-7 h-7" />;
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm border border-blue-100">
              <Phone className="w-4 h-4" />
              <span>We&apos;re here to help</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Get in <span className="text-blue-600">Touch</span> with Us
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              Have questions about our courses or programs? We&apos;d love to
              hear from you. Reach out to us through any of the channels below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get in touch with us through any of these channels. We&apos;re
              available to assist you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {contactItems.map((contact: ContactItem) => (
              <div
                key={contact._id}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${contact.bgColor}20`,
                      color: contact.iconColor,
                    }}
                  >
                    {renderIcon(contact)}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {contact.title}
                  </h3>

                  {/* Content */}
                  {contact.isMultiline ? (
                    <div className="text-gray-600 space-y-1">
                      {contact.content.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">{contact.content}</p>
                  )}

                  {/* Link */}
                  {contact.isLink && contact.href && (
                    <Link
                      href={contact.href}
                      target={contact.isExternal ? "_blank" : undefined}
                      rel={contact.isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-medium group/link"
                    >
                      <span>Contact Now</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      {socialItems.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Follow Us on Social Media
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Stay connected with us on social media for the latest updates,
                news, and educational content.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {socialItems.map((social: ContactItem) => (
                <Link
                  key={social._id}
                  href={social.href || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 hover:bg-white/20 transition-all duration-300 border border-white/10 hover:border-white/30"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${social.bgColor}30`,
                      color: social.iconColor,
                    }}
                  >
                    {renderIcon(social)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">
                      {social.title}
                    </h4>
                    <p className="text-gray-400 text-sm">{social.content}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors ml-2" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                Explore our wide range of courses and take the first step
                towards your professional growth.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/all-courses"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  <span>Browse Courses</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:bg-white/10 transition-colors"
                >
                  <span>Learn More</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
