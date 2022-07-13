import { createReducer } from "@reduxjs/toolkit";
import {
  CreateCustomer,
  GetAccount,
  CreateAccount,
  GetCustomer,
  SearchProduct,
  CreateSubscription,
  SearchSubscription,
} from "./actions";

export interface Customer {
  loading: string;
  secret: { [key: string]: string }; // prod_id -> secret
  prod_id: { [key: string]: string }; // prod_id -> owner's stripe account
  secret_loading: string;
  user_created: boolean;
  subscriptions: Array<DashboardSubscription>;
  loading_subscriptions: string;
}

export interface DashboardSubscription {
  prod_id: string;
  sub_id: string;
  server_id: string;
  cus_id: string;
  name: string;
  icon: string;
  description: string;
  sub_name: string;
  sub_description: string;
  sub_price: string;
  status: string;
}

export interface Owner {
  id: string;
  status: string;
  loading: string;
}

export interface Subscription {
  num_subscribed: number;
  price_id: string;
  prod_id: string;
  server_id: string;
  sub_description: string;
  sub_name: string;
  sub_price: number;
  loading: string;
}

export const initialState: {
  cus: Customer;
  owner: Owner;
  sub: Subscription;
} = {
  cus: {
    loading: "",
    secret: {},
    prod_id: {},
    secret_loading: "",
    user_created: false,
    subscriptions: [],
    loading_subscriptions: "",
  },
  owner: {
    id: "",
    status: "",
    loading: "",
  },
  sub: {
    loading: "",
    num_subscribed: 0,
    price_id: "",
    prod_id: "",
    server_id: "",
    sub_description: "",
    sub_name: "",
    sub_price: 0,
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
        state.owner.id = action.payload.stripe_id;
        state.owner.status = action.payload.status;
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
    .addCase(CreateCustomer.fulfilled, (state) => {
      if (state.cus.loading === "loading") {
        state.cus.loading = "idle";
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
    .addCase(GetCustomer.fulfilled, (state) => {
      if (state.cus.loading === "loading") {
        state.cus.loading = "idle";
        state.cus.user_created = true;
      }
    })
    .addCase(GetCustomer.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.cus.loading = "error";
      }
    })
    .addCase(SearchProduct.pending, (state) => {
      state.sub.loading = "loading";
    })
    .addCase(SearchProduct.fulfilled, (state, action) => {
      if (state.sub.loading === "loading") {
        state.sub.loading = "idle";
        state.sub = {
          ...state.sub,
          ...action.payload,
        };
      }
    })
    .addCase(SearchProduct.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.sub.loading = "error";
      }
    })
    .addCase(CreateSubscription.pending, (state) => {
      state.cus.secret_loading = "loading";
    })
    .addCase(CreateSubscription.fulfilled, (state, action) => {
      if (state.cus.secret_loading === "loading") {
        state.cus.secret_loading = "idle";
        state.cus.secret[action.payload.prod_id] = action.payload.client_secret;
        state.cus.prod_id[action.payload.prod_id] = action.payload.stripe_id;
      }
    })
    .addCase(CreateSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.cus.secret_loading = "error";
      }
    })
    .addCase(SearchSubscription.pending, (state) => {
      state.cus.loading_subscriptions = "loading";
    })
    .addCase(SearchSubscription.fulfilled, (state, action) => {
      if (state.cus.loading_subscriptions === "loading") {
        state.cus.loading_subscriptions = "idle";
        state.cus.subscriptions = action.payload;
      }
    })
    .addCase(SearchSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.cus.loading_subscriptions = "error";
      }
    })
});
