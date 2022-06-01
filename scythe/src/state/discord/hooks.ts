import { useEffect } from "react";
import useSWR from "swr";
import { useAppDispatch } from "../hooks";
import { GetGuilds } from "./actions";

export function useGuilds() {
  const dispatch = useAppDispatch();
  
  
}
