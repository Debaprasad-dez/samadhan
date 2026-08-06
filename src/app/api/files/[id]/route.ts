import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Serve an uploaded file. Public, like the static /uploads/ path it replaces —
 * ids are cuids, and evidence photos are visible on the public feed anyway.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const up = await db.upload.findUnique({
    where: { id },
    select: { mime: true, bytes: true },
  });
  if (!up) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(up.bytes), {
    headers: {
      "Content-Type": up.mime,
      "Content-Length": String(up.bytes.byteLength),
      // Bytes are immutable once written, so this can cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
