"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRec {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (e: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void;
  onend: () => void;
  onerror: () => void;
  start(): void;
  stop(): void;
}

type SpeechCtor = new () => SpeechRec;

/** Web Speech API wrapper. Degrades gracefully when unavailable (§5.1.1). */
export function useVoiceInput(onText: (text: string) => void, lang = "en-IN") {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRec | null>(null);
  const onTextRef = useRef(onText);
  onTextRef.current = onText;

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    setSupported(true);
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;
    rec.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) onTextRef.current(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    };
  }, [lang]);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  }, [listening]);

  return { supported, listening, toggle };
}
