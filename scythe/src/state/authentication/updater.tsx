import { useEffect } from "react";
import { useAppDispatch } from "../hooks";
import { loginRequest } from "./actions";

export default function Updater(): null {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(loginRequest());

    return () => {
      promise.abort();
    };
  }, []);

  return null;
}
