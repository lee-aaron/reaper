import { createAction } from '@reduxjs/toolkit'

export interface Credentials {
  email: string;
  password: string;
}

export interface User {
  token: string;
}

export const loginAuthentication = createAction<{credentials: Credentials}>("auth/login");

export const userAuthentication = createAction<{user: User}>("auth/user");

export const logoutAuthentication = createAction("auth/logout");

export const failedAuthentication = createAction("auth/fail");