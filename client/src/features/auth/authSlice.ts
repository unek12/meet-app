import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '../../store'
import {userApi} from "../../services/user";

export interface User {
  id: string
  username: string
  avatar: string
  name: string
}

type AuthState = {
  user: User | null
  refreshToken: string | null
  accessToken: string | null
}

const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    refreshToken: localStorage.getItem('refreshToken'),
    accessToken: localStorage.getItem('accessToken')
  } as AuthState,
  reducers: {
    setCredentials: (
      state,
      {payload: {user, refreshToken, accessToken}}: PayloadAction<{
        user: User;
        refreshToken: string,
        accessToken: string
      }>
    ) => {
      state.user = user
      state.refreshToken = refreshToken
      state.refreshToken = accessToken
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('accessToken', accessToken)
    },

    setUser: (
      state,
      {payload: user}: PayloadAction<User>
    ) => {
      state.user = user
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints?.userUpdate.matchFulfilled,
      (state, {payload}) => {
        state.user = payload
      }
    )
  }
})

export const {setCredentials, setUser} = slice.actions

export default slice.reducer

export const selectCurrentUser = (state: RootState) => state.auth.user
