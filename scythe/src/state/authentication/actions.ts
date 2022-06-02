import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

export const loginAuthentication = createAction("auth/login");

export const logoutAuthentication = createAction("auth/logout");

export const loginRequest = createAsyncThunk("auth/loginRequest", async () => {
  const res = await fetch("/api/v1/user").catch((e) => e);
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  return await res.json();
});

export const logoutRequest = createAsyncThunk("auth/logoutRequest", async () => {
  const res = await fetch("/api/v1/logout").catch((e) => e);
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  return await res.json();
});