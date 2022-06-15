-- Add migration script here
CREATE TABLE accounts(
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  stripe_account_id TEXT NOT NULL
);