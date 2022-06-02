import { useMemo } from "react";
import { AppDispatch } from "..";
import { useAppSelector } from "../hooks";
import { GetGuilds } from "./actions";

export function fetchGuilds(dispatch: AppDispatch) {
  dispatch(GetGuilds());
}


export function useAdminGuilds() {
  const guilds = useAppSelector((state) => state.discord.guilds);
  
  return useMemo(() => guilds.filter((guild) => guild.owner), [guilds]);
}