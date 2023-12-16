import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../services/auth'
import authReducer from '../features/auth/authSlice'
import {meetApi} from "../services/meet";
import {userApi} from "../services/user";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [meetApi.reducerPath]: meetApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    auth: authReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, meetApi.middleware, userApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
