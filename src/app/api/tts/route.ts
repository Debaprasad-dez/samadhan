import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side text-to-speech. Browser speechSynthesis only works when the OS has
 * a voice installed for the language (Windows ships English-only), so Indian
 * languages stay silent on most devices. This route synthesises audio with the
 * free Google Translate TTS endpoint (no API key) and streams back MP3, so it
 * works regardless of the device's installed voices.
 *
 * POST /api/tts  Body: { text: string, lang: string }  →  audio/mpeg
 */

const MAX = 200; // Google TTS caps each request at ~200 chars.

// Split on word boundaries into <=MAX-char chunks (sentence-ish order preserved).
function chunk(text: string): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > MAX) {
      out.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) out.push(cur);
  return out.length ? out : [text.slice(0, MAX)];
}

export async function POST(req: NextRequest) {
  let text: string, lang: string;
  try {
    ({ text, lang } = (await req.json()) as { text: string; lang: string });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!text?.trim() || !lang) {
    return NextResponse.json({ error: "Missing text or lang" }, { status: 400 });
  }

  const parts = chunk(text);
  const buffers: Buffer[] = [];

  try {
    for (let i = 0; i < parts.length; i++) {
      const url =
        "https://translate.google.com/translate_tts?ie=UTF-8" +
        `&tl=${encodeURIComponent(lang)}&client=tw-ob` +
        `&total=${parts.length}&idx=${i}` +
        `&textlen=${parts[i].length}&q=${encodeURIComponent(parts[i])}`;
      const r = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Referer: "https://translate.google.com/",
        },
      });
      if (!r.ok) {
        return NextResponse.json(
          { error: `Upstream TTS ${r.status}` },
          { status: 502 },
        );
      }
      buffers.push(Buffer.from(await r.arrayBuffer()));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "TTS failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const body = Buffer.concat(buffers);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
