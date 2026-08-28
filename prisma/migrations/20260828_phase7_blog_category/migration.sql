-- Phase 7: add blog category column to JournalEntry (additive, nullable).
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "category" TEXT;