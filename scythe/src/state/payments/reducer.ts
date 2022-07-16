import { createReducer } from "@reduxjs/toolkit";
import {
  CreateAccount,
  CreateCustomer,
  GetAccount,
  GetCustomer,
  SearchOwnerSubscription,
  SearchProduct,
  SearchSubscription,
} from "./actions";

export interface Customer {
  loading: string;
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
  status?: string;
  num_subscribed?: number;
}

export interface Owner {
  id: string;
  status: string;
  loading: string;
  subscriptions: Array<DashboardSubscription>;
  loading_subscriptions: string;
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
    user_created: false,
    subscriptions: [],
    loading_subscriptions: "",
  },
  owner: {
    id: "",
    status: "",
    loading: "",
    subscriptions: [],
    loading_subscriptions: "",
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
        state.cus.user_created = true;
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
        if (action.payload) {
          state.cus.user_created = true;
        }
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
    .addCase(SearchOwnerSubscription.pending, (state) => {
      state.owner.loading_subscriptions = "loading";
    })
    .addCase(SearchOwnerSubscription.fulfilled, (state, action) => {
      if (state.owner.loading_subscriptions === "loading") {
        state.owner.loading_subscriptions = "idle";
        state.owner.subscriptions = action.payload;
      }
    })
    .addCase(SearchOwnerSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.owner.loading_subscriptions = "error";
      }
    });
});
