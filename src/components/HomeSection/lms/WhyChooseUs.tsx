"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Briefcase,
  CheckCircle,
  Headphones,
  Library,
  Folder,
  GraduationCap,
  Award,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const WhyChooseUs = () => {
  const t = useTranslations("whyChooseUs");

  const features = [
    {
      key: "curriculum",
      icon: FileText,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      cardGradient: "bg-gradient-to-t from-blue-100/50 via-blue-50/30 to-white",
    },
    {
      key: "instructors",
      icon: Users,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
      cardGradient:
        "bg-gradient-to-t from-orange-100/50 via-orange-50/30 to-white",
    },
    {
      key: "learning",
      icon: Briefcase,
      iconColor: "text-purple-600", // Changed to purple for modern look
      iconBg: "bg-purple-50",
      cardGradient:
        "bg-gradient-to-t from-purple-200/50 via-purple-50/30 to-white",
    },
  ];

  const services = [
    {
      key: "support",
      icon: Headphones,
      image: "https://cdn-icons-png.flaticon.com/512/9068/9068217.png",
    },
    {
      key: "library",
      icon: Library,
      image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    },
    {
      key: "placement",
      icon: Briefcase,
      image: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    },
    {
      key: "resources",
      icon: Folder,
      image: "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
    },
    {
      key: "training",
      icon: GraduationCap,
      image: "https://cdn-icons-png.flaticon.com/512/3048/3048398.png",
    },
    {
      key: "certificate",
      icon: Award,
      image: "https://cdn-icons-png.flaticon.com/512/2231/2231693.png",
    },
  ];

  const badges = [
    {
      src: "https://res.cloudinary.com/dalpf8iip/image/upload/v1747111938/WhatsApp_Image_2025-05-12_at_6.01.01_PM_sjdwhm.jpg",
      alt: "Autodesk ATC Badge",
    },
    {
      src: "https://res.cloudinary.com/dalpf8iip/image/upload/v1747111896/autodesk_qmrw4i.png",
      alt: "Autodesk Certified",
    },
    {
      src: "https://res.cloudinary.com/dalpf8iip/image/upload/v1747111892/image_vif2ga.png",
      alt: "Autodesk Partner",
    },
    {
      src: "https://res.cloudinary.com/dalpf8iip/image/upload/v1747111872/3ds-Max_vjgz1u.png",
      alt: "3ds Max",
    },
  ];

  return (
    <section className="py-10 lg:py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {t("badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
          >
            {t("title")}{" "}
            <span className="inline-block bg-gray-900 text-white px-3 py-1 rounded-lg">
              {t("titleHighlight")}
            </span>{" "}
            {t("titleEnd")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* Main Features - 3 Column Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div
                className={`h-full border-2 border-black rounded-xl border-t-8 border-gray-900 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-6 lg:p-8 ${feature.cardGradient}`}
              >
                {/* Icon */}
                <div className="flex justify-center mb-5">
                  <div
                    className={`p-4 rounded-full ${feature.iconBg} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      className={`w-10 h-10 ${feature.iconColor}`}
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-gray-900 mb-3">
                  {t(`features.${feature.key}.title`)}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-center mb-5 text-sm leading-relaxed">
                  {t(`features.${feature.key}.description`)}
                </p>

                {/* Feature List */}
                <ul className="space-y-2.5">
                  {[1, 2, 3].map((num) => (
                    <li key={num} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        {t(`features.${feature.key}.feature${num}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl lg:text-3xl font-bold text-center text-gray-900 mb-10">
            {t("services.title")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, index) => (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <motion.div
                  className="relative flex border-2 border-black items-start gap-4 p-5 rounded-xl overlow-hidden bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 hover:border-red-200 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02, backgroundColor: "#fff0f3" }} // Light pinkish white on hover
                  animate={{
                    backgroundSize: ["100% 100%", "200% 100%", "100% 100%"],
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    backgroundSize: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    backgroundPosition: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    scale: { duration: 0.2 },
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-sm border border-transparent group-hover:border-red-100">
                    <Image
                      src={service.image}
                      alt={t(`services.${service.key}.title`)}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 relative z-10">
                    <h4 className="text-base font-bold text-red-600 mb-1.5 group-hover:text-red-700 transition-colors">
                      {t(`services.${service.key}.title`)}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700">
                      {t(`services.${service.key}.description`)}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 items-center"
        >
          {badges.map((badge, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border-t-2 border-b-2 border-gray-900 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center h-16">
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={120}
                  height={64}
                  className="h-full w-auto object-contain max-h-16"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
