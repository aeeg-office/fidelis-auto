/**
 * Idempotent Studio enhancement backfill for existing vehicle images.
 * Generates <base>-enhanced.webp (+ -thumb/-800/-1600 webp sizes) for every
 * VehicleImage that lacks it. NEVER modifies originals — only writes new
 * derivative files. Dry-run by default; pass --apply to write.
 *
 * Usage (from app tree, so tsx resolves paths/aliases):
 *   node --env-file=.env --import tsx scripts/backfill-studio.ts [--apply]
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import sharp from "sharp";
// generateStudioDerivatives is loaded inside main() to keep CJS-compatible
// execution (no top-level await) and resolve the app-local pipeline module.

const APPLY = process.argv.includes("--apply");
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const RASTER = /\.(jpe?g|png|webp|avif)$/i;

type Pipeline = { generateStudioDerivatives: (b: Buffer, d: string, f: string) => Promise<void> };
let pipeline: Pipeline | null = null;

async function ensurePipeline(): Promise<Pipeline> {
  if (pipeline) return pipeline;
  const pipelinePath = path.join(process.cwd(), "src", "lib", "studio-pipeline.ts");
  const mod = (await import(pathToFileURL(pipelinePath).href)) as unknown as Pipeline;
  pipeline = mod;
  return pipeline;
}

async function exists(p: string): Promise<boolean> {
  try {
    await readFile(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const { generateStudioDerivatives } = await ensurePipeline();
  const images = await prisma.vehicleImage.findMany({ select: { id: true, src: true } });
  const rows = images.filter((i) => i.src && i.src.includes("/uploads/") && RASTER.test(i.src));
  console.log(`Backfill (${APPLY ? "APPLY" : "DRY-RUN"}): ${rows.length} candidate image(s)`);
  let created = 0, skipped = 0, missing = 0, failed = 0;
  for (const row of rows) {
    const file = path.basename(row.src.split("?")[0]);
    const base = file.replace(RASTER, "");
    const enhancedFile = `${base}-enhanced.webp`;
    const abs = path.join(UPLOAD_DIR, file);
    const outPath = path.join(UPLOAD_DIR, enhancedFile);
    try {
      if (!APPLY) {
        console.log(`  would-generate ${enhancedFile} (src ${row.src})`);
        continue;
      }
      if (await exists(outPath)) {
        skipped++;
        continue;
      }
      const buffer = await readFile(abs);
      if (!buffer.length) throw new Error("empty");
      await generateStudioDerivatives(buffer, UPLOAD_DIR, file);
      created++;
      console.log(`  OK ${enhancedFile}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("ENOENT")) {
        missing++;
        console.log(`  MISSING original ${file}`);
      } else {
        failed++;
        console.log(`  FAIL ${file}: ${msg}`);
      }
    }
  }
  console.log(
    `Done: created=${created} skipped=${skipped} missing=${missing} failed=${failed} (${APPLY ? "applied" : "dry-run — rerun with --apply"})`
  );
  await prisma.$disconnect();
}

void main();
