type UploadDescriptor = { type: string; size: number };
type UploadValidation = { ok: true; extension: string } | { ok: false; error: string };

const MIME_TYPES: Record<string, { extension: string; maximumSize: number; kind: "image" | "video" }> = {
  "image/jpeg": { extension: "jpg", maximumSize: 10_000_000, kind: "image" },
  "image/png": { extension: "png", maximumSize: 10_000_000, kind: "image" },
  "image/webp": { extension: "webp", maximumSize: 10_000_000, kind: "image" },
  "image/avif": { extension: "avif", maximumSize: 10_000_000, kind: "image" },
  "video/mp4": { extension: "mp4", maximumSize: 100_000_000, kind: "video" },
  "video/webm": { extension: "webm", maximumSize: 100_000_000, kind: "video" },
};

const UNIT_LABEL: Record<"image" | "video", string> = {
  image: "Images",
  video: "Videos",
};

export function validateUpload(file: UploadDescriptor): UploadValidation {
  const definition = MIME_TYPES[file.type];
  if (!definition) {
    return { ok: false, error: "Only JPEG, PNG, WebP, AVIF, MP4, and WebM uploads are allowed." };
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "The uploaded file is empty or invalid." };
  }
  if (file.size > definition.maximumSize) {
    const limitMb = (definition.maximumSize / 1_000_000).toFixed(0);
    const receivedMb = (file.size / 1_000_000).toFixed(1);
    return {
      ok: false,
      error: `${UNIT_LABEL[definition.kind]} must be ${limitMb} MB or smaller. Received ${receivedMb} MB.`,
    };
  }
  return { ok: true, extension: definition.extension };
}