import { FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query"; 
import { useUser } from "./user.provider";
import { getCurrentUser, loginUser, registerUser, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } from "./AuthService";



export const useUserRegistration = () => {
  const { setUser } = useUser();

  return useMutation<any, Error, FieldValues>({
    mutationKey: ["USER_REGISTRATION"],
    mutationFn: async (userData: FieldValues) => await registerUser(userData),
    onSuccess: async (data) => {
      // Check if the response indicates an error
      if (data.success === false) {
        toast.error(data.error || "Registration failed. Please try again.");
        return;
      }

      toast.success("User registration successful");
      
      const currentUser = await getCurrentUser();
      setUser(currentUser ?? null);
    },
    onError: (error) => {
      // Fallback error handling for any other errors
      const message = error.message || "Registration failed. Please try again.";
      toast.error(message);
    },
  });
};
export const useUserLogin = () => {
  const { setUser } = useUser();

  return useMutation<any, Error, FieldValues>({
    mutationKey: ["USER_LOGIN"],
    mutationFn: loginUser,
    onSuccess: async (data) => {
      // Check if the response indicates an error
      if (data.success === false) {
        toast.error(data.error || "Login failed. Please try again.");
        return;
      }

      toast.success("Login successful");

      const currentUser = await getCurrentUser();
      setUser(currentUser ?? null);
    },
    onError: (error) => {
      // Fallback error handling for any other errors
      const message = error.message || "Login failed. Please try again.";
      toast.error(message);
    },
  });  
};

export const useForgotPassword = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["FORGOT_PASSWORD"],
    mutationFn: async (email: string) => await forgotPassword(email),
    onSuccess: (data) => {
      if (data.success === false) {
        toast.error(data.error || "Failed to send reset email. Please try again.");
        return;
      }
      toast.success("Password reset email sent successfully! Please check your email.");
    },
    onError: (error) => {
      const message = error.message || "Failed to send reset email. Please try again.";
      toast.error(message);
    },
  });
};

export const useResetPassword = () => {
  return useMutation<any, Error, { token: string; newPassword: string }>({
    mutationKey: ["RESET_PASSWORD"],
    mutationFn: async ({ token, newPassword }) => await resetPassword(token, newPassword),
    onSuccess: (data) => {
      if (data.success === false) {
        toast.error(data.error || "Failed to reset password. Please try again.");
        return;
      }
      toast.success("Password reset successfully! You can now login with your new password.");
    },
    onError: (error) => {
      const message = error.message || "Failed to reset password. Please try again.";
      toast.error(message);
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["VERIFY_EMAIL"],
    mutationFn: async (token: string) => await verifyEmail(token),
    onSuccess: (data) => {
      if (data.success === false) {
        toast.error(data.error || "Email verification failed. Please try again.");
        return;
      }
      
      if (data.message?.includes('already verified')) {
        toast.success("Your email is already verified!");
      } else {
        toast.success("Email verified successfully!");
      }
    },
    onError: (error) => {
      const message = error.message || "Email verification failed. Please try again.";
      toast.error(message);
    },
  });
};

export const useResendVerificationEmail = () => {
  return useMutation<any, Error, string>({
    mutationKey: ["RESEND_VERIFICATION_EMAIL"],
    mutationFn: async (email: string) => await resendVerificationEmail(email),
    onSuccess: (data) => {
      if (data.success === false) {
        toast.error(data.error || "Failed to resend verification email. Please try again.");
        return;
      }
      toast.success("Verification email sent successfully! Please check your inbox.");
    },
    onError: (error) => {
      const message = error.message || "Failed to resend verification email. Please try again.";
      toast.error(message);
    },
  });
};
