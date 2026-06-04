import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { getCurrentUser } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (§5.1.3)
const ALLOWED: Record<string, "photo" | "video"> = {
  "image/jpeg": "photo",
  "image/png": "photo",
  "image/webp": "photo",
  "video/mp4": "video",
};

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("UNAUTHENTICATED", "Sign in to upload.", 401);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return fail("VALIDATION", "No file provided.", 400);
  }

  const kind = ALLOWED[file.type];
  if (!kind) {
    return fail("VALIDATION", "Only JPG, PNG, WebP or MP4 files are allowed.", 400);
  }
  if (file.size > MAX_BYTES) {
    return fail(
      "VALIDATION",
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Limit is 5 MB.`,
      400,
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext =
    file.name.split(".").pop()?.toLowerCase() ?? (kind === "video" ? "mp4" : "jpg");
  const name = `${nanoid(12)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);

  return ok({
    url: `/uploads/${name}`,
    filename: file.name,
    sizeBytes: file.size,
    kind,
  });
}
