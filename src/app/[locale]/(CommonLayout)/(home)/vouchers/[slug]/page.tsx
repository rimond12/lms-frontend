"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useGetVoucherBySlugQuery,
  useGetGlobalVoucherSettingsQuery,
} from "@/app/redux/api/VoucherApi/voucherApi";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Award,
  CheckCircle2,
  Shield,
  Clock,
  Tag,
  ExternalLink,
} from "lucide-react";

export default function VoucherDetailsPage() {
  const params = useParams();
  const voucherSlug = params.slug as string;

  const {
    data: voucherResponse,
    isLoading,
    error,
  } = useGetVoucherBySlugQuery(voucherSlug);
  const { data: settingsResponse } = useGetGlobalVoucherSettingsQuery();

  const voucher = voucherResponse?.data;
  const globalSettings = settingsResponse?.data;

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace(
      "/api",
      ""
    )}/${imageUrl}`;
  };

  // Use voucher-specific settings if available, otherwise use global settings
  const getPhoneNumber = () => {
    if (voucher?.contactPhoneNumber) return voucher.contactPhoneNumber;
    if (globalSettings?.defaultPhoneNumber)
      return globalSettings.defaultPhoneNumber;
    return "+8801610473379"; // Fallback
  };

  const getPrefilledMessage = () => {
    if (voucher?.prefilledMessage) return voucher.prefilledMessage;
    if (globalSettings?.defaultPrefilledMessage) {
      // Replace {voucherName} placeholder with actual voucher name
      return globalSettings.defaultPrefilledMessage.replace(
        "{voucherName}",
        voucher?.name || "voucher"
      );
    }
    return `Hello, I am interested in purchasing the ${
      voucher?.name || "voucher"
    } from CADDCORE.`;
  };

  const handleWhatsAppOrder = () => {
    if (!voucher) return;

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhone = getPhoneNumber().replace(/[^0-9+]/g, "");

    // Create the WhatsApp URL with pre-filled message
    const message = encodeURIComponent(getPrefilledMessage());
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;

    // Open in new tab
    window.open(whatsappUrl, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading voucher details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Voucher Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The voucher you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/vouchers"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Vouchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/vouchers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to All Vouchers
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Image */}
            <div className="space-y-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
                {voucher.imageUrl ? (
                  <img
                    src={getImageUrl(voucher.imageUrl)}
                    alt={voucher.name}
                    className="w-full h-auto object-cover aspect-square"
                  />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center">
                    <Award className="w-32 h-32 text-blue-300" />
                  </div>
                )}

                {/* Price Badge */}
                {voucher.price && voucher.price > 0 && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold text-xl shadow-lg">
                    ৳{voucher.price.toLocaleString()}
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                  <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-medium">
                    Official Voucher
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-medium">
                    Quick Delivery
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                  <CheckCircle2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 font-medium">
                    100% Genuine
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium mb-4">
                  <Tag className="w-4 h-4" />
                  Certification Voucher
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {voucher.name}
                </h1>
              </div>

              {/* Price (Mobile) */}
              {voucher.price && voucher.price > 0 && (
                <div className="lg:hidden">
                  <div className="text-3xl font-bold text-blue-600">
                    ৳{voucher.price.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Instruction Title */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  {voucher.instructionTitle}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {voucher.instructionDetails.split("\n").map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* WhatsApp Contact Info */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact for Order
                </h3>
                <p className="text-gray-700 mb-2">
                  WhatsApp:{" "}
                  <strong className="text-green-700">{getPhoneNumber()}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Click the button below to order via WhatsApp with a pre-filled
                  message.
                </p>
              </div>

              {/* Order Button */}
              <div className="space-y-4">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 px-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Buy Now via WhatsApp
                  <ExternalLink className="w-5 h-5 opacity-70" />
                </button>

                <p className="text-center text-sm text-gray-500">
                  You&apos;ll be redirected to WhatsApp with a pre-filled order
                  message
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Why Choose CADDCORE?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Official Dassault Systèmes authorized vouchers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Best prices in Bangladesh
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Instant delivery after payment confirmation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">24/7 WhatsApp support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
