import { notFound } from "next/navigation";
import { ThumbsUp, Users, Share2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS, slaDaysForCategory } from "@/lib/seed-data";
import { humanizeCode, formatIST } from "@/lib/utils";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { SlaRing } from "@/components/case/sla-ring";
import { SlaBar } from "@/components/primitives/sla-bar";
import { JourneyRail, type JourneyEvent } from "@/components/primitives/journey-rail";
import { EvidenceGallery } from "@/components/case/evidence-gallery";
import { CaseEngagement } from "@/components/case/case-engagement";
import { SlaPredictChip } from "@/components/case/sla-predict-chip";
import { RtiDraftButton } from "@/components/case/rti-draft-button";
import { Celebration } from "@/components/motion/celebration";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CaseStatus, Severity } from "@/types";

export default async function CaseDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const user = await getCurrentUser();

  const c = await db.case.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
      evidence: true,
      filedBy: { select: { id: true, name: true, reputation: true } },
      _count: { select: { upvotes: true, cosigns: true } },
    },
  });

  if (!c) notFound();

  const isOwner = user?.id === c.filedById;
  const isStaff = user?.role === "OFFICER" || user?.role === "ADMIN";
  if (!isOwner && !isStaff && !c.isPublic) notFound();

  const category = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—";
  const ward = WARDS.find((x) => x.code === c.wardCode)?.name ?? c.wardCode;

  // Viewer engagement state (for upvote/cosign toggles).
  let viewerUpvoted = false;
  let viewerCosigned = false;
  if (user && !isOwner) {
    const [uv, cs] = await Promise.all([
      db.upvote.findUnique({
        where: { caseId_userId: { caseId: c.id, userId: user.id } },
        select: { id: true },
      }),
      db.cosign.findUnique({
        where: { caseId_userId: { caseId: c.id, userId: user.id } },
        select: { id: true },
      }),
    ]);
    viewerUpvoted = !!uv;
    viewerCosigned = !!cs;
  }

  const isOpen = c.status !== "RESOLVED" && c.status !== "CLOSED";
  const daysSince = Math.floor(
    (Date.now() - c.createdAt.getTime()) / 86_400_000,
  );
  const stalled = isOpen && daysSince >= 30 && isOwner;

  // Build the JourneyRail timeline: stage-duration chips (gap from the previous
  // event), a single live node (latest event while open), and a ghosted future
  // rung for the SLA/escalation date.
  const evs = c.events;
  const journeyEvents: JourneyEvent[] = evs.map((e, i) => ({
    id: e.id,
    type: e.type,
    message: e.message,
    createdAt: e.createdAt.toISOString(),
    actor: e.actor,
    durationLabel:
      i > 0
        ? gapLabel(e.createdAt.getTime() - evs[i - 1].createdAt.getTime())
        : undefined,
    live: isOpen && i === evs.length - 1,
  }));
  if (isOpen) {
    journeyEvents.push({
      id: "future-sla",
      type: "ESCALATED",
      label: "Awaiting resolution",
      message: `Auto-escalates to the ward lead if unresolved by ${formatIST(c.slaDueAt)}.`,
      createdAt: c.slaDueAt.toISOString(),
      future: true,
    });
  }
  const elapsedHours = (Date.now() - c.createdAt.getTime()) / 3_600_000;
  const slaLimitDays = slaDaysForCategory(c.categoryId);
  const remainingMs = c.slaDueAt.getTime() - Date.now();
  const remH = Math.round(Math.abs(remainingMs) / 3_600_000);
  const remLabel =
    remainingMs >= 0
      ? `${Math.floor(remH / 24)}d ${String(remH % 24).padStart(2, "0")}h`
      : "overdue";
  const dayOf = Math.min(slaLimitDays, Math.max(1, Math.ceil(elapsedHours / 24)));

  return (
    <div className="space-y-6">
      {isNew === "1" && <Celebration />}

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground font-mono text-xs">{c.number}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold">{c.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status as CaseStatus} />
            <SeverityChip severity={c.severity as Severity} />
            <Badge variant="outline">{humanizeCode(c.departmentCode)}</Badge>
            <Badge variant="outline">
              {ward} ({c.wardCode})
            </Badge>
          </div>
        </div>
        <SlaRing
          createdAt={c.createdAt.toISOString()}
          dueAt={c.slaDueAt.toISOString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* left: body + timeline + evidence */}
        <div className="space-y-6">
          {/* Mockup SLA header — leads with the clock, not history. */}
          {isOpen && (
            <div className="mk">
              <div className="card">
                <div className="cb">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <div>
                      <div className="k">Time left before escalation</div>
                      <div className="v">
                        {remLabel} <small>of {slaLimitDays}d</small>
                      </div>
                    </div>
                    <span className="pill wn">
                      Day {dayOf} of {slaLimitDays}
                    </span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <SlaBar elapsedHours={elapsedHours} limitDays={slaLimitDays} />
                  </div>
                  <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                    <span className="pill if">{c._count.cosigns} co-signs</span>
                    <span className="pill nu">{c.isPublic ? "Public" : "Private"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card>
            <CardContent className="p-5">
              <p className="text-muted-foreground mb-1 text-xs font-semibold uppercase">
                Complaint
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {c.body}
              </p>
              <div className="mt-4 border-t pt-3">
                <CaseEngagement
                  caseId={c.id}
                  isOwner={isOwner}
                  initialUpvotes={c._count.upvotes}
                  viewerUpvoted={viewerUpvoted}
                  initialCosigns={c._count.cosigns}
                  viewerCosigned={viewerCosigned}
                />
              </div>
            </CardContent>
          </Card>

          {c.evidence.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold">Evidence</h2>
              <EvidenceGallery
                items={c.evidence.map((e) => ({
                  url: e.url,
                  kind: e.kind,
                  filename: e.filename,
                }))}
              />
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">Timeline</h2>
            <JourneyRail variant="timeline" events={journeyEvents} />
          </section>
        </div>

        {/* right: meta */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-3 p-4 text-sm">
              <Meta label="Category" value={category} />
              <Meta
                label="Filed"
                value={formatIST(c.createdAt)}
              />
              <Meta label="SLA due" value={formatIST(c.slaDueAt)} />
              {isOpen && (
                <div className="pt-1">
                  <SlaBar elapsedHours={elapsedHours} limitDays={slaLimitDays} />
                </div>
              )}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <ThumbsUp className="h-4 w-4" />
                  {c._count.upvotes}
                </span>
                <span className="text-muted-foreground inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {c._count.cosigns} co-signers
                </span>
              </div>
              {c.qualityScore !== null && (
                <div className="border-t pt-3">
                  <Meta
                    label="Resolution quality"
                    value={`${c.qualityScore}/10`}
                  />
                  {c.isBoilerplate && (
                    <p className="text-warning mt-2 text-xs">
                      AI suspects this closure may be inadequate.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {isOpen && (
            <SlaPredictChip
              departmentCode={c.departmentCode}
              categoryId={c.categoryId}
              wardCode={c.wardCode}
              severity={c.severity as Severity}
            />
          )}

          {stalled && (
            <Card className="border-warning/30 bg-warning-soft">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">Stalled past 30 days</p>
                <p className="text-muted-foreground text-xs">
                  No resolution in {daysSince} days. You can file an RTI to demand
                  a status update.
                </p>
                <RtiDraftButton caseId={c.id} number={c.number} />
              </CardContent>
            </Card>
          )}

          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            {c.isPublic ? "Visible on public feed (anonymised)" : "Private"}
          </p>
        </aside>
      </div>
    </div>
  );
}

// Gap between two timeline events → a compact "21 min" / "2d 5h" chip.
function gapLabel(ms: number): string {
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.round(mins / 60);
  const d = Math.floor(h / 24);
  const r = h % 24;
  if (d > 0) return r > 0 ? `${d}d ${r}h` : `${d}d`;
  return `${h}h`;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
