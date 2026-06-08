"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Sparkles,
  Upload,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
} from "lucide-react";
import { WARDS, DEPARTMENTS, CATEGORIES } from "@/lib/seed-data";
import { humanizeCode } from "@/lib/utils";
import { useIntakeStore } from "@/store/intake";
import { useSession } from "@/hooks/use-session";
import {
  useDraft,
  useClassify,
  useDuplicates,
  type DuplicateMatch,
} from "@/hooks/use-ai";
import { useCreateCase } from "@/hooks/use-cases";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaveGuard } from "@/components/citizen/leave-guard";
import { useT } from "@/components/providers/locale-provider";
import type { Severity } from "@/types";

const STEPS = ["Describe", "Categorise", "Evidence", "Confirm"];
const ACCEPT = "image/jpeg,image/png,image/webp,video/mp4";

export function IntakeWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useSession();
  const s = useIntakeStore();
  const tr = useT();

  // Avoid hydration mismatch from persisted store: render only after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Once we navigate away on submit, stop the step→URL effect clobbering it.
  const navigatingRef = useRef(false);

  // Sync initial step from URL once.
  const initedRef = useRef(false);
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    const urlStep = Number(params.get("step"));
    if (urlStep >= 1 && urlStep <= 4) s.setStep(urlStep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect step in URL.
  useEffect(() => {
    if (!mounted || navigatingRef.current) return;
    router.replace(`/file?step=${s.step}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.step, mounted]);

  const wardForDupes = s.wardCode || user?.wardCode || "";

  // ---- AI: duplicates (debounced) ----
  const duplicates = useDuplicates();
  const [dupes, setDupes] = useState<DuplicateMatch[]>([]);
  useEffect(() => {
    if (s.body.trim().length < 30 || !wardForDupes) {
      setDupes([]);
      return;
    }
    const t = setTimeout(() => {
      duplicates.mutate(
        { title: s.title, body: s.body, wardCode: wardForDupes },
        { onSuccess: (d) => setDupes(d.matches) },
      );
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.body, wardForDupes]);

  // ---- AI: draft / polish ----
  const draft = useDraft();
  const [showDiff, setShowDiff] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");

  function polish() {
    draft.mutate(s.body, {
      onSuccess: (d) => {
        if (d.fallback) {
          toast.info("AI is paused — your text was kept as-is.");
          return;
        }
        setDraftTitle(d.title);
        setDraftBody(d.body);
        setShowDiff(true);
      },
      onError: (e) => toast.error(e.message),
    });
  }

  // ---- AI: classify on entering step 2 ----
  const classify = useClassify();
  const classifyStartedRef = useRef(false);
  useEffect(() => {
    if (s.step !== 2 || s.aiClassified || classifyStartedRef.current) return;
    if (s.body.trim().length < 30) return;
    classifyStartedRef.current = true;
    classify.mutate(
      { title: s.title, body: s.body, wardCode: wardForDupes || undefined },
      {
        onSuccess: (c) => {
          s.setField("departmentCode", c.departmentCode);
          s.setField("categoryId", c.categoryId);
          s.setField("severity", c.severity);
          s.setField("confidence", c.confidence);
          s.setField("aiClassified", true);
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.step]);

  // ---- voice ----
  const voice = useVoiceInput((t) =>
    s.setField("body", (s.body ? s.body + " " : "") + t),
  );

  // ---- evidence upload ----
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 5 - s.evidence.length;
    const list = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      for (const file of list) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5 MB.`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data?.error?.message ?? "Upload failed.");
          continue;
        }
        s.addEvidence(data);
      }
    } finally {
      setUploading(false);
    }
  }

  // ---- submit ----
  const createCase = useCreateCase();
  function submit() {
    createCase.mutate(
      {
        title: s.title || s.body.slice(0, 80),
        body: s.body,
        wardCode: s.wardCode,
        departmentCode: s.departmentCode,
        categoryId: s.categoryId,
        severity: s.severity,
        isPublic: s.isPublic,
        evidence: s.evidence,
      },
      {
        onSuccess: (c) => {
          navigatingRef.current = true;
          router.push(`/cases/${c.id}?new=1`);
          s.reset();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  const cats = useMemo(
    () => CATEGORIES.filter((c) => c.departmentCode === s.departmentCode),
    [s.departmentCode],
  );

  const canNext =
    (s.step === 1 && s.body.trim().length >= 30) ||
    (s.step === 2 && !!s.wardCode && !!s.departmentCode && !!s.categoryId) ||
    s.step === 3;

  function ensureTitle() {
    if (!s.title.trim()) {
      const first = s.body.trim().split(/[.!?\n]/)[0].slice(0, 80);
      s.setField("title", first || s.body.slice(0, 80));
    }
  }

  function next() {
    if (s.step === 1) ensureTitle();
    s.next();
  }

  if (!mounted) {
    return (
      <div className="mx-auto w-full max-w-[720px] space-y-4">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Guard against losing an in-progress complaint on navigation.
  const dirty =
    !createCase.isPending &&
    !navigatingRef.current &&
    (s.title.trim() !== "" ||
      s.body.trim() !== "" ||
      s.evidence.length > 0 ||
      s.step > 1);

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <LeaveGuard
        active={dirty}
        onSaveDraft={() => toast.success(tr("leaveGuard.draftSaved"))}
        onDiscard={() => {
          s.reset();
          toast.message(tr("leaveGuard.draftDiscarded"));
        }}
      />
      {/* stepper */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Step {s.step} of 4 · {STEPS[s.step - 1]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < s.step ? "bg-brand" : "bg-surface-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ---------- Step 1: Describe ---------- */}
      {s.step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              What&rsquo;s the issue?
            </CardTitle>
            <CardDescription>
              Describe it in your own words. We&rsquo;ll help clean it up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea
                value={s.body}
                onChange={(e) => s.setField("body", e.target.value)}
                placeholder="What's the issue? Describe in your own words…"
                rows={6}
                maxLength={2000}
                className="resize-none pr-12"
              />
              {voice.supported && (
                <Button
                  type="button"
                  size="icon"
                  variant={voice.listening ? "default" : "ghost"}
                  className="absolute right-2 top-2"
                  aria-label={voice.listening ? "Stop voice input" : "Start voice input"}
                  onClick={voice.toggle}
                >
                  {voice.listening ? <MicOff /> : <Mic />}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${
                  s.body.trim().length < 30
                    ? "text-muted-foreground"
                    : "text-success"
                }`}
              >
                {s.body.length}/2000 · min 30
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={polish}
                disabled={draft.isPending || s.body.trim().length < 30}
              >
                {draft.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                Polish my complaint
              </Button>
            </div>

            {/* duplicates panel */}
            {dupes.length > 0 && (
              <div className="bg-surface-muted space-y-2 rounded-md p-3">
                <p className="text-sm font-medium">Others nearby reported similar</p>
                {dupes.map((d) => (
                  <div
                    key={d.caseId}
                    className="bg-surface flex items-center justify-between gap-3 rounded-md border p-2"
                  >
                    <p className="min-w-0 truncate text-sm">{d.title}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => router.push(`/cases/${d.caseId}`)}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Join
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------- Step 2: Categorise ---------- */}
      {s.step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Where does this go?
            </CardTitle>
            <CardDescription>
              We&rsquo;ve suggested a category — adjust anything that&rsquo;s off.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {classify.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <p className="text-muted-foreground text-sm">
                  Classifying… you can also pick manually.
                </p>
              </div>
            ) : null}

            {s.confidence !== null && (
              <Badge variant="secondary">
                AI is {Math.round(s.confidence * 100)}% sure
              </Badge>
            )}

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={s.departmentCode}
                onValueChange={(v) => {
                  s.setField("departmentCode", v);
                  s.setField("categoryId", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={s.categoryId}
                onValueChange={(v) => s.setField("categoryId", v)}
                disabled={!s.departmentCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex gap-2">
                {(["LOW", "MEDIUM", "HIGH"] as Severity[]).map((sev) => (
                  <Button
                    key={sev}
                    type="button"
                    variant={s.severity === sev ? "default" : "outline"}
                    size="sm"
                    onClick={() => s.setField("severity", sev)}
                  >
                    {sev[0] + sev.slice(1).toLowerCase()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Ward <span className="text-danger">·</span>
              </Label>
              <Select
                value={s.wardCode}
                onValueChange={(v) => s.setField("wardCode", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your ward" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {WARDS.map((w) => (
                    <SelectItem key={w.code} value={w.code}>
                      {w.name} ({w.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- Step 3: Evidence ---------- */}
      {s.step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Add evidence</CardTitle>
            <CardDescription>
              Optional — up to 5 photos or short videos (≤ 5 MB each).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="hover:border-brand flex w-full flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors"
            >
              {uploading ? (
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              ) : (
                <Upload className="text-muted-foreground h-6 w-6" />
              )}
              <span className="text-sm font-medium">
                Tap to upload or drag files here
              </span>
              <span className="text-muted-foreground text-xs">
                JPG, PNG, WebP or MP4
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />

            {s.evidence.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {s.evidence.map((e) => (
                  <div
                    key={e.url}
                    className="group relative aspect-square overflow-hidden rounded-md border"
                  >
                    {e.kind === "photo" ? (
                      <Image
                        src={e.url}
                        alt={e.filename}
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    ) : (
                      <video src={e.url} className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => s.removeEvidence(e.url)}
                      className="bg-background/90 absolute right-1 top-1 rounded-full p-1 shadow"
                      aria-label={`Remove ${e.filename}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ---------- Step 4: Confirm ---------- */}
      {s.step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">
              Review &amp; file
            </CardTitle>
            <CardDescription>Check the details, then file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Title" onEdit={() => s.setStep(1)}>
              {s.title || "—"}
            </Row>
            <Row label="Description" onEdit={() => s.setStep(1)}>
              {s.body}
            </Row>
            <Row label="Department" onEdit={() => s.setStep(2)}>
              {humanizeCode(s.departmentCode)} ·{" "}
              {CATEGORIES.find((c) => c.id === s.categoryId)?.name ?? "—"}
            </Row>
            <Row label="Severity" onEdit={() => s.setStep(2)}>
              {s.severity[0] + s.severity.slice(1).toLowerCase()}
            </Row>
            <Row label="Ward" onEdit={() => s.setStep(2)}>
              {WARDS.find((w) => w.code === s.wardCode)?.name ?? "—"} ({s.wardCode})
            </Row>
            <Row label="Evidence" onEdit={() => s.setStep(3)}>
              {s.evidence.length
                ? `${s.evidence.length} file(s)`
                : "No evidence attached"}
            </Row>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Show on public feed</p>
                <p className="text-muted-foreground text-xs">
                  Anonymised — your name is never shown.
                </p>
              </div>
              <Switch
                checked={s.isPublic}
                onCheckedChange={(v) => s.setField("isPublic", v)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------- footer nav ---------- */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={s.prev}
          disabled={s.step === 1}
        >
          <ChevronLeft />
          Back
        </Button>
        {s.step < 4 ? (
          <Button type="button" onClick={next} disabled={!canNext}>
            Next
            <ChevronRight />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={submit}
            disabled={createCase.isPending}
          >
            {createCase.isPending ? <Loader2 className="animate-spin" /> : <Check />}
            File complaint
          </Button>
        )}
      </div>

      {/* polish diff dialog */}
      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Polished version</DialogTitle>
            <DialogDescription>
              We kept your facts and tidied the wording.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Yours
              </p>
              <p className="text-sm">{s.body}</p>
            </div>
            <div className="bg-brand-soft space-y-1 rounded-md p-2">
              <p className="text-brand text-xs font-semibold uppercase">AI</p>
              <p className="text-sm font-medium">{draftTitle}</p>
              <p className="text-sm">{draftBody}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDiff(false)}>
              Keep mine
            </Button>
            <Button
              onClick={() => {
                s.setField("title", draftTitle);
                s.setField("body", draftBody);
                setShowDiff(false);
                toast.success("Using the polished version.");
              }}
            >
              Use AI version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0">
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs font-semibold uppercase">
          {label}
        </p>
        <p className="mt-0.5 break-words text-sm">{children}</p>
      </div>
      <Button type="button" variant="link" size="sm" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}
