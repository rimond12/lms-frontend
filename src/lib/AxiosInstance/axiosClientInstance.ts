// import axios from "axios";

// const clientAxiosInstance = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
// });

// clientAxiosInstance.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const token = document.cookie
//       .split('; ')
//       .find((row) => row.startsWith('accessToken='))
//       ?.split('=')[1];

//     if (token) {
//       config.headers.Authorization = `${token}`;
//     }
//   }

//   return config;
// });

// export default clientAxiosInstance;
