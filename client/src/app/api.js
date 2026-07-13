import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Inject access token from local state if available
    const token = getState().auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

// Wrapper to automatically handle token refresh rotation on expired 401 responses
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const errorData = result.error.data;
    if (errorData?.code === 'TOKEN_EXPIRED' || errorData?.message === 'Token expired') {
      // Try to get a new access token via refresh endpoint
      const refreshResult = await baseQuery({
        url: '/auth/refresh',
        method: 'POST'
      }, api, extraOptions);

      if (refreshResult.data?.success) {
        const { token, user } = refreshResult.data.data;
        // Dispatch setCredentials to save new tokens
        api.dispatch({ type: 'auth/setCredentials', payload: { token, user } });
        // Retry original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, clear credentials (logout)
        api.dispatch({ type: 'auth/logOut' });
      }
    }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Hospitals', 'Reviews', 'Favorites', 'Reports', 'AdminStats', 'AdminReviews', 'AdminReports'],
  endpoints: (builder) => ({
    // Auth & Profiles
    getPublicConfig: builder.query({
      query: () => '/public-config'
    }),
    registerUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials
      })
    }),
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      })
    }),
    getProfile: builder.query({
      query: () => '/auth/me'
    }),
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: profileData
      })
    }),

    // Hospital Discovery
    getNearbyHospitals: builder.query({
      query: (params) => ({
        url: '/hospitals/nearby',
        params
      }),
      providesTags: ['Hospitals']
    }),
    getHospitalDetails: builder.query({
      query: ({ source, hospitalId, lat, lng }) => ({
        url: `/hospitals/${source}/${hospitalId}`,
        params: { lat, lng }
      }),
      providesTags: (result, error, { hospitalId }) => [{ type: 'Hospitals', id: hospitalId }]
    }),
    submitReport: builder.mutation({
      query: ({ source, hospitalId, data }) => ({
        url: `/hospitals/${source}/${hospitalId}/report`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['AdminReports']
    }),

    // Reviews
    getReviews: builder.query({
      query: ({ source, hospitalId, sort }) => ({
        url: `/hospitals/${source}/${hospitalId}/reviews`,
        params: { sort }
      }),
      providesTags: ['Reviews']
    }),
    createReview: builder.mutation({
      query: ({ source, hospitalId, data }) => ({
        url: `/hospitals/${source}/${hospitalId}/reviews`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Reviews', 'Hospitals', 'AdminStats', 'AdminReviews']
    }),
    updateReview: builder.mutation({
      query: ({ reviewId, data }) => ({
        url: `/reviews/${reviewId}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Reviews', 'Hospitals', 'AdminReviews']
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Reviews', 'Hospitals', 'AdminStats', 'AdminReviews']
    }),
    reportReview: builder.mutation({
      query: ({ reviewId, message }) => ({
        url: `/reviews/${reviewId}/report`,
        method: 'POST',
        body: { message }
      }),
      invalidatesTags: ['AdminReports']
    }),

    // Favorites
    getFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites']
    }),
    addFavorite: builder.mutation({
      query: (favData) => ({
        url: '/favorites',
        method: 'POST',
        body: favData
      }),
      invalidatesTags: ['Favorites', 'AdminStats']
    }),
    removeFavorite: builder.mutation({
      query: ({ source, hospitalId }) => ({
        url: `/favorites/${source}/${hospitalId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Favorites', 'AdminStats']
    }),

    // Admin Dashboard
    getAdminStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['AdminStats']
    }),
    getAdminReports: builder.query({
      query: () => '/admin/reports',
      providesTags: ['AdminReports']
    }),
    updateReportStatus: builder.mutation({
      query: ({ reportId, status, adminNote }) => ({
        url: `/admin/reports/${reportId}`,
        method: 'PATCH',
        body: { status, adminNote }
      }),
      invalidatesTags: ['AdminReports', 'AdminStats']
    }),
    getAdminReviews: builder.query({
      query: () => '/admin/reviews',
      providesTags: ['AdminReviews']
    }),
    moderateReview: builder.mutation({
      query: ({ reviewId, status, moderationReason }) => ({
        url: `/admin/reviews/${reviewId}/moderate`,
        method: 'PATCH',
        body: { status, moderationReason }
      }),
      invalidatesTags: ['AdminReviews', 'Reviews', 'AdminStats', 'Hospitals']
    }),
    getAdminHospitalProfiles: builder.query({
      query: () => '/admin/hospital-profiles',
      providesTags: ['Hospitals']
    }),
    updateHospitalProfile: builder.mutation({
      query: ({ source, hospitalId, data }) => ({
        url: `/admin/hospital-profiles/${source}/${hospitalId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Hospitals', 'AdminStats']
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, isActive }) => ({
        url: `/admin/users/${userId}/status`,
        method: 'PATCH',
        body: { isActive }
      }),
      invalidatesTags: ['AdminStats']
    })
  })
});

export const {
  useGetPublicConfigQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetNearbyHospitalsQuery,
  useGetHospitalDetailsQuery,
  useSubmitReportMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useReportReviewMutation,
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useGetAdminStatsQuery,
  useGetAdminReportsQuery,
  useUpdateReportStatusMutation,
  useGetAdminReviewsQuery,
  useModerateReviewMutation,
  useGetAdminHospitalProfilesQuery,
  useUpdateHospitalProfileMutation,
  useUpdateUserStatusMutation
} = api;
