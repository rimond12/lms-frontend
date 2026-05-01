'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  useGetExpertsForAboutPageQuery,
  useGetAboutUsCategoriesQuery,
  useGetActiveAboutUsContentQuery,
  IExpert,
  ICategory,
  IAboutUsContent,
  IExpertsByCategory
} from '@/app/redux/api/expartPanelApi/expartPanelApi';
import { Linkedin, Twitter, Globe, Pin } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

export default function AboutUsPage() {
  // Fetch data using Redux hooks
  const { data: contentData, isLoading: contentLoading } = useGetActiveAboutUsContentQuery();
  const { data: expertsData, isLoading: expertsLoading } = useGetExpertsForAboutPageQuery();
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAboutUsCategoriesQuery(true);

  const content = contentData?.data;
  const expertsByCategory = expertsData?.data || {};
  const categories = useMemo(() => {
    return [...(categoriesData?.data || [])].sort((a, b) => a.order - b.order);
  }, [categoriesData]);

  const loading = contentLoading || expertsLoading || categoriesLoading;

  // Sort experts within a category: pinned first (by pinOrder), then by name
  const getSortedExperts = (experts: IExpert[]): IExpert[] => {
    return [...experts].sort((a, b) => {
      // Pinned experts come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Both pinned: sort by pinOrder
      if (a.isPinned && b.isPinned) {
        return (a.pinOrder || 0) - (b.pinOrder || 0);
      }
      
      // Both not pinned: sort by name
      return a.name.localeCompare(b.name);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* About Organization Section */}
      {content && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
                {content.title}
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {content.description}
              </p>

              {/* Mission & Vision */}
              <div className="grid md:grid-cols-2 gap-8 mt-12">
                {content.mission && (
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">
                      Our Mission
                    </h3>
                    <p className="text-gray-700">{content.mission}</p>
                  </div>
                )}

                {content.vision && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-900 mb-4">
                      Our Vision
                    </h3>
                    <p className="text-gray-700">{content.vision}</p>
                  </div>
                )}
              </div>

              {/* Core Values */}
              {content.coreValues && content.coreValues.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Our Core Values
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.coreValues.map((value, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 p-4 rounded-lg text-center"
                      >
                        <p className="text-purple-900 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Sections */}
              {content.additionalSections &&
                content.additionalSections.length > 0 && (
                  <div className="mt-12 space-y-8">
                    {content.additionalSections.map((section, index) => (
                      <div key={index} className="border-l-4 border-primary pl-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-700">{section.content}</p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Team Members by Category - Sorted by category order */}
      {categories.map((category, categoryIndex) => {
        const categoryExperts = expertsByCategory[category.name];
        
        if (!categoryExperts || categoryExperts.length === 0) {
          return null;
        }

        // Sort experts: pinned first, then by name
        const sortedExperts = getSortedExperts(categoryExperts);

        return (
          <section 
            key={category._id} 
            className={`py-16 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {category.description}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {sortedExperts.map((expert) => (
                  <ExpertCard key={expert._id} expert={expert} />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* No team members message */}
      {categories.length === 0 && Object.keys(expertsByCategory).length === 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 text-lg">
              Team members will be displayed here soon.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

// Expert Card Component
function ExpertCard({ expert }: { expert: IExpert }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
      {expert.isPinned && (
        <div className="absolute top-4 right-4 z-10">
          <Pin className="w-6 h-6 text-primary fill-primary" />
        </div>
      )}
      
      <div className="relative h-64 bg-gray-200">
        {expert.photoUrl ? (
          <AppImage
            photoUrl={expert.photoUrl}
            alt={expert.name}
            width={800}
            height={800}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <span className="text-6xl font-bold text-gray-400">
              {expert.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{expert.name}</h3>
        <p className="text-primary font-semibold mb-2">{expert.designation}</p>
        <p className="text-sm text-gray-600 mb-1">{expert.institution}</p>
        
        {expert.shortBio && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-3">
            {expert.shortBio}
          </p>
        )}

        {/* Social Links */}
        {expert.socialLinks && (
          <div className="flex gap-3 mt-4">
            {expert.socialLinks.linkedin && (
              <a
                href={expert.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {expert.socialLinks.twitter && (
              <a
                href={expert.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-500 hover:text-sky-600"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {expert.socialLinks.website && (
              <a
                href={expert.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-700"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        <Link
          href={`/about-us/${expert.slugUrl}`}
          className="mt-4 inline-block w-full text-center bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
