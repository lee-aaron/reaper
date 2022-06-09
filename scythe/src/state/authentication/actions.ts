import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "..";
import { AuthStatus } from "./reducer";

export const loginRequest = createAsyncThunk(
  "auth/loginRequest",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/v1/user", {
        signal: thunkAPI.signal
      });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);

export const logoutRequest = createAsyncThunk(
  "auth/logoutRequest",
  async (_, thunkAPI) => {
    try {
      const res = await fetch("/api/v1/logout", {
        signal: thunkAPI.signal
      });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);
