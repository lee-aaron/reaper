import { createReducer } from "@reduxjs/toolkit";
import { CreateSubscription } from "./action";

export interface Stripe {
  loading: string;
  secret: { [key: string]: string }; // prod_id -> secret
  prod_id: { [key: string]: string }; // prod_id -> owner's stripe account
}

export const initialState: Stripe = {
  secret: {},
  prod_id: {},
  loading: "",
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(CreateSubscription.pending, (state) => {
      state.loading = "loading";
    })
    .addCase(CreateSubscription.fulfilled, (state, action) => {
      if (state.loading === "loading") {
        state.loading = "idle";
        state.secret[action.payload.prod_id] = action.payload.client_secret;
        state.prod_id[action.payload.prod_id] = action.payload.stripe_id;
      }
    })
    .addCase(CreateSubscription.rejected, (state, action) => {
      if (!action.meta.aborted) {
        state.loading = "error";
      }
    });
});
