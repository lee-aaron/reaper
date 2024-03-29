import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { combineReducers } from "redux";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import application from "./application/reducer";
import storage from "./sync_storage";
import user from "./user/reducer";
import authentication from "./authentication/reducer";
import discord from "./discord/reducer";
import payments from "./payments/reducer";
import stripe from "./stripe/reducer";

const PERSISTED_KEYS: string[] = ["user", "authentication", "stripe"];

const reducers = combineReducers({
  application,
  user,
  authentication,
  discord,
  payments,
  stripe
});

const persistConfig = {
  key: "root",
  whitelist: PERSISTED_KEYS,
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
