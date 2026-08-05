"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const SORTS = [
  { k: "near", label: "Near you" },
  { k: "hot", label: "Most co-signed" },
  { k: "new", label: "Newest" },
  { k: "done", label: "Resolved" },
];

/** Feed sort chips — reflected in the URL so the server re-queries. */
export function FeedSort({ active }: { active: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function pick(k: string) {
    const p = new URLSearchParams(params.toString());
    if (k === "near") p.delete("sort");
    else p.set("sort", k);
    router.push(`/feed${p.toString() ? `?${p}` : ""}`, { scroll: false });
  }

  return (
    <div className="filters" role="group" aria-label="Sort feed">
      {SORTS.map((s) => (
        <button
          key={s.k}
          className="fchip"
          aria-pressed={active === s.k}
          onClick={() => pick(s.k)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/** Upvote + co-sign actions on a feed post. */
export function PostActions({
  caseId,
  upvotes,
  viewerUpvoted,
  isOwn,
  viewerCosigned,
}: {
  caseId: string;
  upvotes: number;
  viewerUpvoted: boolean;
  isOwn: boolean;
  viewerCosigned: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(upvotes);
  const [up, setUp] = useState(viewerUpvoted);
  const [signed, setSigned] = useState(viewerCosigned);
  const [busy, setBusy] = useState(false);

  async function upvote() {
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/upvote`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) toast.error(d?.error?.message ?? "Couldn't upvote.");
      else {
        setUp(d.upvoted);
        setCount(d.count);
      }
    } finally {
      setBusy(false);
    }
  }

  async function cosign() {
    const reason = window.prompt(
      "Add your reason for co-signing — it carries weight in the officer's queue.",
    );
    if (!reason || reason.trim().length < 3) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d?.error?.message ?? "Couldn't co-sign.");
        return;
      }
      setSigned(true);
      toast.success("Co-signed — your name is on this case.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="acts">
      <button className="btn s up" onClick={upvote} disabled={busy || isOwn} aria-pressed={up}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
        </svg>
        {count}
      </button>
      <button
        className="btn p"
        style={{ flex: 1 }}
        onClick={cosign}
        disabled={busy || isOwn || signed}
      >
        {isOwn ? "Your complaint" : signed ? "Co-signed" : "Co-sign this"}
      </button>
    </div>
  );
}
