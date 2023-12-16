import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import {RootState} from '../store'
import {customFetchBase} from "./customFetchBase";

export interface Profile {
  first_name: string
  last_name: string
}

export interface ProfileResponse {
  profile: Profile
}

export const profileApi = createApi({
  baseQuery: customFetchBase,
  endpoints: (builder) => ({
    profile: builder.query<ProfileResponse, undefined>({
      query: (credentials) => ({
        url: 'auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
})

export const {
  useProfileQuery
} = profileApi
