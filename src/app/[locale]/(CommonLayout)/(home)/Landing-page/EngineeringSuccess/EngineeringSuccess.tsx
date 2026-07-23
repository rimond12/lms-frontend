"use client";

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  useGetApprovedSuccessStoriesQuery,
  useSubmitSuccessStoryMutation,
  TSuccessStory,
} from "@/app/redux/api/successStoryApi/successStoryApi";
import { useGetLandingPageCmsQuery } from "@/app/redux/api/landingPageCmsApi/landingPageCmsApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Star, Upload, User, Globe, Briefcase, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const ImmigrantSuccess: React.FC = () => {
  const t = useTranslations("immigrantSuccess");
  const tStories = useTranslations("successStories");
  const { data: cmsResponse } = useGetLandingPageCmsQuery();
  const cms = cmsResponse?.data?.successStories;

  const locale = useLocale();
  const isBn = locale === "bn";

  const heading = (isBn ? null : cms?.heading) || tStories("heading");
  const headingHighlight = (isBn ? null : cms?.headingHighlight) || tStories("headingHighlight");
  const subheading = (isBn ? null : cms?.subheading) || tStories("subheading");

  const shareHeading = cms?.shareHeading || t("share.heading");
  const shareSubheading = cms?.shareSubheading || t("share.subheading");
  const shareSubmitBtn = cms?.shareSubmitBtn || t("share.submitBtn");
  const shareNominateBtn = cms?.shareNominateBtn || t("share.nominateBtn");
  const shareProcessBtn = cms?.shareProcessBtn || t("share.processBtn");

  const { data: response, isLoading: isStoriesLoading } = useGetApprovedSuccessStoriesQuery();
  const [submitStory, { isLoading: isSubmitting }] = useSubmitSuccessStoryMutation();

  const stories = response?.data || [];

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    image: "",
    country: "",
    profession: "",
    story: "",
    rating: 5,
    date: new Date().toISOString().split("T")[0],
  });

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "https://api.immigrantjobsworld.com";
    return `${apiBaseUrl}${imagePath}`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be less than 2MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("image", file);

    setIsUploading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api";
      const responseUpload = await fetch(`${apiBaseUrl}/success-stories/upload-image`, {
        method: "POST",
        body: formDataObj,
      });

      if (!responseUpload.ok) throw new Error("Upload failed");

      const responseData = await responseUpload.json();
      const imageUrl = responseData?.data?.imageUrl;

      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Profile photo uploaded successfully");
    } catch (err) {
      toast.error("Photo upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.country.trim() || !formData.profession.trim() || !formData.story.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await submitStory(formData).unwrap();
      toast.success("Your success story has been submitted! It will appear on the landing page once approved by the administrator.");
      setIsOpen(false);
      setFormData({
        fullName: "",
        image: "",
        country: "",
        profession: "",
        story: "",
        rating: 5,
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      toast.error("Failed to submit success story. Please try again.");
      console.error(err);
    }
  };

  const renderCard = (story: TSuccessStory) => (
    <div className="max-w-7xl mx-auto bg-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden group min-h-[320px] flex items-center">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 opacity-10 rounded-full -ml-10 -mb-10" />

      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10 w-full">
        {/* Profile Image */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 p-1">
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden relative">
              {story.image ? (
                <img
                  src={getImageUrl(story.image) || ""}
                  alt={story.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-14 h-14 sm:w-20 sm:h-20 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Award Badge */}
          <div className="absolute -top-2 -right-2 bg-blue-400 p-1.5 sm:p-2 rounded-full border-2 border-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.06 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946 2.06 3.42 3.42 0 013.134 3.134 3.42 3.42 0 002.06 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-2.06 1.946 3.42 3.42 0 01-3.134 3.134 3.42 3.42 0 00-1.946 2.06 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-2.06 3.42 3.42 0 01-3.134-3.134 3.42 3.42 0 00-2.06-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 002.06-1.946 3.42 3.42 0 013.134-3.134z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          {/* Stars */}
          <div className="flex justify-center md:justify-start gap-1 mb-3 sm:mb-4">
            {Array.from({ length: story.rating || 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
              />
            ))}
          </div>

          <p className="text-white text-base sm:text-lg md:text-xl italic leading-relaxed mb-4 sm:mb-6 font-light">
            &ldquo;{story.story}&rdquo;
          </p>

          <div className="text-white">
            <h4 className="font-bold text-base sm:text-lg flex items-center justify-center md:justify-start gap-2">
              {story.fullName}
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal border border-white/10 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {story.country}
              </span>
            </h4>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">
              {story.profession} {story.date ? `| ${story.date}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-7">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white tracking-tight">
          {heading}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-400 dark:to-blue-600">
            {headingHighlight}
          </span>
        </h2>
        <div className="w-20 h-1.5 bg-blue-700 dark:bg-blue-500 mx-auto mt-4 rounded-full" />
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mt-4 leading-relaxed font-medium">
          {subheading}
        </p>
      </div>

      {/* Testimonial Cards Carousel / Display */}
      <div className="mb-14 sm:mb-20 max-w-7xl mx-auto relative group/carousel">
        {isStoriesLoading ? (
          <div className="max-w-7xl mx-auto bg-blue-700/50 animate-pulse rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl h-80 flex items-center justify-center">
            <div className="text-white font-medium">Loading success journeys...</div>
          </div>
        ) : stories.length === 0 ? (
          <div className="max-w-7xl mx-auto bg-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl h-80 flex flex-col items-center justify-center text-center">
            <Star className="w-12 h-12 text-yellow-400 fill-current mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">No success stories published yet</h3>
            <p className="text-blue-100 max-w-md">Be the first one to share your successful journey abroad!</p>
          </div>
        ) : stories.length === 1 ? (
          renderCard(stories[0])
        ) : (
          <div className="relative">
            {/* Custom Navigation Controls */}
            <button className="eng-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 hidden md:flex">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="eng-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 hidden md:flex">
              <ChevronRight className="w-5 h-5" />
            </button>

            <Swiper
              modules={[Navigation, Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              navigation={{
                nextEl: ".eng-next",
                prevEl: ".eng-prev",
              }}
              pagination={{
                clickable: true,
                bulletClass: "swiper-pagination-bullet bg-white/50 hover:bg-white",
                bulletActiveClass: "swiper-pagination-bullet-active bg-white",
              }}
              className="rounded-2xl sm:rounded-3xl overflow-hidden"
            >
              {stories.map((story) => (
                <SwiperSlide key={story._id}>
                  {renderCard(story)}
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* Share Success Section */}
      <div className="text-center max-w-3xl mx-auto mt-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-3 px-2">
          {shareHeading}
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
          {shareSubheading}
        </p>

        {/* Main CTA */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-blue-700 text-white px-7 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg mb-5 sm:mb-6 flex items-center gap-2 mx-auto hover:bg-blue-900 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-200 active:scale-95"
        >
          {shareSubmitBtn}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>

        {/* Secondary Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
          <button
            type="button"
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            {shareNominateBtn}
          </button>
          <button
            type="button"
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            {shareProcessBtn}
          </button>
        </div>
      </div>

      {/* Success Story Submission Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-blue-50">
          <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-700" />
              {shareHeading}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1">আপনার গৌরবময় বিদেশ যাত্রার অভিজ্ঞতা আমাদের সাথে শেয়ার করুন</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="submit-fullName" className="text-sm font-semibold text-slate-700">
                  পূর্ণ নাম <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="submit-fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="যেমন: মো. রাকিবুল ইসলাম"
                    required
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="submit-profession" className="text-sm font-semibold text-slate-700">
                  পেশা / পদবী <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="submit-profession"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    placeholder="যেমন: সিনিয়র টেকনিশিয়ান"
                    required
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="submit-country" className="text-sm font-semibold text-slate-700">
                  গন্তব্য দেশ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="submit-country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="যেমন: Saudi Arabia"
                    required
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="submit-date" className="text-sm font-semibold text-slate-700">
                  তারিখ / সফলতার বছর
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="submit-date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="যেমন: ২০২৪ সফল প্রার্থী"
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">আপনার ছবি / প্রোফাইল ফটো</Label>
              <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-55">
                {formData.image ? (
                  <img
                    src={getImageUrl(formData.image) || ""}
                    alt="Candidate Preview"
                    className="w-14 h-14 rounded-full object-cover border border-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = formData.image;
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    id="publicImageFile"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="publicImageFile" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    {isUploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
                  </Label>
                  <p className="text-[10px] text-slate-400 mt-1">সর্বোচ্চ ২ মেগাবাইট (JPEG, PNG, WebP)</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="submit-story" className="text-sm font-semibold text-slate-700">
                আপনার সাফল্যের গল্প <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="submit-story"
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="যেমন: Immigrant Jobs World-এর মাধ্যমে আমি খুব সহজেই চাকরি পেয়েছি..."
                required
                rows={4}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400 leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">রেটিং (Rating)</Label>
              <div className="flex gap-1.5 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-350"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-500 font-semibold ml-2">({formData.rating} Stars Selected)</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-11 rounded-lg text-sm px-5"
              >
                বাতিল করুন
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="h-11 rounded-lg text-sm bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 shadow-md shadow-blue-100"
              >
                {isSubmitting ? "জমা হচ্ছে..." : "গল্প জমা দিন"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImmigrantSuccess;
