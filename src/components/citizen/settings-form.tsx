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
        toast.success("Settings saved.");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Language</Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>AI assistance</Label>
        <Select value={aiAssistLevel} onValueChange={setAi}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="reduced">Reduced</SelectItem>
            <SelectItem value="off">Off</SelectItem>
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
        Save settings
      </Button>
    </div>
  );
}
