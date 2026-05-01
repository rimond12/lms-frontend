"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users, Award, BarChart3, BookOpen, Clock, CheckCircle,
  Play, ArrowRight, Copy, Check, Monitor, Briefcase,
} from "lucide-react";
import { useGetCourseBySlugQuery } from "@/app/redux/api/CourseApi/CourseApi";
import ExpertSection from "@/components/programs/ExpertSection";
import CurriculumSection from "@/components/programs/CurriculumSection";
import ProjectsSection from "@/components/programs/ProjectsSection";
import CertificatePreviewSection from "@/components/programs/CertificatePreviewSection";
import OnJobTrainingSection from "@/components/programs/OnJobTrainingSection";
import CourseDetailsHeader from "@/components/programs/CourseDetailsHeader";
import AppImage from "@/components/ui/AppImage";
import { toast } from "sonner";
import { useCheckAccessQuery } from "@/app/redux/api/enrollmentApi/enrollmentApi";
import { useGetEnrollableBatchesQuery } from "@/app/redux/api/batchApi/batchApi";
import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import Link from "next/link";
import SuccessStoriesSection from "@/components/shared/SuccessStoriesSection";

const getYouTubeVideoId = (url: string): string => {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
};

const CourseDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="h-6 bg-white/10 rounded w-24 animate-pulse" />
            <div className="h-10 bg-white/20 rounded w-3/4 animate-pulse" />
            <div className="h-20 bg-white/10 rounded animate-pulse" />
            <div className="h-12 bg-white/20 rounded w-40 animate-pulse" />
          </div>
          <div className="aspect-video bg-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 animate-pulse border border-gray-100 h-fit">
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showInstallments, setShowInstallments] = useState(false);
  const [batchStatus, setBatchStatus] = useState<"upcoming" | "running" | "none">("none");

  const { user } = useUser();
  const { data: courseData, isLoading, error } = useGetCourseBySlugQuery(slug);
  const course = courseData;

  const { data: accessData } = useCheckAccessQuery(
    { courseId: course?._id || "", resourceType: "material" },
    { skip: !course?._id },
  );

  const { data: batchesData } = useGetEnrollableBatchesQuery(course?._id || "", { skip: !course?._id });
  const availableBatches = batchesData?.data || [];

  const now = new Date();
  const enrollableBatches = (availableBatches || [])
    .filter((batch: any) => {
      if (batch.enrollmentDeadline) return new Date(batch.enrollmentDeadline) > now;
      return batch.status === "upcoming" || batch.status === "running";
    })
    .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const canEnroll = enrollableBatches.length > 0;

  const upcomingBatches = enrollableBatches
    .filter((b: any) => b.status === "upcoming")
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const runningBatches = enrollableBatches.filter((b: any) => b.status === "running");
  const nextBatch = upcomingBatches[0] || runningBatches[0] || enrollableBatches[0];

  useEffect(() => {
    if (!nextBatch) { setBatchStatus("none"); return; }
    const targetDate = new Date(nextBatch.startDate).getTime();
    const calculateCountdown = () => {
      const difference = targetDate - new Date().getTime();
      if (difference > 0) {
        setBatchStatus("upcoming");
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setBatchStatus("running");
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextBatch]);

  if (isLoading) return <CourseDetailsSkeleton />;

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 max-w-sm">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => router.push("/all-courses")}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this course: ${course.title}`;

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "facebook": url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`; break;
      case "twitter": url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`; break;
      case "linkedin": url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`; break;
      case "whatsapp": url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`; break;
    }
    if (url) window.open(url, "_blank", "width=600,height=400");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;
  const minPrice = nextBatch?.totalPrice || course.price || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CourseDetailsHeader course={course} slug={slug} batchStatus={batchStatus} canEnroll={canEnroll} nextBatch={nextBatch} formatDate={formatDate} />

      <section className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Highlights */}
            {course.highlights && course.highlights.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gray-950 rounded-2xl p-5 overflow-hidden">
                <div className="flex flex-wrap justify-center gap-3">
                  {course.highlights.map((highlight: any, idx: number) => {
                    const colors = [
                      "bg-blue-100 text-black", "bg-blue-100 text-black",
                      "bg-emerald-100 text-black", "bg-purple-100 text-black",
                      "bg-orange-100 text-black", "bg-teal-100 text-black",
                      "bg-pink-100 text-black", "bg-indigo-100 text-black",
                    ];
                    return (
                      <div key={idx} className={`flex items-center gap-1 px-2 py-2.5 rounded-full ${colors[idx % colors.length]} shadow-md hover:scale-105 transition-transform`}>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">{highlight.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* About */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-3xl p-8 shadow-sm border border-gray-100/50 overflow-hidden group">
              {/* ✅ Blue decorative blobs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-blue-100/50" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -ml-32 -mb-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  {/* ✅ Blue icon */}
                  <div className="p-3 bg-blue-50 text-[#1a4da1] rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">About This Course</h2>
                </div>
                <p className="text-gray-600 text-[15px] leading-relaxed text-justify whitespace-pre-line">{course.description}</p>
                {course.tags && course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100/80">
                    {course.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Curriculum */}
            {course.curriculum && course.curriculum.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-6 border border-sky-100/50 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Course Curriculum</h2>
                </div>
                <CurriculumSection curriculum={course.curriculum} />
              </motion.div>
            )}

            {/* Experts */}
            {course.experts && course.experts.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 border border-emerald-100/50 shadow-sm overflow-hidden">
                <ExpertSection experts={course.experts} />
              </motion.div>
            )}

            {/* Projects */}
            {course.projects && course.projects.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-6 border border-amber-100/50 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl"><BookOpen className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Real-world Projects</h2>
                </div>
                <ProjectsSection projects={course.projects} />
              </motion.div>
            )}

            {/* Software */}
            {course.learningSoftware && course.learningSoftware.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="bg-gradient-to-br from-violet-50 to-white rounded-2xl p-6 border border-violet-100/50 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-violet-100 text-violet-600 rounded-xl"><Monitor className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Software You&apos;ll Learn</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {course.learningSoftware.map((software: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      {software.photoUrl ? (
                        <AppImage photoUrl={software.photoUrl} width={120} height={120} alt={software.title} className="w-14 h-14 object-contain" />
                      ) : (
                        <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400"><Monitor className="w-6 h-6" /></div>
                      )}
                      <span className="text-xs text-gray-600 font-medium text-center line-clamp-1">{software.title}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* On Job Training */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-6 border border-teal-100/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-teal-100 text-teal-600 rounded-xl"><Briefcase className="w-5 h-5" /></div>
                <h2 className="text-lg font-bold text-gray-900">অন-জব ট্রেইনিং</h2>
              </div>
              <OnJobTrainingSection />
            </motion.div>

            {/* Certificate */}
            {course.certificatePreview && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 border border-orange-100/50 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl"><Award className="w-5 h-5" /></div>
                  <h2 className="text-lg font-bold text-gray-900">Earn Your Certificate</h2>
                </div>
                <CertificatePreviewSection certificatePreview={course.certificatePreview} />
              </motion.div>
            )}

            <section className="py-16">
              <SuccessStoriesSection autoSlide={true} slideInterval={4000} />
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Pricing Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="relative bg-white rounded-3xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100/50 group">
                {/* ✅ Blue decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-100/50 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -ml-32 -mb-32" />
                {/* ✅ Blue top bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1a4da1] via-[#1a4da1] to-[#133a7a] z-20" />

                <div className="relative z-10 p-6 text-center border-b border-gray-100/80">
                  {minPrice > 0 ? (
                    <>
                      <div className="text-4xl font-bold text-gray-900 tracking-tight">{formatCurrency(minPrice)}</div>
                      {nextBatch?.installmentOptions && nextBatch.installmentOptions.length > 0 && (
                        <div className="mt-3">
                          <button onClick={() => setShowInstallments(!showInstallments)}
                            className="group flex items-center justify-center gap-2 mx-auto text-sm font-medium text-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-100 transition-all duration-300 w-fit">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Installments available
                            {showInstallments ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            )}
                          </button>

                          <motion.div initial={false}
                            animate={{ height: showInstallments ? "auto" : 0, opacity: showInstallments ? 1 : 0, marginTop: showInstallments ? 12 : 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                            <div className="space-y-2 bg-white/50 rounded-xl p-3 border border-gray-100">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Available Plans</p>
                              {nextBatch.installmentOptions.map((plan: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-blue-100 transition-colors">
                                  <div>
                                    <div className="text-xs font-bold text-gray-800">{plan.label}</div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">{plan.numberOfPayments} x {formatCurrency(plan.amountPerInstallment)}</div>
                                  </div>
                                  {/* ✅ Blue price */}
                                  <div className="text-sm font-bold text-[#1a4da1]">{formatCurrency(plan.totalAmount)}</div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-emerald-600">Enrollment Start Soon</div>
                  )}
                </div>

                {nextBatch && (
                  <div className="relative z-10 p-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-100">
                      <span className="text-gray-500 font-medium">Batch</span>
                      <span className="font-bold text-gray-900">{nextBatch.batchName}</span>
                    </div>
                    {/* ✅ Blue starts row */}
                    <div className="flex items-center justify-between py-3 px-4 bg-[#1a4da1] text-white rounded-xl shadow-md shadow-blue-200">
                      <span className="text-blue-100 font-medium">Starts</span>
                      <span className="font-bold">{formatDate(nextBatch.startDate)}</span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 px-5 pb-5">
                  {canEnroll ? (
                    <Link href={`/all-courses/${slug}/enroll`}
                      className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 transform hover:-translate-y-0.5">
                      Enroll Now <ArrowRight size={18} />
                    </Link>
                  ) : (
                    <button disabled className="w-full py-3.5 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed">
                      Enrollment Closed
                    </button>
                  )}
                </div>

                <div className="relative z-10 px-5 pb-5 pt-4 border-t border-gray-100/80">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { icon: Award, label: "Certificate" },
                      { icon: Monitor, label: "Mobile & Desktop" },
                      { icon: Users, label: "Expert Support" },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/80 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 border border-gray-100">
                        {/* ✅ Blue feature icons */}
                        <feature.icon className="w-3.5 h-3.5 text-[#1a4da1]" />
                        {feature.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Share Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Share this course</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleShare("facebook")} className="w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors">
                    <FaFacebook className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleShare("twitter")} className="w-9 h-9 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center transition-colors">
                    <FaTwitter className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleShare("linkedin")} className="w-9 h-9 bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center justify-center transition-colors">
                    <FaLinkedin className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleShare("whatsapp")} className="w-9 h-9 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                    <FaWhatsapp className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={handleCopyLink} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}