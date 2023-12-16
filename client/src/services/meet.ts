import {createApi} from '@reduxjs/toolkit/query/react'
import {customFetchBase} from "./customFetchBase";

export interface UserResponse {
  // user: User
  refreshToken: string
  accessToken: string
}

export interface MeetRequest {
  title: string
}

export const meetApi = createApi({
  reducerPath: 'meetApi',
  baseQuery: customFetchBase,
  endpoints: (builder) => ({
    createMeeting: builder.mutation<any, MeetRequest>({
      query: (credentials) => ({
        url: 'meet',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMeeting: builder.query<any, any>({
      query: (credentials) => ({
        url: `meet/${credentials}`,
        method: 'GET'
      }),
    }),
    getMeetings: builder.query<any, { page: number, take: number }>({
      query: (options) => ({
        url: `meet`,
        params: options,
        method: 'GET'
      }),
    }),
    getMeetingsForUser: builder.query<any, any>({
      query: (options) => ({
        url: `meet/user/${options.userId}`,
        params: options,
        method: 'GET'
        // body: credentials,
      }),
    }),
    getMeetingsStats: builder.query<any, { interval: string }>({
      query: (options) => ({
        url: `meet/stats`,
        params: options,
        method: 'GET'
      }),
    }),
    getMessages: builder.query<any, any>({
      query: (credentials) => ({
        url: 'meet/messages',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
})

export const {
  useCreateMeetingMutation,
  useGetMessagesQuery,
  useGetMeetingQuery,
  useGetMeetingsQuery,
  useGetMeetingsStatsQuery,
  useGetMeetingsForUserQuery
} = meetApi
