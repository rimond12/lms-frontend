/**
 * Category API - RTK Query endpoints
 * Handles all Category/Sub-Category CRUD operations and image uploads
 */

import baseApi from "../baseApi";
import type {
  ICategory,
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
  IReorderCategoryRequest,
  ICategoryQuery,
  ICategoryResponse,
  ICategoryListResponse,
  ICategoryHierarchyResponse,
} from "@/types/category";
import type { ICourse } from "@/types/course";

// Response type for paginated courses
interface ICategoryCourseResponse {
  success: boolean;
  message: string;
  data: ICourse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    categoryName: string;
    categorySlug: string;
  };
}

const CategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== PUBLIC QUERIES ====================

    /**
     * Get all categories with optional filters
     * Supports pagination, search, and filtering by parent/level/status
     */
    getCategories: builder.query<ICategoryListResponse, ICategoryQuery | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters) {
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
          if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);
          if (filters.parentId) params.append("parentId", filters.parentId);
          if (filters.level !== undefined) params.append("level", String(filters.level));
          if (filters.isActive !== undefined) params.append("isActive", String(filters.isActive));
          if (filters.sortBy) params.append("sortBy", filters.sortBy);
          if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        }

        const queryString = params.toString();
        return `/categories${queryString ? `?${queryString}` : ""}`;
      },
      transformResponse: (response: ICategoryListResponse) => response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: "Category" as const, id: _id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    /**
     * Get only main categories (level = 0)
     * Used for top-level navigation and filtering
     */
    getMainCategories: builder.query<ICategoryListResponse, void>({
      query: () => "/categories/main",
      transformResponse: (response: ICategoryListResponse) => response,
      providesTags: [{ type: "Category", id: "MAIN" }],
    }),

    /**
     * Get complete category hierarchy
     * Returns main categories with their sub-categories nested
     */
    getCategoryHierarchy: builder.query<ICategoryHierarchyResponse, void>({
      query: () => "/categories/hierarchy",
      transformResponse: (response: ICategoryHierarchyResponse) => response,
      providesTags: [{ type: "Category", id: "HIERARCHY" }],
    }),

    /**
     * Get category by ID
     */
    getCategoryById: builder.query<ICategoryResponse, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: ICategoryResponse) => response,
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    /**
     * Get category by slug
     * Useful for SEO-friendly URLs
     */
    getCategoryBySlug: builder.query<ICategoryResponse, string>({
      query: (slug) => `/categories/slug/${slug}`,
      transformResponse: (response: ICategoryResponse) => response,
      providesTags: (result) =>
        result?.data ? [{ type: "Category", id: result.data._id }] : [],
    }),

    /**
     * Get sub-categories of a parent category
     */
    getSubCategories: builder.query<ICategoryListResponse, string>({
      query: (parentId) => `/categories/${parentId}/sub-categories`,
      transformResponse: (response: ICategoryListResponse) => response,
      providesTags: (result, error, parentId) => [
        { type: "Category", id: `SUBS_${parentId}` },
      ],
    }),

    /**
     * Get courses by category ID with pagination
     */
    getCoursesByCategory: builder.query<
      ICategoryCourseResponse,
      { categoryId: string; page?: number; limit?: number; includeSubCategories?: boolean }
    >({
      query: ({ categoryId, page = 1, limit = 10, includeSubCategories = true }) => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        params.append("limit", String(limit));
        if (includeSubCategories) {
          params.append("includeSubCategories", "true");
        }
        return `/categories/${categoryId}/courses?${params.toString()}`;
      },
      transformResponse: (response: ICategoryCourseResponse) => response,
      providesTags: (result, error, { categoryId }) => [
        { type: "Category", id: `COURSES_${categoryId}` },
        { type: "Course", id: "LIST" },
      ],
    }),

    // ==================== ADMIN MUTATIONS ====================

    /**
     * Get ALL categories (including inactive) - Admin only
     * Returns hierarchical structure with all categories
     */
    getAllCategoriesAdmin: builder.query<ICategoryHierarchyResponse, void>({
      query: () => "/categories/admin/all",
      transformResponse: (response: ICategoryHierarchyResponse) => response,
      providesTags: [{ type: "Category", id: "ADMIN_ALL" }],
    }),

    /**
     * Create new category
     * Admin only - requires authentication
     */
    createCategory: builder.mutation<ICategoryResponse, ICreateCategoryRequest>({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ICategoryResponse) => response,
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "MAIN" },
        { type: "Category", id: "HIERARCHY" },
        { type: "Category", id: "ADMIN_ALL" },
      ],
    }),

    /**
     * Update category by ID
     * Admin only - requires authentication
     */
    updateCategory: builder.mutation<
      ICategoryResponse,
      { id: string; data: IUpdateCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (response: ICategoryResponse) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "MAIN" },
        { type: "Category", id: "HIERARCHY" },
        { type: "Category", id: "ADMIN_ALL" },
      ],
    }),

    /**
     * Delete category by ID
     * Admin only - requires authentication
     * Will fail if category has sub-categories or courses
     */
    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "MAIN" },
        { type: "Category", id: "HIERARCHY" },
        { type: "Category", id: "ADMIN_ALL" },
      ],
    }),

    /**
     * Upload category photo
     * Admin only - uses FormData for file upload
     */
    uploadCategoryPhoto: builder.mutation<
      { success: boolean; message: string; data: { photoUrl: string } },
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("photo", file);
        return {
          url: `/categories/${id}/photo`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "HIERARCHY" },
        { type: "Category", id: "ADMIN_ALL" },
      ],
    }),

    /**
     * Reorder categories (change order/parent)
     * Admin only - used for drag-and-drop reordering
     */
    reorderCategories: builder.mutation<
      { success: boolean; message: string },
      IReorderCategoryRequest
    >({
      query: (payload) => ({
        url: "/categories/reorder",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "MAIN" },
        { type: "Category", id: "HIERARCHY" },
        { type: "Category", id: "ADMIN_ALL" },
      ],
    }),

    /**
     * Toggle category active status
     * Admin only - quick toggle without full update
     */
    toggleCategoryStatus: builder.mutation<
      ICategoryResponse,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/categories/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (response: ICategoryResponse) => response,
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
        { type: "Category", id: "HIERARCHY" },        { type: "Category", id: "ADMIN_ALL" },      ],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  // Public queries
  useGetCategoriesQuery,
  useGetMainCategoriesQuery,
  useGetCategoryHierarchyQuery,
  useGetCategoryByIdQuery,
  useGetCategoryBySlugQuery,
  useGetSubCategoriesQuery,
  useGetCoursesByCategoryQuery,
  // Lazy queries for programmatic fetching
  useLazyGetCategoriesQuery,
  useLazyGetCategoryByIdQuery,
  useLazyGetCategoryBySlugQuery,
  useLazyGetSubCategoriesQuery,
  useLazyGetCoursesByCategoryQuery,
  // Admin queries
  useGetAllCategoriesAdminQuery,
  // Admin mutations
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryPhotoMutation,
  useReorderCategoriesMutation,
  useToggleCategoryStatusMutation,
} = CategoryApi;

export default CategoryApi;
