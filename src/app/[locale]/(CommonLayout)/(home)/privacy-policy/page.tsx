"use client";

import React, { useState, useEffect, JSX } from "react";
import {
  FileText,
  Shield,
  DollarSign,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Users,
  LucideIcon,
} from "lucide-react";
import { sectionsData } from "@/data/termsData";

// Type definitions
interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  accentColor: string;
}

interface Subsection {
  title: string;
  items: string[];
}

interface Highlight {
  title: string;
  email?: string;
  content?: string;
}

interface ContentSection {
  title: string;
  items?: string[];
  subsections?: Subsection[];
  description?: string;
  highlight?: Highlight;
  additionalInfo?: string;
  contact?: string;
}

interface SectionContent {
  title: string;
  effectiveDate: string;
  applicablePolicies?: string;
  introduction: string;
  sections: ContentSection[];
}

interface ContentData {
  terms: SectionContent;
  privacy: SectionContent;
  refund: SectionContent;
  conduct: SectionContent;
}

interface ContactInfo {
  icon: LucideIcon;
  label: string;
  value: string;
  type: "email" | "phone" | "address";
}

const PrivacyPolicy: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("terms");
  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  // Map sectionsData to sections for navigation
  const sections: Section[] = sectionsData.map((section: any) => ({
    id: section.id,
    label: section.title,
    icon: section.icon,
    color: section.color,
    accentColor: section.color.includes("green")
      ? "green"
      : section.color.includes("blue")
        ? "blue"
        : section.color.includes("amber")
          ? "amber"
          : "purple",
  }));

  // Use sectionsData as contentData
  const contentData: any = {};
  sectionsData.forEach((section: any) => {
    contentData[section.id] = {
      title: section.title,
      effectiveDate: section.effectiveDate,
      introduction: section.introduction,
      sections: section.sections,
    };
  });

  // Contact information data
  const contactInfo: ContactInfo[] = [
    {
      icon: Mail,
      label: "Email",
      value: "caddcorebd@gmail.com",
      type: "email",
    },
    { icon: Phone, label: "Phone", value: "+880 1611-223631", type: "phone" },
    {
      icon: MapPin,
      label: "Address",
      value:
        "149/A, Baitush Sharaf Complex, Airport Road, Farmgate, Dhaka-1215",
      type: "address",
    },
  ];

  const scrollToSection = (sectionId: string): void => {
    setIsScrolling(true);
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  useEffect(() => {
    const handleScroll = (): void => {
      if (isScrolling) return;

      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolling, sections]);

  const renderContentSection = (
    section: ContentSection,
    accentColor: string,
  ): JSX.Element => {
    return (
      <div className="space-y-6">
        {section.subsections ? (
          <div className="space-y-4">
            {section.subsections.map((subsection, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {subsection.title}
                </h4>
                <ul className="space-y-1 text-gray-700 text-sm">
                  {subsection.items.map((item, itemIndex) => (
                    <li key={itemIndex}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : section.items ? (
          <ul className="space-y-2 text-gray-700">
            {section.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className={`text-${accentColor}-600 mr-2`}>•</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: item.replace(
                      /\*\*(.*?)\*\*/g,
                      "<strong>$1</strong>",
                    ),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {section.description && (
          <p className="text-gray-700">{section.description}</p>
        )}

        {section.highlight && section.highlight.email && (
          <div
            className={`bg-${accentColor}-50 border-l-4 border-${accentColor}-400 p-4 rounded`}
          >
            <p className="text-gray-700">
              📧 <strong>{section.highlight.title}</strong>
              <br />
              📨{" "}
              <a
                href={`mailto:${section.highlight.email}`}
                className="text-blue-600 hover:underline"
              >
                {section.highlight.email}
              </a>
            </p>
          </div>
        )}

        {section.highlight && section.highlight.content && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-800">
              <strong>{section.highlight.title}</strong>
              <br />
              {section.highlight.content}
            </p>
          </div>
        )}

        {section.additionalInfo && (
          <p className="text-gray-700 mt-4">{section.additionalInfo}</p>
        )}

        {section.contact && (
          <p className="text-gray-700 mt-4">
            <strong>Contact:</strong> 📧{" "}
            <a
              href="mailto:immigrantjobsworld@gmail.com"
              className="text-blue-600 hover:underline"
            >
              immigrantjobsworld@gmail.com
            </a>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Legal Information
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our terms, privacy practices,
              and policies at CADD CORE Training Institute.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-red-600 to-red-600">
                  <h3 className="text-lg font-semibold text-white">
                    Quick Navigation
                  </h3>
                </div>
                <nav className="p-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                          activeSection === section.id
                            ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                        }`}
                      >
                        <IconComponent className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">{section.label}</span>
                        <ChevronRight
                          className={`h-4 w-4 ml-auto transition-transform ${
                            activeSection === section.id
                              ? "rotate-90 text-blue-600"
                              : "text-gray-400 group-hover:text-blue-600"
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Contact Card */}
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
                <div className="space-y-3 text-sm">
                  {contactInfo.map((contact, index) => {
                    const IconComponent = contact.icon;
                    return (
                      <div key={index}>
                        <div className="flex items-center mb-1">
                          <IconComponent className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="font-medium text-gray-700">
                            {contact.label}:
                          </span>
                        </div>
                        <p
                          className={`ml-6 ${contact.type === "email" ? "text-blue-600" : "text-gray-600"}`}
                        >
                          {contact.type === "email" ? (
                            <a
                              href={`mailto:${contact.value}`}
                              className="hover:underline"
                            >
                              {contact.value}
                            </a>
                          ) : contact.type === "phone" ? (
                            <a
                              href={`tel:${contact.value}`}
                              className="hover:underline"
                            >
                              {contact.value}
                            </a>
                          ) : (
                            contact.value
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-8">
              {sections.map((section) => {
                const IconComponent = section.icon;
                const content = contentData[section.id as keyof ContentData];

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div
                      className={`bg-gradient-to-r ${section.color} px-8 py-6`}
                    >
                      <div className="flex items-center">
                        <IconComponent className="h-8 w-8 text-white mr-4" />
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {content.title}
                          </h2>
                          <p className="text-white text-opacity-80 mt-1">
                            Applicable Policies: {content.applicablePolicies}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-8 py-8">
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-600 mb-6">
                          {content.introduction}
                        </p>

                        <div className="space-y-8">
                          {content.sections.map(
                            (contentSection: ContentSection, index: number) => (
                              <div key={index}>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                  {contentSection.title}
                                </h3>
                                {renderContentSection(
                                  contentSection,
                                  section.accentColor,
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
