import {createApi} from '@reduxjs/toolkit/query/react'
import {customFetchBase} from "./customFetchBase";
import {User} from "../features/auth/authSlice";

export interface UpdateUserRequest {
  username: string
  name: string
  avatar: string
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: customFetchBase,
  endpoints: (builder) => ({
    getUsers: builder.query<any, { page: number, take: number }>({
      query: (options) => ({
        url: `users`,
        params: options,
        method: 'GET'
      }),
    }),
    userUpdate: builder.mutation<User, UpdateUserRequest>({
      query: (userData) => ({
        url: 'users',
        method: 'PATCH',
        body: userData,
      }),
    }),
  }),
})

export const {
  useUserUpdateMutation,
  useGetUsersQuery
} = userApi
