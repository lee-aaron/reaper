import { createReducer } from "@reduxjs/toolkit";
import { createCustomer, getCustomer, deleteCustomer } from "./actions";

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export const initialState: Customer = {
  id: "",
  name: "",
  email: "",
};

export default createReducer(initialState, (builder) => {
  builder
    .addCase(createCustomer, (state, { payload }) => {
      state.name = payload.name;
      state.email = payload.email;
    })
    .addCase(getCustomer, (state, { payload }) => {
      
    })
    .addCase(deleteCustomer, (state, { payload }) => {});
});
