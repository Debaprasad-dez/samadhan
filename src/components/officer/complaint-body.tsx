"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Globe, Volume2, Square } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LOCALES } from "@/lib/i18n";
import { useT } from "@/components/providers/locale-provider";

// Indian Eighth-Schedule locales map to their *-IN BCP-47 tags for TTS voice
// selection; anything else is passed through (the engine falls back gracefully).
function speechLang(code: string): string {
  const IN = new Set([
    "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or", "as", "ur", "en",
  ]);
  if (code === "ne") return "ne-NP";
  return IN.has(code) ? `${code}-IN` : code;
}

// Voices populate asynchronously — getVoices() is often empty on first call and
// fills in on the "voiceschanged" event. Resolve once we actually have them.
function loadVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const have = synth.getVoices();
    if (have.length) return resolve(have);
    const onChange = () => {
      const v = synth.getVoices();
      if (v.length) {
        synth.removeEventListener("voiceschanged", onChange);
        resolve(v);
      }
    };
    synth.addEventListener("voiceschanged", onChange);
    // Fallback so we never hang if the event never fires.
    setTimeout(() => resolve(synth.getVoices()), 600);
  });
}

// Pick the best voice for a language: exact BCP-47 match first, then any voice
// whose language prefix matches (e.g. "bn-IN" / "bn-BD" for code "bn").
function pickVoice(
  voices: SpeechSynthesisVoice[],
  langTag: string,
  code: string,
): SpeechSynthesisVoice | null {
  const tag = langTag.toLowerCase();
  const base = code.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase() === tag) ||
    voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(base)) ||
    null
  );
}

export function ComplaintBody({
  body,
  originalLang = "en",
}: {
  body: string;
  originalLang?: string;
}) {
  const t = useT();
  const [viewLang, setViewLang] = useState<string | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const displayText = translated || body;

  // Stop any in-flight speech/audio when the component unmounts.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
    };
  }, []);

  function stopAudio() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setSpeaking(false);
  }

  async function translate(lang: string) {
    if (lang === originalLang) {
      setViewLang(null);
      setTranslated(null);
      return;
    }

    if (translated && viewLang === lang) {
      setViewLang(null);
      setTranslated(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: body,
          targetLang: lang,
          sourceDetect: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || t("translate.translateError"));
      }

      const data = (await res.json()) as { translated: string; lang: string };
      setTranslated(data.translated);
      setViewLang(lang);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : t("translate.translateError"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Read the (possibly translated) complaint text aloud. Prefer the server TTS
  // route (works for every language regardless of installed OS voices); fall
  // back to the browser's speechSynthesis if the route is unavailable.
  async function toggleSpeak() {
    if (speaking) {
      stopAudio();
      return;
    }
    const code = viewLang || originalLang;
    setSpeaking(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: displayText, lang: code }),
      });
      if (!res.ok) throw new Error("server tts unavailable");
      const blob = await res.blob();
      if (!blob.size) throw new Error("empty audio");
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => stopAudio();
      audio.onerror = () => stopAudio();
      await audio.play();
      return;
    } catch {
      // Server route failed → fall back to local voices.
    }

    speakWithBrowser(code);
  }

  // Fallback: browser speechSynthesis (only works if an OS voice exists).
  function speakWithBrowser(code: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Read aloud isn’t supported on this browser.");
      setSpeaking(false);
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const langTag = speechLang(code);
    loadVoices(synth).then((voices) => {
      const voice = pickVoice(voices, langTag, code);
      if (!voice && code !== "en") {
        toast.error("Read aloud is unavailable for this language right now.");
        setSpeaking(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(displayText);
      if (voice) u.voice = voice;
      u.lang = voice?.lang || langTag;
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      synth.speak(u);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {t("case.complaintDetails")}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Read aloud — circular icon with a live pulse while speaking. */}
          <button
            type="button"
            onClick={toggleSpeak}
            aria-label={speaking ? t("case.stopReading") : t("case.readAloud")}
            title={speaking ? t("case.stopReading") : t("case.readAloud")}
            className={cn(
              "relative grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
              speaking
                ? "border-brand bg-brand-soft text-brand"
                : "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {speaking && (
              <span className="bg-brand/30 absolute inset-0 animate-ping rounded-full" />
            )}
            {speaking ? (
              <Square className="relative h-3.5 w-3.5 fill-current" />
            ) : (
              <Volume2 className="relative h-4 w-4" />
            )}
          </button>

          {LOCALES.filter((l) => l.code !== originalLang).length > 0 && (
            <>
              <Select
                value={viewLang || ""}
                onValueChange={translate}
                disabled={isLoading}
              >
                <SelectTrigger className="h-8 w-32 text-sm">
                  <Globe className="h-3.5 w-3.5" />
                  <SelectValue placeholder={t("translate.action")} />
                </SelectTrigger>
                <SelectContent side="left">
                  <SelectItem value={originalLang}>
                    {LOCALES.find((l) => l.code === originalLang)?.english ||
                      originalLang}{" "}
                    ({t("translate.original")})
                  </SelectItem>
                  {LOCALES.filter((l) => l.code !== originalLang).map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.english}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoading && (
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
              )}
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "rounded-md border p-4",
          "whitespace-pre-wrap text-sm leading-relaxed",
        )}
      >
        {displayText}
      </div>

      {viewLang && viewLang !== originalLang && (
        <p className="text-muted-foreground text-xs">
          {t("translate.viewingIn")}{" "}
          {LOCALES.find((l) => l.code === viewLang)?.english || viewLang}
        </p>
      )}
    </div>
  );
}
