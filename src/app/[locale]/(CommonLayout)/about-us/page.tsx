'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  useGetExpertsForAboutPageQuery,
  useGetAboutUsCategoriesQuery,
  useGetActiveAboutUsContentQuery,
  IExpert,
} from '@/app/redux/api/expartPanelApi/expartPanelApi';
import {
  Linkedin,
  Twitter,
  Globe,
  Star,
  ChevronRight,
  Users,
  Target,
  Eye as EyeIcon,
  Crown,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

/* ─── Category visual config ──────────────────────────────── */
const CATEGORY_CONFIG: Record<
  string,
  { bgDark: string; accentHex: string; badgeCls: string; icon: React.ReactNode; label: string }
> = {
  CEO: {
    bgDark: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    accentHex: '#3b82f6',
    badgeCls: 'bg-blue-600',
    icon: <Crown className="w-6 h-6" />,
    label: 'Chief Executive',
  },
  Director: {
    bgDark: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
    accentHex: '#6366f1',
    badgeCls: 'bg-indigo-600',
    icon: <Briefcase className="w-6 h-6" />,
    label: 'Leadership',
  },
  'Team Member': {
    bgDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    accentHex: '#0ea5e9',
    badgeCls: 'bg-sky-600',
    icon: <Users className="w-6 h-6" />,
    label: 'Our Team',
  },
};

const DEFAULT_CONFIG = {
  bgDark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  accentHex: '#3b82f6',
  badgeCls: 'bg-blue-600',
  icon: <UserCheck className="w-6 h-6" />,
  label: 'Members',
};

export default function AboutUsPage() {
  const { data: contentData, isLoading: contentLoading } =
    useGetActiveAboutUsContentQuery();
  const { data: expertsData, isLoading: expertsLoading } =
    useGetExpertsForAboutPageQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAboutUsCategoriesQuery(true);

  const content = contentData?.data;
  const expertsByCategory = expertsData?.data || {};

  const dbCategories = useMemo(
    () => [...(categoriesData?.data || [])].sort((a, b) => a.order - b.order),
    [categoriesData]
  );

  const displayCategories = useMemo(() => {
    const dbNames = new Set(dbCategories.map((c) => c.name));
    const extras = Object.keys(expertsByCategory)
      .filter((k) => !dbNames.has(k) && expertsByCategory[k]?.length > 0)
      .map((k) => ({ _id: k, name: k, description: '', order: 9999 }));
    return [
      ...dbCategories.filter((c) => expertsByCategory[c.name]?.length > 0),
      ...extras,
    ];
  }, [dbCategories, expertsByCategory]);

  const loading = contentLoading || expertsLoading || categoriesLoading;

  const getSortedExperts = (experts: IExpert[]) =>
    [...experts].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isPinned && b.isPinned)
        return (a.pinOrder || 0) - (b.pinOrder || 0);
      return a.name.localeCompare(b.name);
    });

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-slate-500 font-medium text-sm tracking-wide">
          Loading team info…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ══════════ HERO / ORG INFO ══════════════════════════════ */}
      {content && (
        <>
          {/* Dark hero strip */}
          <section
            className="relative overflow-hidden py-24 md:py-32"
            style={{
              background:
                'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f172a 100%)',
            }}
          >
            {/* Dot grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {/* Glow orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-10"
              style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex flex-col items-center text-center w-full">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Who We Are
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight text-center">
                {content.title}
              </h1>

              {/* Blue bar divider */}
              <div className="flex justify-center items-center gap-1.5 mb-10">
                <div className="w-16 h-0.5 rounded-full bg-blue-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <div className="w-16 h-0.5 rounded-full bg-blue-500" />
              </div>

              {/* Intro paragraph in a styled card container */}
              <div className="max-w-[700px] mx-auto rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 shadow-lg flex flex-col items-center justify-center text-center w-full">
                <p lang="en" className="text-slate-300 text-base sm:text-lg leading-relaxed text-justify hyphens-auto w-full font-normal">
                  {content.description}
                </p>
              </div>
            </div>
          </section>

          {/* Mission + Vision cards on white */}
          {(content.mission || content.vision) && (
            <section className="bg-slate-50 py-16">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                <div className="grid sm:grid-cols-2 gap-6">
                  {content.mission && (
                    <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-slate-100">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">Our Mission</h3>
                        </div>
                        <p lang="en" className="text-slate-600 text-sm sm:text-base leading-[1.9] text-justify hyphens-auto">
                          {content.mission}
                        </p>
                      </div>
                    </div>
                  )}
                  {content.vision && (
                    <div className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-slate-100">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500" />
                      <div className="p-8">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <EyeIcon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-800">Our Vision</h3>
                        </div>
                        <p lang="en" className="text-slate-600 text-sm sm:text-base leading-[1.9] text-justify hyphens-auto">
                          {content.vision}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Core Values */}
                {content.coreValues && content.coreValues.length > 0 && (
                  <div className="mt-14 flex flex-col items-center text-center w-full">
                    <div className="text-center mb-8 max-w-2xl mx-auto">
                      <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                        Our Core Values
                      </h3>
                      <p className="text-slate-500 text-sm text-center">
                        Principles that guide everything we do
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-4 max-w-3xl mx-auto">
                      {content.coreValues.map((value, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:border-blue-300 hover:shadow transition-all duration-200 text-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-slate-700 font-medium text-sm sm:text-base text-center">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Sections */}
                {content.additionalSections &&
                  content.additionalSections.length > 0 && (
                    <div className="mt-14 space-y-8">
                      {content.additionalSections.map((section, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center text-center w-full border-t border-slate-200/60 pt-6"
                        >
                          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 text-center">
                            {section.title}
                          </h3>
                          <p lang="en" className="text-slate-600 text-sm sm:text-base leading-[1.85] text-justify hyphens-auto max-w-2xl mx-auto font-normal">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </section>
          )}
        </>
      )}

      {/* ══════════ TEAM SECTIONS ════════════════════════════════ */}
      {displayCategories.map((category, categoryIndex) => {
        const categoryExperts = expertsByCategory[category.name];
        if (!categoryExperts || categoryExperts.length === 0) return null;

        const sortedExperts = getSortedExperts(categoryExperts);
        const cfg = CATEGORY_CONFIG[category.name] || DEFAULT_CONFIG;
        const isLeadership =
          category.name === 'CEO' || category.name === 'Director';
        const sectionBg = categoryIndex % 2 === 0 ? '#f8fafc' : '#ffffff';

        return (
          <section key={category._id} style={{ background: sectionBg }}>

            {/* ── Dark banner header ─────────────────────────── */}
            <div
              className="relative overflow-hidden py-16"
              style={{ background: cfg.bgDark }}
            >
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* Glow */}
              <div
                className="absolute -top-16 right-0 w-80 h-80 rounded-full blur-3xl opacity-20"
                style={{
                  background: `radial-gradient(circle, ${cfg.accentHex}, transparent)`,
                }}
              />

              <div className="relative container mx-auto px-4 text-center">
                {/* Icon pill */}
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-5"
                  style={{
                    background: `${cfg.accentHex}25`,
                    border: `1px solid ${cfg.accentHex}40`,
                  }}
                >
                  <span style={{ color: cfg.accentHex }}>{cfg.icon}</span>
                  {cfg.label}
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                  {category.name}
                </h2>

                {/* Accent line */}
                <div
                  className="w-16 h-1 rounded-full mx-auto mt-3 mb-4"
                  style={{ background: cfg.accentHex }}
                />

                {category.description && (
                  <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                    {category.description}
                  </p>
                )}

                <p className="text-slate-500 text-xs mt-4 font-medium">
                  {sortedExperts.length}{' '}
                  {sortedExperts.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            {/* ── Cards area ─────────────────────────────────── */}
            <div className="container mx-auto px-4 py-16">
              {isLeadership ? (
                /* Large portrait layout for CEO / Director */
                <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
                  {sortedExperts.map((expert) => (
                    <LeadershipCard
                      key={expert._id}
                      expert={expert}
                      accentHex={cfg.accentHex}
                    />
                  ))}
                </div>
              ) : (
                /* Grid for team members */
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {sortedExperts.map((expert) => (
                    <TeamCard
                      key={expert._id}
                      expert={expert}
                      accentHex={cfg.accentHex}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* No members */}
      {displayCategories.length === 0 &&
        Object.keys(expertsByCategory).length === 0 && (
          <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-medium">
                Team members will be displayed here soon.
              </p>
            </div>
          </section>
        )}
    </div>
  );
}

/* ══ Leadership Card (CEO / Director) ════════════════════════ */
function LeadershipCard({
  expert,
  accentHex,
}: {
  expert: IExpert;
  accentHex: string;
}) {
  return (
    <div className="group relative w-72 sm:w-80 flex-shrink-0">
      {/* Hover glow ring */}
      <div
        className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{ background: `linear-gradient(135deg, ${accentHex}50, transparent 70%)` }}
      />

      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 border border-slate-100">

        {/* ── Photo ── */}
        <div className="relative overflow-hidden" style={{ height: '360px' }}>
          {expert.photoUrl ? (
            <AppImage
              photoUrl={expert.photoUrl}
              alt={expert.name}
              width={640}
              height={720}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accentHex}15, ${accentHex}05)` }}
            >
              <span
                className="text-9xl font-black"
                style={{ color: accentHex, opacity: 0.25 }}
              >
                {expert.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Bottom gradient overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-36"
            style={{
              background:
                'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)',
            }}
          />

          {/* Pinned badge */}
          {expert.isPinned && (
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow-lg">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            </div>
          )}

          {/* Name + designation overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-white text-xl font-bold leading-tight drop-shadow-lg">
              {expert.name}
            </h3>
            <p
              className="text-sm font-semibold mt-1 drop-shadow"
              style={{ color: `${accentHex}dd` }}
            >
              {expert.designation}
            </p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-4">
          {expert.institution && (
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {expert.institution}
            </p>
          )}

          {expert.shortBio && (
            <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
              {expert.shortBio}
            </p>
          )}

          {/* Social links */}
          {expert.socialLinks && (
            <div className="flex items-center gap-2.5">
              {expert.socialLinks.linkedin && (
                <a
                  href={expert.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {expert.socialLinks.twitter && (
                <a
                  href={expert.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-500 flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {expert.socialLinks.website && (
                <a
                  href={expert.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-white transition-all duration-200"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* CTA */}
          <Link
            href={`/about-us/${expert.slugUrl}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:gap-3 hover:opacity-90 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}bb 100%)`,
              boxShadow: `0 4px 14px ${accentHex}40`,
            }}
          >
            View Full Profile <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ══ Team Member Card (compact grid) ═════════════════════════ */
function TeamCard({
  expert,
  accentHex,
}: {
  expert: IExpert;
  accentHex: string;
}) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:-translate-y-1.5 flex flex-col">

      {/* Photo */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: '230px' }}>
        {expert.photoUrl ? (
          <AppImage
            photoUrl={expert.photoUrl}
            alt={expert.name}
            width={400}
            height={460}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accentHex}15, #f1f5f9)` }}
          >
            <span
              className="text-6xl font-black"
              style={{ color: accentHex, opacity: 0.3 }}
            >
              {expert.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Gradient on photo */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{
            background:
              'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 100%)',
          }}
        />

        {expert.isPinned && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold">
              <Star className="w-2.5 h-2.5 fill-current" /> Top
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-snug">
          {expert.name}
        </h3>
        <p className="text-xs font-semibold mt-0.5 mb-1" style={{ color: accentHex }}>
          {expert.designation}
        </p>
        {expert.institution && (
          <p className="text-xs text-slate-400 mb-3">{expert.institution}</p>
        )}

        {expert.shortBio && (
          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
            {expert.shortBio}
          </p>
        )}

        {/* Social + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
          <div className="flex gap-2">
            {expert.socialLinks?.linkedin && (
              <a
                href={expert.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {expert.socialLinks?.twitter && (
              <a
                href={expert.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {expert.socialLinks?.website && (
              <a
                href={expert.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>

          <Link
            href={`/about-us/${expert.slugUrl}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{
              background: accentHex,
              boxShadow: `0 2px 8px ${accentHex}40`,
            }}
          >
            Details <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
