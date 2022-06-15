import { useEffect } from "react";
import { useIsAuthenticated } from "../authentication/hooks";
import { useAppDispatch } from "../hooks";
import { GetUser } from "./actions";
import { User } from "./reducer";

export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) return;
    let shouldFetch = true;
    
    const fetchData = async () => {
      let response = await fetch("/api/v1/get_user");
      let data = (await response.json()) as User;
  
      // dispatch user get
      if (shouldFetch) {
        dispatch(GetUser(data));
      }
    };

    fetchData().catch(console.error);

    return () => {
      shouldFetch = false;
    }
  }, [dispatch, isAuthenticated]);

  return null;
}
