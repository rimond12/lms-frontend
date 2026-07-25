"use client";

import React, { useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ShieldCheck, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import ImmigrantForm from "@/components/common/resubaleform/ImmigrantForm";
import ImmigrantInput from "@/components/common/resubaleform/ImmigrantInput";
import LoadingSpinner from "@/components/common/LoadingSpinner/LoadingSpinner";
import { useChangePassword } from "@/app/[locale]/@auth/auth.hook";

export default function AdminChangePasswordPage() {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formKey, setFormKey] = useState(0); // Reset form trigger

  const { mutate: handleChangePassword, isPending } = useChangePassword();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!data.oldPassword) {
      toast.error("Please enter your current password");
      return;
    }

    if (!data.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    handleChangePassword(
      {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: (response: any) => {
          if (response?.success !== false) {
            setFormKey((prev) => prev + 1); // Reset form inputs
          }
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] p-4 md:p-8 flex items-center justify-center bg-slate-50/50">
      {isPending && <LoadingSpinner message="Updating Password..." />}

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
            <ShieldCheck className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <KeyRound className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Password Security</h1>
              <p className="text-blue-200 text-sm mt-1">
                Update your admin credentials securely directly from the dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          <ImmigrantForm key={formKey} onSubmit={onSubmit}>
            <div className="space-y-6">
              {/* Current Password */}
              <div className="relative">
                <ImmigrantInput
                  label="Current Password"
                  name="oldPassword"
                  placeholder="Enter your current password"
                  type={showOldPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-800 transition-colors p-1"
                  aria-label={showOldPassword ? "Hide current password" : "Show current password"}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* New Password */}
              <div className="relative">
                <ImmigrantInput
                  label="New Password"
                  name="newPassword"
                  placeholder="Enter your new password (min. 6 characters)"
                  type={showNewPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-800 transition-colors p-1"
                  aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Confirm New Password */}
              <div className="relative">
                <ImmigrantInput
                  label="Confirm New Password"
                  name="confirmPassword"
                  placeholder="Re-enter your new password"
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-slate-500 hover:text-slate-800 transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Info hint */}
            <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed">
                Password should be at least 6 characters long. Keep your admin password strong and confidential. You will not need any magic link or email confirmation.
              </p>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <Button
                className="w-full py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg transform active:scale-[0.99] disabled:opacity-75"
                size="lg"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Updating Password..." : "Update Password"}
              </Button>
            </div>
          </ImmigrantForm>
        </div>
      </div>
    </div>
  );
}
