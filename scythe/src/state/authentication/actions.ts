import { createAction } from '@reduxjs/toolkit'

export const loginAuthentication = createAction("auth/login");

export const logoutAuthentication = createAction("auth/logout");