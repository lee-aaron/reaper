import { useEffect } from "react";
import { useIsAuthenticated } from "../authentication/hooks";
import { useUser } from "../discord/hooks";
import { useAppDispatch } from "../hooks";
import { GetAccount, GetCustomer } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  useEffect(() => {
    if (!isAuthenticated || !user.id) return;
    dispatch(GetAccount({ discord_id: user.id }));
    dispatch(GetCustomer({ discord_id: user.id }));
  }, [dispatch, isAuthenticated, user.id]);

  return null;
}
