"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePrefsStore, type NotifyKey } from "@/store/prefs";

/** Confirm / Not fixed on a case whose officer says it is done. */
export function ConfirmActions({ caseId }: { caseId: string }) {
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
      toast.success(
        confirmed ? "Thanks — case closed." : "Reopened. The original clock continues.",
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nacts">
      <button className="btn p" disabled={busy} onClick={() => act(true)}>
        Confirm fix
      </button>
      <button className="btn s" disabled={busy} onClick={() => act(false)}>
        Not fixed
      </button>
    </div>
  );
}

/** Escalate now, once the charter limit has actually lapsed. */
export function EscalateActions({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    <div className="nacts">
      <button className="btn p" disabled={busy} onClick={escalate}>
        Escalate now
      </button>
      <button className="btn s" disabled={busy} onClick={() => router.push(`/cases/${caseId}`)}>
        Open the case
      </button>
    </div>
  );
}

/** Clears the update tray. Obligations are untouched — they are not notifications. */
export function MarkAllRead({ count }: { count: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function clear() {
    setBusy(true);
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!res.ok) {
        toast.error("Couldn't clear the updates.");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn s w" style={{ marginTop: 16 }} disabled={busy} onClick={clear}>
        Mark all updates as read
      </button>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 11, lineHeight: 1.55, textAlign: "center" }}>
        This clears the {count} update{count === 1 ? "" : "s"} only. The items that
        need you stay put.
      </div>
    </>
  );
}

const ROWS: { key: NotifyKey | "decisions"; title: string; sub: string }[] = [
  {
    key: "decisions",
    title: "Anything needing your decision",
    sub: "Confirmations, info requests, closing windows",
  },
  {
    key: "status",
    title: "Status changes on your cases",
    sub: "Assigned, inspected, escalated, resolved",
  },
  { key: "cosigned", title: "Cases you co-signed", sub: "Only when they close or escalate" },
  { key: "ward", title: "Ward reports and meetings", sub: "Monthly digest, ward meeting notices" },
  { key: "reputation", title: "Reputation and badges", sub: "Tier changes, badges, streaks" },
];

export function NotifSettings() {
  const notify = usePrefsStore((s) => s.notify);
  const toggleNotify = usePrefsStore((s) => s.toggleNotify);
  // Persisted state hydrates after mount; render the stored values only once
  // they are available so the switches never flip under the reader.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <>
      {ROWS.map((r) => {
        const locked = r.key === "decisions";
        const on = locked || (ready ? notify[r.key as NotifyKey] : false);
        return (
          <div className="setrow" key={r.key}>
            <div>
              <div className="st2">{r.title}</div>
              <div className="ss">{r.sub}</div>
            </div>
            <button
              className="tg"
              role="switch"
              aria-checked={on}
              aria-label={r.title}
              disabled={locked}
              onClick={() => !locked && toggleNotify(r.key as NotifyKey)}
            />
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 14, lineHeight: 1.55 }}>
        The first row cannot be turned off. An obligation you never hear about is
        the failure this whole app exists to prevent.
      </div>
    </>
  );
}
