// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// // Separate API for file uploads that always uses localhost
// const uploadApi = createApi({
//   reducerPath: "uploadApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: process.env.NEXT_PUBLIC_UPLOAD_API_URL || "https://api.immigrantjobsworld.com/api",

//     prepareHeaders: async (headers) => {
//       // Get token from cookies
//       let token: string | undefined;

//       if (typeof window !== 'undefined') {
//         // Client-side: get from document.cookie
//         const cookieString = document.cookie;
//         const tokenCookie = cookieString
//           .split('; ')
//           .find(row => row.startsWith('accessToken='));
//         token = tokenCookie ? tokenCookie.split('=')[1] : undefined;
//       }

//       if (token) {
//         headers.set('authorization', `${token}`);
//       }

//       return headers;
//     },
//   }),
//   tagTypes: ["Upload"],
//   endpoints: (builder) => ({
//     uploadImage: builder.mutation({
//       query: (formData) => ({
//         url: '/upload/image', // Adjust this to your upload endpoint
//         method: 'POST',
//         body: formData,
//       }),
//       invalidatesTags: ['Upload'],
//     }),
//   }),
// });

// export const { useUploadImageMutation } = uploadApi;
// export default uploadApi;
