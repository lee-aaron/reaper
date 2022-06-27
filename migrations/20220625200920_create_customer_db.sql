-- Add migration script here
CREATE TABLE customers (
  cus_id TEXT PRIMARY KEY,
  server_id TEXT NOT NULL,
  discord_id TEXT NOT NULL,
  cus_name TEXT NOT NULL,
  cus_email TEXT NOT NULL
)