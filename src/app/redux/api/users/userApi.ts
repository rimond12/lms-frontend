import baseApi from "../baseApi";
import Cookies from "js-cookie";
import { updateTokensFromResponse } from "@/app/[locale]/@auth/AuthService";


export const UserApi = baseApi.injectEndpoints({

endpoints: (builder)=>({

    getAllUsers: builder.query({
        query: () => ({
          url: `/users`,
          method: "GET",
        }),
        providesTags: ["User"],
      }), 

    // Search users by email, name, or phone (for admin use)
    searchUsers: builder.query<any, { searchTerm: string; limit?: number }>({
      query: ({ searchTerm, limit = 20 }) => ({
        url: `/users/search`,
        method: "GET",
        params: { q: searchTerm, limit },
      }),
      providesTags: ["User"],
    }), 

      getMe: builder.query({
        query: () => ({
          url: `/auth/me`,
          method: "GET",
        }),
        providesTags: ["User"],
      }),

      updateMyProfile: builder.mutation({
        query: (userData) => {
          // Check if data is FormData
          const isFormData = userData.data instanceof FormData;
          
          return {
            url: `/users/${userData.id}`,
            method: "PUT",
            body: userData.data,
            // Don't set Content-Type for FormData, let browser set it
            headers: isFormData ? {} : undefined,
          };
        },
        invalidatesTags: ["User"],
        async onQueryStarted(arg, { queryFulfilled, dispatch }) {
          try {
            const { data } = await queryFulfilled;
            // If response includes a new token, update cookies
            if (data.data?.accessToken) {
              await updateTokensFromResponse(data);
            }
          } catch (error: any) {
            // Log detailed error information
            console.error('Profile update error in onQueryStarted:', {
              message: error?.message || 'Unknown error',
              status: error?.status,
              statusText: error?.statusText,
              data: error?.data,
              originalError: error
            });
            // Don't re-throw the error, just log it
            // The error will still be available to the component
          }
        },
      }),

      uploadProfilePhoto: builder.mutation({
        query: ({ userId, formData }) => ({
          url: `/users/${userId}/upload-profile-photo`,
          method: "POST",
          body: formData,
        }),
        invalidatesTags: ["User"],
      }),
      
        createUsers: builder.mutation({
            query: (eventData) => ({
              url: "/users",
              method: "POST",
              body: eventData,
            }),
            invalidatesTags: ["User"],
          }), 
    
    
    
          updateusers: builder.mutation({
            query: ({ id, usersData }) => ({
              url: `/users/${id}`,
              method: "PUT",
              body: usersData,
            }),
            invalidatesTags: ["User"],
          }), 
      
          deleteusers: builder.mutation({
            query: (id) => ({
              url: `/users/${id}`,
              method: "DELETE",
            }),
            invalidatesTags: ["User"],
          }),

        // // Make Base Member
        // makeBaseMember: builder.mutation({
        //   query: ({ id, membershipData }) => ({
        //     url: `/users/${id}/make-base-member`,
        //     method: "PATCH",
        //     body: membershipData,
        //   }),
        //   invalidatesTags: ["User"],
        // }),

        // Remove Base Member
        removeBaseMember: builder.mutation({
          query: (id) => ({
            url: `/users/${id}/remove-base-member`,
            method: "PATCH",
          }),
          invalidatesTags: ["User"],
        }),
    
})


})
export const {
    useGetAllUsersQuery,
    useSearchUsersQuery,
    useLazySearchUsersQuery,
    useGetMeQuery,
    useUpdateMyProfileMutation,
    useUploadProfilePhotoMutation,
    useCreateUsersMutation, 
    useUpdateusersMutation,  
    useDeleteusersMutation,
    // useMakeBaseMemberMutation,
    useRemoveBaseMemberMutation
  } = UserApi;