import axios from "axios";

// Client-safe axios instance
export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.caddcore.cloud/api",
});

// Request interceptor
axiosInstance.interceptors.request.use(
  function (config) {
    // Get token from localStorage or cookies (client-side)
    if (typeof window !== "undefined") {
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (accessToken) {
        config.headers.Authorization = accessToken;
      }
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== "undefined") {
        // Redirect to login or handle token refresh
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
