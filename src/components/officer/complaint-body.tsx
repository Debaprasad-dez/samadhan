"use client";

import { useState } from "react";
import { Loader2, Globe } from "lucide-react";
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

export function ComplaintBody({
  body,
  originalLang = "en",
}: {
  body: string;
  originalLang?: string;
}) {
  const [viewLang, setViewLang] = useState<string | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        throw new Error(err.error || "Translation failed");
      }

      const data = (await res.json()) as { translated: string; lang: string };
      setTranslated(data.translated);
      setViewLang(lang);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't translate. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const displayText = translated || body;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Complaint details
        </span>
        {LOCALES.filter((l) => l.code !== originalLang).length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={viewLang || ""}
              onValueChange={translate}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-32 text-sm">
                <Globe className="h-3.5 w-3.5" />
                <SelectValue placeholder="Translate" />
              </SelectTrigger>
              <SelectContent side="left">
                {/* Show original language */}
                <SelectItem value={originalLang}>
                  {LOCALES.find((l) => l.code === originalLang)?.english ||
                    originalLang}{" "}
                  (original)
                </SelectItem>
                {/* Show available languages */}
                {LOCALES.filter((l) => l.code !== originalLang).map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.english}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      <div className={cn("rounded-md border p-4", "whitespace-pre-wrap text-sm leading-relaxed")}>
        {displayText}
      </div>

      {viewLang && viewLang !== originalLang && (
        <p className="text-muted-foreground text-xs">
          Viewing in {LOCALES.find((l) => l.code === viewLang)?.english || viewLang}
        </p>
      )}
    </div>
  );
}
