import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import SnackbarUtils from '../../utils/SnackbarUtils';

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
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
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
      SnackbarUtils.error(res.statusText);
      return thunkAPI.rejectWithValue(res.statusText);
    }
    SnackbarUtils.success("Account Created");
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
        return thunkAPI.rejectWithValue(res.statusText);
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
        "/api/v1/search_one_product",
        window.location.origin
      );
      productUrl.searchParams.append("prod_id", prod_id);
      const res = await fetch(productUrl.toString());
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
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
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
);

export const SearchOwnerSubscription = createAsyncThunk(
  "payments/subscriptions/searchOwner",
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
        "/api/v1/search_owner_product",
        window.location.origin
      );
      subscriptionUrl.searchParams.append("discord_id", discord_id);
      const res = await fetch(subscriptionUrl.toString());
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
)

export const CancelSubscription = createAsyncThunk(
  "payments/subscriptions/cancel",
  async (
    {
      discord_id,
      prod_id,
      server_id
    } : {
      discord_id: string;
      prod_id: string;
      server_id: string;
    },
    thunkAPI
  ) => {
    try {
      const subscriptionUrl = new URL(
        "/api/v1/cancel_subscription",
        window.location.origin
      );
      const res = await fetch(subscriptionUrl.toString(), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discord_id: discord_id,
          prod_id: prod_id,
          server_id: server_id,
        }),
      });
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      SnackbarUtils.success("Subscription cancelled");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
)

export const GetRole = createAsyncThunk(
  "payments/roles/get",
  async (
    {
      server_id
    } : {
      server_id: string;
    },
    thunkAPI
  ) => {
    try {
      const roleUrl = new URL(
        "/api/v1/get_roles",
        window.location.origin
      );
      roleUrl.searchParams.append("server_id", server_id);
      const res = await fetch(roleUrl.toString());
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
)

export const CreateProduct = createAsyncThunk(
  "payments/products/create",
  async (
    body: {
      name: string;
      email: string;
      product_name: string;
      description: string;
      price: number;
      target_server: string;
      discord_id: string;
      discord_name: string;
      discord_icon: string;
      discord_description: string;
      role_id: string | undefined;
      role_name: string | undefined;
    },
    thunkAPI
  ) => {
    try {
      const productUrl = new URL(
        "/api/v1/create_product",
        window.location.origin
      );
      const res = await fetch(productUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.status !== 200) {
        SnackbarUtils.error(res.statusText);
        return thunkAPI.rejectWithValue(res.statusText);
      }
      SnackbarUtils.success("Product created");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue("");
    }
  }
)
