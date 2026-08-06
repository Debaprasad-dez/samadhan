"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";

/** The case-detail action bar: add a photo, or pull an escalation forward. */
export function CaseSticky({
  caseId,
  canEscalate,
  escalateHint,
  isOwner,
}: {
  caseId: string;
  canEscalate: boolean;
  escalateHint: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function addPhoto(original: File) {
    setBusy(true);
    try {
      const file = await compressImage(original);
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Files must be under 4 MB.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await up.json();
      if (!up.ok) {
        toast.error(d?.error?.message ?? "Upload failed.");
        return;
      }
      const res = await fetch(`/api/cases/${caseId}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
      const r = await res.json();
      if (!res.ok) {
        toast.error(r?.error?.message ?? "Couldn't attach the photo.");
        return;
      }
      toast.success("Photo added to the case.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function escalate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/escalate`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't escalate.");
        return;
      }
      toast.success("Escalated to the next rung.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) addPhoto(f);
          e.target.value = "";
        }}
      />
      <button
        className="btn s"
        style={{ flex: 1 }}
        disabled={busy || !isOwner}
        onClick={() => fileRef.current?.click()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5h3.2l1.4-2.4h7.8l1.4 2.4h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" />
          <circle cx="12" cy="13.2" r="3.6" />
        </svg>
        Add a photo
      </button>
      <button
        className="btn p"
        style={{ flex: 1 }}
        disabled={busy || !canEscalate}
        title={canEscalate ? undefined : escalateHint}
        onClick={escalate}
      >
        Escalate now
      </button>
    </div>
  );
}
