"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALES } from "@/lib/i18n";
import { useT } from "@/components/providers/locale-provider";

export function SettingsForm({
  initial,
}: {
  initial: {
    language: string;
    aiAssistLevel: string;
    showOnLeaderboard: boolean;
  };
}) {
  const router = useRouter();
  const t = useT();
  const [language, setLanguage] = useState(initial.language);
  const [aiAssistLevel, setAi] = useState(initial.aiAssistLevel);
  const [showOnLeaderboard, setShow] = useState(initial.showOnLeaderboard);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, aiAssistLevel, showOnLeaderboard }),
      });
      const d = await res.json();
      if (!res.ok) toast.error(d?.error?.message ?? "Couldn't save.");
      else {
        toast.success(t("settings.saved"));
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <Label>{t("settings.aiAssist")}</Label>
        <Select value={aiAssistLevel} onValueChange={setAi}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">{t("settings.aiFull")}</SelectItem>
            <SelectItem value="reduced">{t("settings.aiReduced")}</SelectItem>
            <SelectItem value="off">{t("settings.aiOff")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <p className="text-sm font-medium">Show my name on leaderboards</p>
          <p className="text-muted-foreground text-xs">
            Off shows your initials only.
          </p>
        </div>
        <Switch checked={showOnLeaderboard} onCheckedChange={setShow} />
      </div>

      <Button onClick={save} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}
