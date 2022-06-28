import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "..";

export const GetGuilds = createAsyncThunk(
  "discord/guilds/get",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(
        new URL("/api/v1/get_guilds", window.location.origin)
      );
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  },
  {
    condition: (_, thunkAPI) => {
      let state = thunkAPI.getState() as AppState;
      if (state.discord.status === "loading") {
        return false;
      }
      return true;
    },
  }
);

export const GetUser = createAsyncThunk(
  "discord/user/get",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(
        new URL("/api/v1/get_user", window.location.origin)
      );
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  },
  {
    condition: (_, thunkAPI) => {
      let state = thunkAPI.getState() as AppState;
      if (state.discord.user.status === "loading") {
        return false;
      }
      return true;
    },
  }
);
