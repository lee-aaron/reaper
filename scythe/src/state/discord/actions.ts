import { createAsyncThunk } from "@reduxjs/toolkit";

export const GetGuilds = createAsyncThunk("discord/guilds/get", async () => {
  const res = await fetch("/api/v1/get_guilds");
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  return await res.json();
});