import { createReducer } from "@reduxjs/toolkit";
import { GetGuilds } from "./actions";

export interface Guild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: Array<string>;
}

export interface User {
  id: string;
  username: string;
  discriminator: string;
  email: string;
}

export interface Discord {
  guilds: Array<Guild>;
  user: User;
  status: string;
}

export const initialState: Discord = {
  guilds: [],
  status: "idle",
  user: {
    id: "",
    username: "",
    discriminator: "",
    email: "",
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(GetGuilds.pending, (state) => {
      state.status = "loading";
    })
    .addCase(GetGuilds.fulfilled, (state, action) => {
      // parse payload into array of Guilds
      if (state.status === "loading") {
        state.status = "idle";
        state.guilds = action.payload;
      }
    })
    .addCase(GetGuilds.rejected, (state, action) => {
      state.status = "error";
      state.guilds = [];
    });
});
