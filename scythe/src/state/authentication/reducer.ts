import { createReducer } from "@reduxjs/toolkit";
import { loginAuthentication, loginRequest, logoutAuthentication, logoutRequest } from "./actions";

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
    })
    .addCase(loginRequest.pending, (state) => {
      state.status = AuthStatus.PENDING;
    })
    .addCase(loginRequest.fulfilled, (state) => {
      state.status = AuthStatus.LOGGED_IN;
      state.isAuthenticated = true;
    })
    .addCase(loginRequest.rejected, (state) => {
      state.status = AuthStatus.FAILED;
      state.isAuthenticated = false;
    })
    .addCase(logoutRequest.pending, (state) => {
      state.status = AuthStatus.PENDING;
    })
    .addCase(logoutRequest.fulfilled, (state) => {
      state.status = AuthStatus.LOGGED_OUT;
      state.isAuthenticated = false;
    })
    .addCase(logoutRequest.rejected, (state) => {
      state.status = AuthStatus.FAILED;
      state.isAuthenticated = true;
    })
});
