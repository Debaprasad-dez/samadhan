import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { CATEGORIES, WARDS } from "@/lib/seed-data";
import { humanizeCode, formatIST } from "@/lib/utils";
import { getDict, translate } from "@/lib/i18n";
import { StatusBadge, SeverityChip } from "@/components/case/status-badge";
import { SlaRing } from "@/components/case/sla-ring";
import { CaseTimeline } from "@/components/case/case-timeline";
import { EvidenceGallery } from "@/components/case/evidence-gallery";
import { CaseActions } from "@/components/officer/case-actions";
import { AiBrief } from "@/components/officer/ai-brief";
import { ComplaintBody } from "@/components/officer/complaint-body";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CaseStatus, Severity } from "@/types";

export default async function OfficerCaseView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await requireRole(["OFFICER"]);
  const dict = getDict(viewer.language);
  const t = (k: string) => translate(dict, k);

  const c = await db.case.findUnique({
    where: { id },
    include: {
      events: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true, role: true } } },
      },
      evidence: true,
      filedBy: { select: { name: true, reputation: true } },
      _count: { select: { upvotes: true, cosigns: true } },
    },
  });
  if (!c) notFound();

  const category = CATEGORIES.find((x) => x.id === c.categoryId)?.name ?? "—";
  const ward = WARDS.find((x) => x.code === c.wardCode)?.name ?? c.wardCode;

  const similar = await db.case.findMany({
    where: {
      categoryId: c.categoryId,
      id: { not: c.id },
      status: { in: ["RESOLVED", "CLOSED"] },
    },
    orderBy: { resolvedAt: "desc" },
    take: 3,
    select: { id: true, number: true, title: true, qualityScore: true },
  });

  // Reassign is available to department leads (and admins).
  const me = await db.user.findUnique({
    where: { id: viewer.id },
    select: { isDeptLead: true },
  });
  const canReassign = !!me?.isDeptLead;
  const deptOfficers = canReassign
    ? await db.user.findMany({
        where: {
          role: "OFFICER",
          departmentCode: c.departmentCode,
          id: { not: viewer.id },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="space-y-5">
      <Link
        href="/inbox"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← {t("nav.inbox")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted-foreground font-mono text-xs">{c.number}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold">{c.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status as CaseStatus} />
            <SeverityChip severity={c.severity as Severity} />
            <Badge variant="outline">{humanizeCode(c.departmentCode)}</Badge>
            <Badge variant="outline">{category}</Badge>
            <Badge variant="outline">
              {ward} ({c.wardCode})
            </Badge>
            {c.escalated && (
              <Badge className="bg-danger-soft text-danger">
                {t("status.ESCALATED")}
              </Badge>
            )}
          </div>
        </div>
        <SlaRing
          createdAt={c.createdAt.toISOString()}
          dueAt={c.slaDueAt.toISOString()}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* left: case + timeline */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-5">
              <ComplaintBody body={c.body} />
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
                <span>
                  {t("case.filedBy")} {c.filedBy.name}
                </span>
                <span>
                  {t("case.reputation")} {c.filedBy.reputation}
                </span>
                <span>
                  {c._count.cosigns} {t("case.coSigners")}
                </span>
                <span>
                  {c._count.upvotes} {t("case.upvotes")}
                </span>
                <span>
                  {t("case.filed")} {formatIST(c.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {c.evidence.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-semibold">
                {t("case.evidence")}
              </h2>
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
            <h2 className="font-display text-lg font-semibold">
              {t("case.timeline")}
            </h2>
            <CaseTimeline
              events={c.events.map((e) => ({
                id: e.id,
                type: e.type,
                message: e.message,
                createdAt: e.createdAt.toISOString(),
                actor: e.actor,
              }))}
            />
          </section>
        </div>

        {/* right: actions + AI brief + similar */}
        <aside className="space-y-4">
          <CaseActions
            caseId={c.id}
            status={c.status as CaseStatus}
            canReassign={canReassign}
            officers={deptOfficers}
          />
          <AiBrief caseId={c.id} />
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold">{t("case.similar")}</p>
              {similar.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("case.noneYet")}
                </p>
              ) : (
                similar.map((s) => (
                  <Link
                    key={s.id}
                    href={`/case/${s.id}`}
                    className="hover:bg-surface-muted block rounded-md p-2 text-sm"
                  >
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {s.number}
                      {s.qualityScore !== null
                        ? ` · ${t("case.quality")} ${s.qualityScore}/10`
                        : ""}
                    </p>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
