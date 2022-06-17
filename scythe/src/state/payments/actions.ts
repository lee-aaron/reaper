import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { AppState } from "..";

export const createCustomer = createAction<{
  name: string;
  email: string;
}>("payments/createCustomer");

export const getCustomer = createAction<{
  id: string;
}>("payments/getCustomer");

export const deleteCustomer = createAction<{
  id: string;
}>("payments/deleteCustomer");

export const CreateAccount = createAsyncThunk(
  "payments/accounts/create",
  async (
    {
      discord_id,
      email,
      name,
      refresh_url,
      return_url,
    }: {
      discord_id: string;
      email: string;
      name: string;
      refresh_url: string;
      return_url: string;
    },
    thunkAPI
  ) => {
    try {
      const accountUrl = new URL(
        "/api/v1/create_account",
        window.location.origin
      );
      const res = await fetch(accountUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discord_id: discord_id,
          email: email,
          name: name,
          refresh_url: refresh_url,
          return_url: return_url,
        }),
      });
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

export const GetAccount = createAction<{
  id: string;
  status: string;
}>("payments/getAccount");
