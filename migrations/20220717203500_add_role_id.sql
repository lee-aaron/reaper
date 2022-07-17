-- Add migration script here
ALTER TABLE "sub_info" ADD COLUMN "role_id" TEXT REFERENCES "role"("role_id");