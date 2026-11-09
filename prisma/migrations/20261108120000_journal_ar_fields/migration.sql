-- Journal bilingual fields: Arabic title/excerpt/meta (additive)
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "titleAr" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "excerptAr" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "metaDescriptionAr" TEXT;
