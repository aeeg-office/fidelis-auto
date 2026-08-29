import { PrismaClient } from "@prisma/client";
import { unlink } from "fs/promises";
import path from "path";

export interface ImageOrderItem {
  /** Existing VehicleImage id (present when keeping a stored image). */
  id?: string | null;
  /** Image URL/path (e.g. /uploads/xxx.jpg). */
  src: string;
  /** Exactly one item should be the cover (isPrimary=true). */
  cover?: boolean;
}

export function normalizeImageOrder(input: unknown): ImageOrderItem[] | null {
  if (!Array.isArray(input) || input.length > 30) return null;
  const out: ImageOrderItem[] = [];
  for (const it of input) {
    if (!it || typeof it !== "object") return null;
    const { id, src, cover } = it as { id?: unknown; src?: unknown; cover?: unknown };
    if (typeof src !== "string" || !src) return null;
    out.push({
      id: typeof id === "string" && id ? id : null,
      src,
      cover: cover === true,
    });
  }
  return out;
}

/**
 * Sync a vehicle's image set to the given ordered list.
 *
 * Strategy (no data loss risk, minimal writes):
 *  - Deletes any stored VehicleImage whose id is no longer in the list.
 *  - Updates sortOrder + isPrimary in place for retained rows.
 *  - Creates rows for new srcs (no id yet).
 *  - Guarantees exactly one isPrimary (the item flagged cover; fallback = first item).
 *  - Optionally deletes orphaned upload files (srcs that were removed).
 */
export async function syncVehicleImages(
  prisma: Pick<PrismaClient, "vehicleImage" | "$transaction">,
  vehicleId: string,
  ordered: ImageOrderItem[],
  opts: { deleteFiles?: boolean } = {},
): Promise<{ created: number; deleted: number; cover: string | null }> {
  if (ordered.length === 0) {
    // Remove all images.
    const existing = await prisma.vehicleImage.findMany({
      where: { vehicleId },
      select: { id: true, src: true },
    });
    if (opts.deleteFiles) {
      for (const e of existing) await safeUnlink(e.src);
    }
    await prisma.vehicleImage.deleteMany({ where: { vehicleId } });
    return { created: 0, deleted: existing.length, cover: null };
  }

  const existing = await prisma.vehicleImage.findMany({
    where: { vehicleId },
    select: { id: true, src: true },
  });
  const existingBySrc = new Map(existing.map((e) => [e.src, e]));
  const existingById = new Map(existing.map((e) => [e.id, e]));

  // Cover index: the flagged item, else the first.
  const coverIdx = ordered.findIndex((o) => o.cover);
  const primaryIdx = coverIdx >= 0 ? coverIdx : 0;

  // 1. Figure out which existing rows are being kept vs removed.
  const keptIds = new Set<string>();
  for (const o of ordered) {
    if (o.id && existingById.has(o.id)) keptIds.add(o.id);
  }
  const removed = existing.filter((e) => !keptIds.has(e.id));

  // 2. Delete removed rows + files.
  if (removed.length) {
    if (opts.deleteFiles) {
      for (const r of removed) await safeUnlink(r.src);
    }
    await prisma.vehicleImage.deleteMany({
      where: { id: { in: removed.map((r) => r.id) } },
    });
  }

  // 3. Upsert each item with its running sortOrder + primary flag.
  let created = 0;
  for (let i = 0; i < ordered.length; i++) {
    const o = ordered[i];
    const isPrimary = i === primaryIdx;
    const existingRow = o.id ? existingById.get(o.id) : o.src ? existingBySrc.get(o.src) : undefined;
    if (existingRow) {
      await prisma.vehicleImage.update({
        where: { id: existingRow.id },
        data: { src: o.src, sortOrder: i, isPrimary },
      });
    } else {
      await prisma.vehicleImage.create({
        data: { vehicleId, src: o.src, sortOrder: i, isPrimary, category: "exterior" },
      });
      created++;
    }
  }

  return {
    created,
    deleted: removed.length,
    cover: ordered[primaryIdx]?.src ?? null,
  };
}

/** Delete an uploaded file if it lives under the public uploads dir. */
async function safeUnlink(src: string): Promise<void> {
  if (typeof src !== "string" || !src.includes("/uploads/")) return;
  const root = process.cwd();
  const abs = src.startsWith("/") ? path.join(root, "public", src) : path.join(root, "public", "uploads", src);
  try {
    await unlink(abs);
  } catch {
    // Non-fatal: file may not exist or be a volume path. Ignore.
  }
}