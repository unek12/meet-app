import {createApi} from '@reduxjs/toolkit/query/react'
import {customFetchBase} from "./customFetchBase";
import {User} from "../features/auth/authSlice";

interface UserResponse {
  user: User
  refreshToken: string
  accessToken: string
}

export interface LoginRequest {
  username: string
  password: string
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: customFetchBase,
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/signin',
        method: 'POST',
        body: credentials,
      }),
    }),
    registration: builder.mutation<UserResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/signup',
        method: 'POST',
        body: credentials,
      }),
    }),
    profile: builder.query<User, void>({
      query: () => ({
        url: 'auth/profile'
      }),
    }),
  }),
})

export const {
  useLoginMutation,
  useProfileQuery,
  useRegistrationMutation
} = authApi
