import type { ZodType } from "zod";

const KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b:free";
const TIMEOUT_MS = 12_000; // §5.4 cross-cutting

// Only free OpenRouter models — ordered by capability for this use-case.
// Override with OPENROUTER_MODELS env var (comma-separated).
const MODELS = (
  process.env.OPENROUTER_MODELS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
    MODEL,
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-ultra-550b-a55b:free",
    "openrouter/free",
  ]
).filter((m, i, a) => a.indexOf(m) === i);

// Two transports, both server-side only (key never reaches the client):
//   1. Proxy mode (preferred, §"copy the proxy pattern"): OPENROUTER_CHAT_URL points at a
//      serverless proxy (e.g. ciner-proxy /api/chat) that injects the key. No auth from us.
//   2. Direct mode: call OpenRouter with our own OPENROUTER_API_KEY.
const PROXY_URL = process.env.OPENROUTER_CHAT_URL;
const DIRECT_URL =
  (process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1") +
  "/chat/completions";

function keyValid(): boolean {
  return !!KEY && KEY !== "sk-or-v1-replace-me" && KEY.length > 10;
}

/** AI is live when a proxy URL is configured OR a real key is set; else features use fallbacks. */
export function aiEnabled(): boolean {
  return !!PROXY_URL || keyValid();
}

export interface AiResult<T> {
  ok: boolean;
  fallback: boolean;
  data: T;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function extractJson(s: string): string {
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  return a >= 0 && b > a ? s.slice(a, b + 1) : s;
}

function logCall(
  version: string,
  ok: boolean,
  latencyMs: number,
  model: string,
): void {
  // Structured log (§14.9): { promptVersion, model, latencyMs, ok }.
  console.log(
    JSON.stringify({
      level: "info",
      msg: "ai_call",
      promptVersion: version,
      model,
      ok,
      latencyMs,
    }),
  );
}

async function chat(
  messages: ChatMessage[],
  temperature: number,
  model: string,
): Promise<string> {
  const url = PROXY_URL ?? DIRECT_URL;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!PROXY_URL && keyValid()) {
    headers["Authorization"] = `Bearer ${KEY}`;
    headers["HTTP-Referer"] = "https://samadhan.local";
    headers["X-Title"] = "Samadhan";
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call the model, return raw text output.
 * On failure returns null (caller decides fallback).
 */
export async function callText(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string | null> {
  if (!aiEnabled()) return null;

  const url = PROXY_URL ?? DIRECT_URL;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!PROXY_URL && keyValid()) {
    headers["Authorization"] = `Bearer ${KEY}`;
    headers["HTTP-Referer"] = "https://samadhan.local";
    headers["X-Title"] = "Samadhan";
  }

  for (const model of MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: opts.system },
              { role: "user", content: opts.user },
            ],
            temperature: opts.temperature ?? 0.1,
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) continue; // try next model on HTTP error (rate limit etc.)
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content ?? "";
      if (text) return text.trim();
    } catch {
      // timeout / network → try next model
    }
  }

  return null;
}

/**
 * Call the model, parse JSON, validate against a Zod schema.
 * On parse/validation failure: retry once with a stricter instruction.
 * On second failure (or AI disabled/error/timeout): return the documented fallback.
 */
export async function callJSON<T>(opts: {
  version: string;
  system: string;
  user: string;
  schema: ZodType<T>;
  fallback: T;
  temperature?: number;
}): Promise<AiResult<T>> {
  const start = Date.now();

  if (!aiEnabled()) {
    logCall(opts.version, false, 0, "none");
    return { ok: false, fallback: true, data: opts.fallback };
  }

  const base: ChatMessage[] = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user },
  ];
  const strict: ChatMessage = {
    role: "user",
    content: "Respond with strictly valid JSON only.",
  };

  // Try each model; on HTTP error (e.g. 429) move to the next. On a parse failure,
  // retry the same model once with a stricter instruction, then move on.
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const messages = attempt === 0 ? base : [...base, strict];
        const raw = await chat(messages, opts.temperature ?? 0.2, model);
        const parsed = opts.schema.safeParse(JSON.parse(extractJson(raw)));
        if (parsed.success) {
          logCall(opts.version, true, Date.now() - start, model);
          return { ok: true, fallback: false, data: parsed.data };
        }
        // parse failed → loop for stricter retry on the same model
      } catch {
        // network/HTTP error (rate limit, timeout) → stop retrying this model
        break;
      }
    }
  }

  logCall(opts.version, false, Date.now() - start, "fallback");
  return { ok: false, fallback: true, data: opts.fallback };
}
