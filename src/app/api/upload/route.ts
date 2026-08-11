import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { can, type AccountRole } from "@/lib/authorization";
import { validateUpload } from "@/lib/upload-policy";
import { getCurrentUser } from "@/lib/user-auth";

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

    const buffer = Buffer.from(await candidate.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${crypto.randomUUID()}.${validation.extension}`;
    await writeFile(path.join(uploadDir, filename), buffer, { flag: "wx" });
    return NextResponse.json({ ok: true, url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
