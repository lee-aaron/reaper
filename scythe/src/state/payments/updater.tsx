import { useEffect } from "react";
import { useIsAuthenticated } from "../authentication/hooks";
import { useUser } from "../discord/hooks";
import { useAppDispatch } from "../hooks";
import { GetAccount } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  useEffect(() => {
    if (!isAuthenticated || !user.id) return;
    const promise = dispatch(GetAccount({ discord_id: user.id }));

    return () => {
      promise.abort();
    }
  }, [dispatch, isAuthenticated, user]);

  return null;
}
