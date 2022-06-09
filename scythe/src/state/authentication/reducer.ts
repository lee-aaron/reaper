import { createReducer } from "@reduxjs/toolkit";
import { loginRequest, logoutRequest } from "./actions";

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
    .addCase(loginRequest.pending, (state) => {
      state.status = AuthStatus.PENDING;
    })
    .addCase(loginRequest.fulfilled, (state) => {
      if (state.status === AuthStatus.PENDING) {
        state.status = AuthStatus.LOGGED_IN;
        state.isAuthenticated = true;
      }
    })
    .addCase(loginRequest.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.status = AuthStatus.FAILED;
        state.isAuthenticated = false;
      }
    })
    .addCase(logoutRequest.pending, (state) => {
      state.status = AuthStatus.PENDING;
    })
    .addCase(logoutRequest.fulfilled, (state) => {
      if (state.status === AuthStatus.PENDING) {
        state.status = AuthStatus.LOGGED_OUT;
        state.isAuthenticated = false;
      }
    })
    .addCase(logoutRequest.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.status = AuthStatus.FAILED;
        state.isAuthenticated = true;
      }
    });
});
