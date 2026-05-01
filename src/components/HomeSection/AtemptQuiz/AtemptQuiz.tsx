"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
// This now uses your actual RTK Query hook
import {
  useGetQuizzesQuery,
  useApplyForQuizMutation,
  useCheckQuizApprovalStatusQuery,
} from "@/app/redux/api/QuizApi/quizApi";
import {
  Play,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock4,
  AlertCircle,
  Trophy,
  Target,
  ArrowRight,
} from "lucide-react";
import RichTextRenderer from "@/components/shared/RichTextRenderer";
import styles from "./AttemptQuiz.module.css";
import { toast } from "react-hot-toast";
import { useUser } from "@/app/[locale]/@auth/user.provider";
import { useUpdateMyProfileMutation } from "@/app/redux/api/users/userApi";
import { useRouter } from "next/navigation";
import { ProfessionalAnimatedTitle } from "@/components/common/Commontitle/AnimationTitile";
import AppImage from "@/components/ui/AppImage";

const Card = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`group relative h-[520px] ${styles["professional-card"]} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 overflow-hidden backdrop-blur-lg ${className}`}
    style={style}
  >
    {/* Premium Gradient Border Effect */}
    <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
      <div className="w-full h-full rounded-2xl bg-white"></div>
    </div>

    {/* Glass Morphism Effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white/50 to-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"></div>

    {/* Floating Background Orbs */}
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>
    <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-pink-400/30 to-orange-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"></div>

    {/* Content Container */}
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

const QuizCard = ({ quiz, index }: { quiz: any; index: number }) => {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [applyForQuiz] = useApplyForQuizMutation();
  const { data: approvalStatus, refetch: refetchStatus } =
    useCheckQuizApprovalStatusQuery(quiz._id!, {
      skip: !user,
    });
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateMyProfileMutation();

  // Modal state for completing missing profile info
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"APPLY" | "START" | null>(
    null,
  );
  const [tempNid, setTempNid] = useState("");
  const [tempAddress, setTempAddress] = useState("");

  const missingFields = useMemo(() => {
    if (!user) return [] as string[];
    const fields: string[] = [];
    if (!user.nid) fields.push("nid");
    if (!user.address) fields.push("address");
    return fields;
  }, [user]);

  const openProfileModalIfNeeded = (action: "APPLY" | "START") => {
    if (!user) {
      toast.error("Please login first");
      return false;
    }
    if (missingFields.length > 0) {
      // Prefill temp states with existing values if any
      setTempNid(user?.nid || "");
      setTempAddress(user?.address || "");
      setPendingAction(action);
      setShowProfileModal(true);
      return true;
    }
    return false;
  };

  const handleSaveMissingInfo = async () => {
    if (!user) return;
    try {
      const payload: any = { id: user._id, data: {} as any };
      if (!user.nid && tempNid.trim()) payload.data.nid = tempNid.trim();
      if (!user.address && tempAddress.trim())
        payload.data.address = tempAddress.trim();

      if (Object.keys(payload.data).length === 0) {
        // Nothing to update (user left fields empty)
        toast.error("Please fill in required fields");
        return;
      }

      const res: any = await updateProfile(payload).unwrap();
      // Attempt to get updated user object
      const updatedUser = res?.data ||
        res?.user || { ...user, ...payload.data };
      setUser(updatedUser);
      toast.success("Profile updated");
      setShowProfileModal(false);
      // Directly proceed with the intended action WITHOUT re-checking missing fields
      if (pendingAction === "APPLY") {
        try {
          await applyForQuiz(quiz._id!).unwrap();
          toast.success(
            "Successfully applied for quiz! Redirecting to your applications...",
          );
          refetchStatus();
          // Redirect to my-applications after successful application
          setTimeout(() => {
            router.push("/user-profile/my-applications");
          }, 1500);
        } catch (error: any) {
          toast.error(error?.data?.message || "Failed to apply for quiz");
        }
      } else if (pendingAction === "START") {
        router.push(`/give-quiz/${quiz._id}`);
      }
    } catch (e: any) {
      toast.error(e?.data?.message || "Failed to update profile");
    }
  };

  const handleApplyForQuiz = async () => {
    if (!user) {
      toast.error("Please login to apply for quizzes");
      return;
    }

    // Ensure required profile data present before applying
    if (openProfileModalIfNeeded("APPLY")) return; // modal opened

    try {
      await applyForQuiz(quiz._id!).unwrap();
      toast.success(
        "Successfully applied for quiz! Redirecting to your applications...",
      );
      refetchStatus();
      // Redirect to my-applications after successful application
      setTimeout(() => {
        router.push("/user-profile/my-applications");
      }, 1500);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to apply for quiz");
    }
  };

  const handleStartQuiz = () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    if (openProfileModalIfNeeded("START")) return;
    router.push(`/give-quiz/${quiz._id}`);
  };

  const getButtonContent = () => {
    if (!user) {
      return {
        text: "Apply Now",
        icon: <AlertCircle className="w-5 h-5" />,
        disabled: false,
        onClick: () => {
          // Redirect to login with redirect back to this page
          router.push(
            `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
          );
        },
        className:
          "from-red-700 btn  to-red-800 hover:from-gray-950 hover:to-gray-950",
      };
    }

    if (!approvalStatus?.application) {
      return {
        text: "Apply for Quiz",
        icon: (
          <BookOpen className="w-5 h-5 group-hover/button:scale-110 transition-transform duration-300" />
        ),
        disabled: false,
        onClick: handleApplyForQuiz,
        className:
          "from-[#AF4444] to-[#AF4444] hover:from-[#AF4444] hover:to-red-800",
      };
    }

    switch (approvalStatus.status) {
      case "PENDING":
        return {
          text: "Application Pending",
          icon: <Clock4 className="w-5 h-5" />,
          disabled: true,
          onClick: () => {},
          className:
            "from-yellow-500 to-orange-500 opacity-75 cursor-not-allowed",
        };
      case "APPROVED":
        return {
          text: "Start Quiz",
          icon: (
            <Play className="w-5 h-5 group-hover/button:scale-110 transition-transform duration-300" />
          ),
          disabled: false,
          onClick: handleStartQuiz,
          className:
            "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
        };
      case "REJECTED":
        return {
          text: "Application Rejected",
          icon: <XCircle className="w-5 h-5" />,
          disabled: true,
          onClick: () => {},
          className: "from-red-800 to-red-800 opacity-75 cursor-not-allowed",
        };
      default:
        return {
          text: "Apply for Quiz",
          icon: (
            <BookOpen className="w-5 h-5 group-hover/button:scale-110 transition-transform duration-300" />
          ),
          disabled: false,
          onClick: handleApplyForQuiz,
          className:
            "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
        };
    }
  };

  const buttonConfig = getButtonContent();

  return (
    <Card
      key={quiz._id}
      className={`${styles["animate-fade-in-up"]}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Premium Header with Status Badge */}
        <div className="relative mb-4">
          {/* Status Badge */}
          {approvalStatus?.application && (
            <div
              className={`absolute -top-3 -right-3 z-20 flex items-center gap-1.5 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg ${
                approvalStatus.status === "APPROVED"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : approvalStatus.status === "PENDING"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-red-800 to-pink-500"
              }`}
            >
              {approvalStatus.status === "APPROVED" && (
                <CheckCircle className="w-3 h-3" />
              )}
              {approvalStatus.status === "PENDING" && (
                <Clock4 className="w-3 h-3 animate-pulse" />
              )}
              {approvalStatus.status === "REJECTED" && (
                <XCircle className="w-3 h-3" />
              )}
              <span className="uppercase tracking-wide text-xs">
                {approvalStatus.status}
              </span>
            </div>
          )}
        </div>

        {/* Professional Quiz Image with Enhanced Styling */}
        {quiz.descriptionImage && (
          <div className="relative h-44 rounded-xl overflow-hidden mb-4 shadow-lg group-hover:shadow-xl transition-all duration-500 border-2 border-gray-100/50 group-hover:border-blue-200/50">
            {/* Image with professional aspect ratio and styling */}
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <AppImage
                photoUrl={quiz.descriptionImage}
                alt={quiz.title}
                width={400}
                height={250}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter group-hover:brightness-110"
                style={{
                  objectPosition: "center",
                  aspectRatio: "16/9",
                }}
                defaultImage="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop&crop=center&auto=format&q=80"
              />
            </div>

            {/* Professional Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Premium Badge/Category Indicator */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
              Take a Challenge
            </div>

            {/* Floating Quiz Trophy Icon */}
            <div className="absolute bottom-3 right-3 w-10 h-10 bg-gradient-to-br from-yellow-400/80 to-orange-500/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>

            {/* Subtle shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 skew-x-12 transform -translate-x-full group-hover:translate-x-full"></div>
          </div>
        )}

        {/* Quiz Title & Description */}
        <div className="flex-grow mb-4">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-500 leading-tight line-clamp-2">
              {quiz.title}
            </h3>
          </div>
          <div
            className={`text-gray-600 text-sm leading-relaxed ${styles["line-clamp-2"]} group-hover:text-gray-700 transition-colors duration-300`}
          >
            <RichTextRenderer htmlString={quiz.description} />
          </div>
        </div>

        {/* Enhanced Quiz Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-xl border border-gray-100/50 group-hover:border-blue-200/50 transition-all duration-500">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mx-auto mb-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <Target className="text-white w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Multiple Quiz
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mx-auto mb-2 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <BookOpen className="text-white w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Class
            </p>
          </div>
        </div>

        {/* Professional Premium Action Button */}
        <div className="mt-auto">
          <button
            onClick={buttonConfig.onClick}
            disabled={buttonConfig.disabled}
            className={`w-full relative overflow-hidden bg-gradient-to-r ${buttonConfig.className} text-white py-3 px-4 rounded-xl transition-all duration-500 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 group/button text-sm ${buttonConfig.disabled ? "transform-none hover:shadow-lg cursor-not-allowed opacity-80" : "hover:scale-[1.02]"}`}
          >
            {/* Enhanced Button Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-700 skew-x-12"></div>

            {/* Premium Animated Border */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/button:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>

            {/* Button Content Container */}
            <div className="relative flex items-center justify-center gap-2 z-10">
              {/* Animated Icon */}
              <div className="flex items-center justify-center w-5 h-5 group-hover/button:scale-110 transition-transform duration-300">
                {buttonConfig.icon}
              </div>

              {/* Button Text */}
              <span className="font-semibold tracking-wide text-sm uppercase">
                {buttonConfig.text}
              </span>

              {/* Arrow Animation */}
              {!buttonConfig.disabled && (
                <div className="flex items-center justify-center w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Enhanced Glow Effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover/button:opacity-30 transition-opacity duration-500 blur-xl bg-gradient-to-r from-current via-current to-current"></div>

            {/* Loading State Overlay */}
            {buttonConfig.disabled && (
              <div className="absolute inset-0 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        </div>

        {/* Profile Completion Modal - Enhanced Design */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-gray-100">
              {/* Modal Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Complete Your Profile
                </h3>
                <p className="text-gray-600 text-sm">
                  Please provide the missing information to continue
                </p>
              </div>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setPendingAction(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Close"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="space-y-4">
                {missingFields.includes("nid") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      National ID (NID)
                    </label>
                    <input
                      type="text"
                      value={tempNid}
                      onChange={(e) => setTempNid(e.target.value)}
                      placeholder="Enter your NID"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                )}
                {missingFields.includes("address") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      placeholder="Enter your address"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] transition-all duration-200"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setPendingAction(null);
                  }}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 font-medium"
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMissingInfo}
                  disabled={
                    isUpdatingProfile ||
                    (missingFields.includes("nid") && !tempNid.trim()) ||
                    (missingFields.includes("address") && !tempAddress.trim())
                  }
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isUpdatingProfile
                    ? "Saving..."
                    : pendingAction === "APPLY"
                      ? "Save & Apply"
                      : pendingAction === "START"
                        ? "Save & Start"
                        : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default function QuizSelection() {
  const { data, isLoading, error } = useGetQuizzesQuery();

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Loading Amazing Quizzes...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[520px] bg-white p-6 rounded-2xl shadow-xl border border-gray-100"
              >
                <div
                  className={`h-44 bg-gray-200 rounded-xl mb-4 ${styles.shimmer}`}
                ></div>
                <div
                  className={`h-6 bg-gray-200 rounded-lg w-3/4 mb-3 ${styles.shimmer}`}
                ></div>
                <div
                  className={`h-4 bg-gray-200 rounded-lg w-full mb-2 ${styles.shimmer}`}
                ></div>
                <div
                  className={`h-4 bg-gray-200 rounded-lg w-2/3 mb-4 ${styles.shimmer}`}
                ></div>
                <div
                  className={`h-20 bg-gray-200 rounded-xl mb-6 ${styles.shimmer}`}
                ></div>
                <div
                  className={`h-12 bg-gray-200 rounded-xl ${styles.shimmer}`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-10 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-red-800">
            Oops! Something went wrong.
          </h3>
          <p className="text-gray-600 mt-2">
            We couldn't load the quizzes. Please check your connection and try
            again.
          </p>
        </div>
      </div>
    );
  }

  const quizzes = data.quizzes || [];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className={`text-center  ${styles["animate-fade-in"]}`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#AF4444] to-[#AF4444] rounded-full mb-4 shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <ProfessionalAnimatedTitle
            title="Test Your Knowledge"
            subTitle="Challenge yourself with our expertly crafted quizzes and unlock your potential"
          />
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Courses and Quizzes Available
            </h3>
            <p className="text-gray-500 text-sm">
              Check back soon for exciting new challenges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz: any, index: number) => (
              <QuizCard key={quiz._id} quiz={quiz} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
