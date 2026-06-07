"use client";

import React, { useEffect, Suspense } from "react";
import {
  FieldValues,
  SubmitHandler,
  useForm,
  FormProvider,
} from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { useUserRegistration } from "@/app/[locale]/@auth/auth.hook";
import ImmigrantForm from "@/components/common/resubaleform/ImmigrantForm";
import ImmigrantInput from "@/components/common/resubaleform/ImmigrantInput";
import { Button } from "@/components/ui/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignUpContent />
    </Suspense>
  );
}

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const router = useRouter();

  const methods = useForm<FieldValues>();
  const { handleSubmit } = methods;

  const {
    mutate: handleUserRegistration,
    isSuccess,
    isPending,
    isError,
    error,
  } = useUserRegistration();

  useEffect(() => {
    localStorage.removeItem("emailForVerification");
  }, []);

  useEffect(() => {
    if (!isPending && isSuccess) {
      toast.success(
        "Registration successful! Please check your email to verify your account.",
        {
          duration: 5000,
          position: "top-center",
        },
      );
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/");
      }
    }

    if (
      !isPending &&
      isError &&
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as any).response?.data?.message
    ) {
      const message = (error as any).response.data.message;
      toast.error(
        message.toLowerCase().includes("duplicate")
          ? "Email is already in use. Try logging in or use another email."
          : message,
      );
    }
  }, [isSuccess, isPending, isError, error, router]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const userData = {
      ...data,
      profilePhoto:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    };

    localStorage.setItem("emailForVerification", data.email);
    handleUserRegistration(userData);
  };

  return (
    <section className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gray-50 py-10">
      {isPending && <LoadingSpinner />}

      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Colorful Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-20 w-[35rem] h-[35rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <div className="w-full max-w-[500px] z-10 p-4">
        {/* Logo Section */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 md:p-10"
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your details to get started
            </p>
          </div>

          <ImmigrantForm onSubmit={handleSubmit(onSubmit)}>
            <FormProvider {...methods}>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Full Name
                  </label>
                  <ImmigrantInput
                    name="name"
                    placeholder="e.g. Ariyan Rakib"
                    className="bg-white/50 h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Email Address
                  </label>
                  <ImmigrantInput
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    className="bg-white/50 h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Mobile Number
                  </label>
                  <ImmigrantInput
                    name="mobileNumber"
                    placeholder="+880 1234-567890"
                    className="bg-white/50 h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 ml-1">
                    Password
                  </label>
                  <ImmigrantInput
                    name="password"
                    placeholder="Create a strong password"
                    type="password"
                    className="bg-white/50 h-11"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full h-11 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-900 text-white font-medium rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 group mt-2"
                    size="lg"
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <LoadingSpinner /> Creating...
                      </span>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FormProvider>
          </ImmigrantForm>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors inline-flex items-center gap-1"
              >
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-gray-600 hover:text-purple-600 underline decoration-gray-300 hover:decoration-purple-600 underline-offset-2 transition-all"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-gray-600 hover:text-purple-600 underline decoration-gray-300 hover:decoration-purple-600 underline-offset-2 transition-all"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
