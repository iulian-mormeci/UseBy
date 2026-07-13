import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class UploadError extends Error {}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!(file.type in ALLOWED_TYPES)) {
    throw new UploadError("Formato immagine non supportato (usa JPEG, PNG o WEBP)");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new UploadError("Immagine troppo grande (massimo 5MB)");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = ALLOWED_TYPES[file.type];
  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/${filename}`;
}
