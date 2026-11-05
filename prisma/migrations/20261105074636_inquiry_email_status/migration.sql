-- Inquiry email delivery status (WS-D, 2026-11-06): additive, nullable.
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "emailStatus" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN IF NOT EXISTS "emailError" TEXT;
