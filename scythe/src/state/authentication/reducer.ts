import { createReducer } from "@reduxjs/toolkit";
import {
  loginAuthentication,
  logoutAuthentication,
  failedAuthentication,
  userAuthentication,
} from "./actions";

export enum AuthStatus {
  LOGGED_IN,
  LOGGED_OUT,
  FAILED,
  PENDING
}

export interface AuthenticationState {
  isAuthenticated: boolean;
  status: AuthStatus;
  code: string;
  token: string;
}

export const initialState: AuthenticationState = {
  isAuthenticated: false,
  code: "",
  token: "",
  status: AuthStatus.LOGGED_OUT,
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(
      loginAuthentication,
      (state, { payload: { credentials: Credentials } }) => {
        state.isAuthenticated = false;
        state.code = Credentials.code;
        state.status = AuthStatus.PENDING;
      }
    )
    .addCase(userAuthentication, (state, { payload : { user: User }}) => {
      state.isAuthenticated = true;
      state.token = User.token;
      state.status = AuthStatus.LOGGED_IN;
    })
    .addCase(logoutAuthentication, (state) => {
      state.isAuthenticated = false;
      state.code = "";
      state.status = AuthStatus.LOGGED_OUT;
    })
    .addCase(failedAuthentication, (state) => {
      state.isAuthenticated = false;
      state.code = "";
      state.status = AuthStatus.FAILED;
    });
});
