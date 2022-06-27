import { useEffect } from "react";
import { useIsAuthenticated } from "../authentication/hooks";
import { useAppDispatch } from "../hooks";
import { GetUser } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(GetUser());
  }, [dispatch, isAuthenticated]);

  return null;
}
