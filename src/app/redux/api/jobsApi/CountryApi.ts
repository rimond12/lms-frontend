import baseApi from "../baseApi";

export interface ICountry {
  _id: string;
  name: string;
  nameBn: string;
  flagIcon: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

const CountryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query<ICountry[], void>({
      query: () => "/countries",
      transformResponse: (res: any) => res.data,
      providesTags: ["Country"],
    }),
    createCountry: builder.mutation<ICountry, Partial<ICountry>>({
      query: (data) => ({
        url: "/countries",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Country"],
    }),
    updateCountry: builder.mutation<ICountry, { id: string; data: Partial<ICountry> }>({
      query: ({ id, data }) => ({
        url: `/countries/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Country"],
    }),
    deleteCountry: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/countries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Country"],
    }),
    uploadCountryFlag: builder.mutation<string, FormData>({
      query: (formData) => ({
        url: "/countries/upload-flag",
        method: "POST",
        body: formData,
      }),
      transformResponse: (res: any) => res.data,
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useCreateCountryMutation,
  useUpdateCountryMutation,
  useDeleteCountryMutation,
  useUploadCountryFlagMutation,
} = CountryApi;
export default CountryApi;
