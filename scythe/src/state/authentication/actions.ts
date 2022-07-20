import { createAsyncThunk } from "@reduxjs/toolkit";
import SnackbarUtils from "../../utils/SnackbarUtils";

export const loginRequest = createAsyncThunk(
  "auth/loginRequest",
  async ({ code, state }: { code: string; state: string }, thunkAPI) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        signal: thunkAPI.signal,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          state,
        }),
      });
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      SnackbarUtils.success("Login successful");
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
        signal: thunkAPI.signal,
      });
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      return true;
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);
