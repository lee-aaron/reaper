import { useEffect } from "react";
import useSWR from "swr";
import { AppDispatch } from "..";
import { useAppDispatch, useAppSelector } from "../hooks";
import { loginAuthentication, loginRequest, logoutRequest } from "./actions";
import { AuthStatus } from "./reducer";

export function useIsAuthenticated(): boolean {
  const isAuthenticated = useAppSelector(
    (state) => state.authentication.isAuthenticated
  );
  return isAuthenticated;
}

export function useAuthStatus(): AuthStatus {
  const status = useAppSelector((state) => state.authentication.status);
  return status;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.message = await res.text();
    throw error;
  }

  return res.text();
};

export function useUser() {
  const { data, error } = useSWR("/api/v1/user", fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loginAuthentication());
  }, [data]);

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  };
}
