"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Award, Star, Upload, User, Globe, Briefcase, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

import {
  useGetApprovedSuccessStoriesQuery,
  useSubmitSuccessStoryMutation,
  TSuccessStory,
} from "@/app/redux/api/successStoryApi/successStoryApi";
import { TestimonialCard } from "@/app/[locale]/(CommonLayout)/(home)/Landing-page/SuccessStories/SuccessStories";

export default function SuccessStoriesFullPage() {
  const t = useTranslations("successStories");
  const tImm = useTranslations("immigrantSuccess");

  const { data: response, isLoading, error } = useGetApprovedSuccessStoriesQuery();
  const [submitStory, { isLoading: isSubmitting }] = useSubmitSuccessStoryMutation();
  const stories = response?.data || [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    image: "",
    country: "",
    profession: "",
    story: "",
    rating: 5,
    date: new Date().getFullYear() + " " + (tImm("testimonial.company")?.includes("সফল প্রার্থী") ? "সফল প্রার্থী" : "Successful Candidate"),
  });

  // Pagination logic
  const indexOfLastStory = currentPage * itemsPerPage;
  const indexOfFirstStory = indexOfLastStory - itemsPerPage;
  const currentStories = stories.slice(indexOfFirstStory, indexOfLastStory);
  const totalPages = Math.ceil(stories.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

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
        date: new Date().getFullYear() + " " + (tImm("testimonial.company")?.includes("সফল প্রার্থী") ? "সফল প্রার্থী" : "Successful Candidate"),
      });
    } catch (err) {
      toast.error("Failed to submit success story. Please try again.");
      console.error(err);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="relative py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t("heading") || "Successful Candidates'"} <span className="text-blue-700">{t("headingHighlight") || "Success Stories"}</span>
          </motion.h2>
          <motion.div
            className="h-1.5 w-24 bg-blue-700 mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            {t("subheading") || "Inspiring journeys of candidates who succeeded through our programs and training"}
          </motion.p>
        </motion.div>

        {/* Testimonials Grid Card Section */}
        <Card className="rounded-2xl shadow-sm overflow-hidden border-0 bg-white">
          {/* Card Header */}
          <div className="bg-blue-700 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-650 opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-blue-600 opacity-20"></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
              <div>
                <motion.h3
                  className="text-2xl md:text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  {tImm("share.heading") || "Candidates success Journeys"}
                </motion.h3>
                <motion.p
                  className="text-white/95 mt-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  {t("subheading") || "Real stories, life-changing achievements"}
                </motion.p>
              </div>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-white hover:bg-slate-50 text-blue-700 px-5 py-2.5 rounded-xl font-bold transition-all border border-white shadow-md flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {tImm("share.submitBtn") || "Share Your Success"}
              </button>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            {isLoading ? (
              <div className="text-center py-20 text-gray-500 animate-pulse font-medium">
                Loading success stories...
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-medium">
                Failed to load success stories.
              </div>
            ) : currentStories.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700">No success stories found</h3>
                <p className="text-gray-500 mt-2">Check back later or share your own success journey!</p>
              </div>
            ) : (
              /* Testimonial Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentStories.map((story: TSuccessStory, index) => (
                  <motion.div
                    key={story._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="rounded-lg overflow-hidden"
                  >
                    <TestimonialCard story={story} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div
              className="flex justify-center items-center gap-2 sm:gap-4 p-6 border-t border-gray-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="outline"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                aria-label="Previous Page"
              >
                <ArrowLeft size={18} />
              </Button>

              {pageNumbers.map((number) => (
                <Button
                  key={number}
                  variant={number === currentPage ? "default" : "outline"}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full font-medium transition-all ${
                    number === currentPage
                      ? "bg-blue-750 hover:bg-blue-800 text-white shadow-md"
                      : "hover:bg-blue-50 border-gray-300"
                  }`}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </Button>
              ))}

              <Button
                variant="outline"
                className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Next Page"
              >
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </Card>
      </div>

      {/* Submission Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-blue-50">
          <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-blue-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-700" />
              {tImm("share.heading") || "আপনার সাফল্যের গল্প জমা দিন"}
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-1">আপনার গৌরবময় বিদেশ যাত্রার অভিজ্ঞতা আমাদের সাথে শেয়ার করুন</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullpage-fullName" className="text-sm font-semibold text-slate-700">
                  পূর্ণ নাম <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullpage-fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="যেমন: মো. রাকিবুল ইসলাম"
                    required
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullpage-profession" className="text-sm font-semibold text-slate-700">
                  পেশা / পদবী <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullpage-profession"
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
                <Label htmlFor="fullpage-country" className="text-sm font-semibold text-slate-700">
                  গন্তব্য দেশ <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullpage-country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="যেমন: Saudi Arabia"
                    required
                    className="pl-9 h-11 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fullpage-date" className="text-sm font-semibold text-slate-700">
                  তারিখ / সফলতার বছর
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="fullpage-date"
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
                    id="fullpage-ImageFile"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label htmlFor="fullpage-ImageFile" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-blue-700" />
                    {isUploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
                  </Label>
                  <p className="text-[10px] text-slate-400 mt-1">সর্বোচ্চ ২ মেগাবাইট (JPEG, PNG, WebP)</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullpage-story" className="text-sm font-semibold text-slate-700">
                আপনার সাফল্যের গল্প <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="fullpage-story"
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
                        star <= formData.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
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
}
