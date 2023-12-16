import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {Mutex} from 'async-mutex';
import {RootState} from "../store";

const baseUrl = `${process.env.REACT_APP_API_URL}`;

const mutex = new Mutex();

const baseQuery = () => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, {getState}) => {
      const token = localStorage.getItem("accessToken")
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  });
}

export const customFetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // wait until the mutex is available without locking it
  await mutex.waitForUnlock();
  let result = await baseQuery()(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await fetchBaseQuery({
          baseUrl,
          prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.refreshToken
            if (token) {
              headers.set('authorization', `Bearer ${token}`)
            }
            return headers
          },
        })(
          { url: 'auth/refresh' },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const {refreshToken, accessToken} = refreshResult.data as {refreshToken: string, accessToken: string}
          if (refreshToken && accessToken) {
            localStorage.setItem("refreshToken", refreshToken)
            localStorage.setItem("accessToken", accessToken)
            result = await baseQuery()(args, api, extraOptions);
          }
        } else {
          // api.dispatch(logout());
          window.location.href = '/login';
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery()(args, api, extraOptions);
    }
  }

  return result;
};
