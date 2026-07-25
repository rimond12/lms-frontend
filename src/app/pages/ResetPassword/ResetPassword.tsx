"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import ImmigrantForm from "@/components/common/resubaleform/ImmigrantForm";
import ImmigrantInput from "@/components/common/resubaleform/ImmigrantInput";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useResetPassword } from "@/app/[locale]/@auth/auth.hook";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

export function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [passwordReset, setPasswordReset] = useState(false);
  const hasMounted = useHasMounted();

  const { mutate: handleResetPassword, isPending } = useResetPassword();

  useEffect(() => {
    if (!hasMounted) return;

    const tokenParam = searchParams?.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error("Invalid reset link");
      router.push("/forgot-password");
    }
  }, [searchParams, router, hasMounted]);

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    handleResetPassword(
      { token, newPassword: data.newPassword },
      {
        onSuccess: (response: any) => {
          if (response.success !== false) {
            setPasswordReset(true);
          }
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to reset password");
        },
      },
    );
  };

  if (!hasMounted) return null;

  if (!token && hasMounted) {
    return (
      <section className="h-screen w-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h3>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (passwordReset) {
    return (
      <section className="h-screen w-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      {isPending && <LoadingSpinner message="Resetting password..." />}

      <div className="h-screen w-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20 p-8">
          <div className="text-center mb-8">
            <Link
              href="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <h3 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Reset Password
            </h3>
            <p className="text-gray-600 mt-2">Enter your new password below</p>
          </div>

          <ImmigrantForm onSubmit={onSubmit}>
            <div className="mb-6 space-y-4">
              <div className="relative">
                <ImmigrantInput
                  label="New Password"
                  name="newPassword"
                  placeholder="Enter your new password"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 flex items-center text-gray-950 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <ImmigrantInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 flex items-center text-gray-950 cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Password must be at least 6 characters long.
              </p>
            </div>

            <Button
              className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              size="lg"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </ImmigrantForm>
        </div>
      </div>
    </section>
  );
}
