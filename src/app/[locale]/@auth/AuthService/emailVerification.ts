"use server";

import { axiosInstance } from "@/lib/AxiosInstance";

export const verifyEmail = async (token: string) => {
  try {
    const { data } = await axiosInstance.post("/auth/verify-email", { token });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Email verification failed. Please try again.";
    
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const { data } = await axiosInstance.post("/auth/resend-verification", { email });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to resend verification email. Please try again.";
    
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};