-- Phase 5: moderation log for auditable approve/reject/auto-approve decisions.
CREATE TABLE IF NOT EXISTS "ModerationLog" (
    "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::text),
    "vehicleId" TEXT,
    "listingRequestId" TEXT,
    "moderatorId" TEXT,
    "targetUserId" TEXT,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ModerationLog_moderatorId_createdAt_idx" ON "ModerationLog" ("moderatorId", "createdAt");
CREATE INDEX IF NOT EXISTS "ModerationLog_listingRequestId_createdAt_idx" ON "ModerationLog" ("listingRequestId", "createdAt");
CREATE INDEX IF NOT EXISTS "ModerationLog_targetUserId_createdAt_idx" ON "ModerationLog" ("targetUserId", "createdAt");
CREATE INDEX IF NOT EXISTS "ModerationLog_vehicleId_createdAt_idx" ON "ModerationLog" ("vehicleId", "createdAt");
