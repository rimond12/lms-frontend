"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import CaddForm from "@/components/common/resubaleform/CaddForm";
import CaddInput from "@/components/common/resubaleform/CaddInput";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useForgotPassword } from "@/app/[locale]/@auth/auth.hook";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

export function ForgotPassword() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const hasMounted = useHasMounted();

  const { mutate: handleForgotPassword, isPending } = useForgotPassword();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setEmail(data.email);
    handleForgotPassword(data.email, {
      onSuccess: (response: any) => {
        if (response.success !== false) {
          setEmailSent(true);
        }
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to send reset email");
      },
    });
  };

  if (!hasMounted) return null;

  if (emailSent) {
    return (
      <section className="h-screen w-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Email Sent!
            </h3>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your email and follow the instructions to reset your
              password.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The link will expire in 15 minutes for security reasons.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Email
              </Button>
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      {isPending && <LoadingSpinner />}

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
              Forgot Password
            </h3>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          <CaddForm onSubmit={onSubmit}>
            <div className="mb-6">
              <CaddInput
                label="Email Address"
                name="email"
                placeholder="Enter your email address"
                type="email"
              />
            </div>

            <Button
              className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              size="lg"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Sending..." : "Send Reset Link"}
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
          </CaddForm>
        </div>
      </div>
    </section>
  );
}
