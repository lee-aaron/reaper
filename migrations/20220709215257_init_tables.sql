-- https://dbdiagram.io/d/62c9ee2acc1bc14cc588b911
CREATE TABLE "owners" (
  "discord_id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "stripe_id" TEXT UNIQUE NOT NULL,
  "status" TEXT NOT NULL
);

CREATE TABLE "sub_info" (
  "prod_id" TEXT PRIMARY KEY,
  "price_id" TEXT NOT NULL,
  "sub_name" TEXT NOT NULL,
  "sub_description" TEXT NOT NULL,
  "server_id" TEXT NOT NULL,
  "num_subscribed" INT NOT NULL
);

CREATE TABLE "sub_price" (
  "price_id" TEXT PRIMARY KEY,
  "sub_price" INT NOT NULL
);

CREATE TABLE "customers" (
  "discord_id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL
);

CREATE TABLE "guilds" (
  "discord_id" TEXT NOT NULL,
  "server_id" TEXT NOT NULL
);

CREATE TABLE "guild_info" (
  "server_id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "description" TEXT NOT NULL
);

CREATE TABLE "cus_subscriptions" (
  "cus_id" TEXT NOT NULL,
  "discord_id" TEXT NOT NULL,
  "prod_id" TEXT NOT NULL,
  "server_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "sub_id" TEXT PRIMARY KEY
);

ALTER TABLE "sub_info" ADD FOREIGN KEY ("price_id") REFERENCES "sub_price" ("price_id");

ALTER TABLE "sub_info" ADD FOREIGN KEY ("server_id") REFERENCES "guild_info" ("server_id");

ALTER TABLE "guilds" ADD FOREIGN KEY ("discord_id") REFERENCES "owners" ("discord_id");

ALTER TABLE "guilds" ADD FOREIGN KEY ("server_id") REFERENCES "guild_info" ("server_id");

ALTER TABLE "cus_subscriptions" ADD FOREIGN KEY ("discord_id") REFERENCES "customers" ("discord_id");

ALTER TABLE "cus_subscriptions" ADD FOREIGN KEY ("prod_id") REFERENCES "sub_info" ("prod_id");

ALTER TABLE "cus_subscriptions" ADD FOREIGN KEY ("server_id") REFERENCES "guild_info" ("server_id");
