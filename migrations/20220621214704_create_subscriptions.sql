-- Handles the list of available subscriptions
CREATE TABLE subscriptions (
  prod_id TEXT PRIMARY KEY,
  discord_id TEXT NOT NULL,
  discord_name TEXT NOT NULL,
  subscription_name TEXT NOT NULL,
  subscription_description TEXT NOT NULL,
  subscription_price TEXT NOT NULL,
  discord_icon TEXT NOT NULL
)