import { createReducer } from "@reduxjs/toolkit";
import { GetGuilds, GetUser } from "./actions";

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
        if (action.payload instanceof Array) {
          state.guilds = action.payload;
        } else {
          state.guilds = [];
        }
      }
    })
    .addCase(GetGuilds.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.status = "error";
        state.guilds = [];
      }
    })
    .addCase(GetUser.pending, (state) => {
      state.status = "loading";
    })
    .addCase(GetUser.fulfilled, (state, action) => {
      if (state.status === "loading") {
        state.status = "idle";
        state.user = action.payload;
      }
    })
    .addCase(GetUser.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.status = "error";
      }
    });
});
