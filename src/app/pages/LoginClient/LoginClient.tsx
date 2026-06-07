"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";

import { toast } from "sonner";
import { useUserLogin } from "@/app/[locale]/@auth/auth.hook";
import ImmigrantForm from "@/components/common/resubaleform/ImmigrantForm";
import ImmigrantInput from "@/components/common/resubaleform/ImmigrantInput";
import { Button } from "@/components/ui/Button";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [showPassword, setShowPassword] = useState(false);
  const hasMounted = useHasMounted();

  const { mutate: handleUserLogin, isPending } = useUserLogin();

  useEffect(() => {
    const param = searchParams?.get("redirect");
    if (param) setRedirectTo(param);
  }, [searchParams]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    handleUserLogin(data, {
      onSuccess: (response: any) => {
        if (response.success === false) return;
        const role = response?.data?.role;
        if (role === "ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/user-profile");
        }
      },
      onError: (error) => {
        toast.error(error?.message || "Invalid email or password");
      },
    });
  };

  if (!hasMounted) return null;

  return (
    <>
      {/* ✅ Fullscreen loader — isPending এ পুরো screen এ দেখাবে */}
      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/images/imigrant-2.png"
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Signing in...</p>
          <p className="text-xs text-gray-400 mt-1">Please wait</p>
        </div>
      )}

      <section className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gray-50">
        {/* Animated Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" />
          <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-20 w-[35rem] h-[35rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        </div>

        <div className="w-full max-w-[440px] z-10 p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 p-8 md:p-10">
            {/* Logo */}
            <div className="mb-4 text-center">
              <div className="flex justify-center mb-2">
                <img src="/images/imigrant-2.png" />
              </div>
              <p className="text-gray-500 text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            <ImmigrantForm onSubmit={onSubmit}>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <ImmigrantInput
                    name="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    type="email"
                    className="bg-white/50"
                    labelClassName="text-gray-700 font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="relative group">
                    <ImmigrantInput
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      className="bg-white/50"
                      labelClassName="text-gray-700 font-medium text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-[38px] text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center cursor-pointer group select-none">
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-purple-600 peer-checked:border-purple-600 transition-all" />
                      <svg
                        className="w-2.5 h-2.5 text-white absolute top-[3px] left-[3px] opacity-0 peer-checked:opacity-100 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="ml-2 text-sm text-gray-500 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* ✅ Button — ছোট inline spinner, fullscreen loader আলাদা */}
                <Button
                  className="w-full h-11 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-950 text-white font-medium rounded-xl transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70"
                  size="lg"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </ImmigrantForm>

            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
