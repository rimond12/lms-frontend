import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://api.immigrantjobsworld.com/api",
    // // baseUrl: "https://api.immigrantjobsworld.com/api",

    baseUrl:
      process.env.NEXT_PUBLIC_API_URL || "https://api.immigrantjobsworld.com/api",
    prepareHeaders: async (headers, { getState }) => {
      // Get token from cookies
      let token: string | undefined;

      if (typeof window !== "undefined") {
        const cookieString = document.cookie;
        const tokenCookie = cookieString
          .split("; ")
          .find((row) => row.startsWith("accessToken="));
        token = tokenCookie ? tokenCookie.split("=")[1] : undefined;
      }

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Quiz",
    "QuizAttempt",
    "QuizAnalytics",
    "QuizApplication",
    "BlogEventNews",
    "Expert",
    "EventCalendar",
    "Course",
    "Material",
    "Enrollment",
    "Certificate",
    "AccessControl",
    "Invitation",
    "Email",
    "Banner",
    "Notice",
    "Batch",
    "BatchEnrollment",
    "Dashboard",
    "StudentReview",
    "Category",
    "AboutUsContent",
    "Contact",
    "Voucher",
    "BatchCertificate",
    "Assignment",
    "AssignmentSubmission",
    "BatchModule",
    "ActivityHistory",
    "Job",
    "JobApplication",
    "SavedJob",
    "Lead",
    "JobCategory",
    "LandingPageCMS",
    "SuccessStory",
    "Country",
    "Footer",
    "Navbar",
  ],
  endpoints: () => ({}),
});

export default baseApi;
