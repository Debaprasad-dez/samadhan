"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** Confirm / Not-fixed actions on a resolved case (mockup "Awaiting you"). */
export function ConfirmFix({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(confirmed: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't update the case.");
        return;
      }
      toast.success(confirmed ? "Thanks — case closed." : "Reopened. The original clock continues.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button
        className="btn p"
        style={{ flex: 1, padding: "12px 14px", fontSize: 13 }}
        disabled={busy}
        onClick={() => act(true)}
      >
        Confirm fix
      </button>
      <button
        className="btn s"
        style={{ flex: 1, padding: "12px 14px", fontSize: 13 }}
        disabled={busy}
        onClick={() => act(false)}
      >
        Not fixed
      </button>
    </div>
  );
}
