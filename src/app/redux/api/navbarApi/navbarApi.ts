import baseApi from "../baseApi";

export interface INavLinkDropdown {
  nameEn: string;
  nameBn: string;
  href: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon?: string;
  badgeEn?: string;
  badgeBn?: string;
  featured?: boolean;
}

export interface INavLink {
  nameEn: string;
  nameBn: string;
  href: string;
  icon?: string;
  dropdown?: INavLinkDropdown[];
}

export interface INavbar {
  _id?: string;
  showLanguageToggle: boolean;
  navLinks: INavLink[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type NavbarResponse = {
  success: boolean;
  message: string;
  data: INavbar;
};

const navbarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNavbar: builder.query<NavbarResponse, void>({
      query: () => "/navbar",
      providesTags: ["Navbar"],
    }),
    updateNavbar: builder.mutation<NavbarResponse, Partial<INavbar>>({
      query: (payload) => ({
        url: "/navbar",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Navbar"],
    }),
  }),
});

export const { useGetNavbarQuery, useUpdateNavbarMutation } = navbarApi;
export default navbarApi;
