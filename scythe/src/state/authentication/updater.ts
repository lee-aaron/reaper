import { failedAuthentication, loginAuthentication } from "./actions";
import { useAppDispatch } from "../hooks";
import { useEffect } from "react";
import { useIsAuthenticated } from "./hooks";


export default function Updater(): null {
  const dispatch = useAppDispatch();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // if window url is on login page and has code
    if (window.location.pathname === "/login" && window.location.search.includes("code") && !isAuthenticated) {
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        return;
      }

      dispatch(loginAuthentication({ credentials: { code } }));
      
      // get /api/oauth
      fetch("/api/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          code: code
        })
      }).then(res => {
        if (res.redirected) {
          window.location.href = res.url;
        }
        if (!res.ok) {
          throw new Error(res.statusText);
        }
      }).catch((e: Error) => {
        console.log(e);
        dispatch(failedAuthentication);
      })
    }
  }, [dispatch]);

  return null;
}