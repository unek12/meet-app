// import {createSlice} from '@reduxjs/toolkit'
// import type {PayloadAction} from '@reduxjs/toolkit'
// import type {User} from '../../services/auth'
// import type {RootState} from '../../store'
//
// type AuthState = {
//   user: User | null
//   refreshToken: string | null
//   accessToken: string | null
// }
//
// const slice = createSlice({
//   name: 'meet',
//   initialState: {} as {},
//   reducers: {
//     createMeet: (
//       undefined,
//       {payload: {user, refreshToken, accessToken}}: PayloadAction<{
//         user: User;
//         refreshToken: string,
//         accessToken: string
//       }>
//     ) => {
//       // state.user = user
//       // state.refreshToken = refreshToken
//       // state.refreshToken = accessToken
//       localStorage.setItem('refreshToken', refreshToken)
//       localStorage.setItem('accessToken', accessToken)
//     }
//   },
// })
//
// export const {createMeet, setUser} = slice.actions
//
// export default slice.reducer
//
// // export const selectCurrentUser = (state: RootState) => state.auth.user
