import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { loginAuthentication, logoutAuthentication } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();

  const getUser = async () => {
    const response = await fetch("/api/v1/user");
    return response;
  }

  useEffect(() => {
    getUser().then(_ => {
      dispatch(loginAuthentication());
    }).catch(_ => {
      dispatch(logoutAuthentication());
    });
  }, [dispatch]);

  return null;
}