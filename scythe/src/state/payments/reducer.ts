import { createReducer } from "@reduxjs/toolkit";
import {
  createCustomer,
  getCustomer,
  deleteCustomer,
  GetAccount,
  CreateAccount,
} from "./actions";

export interface Customer {
  id: string;
  name: string;
  email: string;
  loading: string;
}

export interface Owner {
  id: string;
  status: string;
  loading: string;
}

export const initialState: {
  cus: Customer;
  owner: Owner;
} = {
  cus: {
    id: "",
    name: "",
    email: "",
    loading: "",
  },
  owner: {
    id: "",
    status: "",
    loading: "",
  },
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(createCustomer, (state, { payload }) => {
      state.cus.name = payload.name;
      state.cus.email = payload.email;
    })
    .addCase(getCustomer, (state, { payload }) => {})
    .addCase(deleteCustomer, (state, { payload }) => {})
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
    .addCase(CreateAccount.rejected, (state) => {
      state.owner.loading = "error";
    })
    .addCase(GetAccount, (state, { payload }) => {
      state.owner.id = payload.id;
      state.owner.status = payload.status;
    });
});
