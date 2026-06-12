import baseApi from "../baseApi";

export interface IFooterQuickLink {
  label: string;
  url: string;
}

export interface IFooterSocialLinks {
  facebook: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
  x: string;
}

export interface IFooter {
  _id?: string;
  hotline: string;
  whatsappLink: string;
  email: string;
  address: string;
  mobile: string;
  officeHours: string;
  socialLinks: IFooterSocialLinks;
  copyrightText: string;
  quickLinks: IFooterQuickLink[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type FooterResponse = {
  success: boolean;
  message: string;
  data: IFooter;
};

const footerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFooter: builder.query<FooterResponse, void>({
      query: () => "/footer",
      providesTags: ["Footer"],
    }),
    updateFooter: builder.mutation<FooterResponse, Partial<IFooter>>({
      query: (payload) => ({
        url: "/footer",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Footer"],
    }),
  }),
});

export const { useGetFooterQuery, useUpdateFooterMutation } = footerApi;
export default footerApi;
