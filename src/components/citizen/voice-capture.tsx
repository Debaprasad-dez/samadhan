"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIntakeStore } from "@/store/intake";
import { useT } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

// Minimal Web Speech API typings.
interface SpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechEvent {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
}
interface SpeechRec {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: SpeechEvent) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  start(): void;
  stop(): void;
  abort(): void;
}
type SpeechCtor = new () => SpeechRec;

// Speech-recognition locales (BCP-47) for India's major languages. The browser
// STT engine handles the actual recognition per code.
const LANGS = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "mr-IN", label: "मराठी" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "gu-IN", label: "ગુજરાતી" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
  { code: "pa-Guru-IN", label: "ਪੰਜਾਬੀ" },
  { code: "ur-IN", label: "اردو" },
  { code: "or-IN", label: "ଓଡ଼ିଆ" },
  { code: "as-IN", label: "অসমীয়া" },
  { code: "ne-NP", label: "नेपाली" },
];

/**
 * The CTA voice mic. Opens a themed dialog that records and live-transcribes the
 * speaker (Web Speech API). On "Stop & continue" the transcript is written into
 * the complaint draft and the user lands on the file-complaint form, step 1,
 * with the description pre-filled.
 */
export function VoiceMicButton({ ariaLabel }: { ariaLabel: string }) {
  const router = useRouter();
  const setField = useIntakeStore((s) => s.setField);
  const t = useT();

  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en-IN");
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<"denied" | "generic" | null>(null);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRec | null>(null);
  const userStoppedRef = useRef(false);

  // Reset transcript each time the dialog opens.
  useEffect(() => {
    if (open) {
      setFinalText("");
      setInterim("");
      setError(null);
    }
  }, [open]);

  // Manage the recognition session while open (restart on language change).
  useEffect(() => {
    if (!open) return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) {
      setSupported(false);
      return;
    }
    setSupported(true);
    userStoppedRef.current = false;

    // Single-utterance recognition (continuous=false) that auto-restarts on end,
    // matching the proven /file mic (useVoiceInput). Continuous mode made Chrome
    // emit progressive/cumulative finals ("there", "there is", "there is a"…),
    // which concatenated into repeated words — so take ONE final per session and
    // append it, restarting to keep listening across the speaker's pauses.
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;

    let cancelled = false;
    let appended = false;
    rec.onresult = (e) => {
      const res = e.results[e.results.length - 1];
      const text = res[0].transcript;
      if (res.isFinal) {
        if (!appended) {
          appended = true;
          setFinalText((p) => (p ? p + " " : "") + text.trim());
        }
        setInterim("");
      } else {
        setInterim(text);
      }
    };
    rec.onend = () => {
      if (cancelled || userStoppedRef.current) {
        setListening(false);
        return;
      }
      // New session → allow the next utterance's final to append.
      appended = false;
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed")
        setError("denied");
      else if (e?.error && e.error !== "no-speech" && e.error !== "aborted")
        setError("generic");
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }

    return () => {
      cancelled = true;
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recRef.current = null;
      setListening(false);
    };
  }, [open, lang]);

  const transcript = (finalText + " " + interim).trim();

  function stopAndContinue() {
    userStoppedRef.current = true;
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setOpen(false);
    if (transcript) setField("body", transcript);
    router.push("/file");
  }

  function close() {
    userStoppedRef.current = true;
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  return (
    <>
      {/* Trigger — matches the CTA mic styling */}
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className="relative flex w-[54px] flex-none items-center justify-center rounded-2xl"
        style={{
          background:
            "linear-gradient(160deg,color-mix(in srgb,var(--g-gold-lt) 55%,#fff),color-mix(in srgb,var(--g-gold-lt) 82%,var(--g-bg)))",
          border: "1px solid color-mix(in srgb,var(--g-gold) 45%,transparent)",
          boxShadow:
            "0 10px 22px -12px color-mix(in srgb,var(--g-gold) 70%,transparent),inset 0 1px 0 rgba(255,255,255,.7)",
          color: "var(--g-primary-deep)",
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl"
          aria-hidden
          style={{
            border: "1.5px solid color-mix(in srgb,var(--g-primary) 50%,transparent)",
            animation: "micpulse 2.6s ease-out infinite",
          }}
        />
        <Mic className="h-[21px] w-[21px]" />
      </button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) close();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{t("voice.title")}</DialogTitle>
            <DialogDescription>{t("voice.sub")}</DialogDescription>
          </DialogHeader>

          {!supported ? (
            <div className="space-y-4 py-2">
              <p className="text-muted-foreground text-sm">
                {t("voice.notSupported")}
              </p>
              <Button
                onClick={() => {
                  setOpen(false);
                  router.push("/file");
                }}
                className="w-full"
              >
                <Keyboard className="h-4 w-4" />
                {t("voice.typeInstead")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Recording orb + waveform */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="relative grid h-20 w-20 place-items-center">
                  {listening && (
                    <>
                      <span className="voice-ring bg-brand/30 absolute inset-0 rounded-full" />
                      <span
                        className="voice-ring bg-brand/20 absolute inset-0 rounded-full"
                        style={{ animationDelay: "0.6s" }}
                      />
                    </>
                  )}
                  <div className="bg-brand text-brand-foreground shadow-elev-2 relative grid h-16 w-16 place-items-center rounded-full">
                    <Mic className="h-7 w-7" />
                  </div>
                </div>

                <div className="flex items-end gap-1" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "bg-brand/70 w-1 rounded-full",
                        listening ? "voice-bar" : "",
                      )}
                      style={{
                        height: 18,
                        animationDelay: `${i * 0.12}s`,
                        transform: listening ? undefined : "scaleY(0.4)",
                      }}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                  {listening && (
                    <span className="bg-danger h-2 w-2 animate-pulse rounded-full" />
                  )}
                  {error === "denied"
                    ? t("voice.micDenied")
                    : error === "generic"
                      ? t("voice.retry")
                      : listening
                        ? t("voice.listening")
                        : t("voice.paused")}
                </p>
              </div>

              {/* Live transcript */}
              <div className="border-border bg-surface-muted/50 min-h-[88px] max-h-40 overflow-y-auto rounded-xl border p-3 text-sm leading-relaxed">
                {transcript ? (
                  <>
                    <span>{finalText}</span>{" "}
                    <span className="text-muted-foreground italic">{interim}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {t("voice.placeholder")}
                  </span>
                )}
              </div>

              {/* Language */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {t("settings.language")}
                </span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="border-border-strong bg-surface text-foreground focus:ring-ring rounded-md border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1"
                >
                  {LANGS.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {supported && (
            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="ghost" onClick={close}>
                {t("voice.cancel")}
              </Button>
              <Button onClick={stopAndContinue} disabled={!transcript}>
                <Square className="h-4 w-4" />
                {t("voice.stop")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
