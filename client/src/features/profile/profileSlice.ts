import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import type {RootState} from '../../store'
import {Profile} from "../../services/profile";

type ProfileState = {
  profile: Profile | null
}

const slice = createSlice({
  name: 'auth',
  initialState: {
    profile: null,
  } as ProfileState,
  reducers: {
    setProfile: (
      state,
      {payload: {profile}}: PayloadAction<{
        profile: Profile
      }>
    ) => {
      state.profile = profile
    },
  },
})

export const {setProfile} = slice.actions

export default slice.reducer

// export const selectCurrentUser = (state: RootState) => state.auth.user
