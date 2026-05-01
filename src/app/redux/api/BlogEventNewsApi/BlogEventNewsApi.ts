import baseApi from "../baseApi";
import { BlogEventNewsResponse, RelatedContentResponse } from "@/types/blogEventNews";

const BlogEventNewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<any, { category?: 'blog' | 'news' | 'event' } | void>({
      query: (arg) => {
        const params = arg?.category ? `?category=${arg.category}` : '';
        return `/blog-event-news${params}`;
      },
      providesTags: ['BlogEventNews'],
    }),
    getItemById: builder.query<any, string>({
      query: (id) => `/blog-event-news/${id}`,
      providesTags: ['BlogEventNews'],
    }),
    getItemBySlug: builder.query<BlogEventNewsResponse, string>({
      query: (slug) => `/blog-event-news/slug/${slug}`,
      providesTags: ['BlogEventNews'],
    }),
    createItem: builder.mutation<any, any>({
      query: (payload) => ({
        url: '/blog-event-news',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['BlogEventNews'],
    }),
    updateItem: builder.mutation<any, { id: string } & Record<string, any>>({
      query: ({ id, ...patch }) => ({
        url: `/blog-event-news/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['BlogEventNews'],
    }),
    deleteItem: builder.mutation<any, string>({
      query: (id) => ({
        url: `/blog-event-news/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BlogEventNews'],
    }),
    getRelatedItems: builder.query<RelatedContentResponse, { category: string; currentId: string; limit?: number }>({
      query: ({ category, currentId, limit = 6 }) => 
        `/blog-event-news/related?category=${category}&exclude=${currentId}&limit=${limit}`,
      providesTags: ['BlogEventNews'],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemByIdQuery,
  useGetItemBySlugQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useGetRelatedItemsQuery,
} = BlogEventNewsApi;
