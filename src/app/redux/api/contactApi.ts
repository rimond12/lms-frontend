import baseApi from "./baseApi";

export const ContactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all active contact items
    getAllContacts: builder.query({
      query: () => ({
        url: "/contact",
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),

    // Get contact items by category
    getContactsByCategory: builder.query({
      query: (category) => ({
        url: `/contact/category/${category}`,
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),

    // Get contact item by ID
    getContactById: builder.query({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),

    // Get all contact items for admin (including inactive)
    getAllContactsAdmin: builder.query({
      query: () => ({
        url: "/contact/admin/all",
        method: "GET",
      }),
      providesTags: ["Contact"],
    }),

    // Create a new contact item
    createContact: builder.mutation({
      query: (contactData) => ({
        url: "/contact",
        method: "POST",
        body: contactData,
      }),
      invalidatesTags: ["Contact"],
    }),

    // Update a contact item
    updateContact: builder.mutation({
      query: ({ id, contactData }) => ({
        url: `/contact/${id}`,
        method: "PUT",
        body: contactData,
      }),
      invalidatesTags: ["Contact"],
    }),

    // Delete a contact item
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),

    // Bulk update contact order
    updateContactOrder: builder.mutation({
      query: (updates) => ({
        url: "/contact/order/bulk",
        method: "PUT",
        body: { updates },
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useGetContactsByCategoryQuery,
  useGetContactByIdQuery,
  useGetAllContactsAdminQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  useUpdateContactOrderMutation,
} = ContactApi;
