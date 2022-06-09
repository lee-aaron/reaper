import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "..";

export const GetGuilds = createAsyncThunk("discord/guilds/get", async (_, thunkAPI) => {
  try {
    const res = await fetch("/api/v1/get_guilds");
    if (res.status !== 200) {
      throw new Error(res.statusText);
    }
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue("");
  }
}, {
  condition: (_, thunkAPI) => {
    let state = thunkAPI.getState() as AppState;
    if (state.discord.status === "loading") {
      return false;
    }
    return true;
  },
});