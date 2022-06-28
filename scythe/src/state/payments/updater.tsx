import { useRouter } from "next/router";
import { useEffect } from "react";
import { useIsAuthenticated } from "../authentication/hooks";
import { useUser } from "../discord/hooks";
import { useAppDispatch } from "../hooks";
import { GetAccount, GetCustomer } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user.id) return;
    dispatch(GetAccount({ discord_id: user.id }));
  }, [dispatch, isAuthenticated, user.id]);

  useEffect(() => {
    if (!isAuthenticated || !user.id || !router.isReady) return;

    // dispatch get customer if on subscribe route
    if (router.pathname.includes("/subscribe") && router.query.id) {
      dispatch(GetCustomer({ discord_id: user.id, server_id: router.query.id as string }));
    }

  }, [dispatch, isAuthenticated, user, router.pathname, router.isReady]);

  return null;
}
