-- Phase 2: auditable seller/dealer listing moderation.
-- PostgreSQL enum additions are additive and do not rewrite existing marketplace data.
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'LISTING_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'LISTING_REJECTED';
