import { useMemo } from "react";
import { useAppSelector } from "../hooks";

export function useAdminGuilds() {
  const guilds = useAppSelector((state) => state.discord.guilds);
  
  return useMemo(() => guilds.filter((guild) => guild.owner), [guilds]);
}