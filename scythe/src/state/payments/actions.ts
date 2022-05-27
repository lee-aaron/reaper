import { createAction } from '@reduxjs/toolkit'

export const createCustomer = createAction<{
  name: string,
  email: string,
}>("payments/createCustomer");

export const getCustomer = createAction<{
  id: string,
}>("payments/getCustomer");

export const deleteCustomer = createAction<{
  id: string,
}>("payments/deleteCustomer");