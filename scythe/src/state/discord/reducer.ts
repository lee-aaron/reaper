import { createReducer } from "@reduxjs/toolkit";

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
}

export const initialState: Discord = {
  guilds: [],
  user: {
    id: "",
    username: "",
    discriminator: "",
    email: "",
  },
};

export default createReducer(initialState, (builder) => {
  builder.addCase("", (state) => {});
});
