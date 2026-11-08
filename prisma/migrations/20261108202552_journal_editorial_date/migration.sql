-- Additive: archive display/grouping date for JournalEntry.
-- publishedAt remains the true publish timestamp; editorialDate is the editorial archive date.
ALTER TABLE "JournalEntry" ADD COLUMN "editorialDate" TIMESTAMP(3);
