import { useAppSelector } from "../hooks";
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
