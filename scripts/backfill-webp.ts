/**
 * Idempotent WebP backfill for existing uploads.
 *
 *   npx tsx scripts/backfill-webp.ts /path/to/uploads
 *
 * Scans the given directory (recursively) for raster originals
 * (*.jpg / *.jpeg / *.png / *.webp / *.avif) and, for each, writes the capped
 * original copy (-2560.webp, Spec L — see src/lib/upload-policy.ts) plus the
 * three WebP derivatives (-thumb.webp ~320px, -800.webp, -1600.webp) next to
 * the original. It skips files whose -2560.webp already exists (so re-runs are
 * safe — a first run after this change also emits the capped copy for uploads
 * that predate it), always preserves originals, and logs per-file errors
 * without aborting the rest of the run.
 *
 * Pure filesystem operation — it needs only the directory path, not the DB.
 * Point it at the exact uploads volume you want to process; do NOT run it
 * against production without an explicit, reviewed target.
 */
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { MAX_ORIGINAL_DIM, capOriginalDimensions, cappedOriginalFilename } from "../src/lib/upload-policy";

const DERIVATIVES = [
  { suffix: "-thumb", width: 320 },
  { suffix: "-800", width: 800 },
  { suffix: "-1600", width: 1600 },
];

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

// Basenames that match our generated outputs (<stem>-thumb/-800/-1600/-2560).
const DERIVATIVE_SUFFIX_RE = /-(thumb|800|1600|2560)$/i;

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile() && INPUT_EXTS.has(path.extname(entry.name).toLowerCase())) {
      // Never feed previously-generated derivatives back in as sources
      // (e.g. avoid turning car-800.webp into car-800-thumb.webp towers).
      const stem = path.basename(entry.name, path.extname(entry.name));
      if (DERIVATIVE_SUFFIX_RE.test(stem)) continue;
      out.push(full);
    }
  }
  return out;
}

async function generateFor(file: string): Promise<"generated" | "skipped"> {
  const dir = path.dirname(file);
  const ext = path.extname(file);
  const stem = path.basename(file, ext);
  const filename = path.basename(file);

  // Gate on the capped copy rather than -thumb.webp so a re-run after this
  // change adds the Spec L -2560.webp to uploads that predate it.
  const capped = path.join(dir, cappedOriginalFilename(filename));
  if (await exists(capped)) {
    return "skipped";
  }

  const source = sharp(file);
  const meta = await source.metadata();
  if (!meta.width || !meta.height) throw new Error("not a readable image");

  // Capped original copy (Spec L) — same policy as the upload pipeline.
  const { width, height } = capOriginalDimensions(meta.width, meta.height, MAX_ORIGINAL_DIM);
  await source
    .clone()
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(capped);

  for (const d of DERIVATIVES) {
    const out = path.join(dir, `${stem}${d.suffix}.webp`);
    await source
      .clone()
      .resize({ width: d.width, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82 })
      .toFile(out);
  }
  return "generated";
}

async function main(): Promise<void> {
  const argDir = process.argv[2];
  if (!argDir) {
    console.error("Usage: npx tsx scripts/backfill-webp.ts <uploads-dir>");
    process.exit(1);
  }

  const root = path.resolve(argDir);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat || !stat.isDirectory()) {
    console.error(`Not a directory: ${root}`);
    process.exit(1);
  }

  const files = await walk(root);
  console.log(`Found ${files.length} raster file(s) under ${root}`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  for (const file of files) {
    try {
      const result = await generateFor(file);
      if (result === "generated") {
        generated++;
        console.log(`OK   ${file}`);
      } else {
        skipped++;
        console.log(`SKIP ${file} (-2560.webp already exists)`);
      }
    } catch (error) {
      failed++;
      console.error(`ERROR ${file}: ${(error as Error).message}`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});