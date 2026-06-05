"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Flame, Loader2 } from "lucide-react";
import { FeedCard, type FeedItem } from "@/components/public/feed-card";
import { EmptyState } from "@/components/shared/empty-state";
import { EmptySearch } from "@/components/art/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { WARDS, DEPARTMENTS } from "@/lib/seed-data";
import { CASE_STATUSES } from "@/types";
import { humanizeCode } from "@/lib/utils";

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [hot, setHot] = useState<FeedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ward, setWard] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const pageRef = useRef(1);

  const qs = useCallback(
    (page: number) => {
      const p = new URLSearchParams();
      if (ward) p.set("ward", ward);
      if (dept) p.set("dept", dept);
      if (status) p.set("status", status);
      p.set("page", String(page));
      return p.toString();
    },
    [ward, dept, status],
  );

  const load = useCallback(
    async (reset: boolean) => {
      setLoading(true);
      const page = reset ? 1 : pageRef.current + 1;
      try {
        const res = await fetch(`/api/public/feed?${qs(page)}`);
        const d = await res.json();
        if (res.ok) {
          pageRef.current = page;
          setTotal(d.total ?? 0);
          setItems((prev) => (reset ? d.cases : [...prev, ...d.cases]));
        }
      } finally {
        setLoading(false);
      }
    },
    [qs],
  );

  // hot strip (once)
  useEffect(() => {
    fetch("/api/public/feed?scope=hot")
      .then((r) => r.json())
      .then((d) => setHot(d.cases ?? []))
      .catch(() => undefined);
  }, []);

  // reset + load on filter change
  useEffect(() => {
    load(true);
  }, [load]);

  // infinite scroll sentinel
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && items.length < total) {
        load(false);
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loading, items.length, total, load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Public feed</h1>
        <p className="text-muted-foreground text-sm">
          Civic complaints across Mumbai · anonymised
        </p>
      </div>

      {/* hot zone */}
      {hot.length > 0 && (
        <section className="space-y-2">
          <p className="text-warning inline-flex items-center gap-1.5 text-sm font-semibold">
            <Flame className="h-4 w-4" /> Top issues this week
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {hot.map((h) => (
              <div key={h.id} className="w-64 shrink-0">
                <FeedCard item={h} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={ward} onChange={setWard} label="All wards">
          {WARDS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </Select>
        <Select value={dept} onChange={setDept} label="All departments">
          {DEPARTMENTS.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={setStatus} label="Any status">
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanizeCode(s)}
            </option>
          ))}
        </Select>
      </div>

      {/* grid */}
      {loading && items.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          illustration={<EmptySearch />}
          title="No complaints match"
          description="Try a different ward, department, or status — or reset the filters."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <FeedCard key={it.id} item={it} />
            ))}
          </div>
          <div ref={sentinel} className="flex justify-center py-4">
            {loading && <Loader2 className="text-muted-foreground animate-spin" />}
            {!loading && items.length >= total && total > 0 && (
              <p className="text-muted-foreground text-xs">
                That&rsquo;s everything.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-input bg-background h-8 rounded-md border px-2 text-sm"
    >
      <option value="">{label}</option>
      {children}
    </select>
  );
}
