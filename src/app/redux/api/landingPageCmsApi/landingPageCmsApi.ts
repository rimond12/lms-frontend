import baseApi from "../baseApi";

export interface IHeroSlide {
  image: string;
  altText?: string;
}

export interface IHeroCourseItem {
  name: string;
  sub: string;
  iconKey: string;
  nameBn?: string;
  subBn?: string;
}

export interface IStatItem {
  end: number;
  suffix: string;
  label: string;
  labelBn?: string;
  icon: string;
}

export interface IServiceItem {
  title: string;
  description: string;
  titleBn?: string;
  descriptionBn?: string;
}

export interface IOurServiceItem {
  title: string;
  desc: string;
  titleBn?: string;
  descBn?: string;
}

export interface ITrainingPoint {
  title: string;
  description: string;
  titleBn?: string;
  descriptionBn?: string;
}

export interface IPartnerLogo {
  name: string;
  img: string;
}

export interface IImmigrantJobFeature {
  title: string;
  description: string;
  titleBn?: string;
  descriptionBn?: string;
}

export interface IImmigrantJobType {
  type: string;
  count: string;
  description: string;
  typeBn?: string;
  descriptionBn?: string;
}

export interface IOfflineCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  bannerImage: string;
  duration: string;
  level: string;
  tags: string[];
  price: number;
  discountedPrice: number;
  location: string;
  timing: string;
  startDate: string;
  tools: string[];
}

export interface ILandingPageCMS {
  _id: string;
  hero: {
    bannerSlides: IHeroSlide[];
    headline: string;
    headlineBn?: string;
    sub: string;
    subBn?: string;
    courses: IHeroCourseItem[];
  };
  stats: {
    items: IStatItem[];
  };
  services: {
    badge: string;
    badgeBn?: string;
    heading1: string;
    heading1Bn?: string;
    heading2: string;
    heading2Bn?: string;
    items: IServiceItem[];
  };
  ourServices: {
    headingPrefix: string;
    headingPrefixBn?: string;
    headingHighlight: string;
    headingHighlightBn?: string;
    items: IOurServiceItem[];
  };
  trainingSection: {
    badge: string;
    badgeBn?: string;
    heading1: string;
    heading1Bn?: string;
    heading2: string;
    heading2Bn?: string;
    subheading: string;
    subheadingBn?: string;
    points: ITrainingPoint[];
    mainCard: { title: string; description: string; button: string; titleBn?: string; descriptionBn?: string; buttonBn?: string };
    cards: { title: string; description: string; titleBn?: string; descriptionBn?: string }[];
  };
  ourJourney: {
    title: string;
    titleBn?: string;
    subtitle: string;
    subtitleBn?: string;
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
    badgeBn?: string;
    heading: string;
    headingBn?: string;
    headingHighlight: string;
    headingHighlightBn?: string;
    subheading: string;
    subheadingBn?: string;
    features: { title: string; desc: string; titleBn?: string; descBn?: string }[];
  };
  successStories: {
    heading: string;
    headingBn?: string;
    headingHighlight: string;
    headingHighlightBn?: string;
    subheading: string;
    subheadingBn?: string;
    shareHeading: string;
    shareHeadingBn?: string;
    shareSubheading: string;
    shareSubheadingBn?: string;
    shareSubmitBtn: string;
    shareSubmitBtnBn?: string;
    shareNominateBtn: string;
    shareNominateBtnBn?: string;
    shareProcessBtn: string;
    shareProcessBtnBn?: string;
  };
  immigrantJobsSection: {
    badge: string;
    badgeBn?: string;
    heading: string;
    headingBn?: string;
    subheading: string;
    subheadingBn?: string;
    whyChooseTitle: string;
    whyChooseTitleBn?: string;
    features: IImmigrantJobFeature[];
    featuredTitle: string;
    featuredTitleBn?: string;
    liveBadge: string;
    liveBadgeBn?: string;
    listingsSubtext: string;
    listingsSubtextBn?: string;
    whyUsBadge: string;
    whyUsBadgeBn?: string;
    whyUsSubtext: string;
    whyUsSubtextBn?: string;
    browseAllText: string;
    browseAllTextBn?: string;
    viewAllJobs: string;
    viewAllJobsBn?: string;
    moreListings: string;
    moreListingsBn?: string;
    employmentTitle: string;
    employmentTitleBn?: string;
    jobTypes: IImmigrantJobType[];
    ctaBadge: string;
    ctaBadgeBn?: string;
    ctaHeading: string;
    ctaHeadingBn?: string;
    ctaSubheading: string;
    ctaSubheadingBn?: string;
    ctaButton: string;
    ctaButtonBn?: string;
  };
  popularCourses: {
    headingPrefix: string;
    headingPrefixBn?: string;
    headingHighlight: string;
    headingHighlightBn?: string;
    seeAllText: string;
    seeAllTextBn?: string;
  };
  courseModules: {
    titlePrefix: string;
    titlePrefixBn?: string;
    titleHighlight: string;
    titleHighlightBn?: string;
    subtitle: string;
    subtitleBn?: string;
    technicalTab: string;
    technicalTabBn?: string;
    languageTab: string;
    languageTabBn?: string;
    detailsLink: string;
    detailsLinkBn?: string;
    offlineCourses: IOfflineCourse[];
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
