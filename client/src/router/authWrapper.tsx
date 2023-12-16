import React, {FC, useEffect} from "react";
import {useDispatch} from "react-redux";
import {useProfileQuery} from "../services/auth";
import {setUser} from "../features/auth/authSlice";
import {useAuth} from "../hooks/useAuth";

type Props = {
  children?: React.ReactNode
};

export const AuthWrapper: FC<Props> = ({children}) => {
  const dispatch = useDispatch()
  const {data, isLoading} = useProfileQuery()
  const user = useAuth()
  useEffect(() => {
    if (data) {
      dispatch(setUser(data))
    }
  }, [data, user]);

  if (isLoading) {
    return <p>loading</p>
  }

  if (user) {
    console.log(user)
    return <>{children}</>
  }

  return <>user not found</>
};