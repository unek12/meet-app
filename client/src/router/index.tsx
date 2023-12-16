import {createBrowserRouter} from "react-router-dom";
import {AuthWrapper} from "./authWrapper";
import React from "react";
import {Registration} from "../features/auth/Registration";
import {Login} from "../features/auth/Login";
import {Profile} from "../features/profile/Profile";
import {Home} from "../features/home/Home";
import Meet from "../features/meet/Meet";
import JoiningRoom from "../features/meet/JoiningRoom";
import AdminPanel from "../features/admin/AdminPanel";

export const router = createBrowserRouter([
  {
    path: '/meet/:id',
    element:
    <AuthWrapper>
      <JoiningRoom>

      </JoiningRoom>
    </AuthWrapper>
  },
  {
    path: '/profile',
    element: <AuthWrapper><Profile/></AuthWrapper>,
  },
  {
    path: '/',
    element: <AuthWrapper><Home/></AuthWrapper>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/singup',
    element: <Registration/>
  },
  {
    path: '/admin',
    element: <AuthWrapper><AdminPanel/></AuthWrapper>
  }
])
