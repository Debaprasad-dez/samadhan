import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ok, fail } from "@/lib/api";

export const runtime = "nodejs";

// Photos arrive compressed to ~100 KB by the browser (see lib/compress-image).
// The ceiling is generous headroom for that, and for short clips. It stays
// under the 4.5 MB request-body limit serverless hosts impose.
const MAX_BYTES = 4 * 1024 * 1024;
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
      `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Limit is 4 MB.`,
      400,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const row = await db.upload.create({
    data: {
      ownerId: user.id,
      mime: file.type,
      filename: file.name,
      sizeBytes: bytes.byteLength,
      bytes,
    },
    select: { id: true },
  });

  return ok({
    url: `/api/files/${row.id}`,
    filename: file.name,
    sizeBytes: bytes.byteLength,
    kind,
  });
}
