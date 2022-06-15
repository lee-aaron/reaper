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
    let shouldFetch = true;
    
    const fetchData = async () => {
      let accountUrl = new URL("/api/v1/get_account", window.location.origin);
      accountUrl.searchParams.append("discord_id", user.id);
      let response = await fetch(accountUrl.toString());
  
      // dispatch
      if (shouldFetch) {
        const account = await response.json();
        dispatch(GetAccount({
          id: account[0],
          status: account[1]
        }));
      }
    };

    fetchData().catch(console.error);

    return () => {
      shouldFetch = false;
    }
  }, [dispatch, isAuthenticated, user]);

  return null;
}
