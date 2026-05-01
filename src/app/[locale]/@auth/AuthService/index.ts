"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { FieldValues } from 'react-hook-form';
import { axiosInstance } from "@/lib/AxiosInstance";

export const registerUser = async (userData: FieldValues) => {
  try {
    const { data } = await axiosInstance.post("/auth/register", userData);

    if (data.success) {
      (await cookies()).set("accessToken", data?.data?.accessToken);
      (await cookies()).set("refreshToken", data?.data?.refreshToken);
    }

    return data;
  } catch (error: any) {
    // Extract the error message from the response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Registration failed. Please try again.";
    
    // Return an error object that can be safely passed to client
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};

export const loginUser = async (userData: FieldValues) => {
  try {
    const { data } = await axiosInstance.post("/auth/login", userData);

    if (data.success) {
      (await cookies()).set("accessToken", data.data.accessToken);
      (await cookies()).set("refreshToken", data.data.refreshToken);
    }

    return data;
  } catch (error: any) {
    // Extract the error message from the response
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Login failed. Please try again.";
    
    // Return an error object that can be safely passed to client
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};

export const logout = async () => {
  (await cookies()).delete("accessToken");
  (await cookies()).delete("refreshToken");
};


export const getCurrentUser = async () => {
  try {
    const accessToken = (await cookies()).get("accessToken")?.value;
    console.log('getCurrentUser: accessToken exists:', !!accessToken);

    if (!accessToken) {
      console.log('getCurrentUser: No access token found');
      return null;
    }

    let decodedToken = null;

    try {
      decodedToken = await jwtDecode(accessToken);
      console.log('getCurrentUser: decodedToken:', decodedToken);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('getCurrentUser: Token expired');
        // Clear expired tokens
        (await cookies()).delete("accessToken");
        (await cookies()).delete("refreshToken");
        return null;
      }

      // Fetch complete user profile from API
      try {
        const { data } = await axiosInstance.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (data.success) {
          // console.log('getCurrentUser: Full user data from API:', data.data);
          return data.data;
        }
      } catch (apiError) {
        console.error('getCurrentUser: API fetch error, falling back to JWT data:', apiError);
        // Fall back to JWT data if API call fails
        return {
          _id: decodedToken._id,
          name: decodedToken.name,
          email: decodedToken.email,
          mobileNumber: decodedToken.mobileNumber,
          role: decodedToken.role,
          status: decodedToken.status,
          emailVerified: decodedToken.emailVerified,
          profilePhoto: decodedToken.profilePhoto,
          age: decodedToken.age,
          cvUrl: decodedToken.cvUrl,
          experienceCertificateUrl: decodedToken.experienceCertificateUrl,
          universityCertificateUrl: decodedToken.universityCertificateUrl,
        };
      }

    } catch (jwtError) {
      console.error('getCurrentUser: JWT decode error:', jwtError);
      // Clear invalid tokens
      (await cookies()).delete("accessToken");
      (await cookies()).delete("refreshToken");
      return null;
    }
  } catch (error) {
    console.error('getCurrentUser: Error:', error);
    return null;
  }
};

// Helper function to update tokens from API response
export const updateTokensFromResponse = async (response: any) => {
  try {
    if (response.data?.accessToken) {
      (await cookies()).set("accessToken", response.data.accessToken);
      // console.log('Updated access token from API response');
    }
    if (response.data?.refreshToken) {
      (await cookies()).set("refreshToken", response.data.refreshToken);
    }
  } catch (error) {
    console.error('Error updating tokens:', error);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const { data } = await axiosInstance.post("/auth/forgot-password", { email });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to send reset email. Please try again.";
    
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const { data } = await axiosInstance.post("/auth/reset-password", { 
      token, 
      newPassword 
    });
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Failed to reset password. Please try again.";
    
    return {
      success: false,
      error: errorMessage,
      statusCode: error.response?.status || 500
    };
  }
};

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