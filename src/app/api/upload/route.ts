import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { can, type AccountRole } from "@/lib/authorization";
import { validateUpload } from "@/lib/upload-policy";
import { getCurrentUser } from "@/lib/user-auth";

/**
 * WebP derivatives generated next to every uploaded raster (media opt).
 * Widths are upper bounds — smaller originals are never upscaled
 * (withoutEnlargement), and a whole-image ("inside") fit preserves the original
 * aspect ratio so the gallery's CSS object-cover cropping stays correct.
 */
const DERIVATIVES = [
  { suffix: "-thumb", width: 320 },
  { suffix: "-800", width: 800 },
  { suffix: "-1600", width: 1600 },
];

// Rasters sharp can decode into WebP. Videos (mp4/webm) are left untouched.
const RASTER_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function generateWebpDerivatives(buffer: Buffer, uploadDir: string, filename: string): Promise<void> {
  const base = filename.replace(/\.[^.]+$/, "");
  const source = sharp(buffer);
  const meta = await source.metadata();
  if (!meta.width || !meta.height) throw new Error(`Unreadable image metadata for ${filename}`);
  for (const d of DERIVATIVES) {
    await source
      .clone()
      .resize({ width: d.width, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82 })
      .toFile(path.join(uploadDir, `${base}${d.suffix}.webp`));
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to upload listing media." }, { status: 401 });
  if (!can(user.role as AccountRole, "listing:create")) {
    return NextResponse.json({ error: "Your account is not permitted to upload listing media." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const candidate = formData.get("file");
    if (!(candidate instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const validation = validateUpload(candidate);
    if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

    // Optional slug → store under vehicles/<slug>/ (FID-009). Falls back to root
    // /uploads/<uuid>.<ext> for callers that don't pass a slug (backward compatible).
    const slug = (formData.get("slug") as string | null)
      ?.toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const buffer = Buffer.from(await candidate.arrayBuffer());
    const uploadDir = slug
      ? path.join(process.cwd(), "public", "uploads", "vehicles", slug)
      : path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${validation.extension}`;
    await writeFile(path.join(uploadDir, filename), buffer, { flag: "wx" });

    // Media opt: emit -thumb.webp / -800.webp / -1600.webp for raster uploads.
    // A derivative failure must NOT fail the upload — the original is preserved
    // and the caller still gets the original url (contract unchanged).
    if (RASTER_TYPES.has(candidate.type)) {
      try {
        await generateWebpDerivatives(buffer, uploadDir, filename);
      } catch (error) {
        console.error("WebP derivative generation failed for", filename, error);
      }
    }

    const url = slug ? `/uploads/vehicles/${slug}/${filename}` : `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}