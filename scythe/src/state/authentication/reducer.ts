import { createReducer } from "@reduxjs/toolkit";
import { loginAuthentication, logoutAuthentication } from "./actions";

export enum AuthStatus {
  LOGGED_IN,
  LOGGED_OUT,
  FAILED,
  PENDING,
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  status: AuthStatus;
}

export const initialState: AuthenticationState = {
  isAuthenticated: false,
  status: AuthStatus.LOGGED_OUT,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(loginAuthentication, (state) => {
      state.isAuthenticated = true;
      state.status = AuthStatus.LOGGED_IN;
    })
    .addCase(logoutAuthentication, (state) => {
      state.isAuthenticated = false;
      state.status = AuthStatus.LOGGED_OUT;
    });
});
