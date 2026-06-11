"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES } from "@/lib/i18n";
import { useT } from "@/components/providers/locale-provider";

/**
 * Officer/worker language setting. Reuses the shared (un-role-gated)
 * /api/profile/settings endpoint; the saved `language` is read back by the
 * root LocaleProvider so the whole dashboard reskins on refresh. Language only
 * — staff have no AI-assist / leaderboard options.
 */
export function OfficerSettingsForm({
  initialLanguage,
}: {
  initialLanguage: string;
}) {
  const router = useRouter();
  const t = useT();
  const [language, setLanguage] = useState(initialLanguage);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const toastId = toast.loading(t("settings.applying"));
    try {
      const res = await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? t("settings.applyError"), {
          id: toastId,
        });
      } else {
        toast.success(t("settings.saved"), { id: toastId });
        router.refresh();
      }
    } catch {
      toast.error(t("settings.applyError"), { id: toastId });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>{t("settings.language")}</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {LOCALES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.code === "en" ? "English" : `${l.native} · ${l.english}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={save} disabled={saving || language === initialLanguage}>
        {saving && <Loader2 className="animate-spin" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}
