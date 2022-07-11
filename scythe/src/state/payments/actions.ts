import { createAction, createAsyncThunk } from "@reduxjs/toolkit";

export const CreateCustomer = createAsyncThunk(
  "payments/customer/create",
  async (
    {
      name,
      email,
      discord_id,
    }: { name: string; email: string; discord_id: string },
    thunkAPI
  ) => {
    try {
      const createCustomerUrl = new URL(
        "/api/v1/create_customer",
        window.location.origin
      );

      let query = {
        name: name,
        email: email,
        discord_id: discord_id,
      };

      const res = await fetch(createCustomerUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      thunkAPI.rejectWithValue(err);
    }
  }
);

export const GetCustomer = createAsyncThunk(
  "payments/customer/get",
  async ({ discord_id }: { discord_id: string }, thunkAPI) => {
    const getCustomerUrl = new URL(
      "/api/v1/get_customer",
      window.location.origin
    );

    let query = {
      discord_id: discord_id,
    };

    getCustomerUrl.search = new URLSearchParams(query).toString();

    const res = await fetch(getCustomerUrl.toString());
    if (res.status !== 200) {
      return thunkAPI.rejectWithValue(res.statusText);
    }
    return await res.json();
  }
);

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
      return thunkAPI.rejectWithValue(res.statusText);
    }
    return await res.json();
  }
);

export const GetAccount = createAsyncThunk(
  "payments/accounts/get",
  async (
    {
      discord_id,
    }: {
      discord_id: string;
    },
    thunkAPI
  ) => {
    try {
      const accountUrl = new URL("/api/v1/get_account", window.location.origin);
      accountUrl.searchParams.append("discord_id", discord_id);
      const res = await fetch(accountUrl.toString());
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);

export const SearchProduct = createAsyncThunk(
  "payments/products/search",
  async (
    {
      prod_id,
    }: {
      prod_id: string;
    },
    thunkAPI
  ) => {
    try {
      const productUrl = new URL(
        "/api/v1/search_product",
        window.location.origin
      );
      productUrl.searchParams.append("prod_id", prod_id);
      const res = await fetch(productUrl.toString());
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);

export const CreateSubscription = createAsyncThunk(
  "payments/subscriptions/create",
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

export const SearchSubscription = createAsyncThunk(
  "payments/subscriptions/search",
  async (
    {
      discord_id,
    }: {
      discord_id: string;
    },
    thunkAPI
  ) => {
    try {
      const subscriptionUrl = new URL(
        "/api/v1/search_subscription",
        window.location.origin
      );
      subscriptionUrl.searchParams.append("discord_id", discord_id);
      const res = await fetch(subscriptionUrl.toString());
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);
