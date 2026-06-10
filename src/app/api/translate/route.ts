import { NextRequest, NextResponse } from "next/server";

/**
 * Translate complaint text on-demand.
 * Officers/admins can view citizen complaints in their preferred language.
 *
 * POST /api/translate
 * Body: {
 *   text: string          // complaint description to translate
 *   targetLang: string    // BCP-47 locale code (hi, bn, mr, etc)
 *   sourceDetect?: bool   // auto-detect source (default: true)
 * }
 * Response: { translated: string, lang: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { text, targetLang, sourceDetect = true } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing text or targetLang" },
        { status: 400 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ translated: "", lang: targetLang });
    }

    // Language name map for natural prompts
    const langNames: Record<string, string> = {
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
    };

    const targetName = langNames[targetLang] || targetLang;

    const systemPrompt = `You are a professional translator for civic complaint and government communication documents.
Translate the user-submitted text to ${targetName} while maintaining the original meaning and emotional tone.
Keep technical terms and proper nouns when appropriate.
Provide only the translated text, no additional explanation.`;

    const message = sourceDetect
      ? `Translate this civic complaint to ${targetName}:\n\n${text}`
      : `Translate this civic complaint from its original language to ${targetName}:\n\n${text}`;

    const response = await fetch("https://openrouter.ai/api/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Translation API error");
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const translated = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      translated,
      lang: targetLang,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    console.error("Translation error:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
