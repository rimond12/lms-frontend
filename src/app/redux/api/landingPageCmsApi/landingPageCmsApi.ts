import baseApi from "../baseApi";

export interface IHeroSlide {
  image: string;
  altText?: string;
}

export interface IHeroCourseItem {
  name: string;
  sub: string;
  iconKey: string;
}

export interface IStatItem {
  end: number;
  suffix: string;
  label: string;
  icon: string;
}

export interface IServiceItem {
  title: string;
  description: string;
}

export interface IOurServiceItem {
  title: string;
  desc: string;
}

export interface ITrainingPoint {
  title: string;
  description: string;
}

export interface IPartnerLogo {
  name: string;
  img: string;
}

export interface ILandingPageCMS {
  _id: string;
  hero: {
    bannerSlides: IHeroSlide[];
    headline: string;
    sub: string;
    courses: IHeroCourseItem[];
  };
  stats: {
    items: IStatItem[];
  };
  services: {
    badge: string;
    heading1: string;
    heading2: string;
    items: IServiceItem[];
  };
  ourServices: {
    headingPrefix: string;
    headingHighlight: string;
    items: IOurServiceItem[];
  };
  trainingSection: {
    badge: string;
    heading1: string;
    heading2: string;
    subheading: string;
    points: ITrainingPoint[];
    mainCard: { title: string; description: string; button: string };
    cards: { title: string; description: string }[];
  };
  ourJourney: {
    title: string;
    subtitle: string;
    row1: IPartnerLogo[];
    row2: IPartnerLogo[];
    row3: IPartnerLogo[];
  };
  joinInstructor: {
    title: string;
    brand: string;
    subtitle: string;
    bannerImage: string;
    bannerTitle: string;
    lookingFor: string[];
    infoTitle: string;
    infoDesc: string;
    email: string;
    phone: string;
  };
  applySection: {
    badge: string;
    heading: string;
    headingHighlight: string;
    subheading: string;
    features: { title: string; desc: string }[];
  };
  successStories: {
    heading: string;
    headingHighlight: string;
    subheading: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type CmsResponse = { success: boolean; message: string; data: ILandingPageCMS };

const landingPageCmsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPageCms: builder.query<CmsResponse, void>({
      query: () => "/landing-page-cms",
      providesTags: ["LandingPageCMS"],
    }),
    updateLandingPageCms: builder.mutation<CmsResponse, Partial<ILandingPageCMS>>({
      query: (payload) => ({
        url: "/landing-page-cms",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["LandingPageCMS"],
    }),
    updateLandingPageCmsSection: builder.mutation<
      CmsResponse,
      { section: string; data: Record<string, unknown> }
    >({
      query: ({ section, data }) => ({
        url: `/landing-page-cms/section/${section}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["LandingPageCMS"],
    }),
    uploadLandingPageCmsImage: builder.mutation<
      { success: boolean; message: string; data: { imagePath: string } },
      FormData
    >({
      query: (formData) => ({
        url: "/landing-page-cms/upload-image",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetLandingPageCmsQuery,
  useUpdateLandingPageCmsMutation,
  useUpdateLandingPageCmsSectionMutation,
  useUploadLandingPageCmsImageMutation,
} = landingPageCmsApi;
