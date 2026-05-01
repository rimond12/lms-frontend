'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetExpertBySlugQuery, IExpert } from '@/app/redux/api/expartPanelApi/expartPanelApi';
import { 
  Linkedin, 
  Twitter, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  Award,
  BookOpen,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

export default function ExpertProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const { data, isLoading, error } = useGetExpertBySlugQuery(slug, { skip: !slug });
  const expert = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Expert not found
          </h1>
          <button
            onClick={() => router.push('/about-us')}
            className="text-primary hover:underline"
          >
            Back to About Us
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/about-us')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to About Us
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
            {/* Photo */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
              {expert.photoUrl ? (
                <AppImage
                           photoUrl={expert.photoUrl}
                           alt={expert.name}
                           width={800}
                           height={800}
                           className="object-cover w-full h-full"
                         />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white text-gray-400">
                  <span className="text-8xl font-bold">
                    {expert.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {expert.name}
              </h1>
              <p className="text-xl md:text-2xl font-semibold mb-2 text-blue-100">
                {expert.designation}
              </p>
              <p className="text-lg text-blue-50 mb-4">{expert.institution}</p>
              <p className="text-md text-blue-100">
                Specialization: {expert.specialization}
              </p>

              {/* Social Links */}
              {expert.socialLinks && (
                <div className="flex gap-4 mt-6 justify-center md:justify-start">
                  {expert.socialLinks.linkedin && (
                    <a
                      href={expert.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {expert.socialLinks.twitter && (
                    <a
                      href={expert.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {expert.socialLinks.website && (
                    <a
                      href={expert.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
                    >
                      <Globe className="w-6 h-6" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Bio */}
          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {expert.bio}
            </p>
          </section>

          {/* Job Experiences */}
          {expert.jobExperiences && expert.jobExperiences.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Professional Experience
                </h2>
              </div>
              <div className="space-y-6">
                {expert.jobExperiences.map((exp, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {exp.position}
                    </h3>
                    <p className="text-primary font-medium mb-2">
                      {exp.organization}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(exp.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Academic Qualifications */}
          {expert.academicQualifications &&
            expert.academicQualifications.length > 0 && (
              <section className="bg-white rounded-lg shadow-md p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Education
                  </h2>
                </div>
                <div className="space-y-6">
                  {expert.academicQualifications.map((qual, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {qual.degree} in {qual.field}
                      </h3>
                      <p className="text-green-600 font-medium mb-1">
                        {qual.institution}
                      </p>
                      <p className="text-sm text-gray-600">
                        Year: {qual.passingYear}
                        {qual.grade && ` | Grade: ${qual.grade}`}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Achievements */}
          {expert.achievements && expert.achievements.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Achievements & Awards
                </h2>
              </div>
              <ul className="space-y-3">
                {expert.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{achievement}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Publications */}
          {expert.publications && expert.publications.length > 0 && (
            <section className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Publications
                </h2>
              </div>
              <ul className="space-y-3">
                {expert.publications.map((publication, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700">{publication}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
