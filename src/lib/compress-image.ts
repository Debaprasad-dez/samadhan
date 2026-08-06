/**
 * Shrink a photo in the browser before it is uploaded.
 *
 * Phone cameras produce 3–8 MB files; the case only ever needs enough detail to
 * show a pothole or a leaking pipe. Downscaling and re-encoding to JPEG gets
 * that to roughly 100 KB, which keeps uploads quick on a weak connection and
 * keeps the stored bytes small.
 *
 * Non-images (and anything the browser cannot decode) are returned untouched —
 * the server still enforces its own limits.
 */

const MAX_DIM = 1600;
const TARGET_BYTES = 100 * 1024;
const QUALITIES = [0.82, 0.7, 0.6, 0.5, 0.4, 0.32];

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
}

function draw(bitmap: ImageBitmap, scale: number): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export async function compressImage(
  file: File,
  targetBytes = TARGET_BYTES,
): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= targetBytes) return file;

  let bitmap: ImageBitmap;
  try {
    // from-image honours the EXIF rotation phones write, so portrait shots
    // don't arrive on their side.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    let scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    let smallest: Blob | null = null;

    // Two passes: drop quality first, and only halve the dimensions if even the
    // lowest quality is still over budget.
    for (let pass = 0; pass < 2; pass++) {
      const canvas = draw(bitmap, scale);
      if (!canvas) return file;

      for (const q of QUALITIES) {
        const blob = await toBlob(canvas, q);
        if (!blob) return file;
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= targetBytes) return asFile(blob, file);
      }
      scale *= 0.6;
    }

    // Still over budget (rare — very noisy images). Send the smallest we made,
    // unless the original was somehow smaller.
    if (smallest && smallest.size < file.size) return asFile(smallest, file);
    return file;
  } finally {
    bitmap.close();
  }
}

function asFile(blob: Blob, original: File): File {
  const name = original.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${name}.jpg`, {
    type: "image/jpeg",
    lastModified: original.lastModified,
  });
}
