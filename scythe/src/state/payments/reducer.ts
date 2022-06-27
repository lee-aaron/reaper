import { createReducer } from "@reduxjs/toolkit";
import {
  CreateCustomer,
  GetAccount,
  CreateAccount,
  GetCustomer,
  SearchSubscription,
  CreateSubscription,
} from "./actions";

export interface Customer {
  id: string;
  loading: string;
  secret: { [key: string]: string };
  prod_id: { [key: string]: string };
}

export interface Owner {
  id: string;
  status: string;
  loading: string;
}

export interface Subscription {
  sub_name: string;
  sub_description: string;
  sub_price: number;
  discord_id: string;
  discord_name: string;
  discord_icon: string;
  loading: string;
}

export const initialState: {
  cus: Customer;
  owner: Owner;
  sub: Subscription;
} = {
  cus: {
    id: "",
    loading: "",
    secret: {},
    prod_id: {},
  },
  owner: {
    id: "",
    status: "",
    loading: "",
  },
  sub: {
    sub_name: "",
    sub_description: "",
    sub_price: 0,
    discord_id: "",
    discord_name: "",
    discord_icon: "",
    loading: "",
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(CreateAccount.pending, (state) => {
      state.owner.loading = "loading";
    })
    .addCase(CreateAccount.fulfilled, (state, action) => {
      if (state.owner.loading === "loading") {
        state.owner.loading = "idle";
        // should get back a url to redirect to
        location.assign(action.payload.url);
      }
    })
    .addCase(CreateAccount.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.owner.loading = "error";
      }
    })
    .addCase(GetAccount.pending, (state) => {
      state.owner.loading = "loading";
    })
    .addCase(GetAccount.fulfilled, (state, action) => {
      if (state.owner.loading === "loading") {
        state.owner.loading = "idle";
        state.owner.id = action.payload[0];
        state.owner.status = action.payload[1];
      }
    })
    .addCase(GetAccount.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.owner.loading = "error";
      }
    })
    .addCase(CreateCustomer.pending, (state) => {
      state.cus.loading = "loading";
    })
    .addCase(CreateCustomer.fulfilled, (state, action) => {
      if (state.cus.loading === "loading") {
        state.cus.loading = "idle";
        state.cus.id = action.payload.id;
      }
    })
    .addCase(CreateCustomer.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.cus.loading = "error";
      }
    })
    .addCase(GetCustomer.pending, (state) => {
      state.cus.loading = "loading";
    })
    .addCase(GetCustomer.fulfilled, (state, action) => {
      if (state.cus.loading === "loading") {
        state.cus.loading = "idle";
        state.cus.id = action.payload.customer_id;
      }
    })
    .addCase(GetCustomer.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.cus.loading = "error";
      }
    })
    .addCase(SearchSubscription.pending, (state) => {
      state.sub.loading = "loading";
    })
    .addCase(SearchSubscription.fulfilled, (state, action) => {
      if (state.sub.loading === "loading") {
        state.sub.loading = "idle";
        state.sub.sub_name = action.payload.subscription_name;
        state.sub.sub_description = action.payload.subscription_description;
        state.sub.sub_price = action.payload.subscription_price;
        state.sub.discord_id = action.payload.discord_id;
        state.sub.discord_name = action.payload.discord_name;
        state.sub.discord_icon = action.payload.discord_icon;
      }
    })
    .addCase(SearchSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.sub.loading = "error";
      }
    })
    .addCase(CreateSubscription.pending, (state) => {
      state.sub.loading = "loading";
    })
    .addCase(CreateSubscription.fulfilled, (state, action) => {
      if (state.sub.loading === "loading") {
        state.sub.loading = "idle";
        state.cus.secret[action.payload.product_id] = action.payload.client_secret;
        state.cus.prod_id[action.payload.product_id] = action.payload.stripe_account;
      }
    })
    .addCase(CreateSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.sub.loading = "error";
      }
    })
});
