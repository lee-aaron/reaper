-- Add migration script here
CREATE TABLE guilds (
  discord_id TEXT PRIMARY KEY REFERENCES accounts (discord_id),
  guild_id TEXT ARRAY
)