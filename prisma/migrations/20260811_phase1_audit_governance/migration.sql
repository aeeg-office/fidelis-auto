-- Phase 1 hardening: immutable operational audit trail for privileged lifecycle actions.
CREATE TYPE "AuditAction" AS ENUM (
  'SUPER_ADMIN_BOOTSTRAPPED',
  'ROLE_CHANGED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_RESTORED',
  'DEALER_APPROVED',
  'DEALER_REJECTED',
  'SESSION_REVOKED'
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" "AuditAction" NOT NULL,
  "actorId" TEXT,
  "targetId" TEXT,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_targetId_createdAt_idx" ON "AuditLog"("targetId", "createdAt");
