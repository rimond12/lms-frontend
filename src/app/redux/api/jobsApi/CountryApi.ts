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
  }),
});

export const { useGetCountriesQuery } = CountryApi;
export default CountryApi;
