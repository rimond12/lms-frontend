import baseApi from "./baseApi";

// Dashboard API - Injected into baseApi
const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: `/dashboard/stats`,
        method: "GET",
      }),
      providesTags: ["Dashboard" as const],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
