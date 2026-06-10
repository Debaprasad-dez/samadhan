import { NextRequest, NextResponse } from "next/server";
import { callText } from "@/lib/ai/client";

/**
 * Translate complaint text on-demand.
 * Officers/admins can view citizen complaints in their preferred language.
 *
 * POST /api/translate
 * Body: {
 *   text: string          // complaint description to translate
 *   targetLang: string    // BCP-47 locale code (hi, bn, mr, etc)
 * }
 * Response: { translated: string, lang: string }
 */

const LANG_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  pa: "Punjabi",
  ur: "Urdu",
  as: "Assamese",
  ne: "Nepali",
  sa: "Sanskrit",
  mai: "Maithili",
  kok: "Konkani",
  doi: "Dogri",
  sat: "Santali",
  ks: "Kashmiri",
  sd: "Sindhi",
  mni: "Manipuri",
  brx: "Bodo",
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = (await req.json()) as {
      text: string;
      targetLang: string;
    };

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing text or targetLang" },
        { status: 400 },
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ translated: "", lang: targetLang });
    }

    const targetName = LANG_NAMES[targetLang] ?? targetLang;

    const translated = await callText({
      system: `You are a professional translator for civic complaint and government communication documents.
Translate the given text to ${targetName} while maintaining the original meaning and emotional tone.
Preserve technical terms and proper nouns where appropriate.
Output only the translated text — no preamble, no explanation, no quotes.`,
      user: text,
      temperature: 0.1,
    });

    if (!translated) {
      return NextResponse.json(
        { error: "Translation unavailable. Check AI configuration." },
        { status: 503 },
      );
    }

    return NextResponse.json({ translated, lang: targetLang });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    console.error("Translation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
