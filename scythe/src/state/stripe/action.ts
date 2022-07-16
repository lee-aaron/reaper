import { createAsyncThunk } from "@reduxjs/toolkit";

export const CreateSubscription = createAsyncThunk(
  "stripe/subscriptions/create",
  async (
    {
      prod_id,
      server_id,
      discord_id,
      price_id,
    }: {
      prod_id: string;
      server_id: string;
      discord_id: string;
      price_id: string;
    },
    thunkAPI
  ) => {
    try {
      const subscriptionUrl = new URL(
        "/api/v1/create_subscription",
        window.location.origin
      );
      const res = await fetch(subscriptionUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prod_id: prod_id,
          server_id: server_id,
          discord_id: discord_id,
          price_id: price_id,
        }),
      });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);