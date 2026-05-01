import baseApi from "../baseApi";

export interface IJobExperience {
  organization: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface IAcademicQualification {
  degree: string;
  field: string;
  institution: string;
  passingYear: number;
  grade?: string;
}

export interface IExpert {
  _id: string;
  photoUrl?: string;
  name: string;
  slugUrl: string;
  designation: string;
  institution: string;
  specialization: string;
  bio: string;
  shortBio?: string;
  jobExperiences: IJobExperience[];
  academicQualifications: IAcademicQualification[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  achievements?: string[];
  publications?: string[];
  // About Us Page Fields
  category?: string;
  isPinned?: boolean;
  pinOrder?: number;
  isActive?: boolean;
  showOnAboutPage?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IExpertInput {
  name: string;
  slugUrl?: string;
  designation: string;
  institution: string;
  specialization: string;
  bio: string;
  shortBio?: string;
  jobExperiences: IJobExperience[];
  academicQualifications: IAcademicQualification[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  achievements?: string[];
  publications?: string[];
  category?: string;
  isPinned?: boolean;
  pinOrder?: number;
  isActive?: boolean;
  showOnAboutPage?: boolean;
}

// About Us Category Interface
export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// About Us Content Interface
export interface IAboutUsContent {
  _id: string;
  title: string;
  description: string;
  mission?: string;
  vision?: string;
  coreValues?: string[];
  additionalSections?: { title: string; content: string }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Experts grouped by category
export interface IExpertsByCategory {
  [category: string]: IExpert[];
}

const expertApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExperts: builder.query<{ data: IExpert[]; meta: any }, { page?: number; limit?: number; searchTerm?: string; specialization?: string }>({
      query: ({ page = 1, limit = 10, searchTerm, specialization }) => {
        let query = `expart-panel?page=${page}&limit=${limit}`;
        if (searchTerm) query += `&searchTerm=${searchTerm}`;
        if (specialization) query += `&specialization=${specialization}`;
        return query;
      },
      providesTags: [{ type: 'Expert', id: 'LIST' }],
    }),
    
    getExpertById: builder.query<{ data: IExpert }, string>({
      query: (id) => `expart-panel/${id}`,
      providesTags: (result, error, id) => [{ type: 'Expert', id }],
    }),
    
    getExpertBySlug: builder.query<{ data: IExpert }, string>({
      query: (slug) => `expart-panel/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Expert', id: slug }],
    }),
    
    createExpert: builder.mutation<{ data: IExpert }, FormData>({
      query: (formData) => ({
        url: 'expart-panel',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Expert', id: 'LIST' }],
    }),
    
    updateExpertPanelMember: builder.mutation<{ data: IExpert }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `expart-panel/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Expert', id },
        { type: 'Expert', id: 'LIST' }
      ],
    }),
    
    deleteExpertPanelMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `expart-panel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Expert', id: 'LIST' }],
    }),

    // ============= About Us Page Specific Endpoints =============
    
    // Get experts for About Us page (grouped by category)
    getExpertsForAboutPage: builder.query<{ data: IExpertsByCategory }, void>({
      query: () => 'expart-panel/about-us/all',
      providesTags: [{ type: 'Expert', id: 'ABOUT_US' }],
    }),

    // Get About Us categories
    getAboutUsCategories: builder.query<{ data: ICategory[] }, boolean | void>({
      query: (activeOnly = false) => `about-us/categories?activeOnly=${activeOnly}`,
      providesTags: ['Category'],
    }),

    // Get active About Us content
    getActiveAboutUsContent: builder.query<{ data: IAboutUsContent }, void>({
      query: () => 'about-us/content/active',
      providesTags: ['AboutUsContent'],
    }),

    // Toggle expert pin status
    toggleExpertPin: builder.mutation<{ data: IExpert }, { id: string; isPinned: boolean; pinOrder?: number }>({
      query: ({ id, isPinned, pinOrder }) => ({
        url: `expart-panel/${id}/pin`,
        method: 'PATCH',
        body: { isPinned, pinOrder },
      }),
      invalidatesTags: [{ type: 'Expert', id: 'LIST' }, { type: 'Expert', id: 'ABOUT_US' }],
    }),

    // Update expert category
    updateExpertCategory: builder.mutation<{ data: IExpert }, { id: string; category: string }>({
      query: ({ id, category }) => ({
        url: `expart-panel/${id}/category`,
        method: 'PATCH',
        body: { category },
      }),
      invalidatesTags: [{ type: 'Expert', id: 'LIST' }, { type: 'Expert', id: 'ABOUT_US' }],
    }),

    // Toggle show on About page
    toggleShowOnAboutPage: builder.mutation<{ data: IExpert }, { id: string; showOnAboutPage: boolean }>({
      query: ({ id, showOnAboutPage }) => ({
        url: `expart-panel/${id}/toggle-about-page`,
        method: 'PATCH',
        body: { showOnAboutPage },
      }),
      invalidatesTags: [{ type: 'Expert', id: 'LIST' }, { type: 'Expert', id: 'ABOUT_US' }],
    }),

    // ============= Category CRUD Endpoints =============
    
    // Create category
    createCategory: builder.mutation<{ data: ICategory }, { name: string; slug?: string; description?: string; order?: number; isActive?: boolean }>({
      query: (data) => ({
        url: 'about-us/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    // Update category
    updateCategory: builder.mutation<{ data: ICategory }, { id: string; data: Partial<{ name: string; slug: string; description: string; order: number; isActive: boolean }> }>({
      query: ({ id, data }) => ({
        url: `about-us/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    // Delete category
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `about-us/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    // Reorder categories
    reorderCategories: builder.mutation<void, { categoryOrders: { id: string; order: number }[] }>({
      query: (data) => ({
        url: 'about-us/categories/reorder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),

    // ============= About Us Content CRUD Endpoints =============
    
    // Create About Us content
    createAboutUsContent: builder.mutation<{ data: IAboutUsContent }, Partial<IAboutUsContent>>({
      query: (data) => ({
        url: 'about-us/content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AboutUsContent'],
    }),

    // Get all About Us content
    getAllAboutUsContent: builder.query<{ data: IAboutUsContent[] }, void>({
      query: () => 'about-us/content/all',
      providesTags: ['AboutUsContent'],
    }),

    // Update About Us content
    updateAboutUsContent: builder.mutation<{ data: IAboutUsContent }, { id: string; data: Partial<IAboutUsContent> }>({
      query: ({ id, data }) => ({
        url: `about-us/content/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['AboutUsContent'],
    }),

    // Delete About Us content
    deleteAboutUsContent: builder.mutation<void, string>({
      query: (id) => ({
        url: `about-us/content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AboutUsContent'],
    }),
  }),
});

export const {
  useGetExpertsQuery,
  useGetExpertByIdQuery,
  useGetExpertBySlugQuery,
  useCreateExpertMutation,
  useUpdateExpertPanelMemberMutation,
  useDeleteExpertPanelMemberMutation,
  // About Us specific hooks
  useGetExpertsForAboutPageQuery,
  useGetAboutUsCategoriesQuery,
  useGetActiveAboutUsContentQuery,
  useToggleExpertPinMutation,
  useUpdateExpertCategoryMutation,
  useToggleShowOnAboutPageMutation,
  // Category CRUD hooks
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
  // About Us Content CRUD hooks
  useCreateAboutUsContentMutation,
  useGetAllAboutUsContentQuery,
  useUpdateAboutUsContentMutation,
  useDeleteAboutUsContentMutation,
} = expertApi;


