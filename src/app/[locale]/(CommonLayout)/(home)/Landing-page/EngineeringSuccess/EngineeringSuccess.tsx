"use client";

import React from "react";
import { useTranslations } from "next-intl";

const ImmigrantSuccess: React.FC = () => {
  const t = useTranslations("immigrantSuccess");

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-7">
      {/* Testimonial Card */}
      <div className="max-w-7xl mx-auto bg-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl relative overflow-hidden mb-14 sm:mb-20 group">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300 opacity-10 rounded-full -ml-10 -mb-10" />

        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 relative z-10">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 p-1">
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
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
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-white text-base sm:text-lg md:text-xl italic leading-relaxed mb-4 sm:mb-6 font-light">
              &ldquo;{t("testimonial.quote")}&rdquo;
            </p>

            <div className="text-white">
              <h4 className="font-bold text-base sm:text-lg">
                {t("testimonial.name")}
              </h4>
              <p className="text-blue-200 text-xs sm:text-sm mt-0.5">
                {t("testimonial.company")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Success Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-700 mb-3 px-2">
          {t("share.heading")}
        </h2>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
          {t("share.subheading")}
        </p>

        {/* Main CTA */}
        <button
          type="button"
          className="bg-blue-700 text-white px-7 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg mb-5 sm:mb-6 flex items-center gap-2 mx-auto hover:bg-blue-900 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-200"
        >
          {t("share.submitBtn")}
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
            {t("share.nominateBtn")}
          </button>
          <button
            type="button"
            className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            {t("share.processBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImmigrantSuccess;
