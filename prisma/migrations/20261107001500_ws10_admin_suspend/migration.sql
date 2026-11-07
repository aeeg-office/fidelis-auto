-- WS10: warning-only policy for scams/fake listings — admin can suspend an account.
-- Additive-only: adds a nullable-by-default suspension flag to User.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSuspended" BOOLEAN NOT NULL DEFAULT false;