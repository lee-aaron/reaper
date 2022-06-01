import { createAsyncThunk } from "@reduxjs/toolkit";

export const GetGuilds = createAsyncThunk("discord/guilds/get", async () => {
  const res = await fetch("/api/v1/get_guilds");
  return await res.json();
});