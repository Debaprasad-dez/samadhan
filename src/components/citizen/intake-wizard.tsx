"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { WARDS, DEPARTMENTS, CATEGORIES } from "@/lib/seed-data";
import { humanizeCode } from "@/lib/utils";
import { useIntakeStore } from "@/store/intake";
import { usePrefsStore } from "@/store/prefs";
import { useSession } from "@/hooks/use-session";
import {
  useDraft,
  useClassify,
  useDuplicates,
  type DuplicateMatch,
} from "@/hooks/use-ai";
import { useCreateCase } from "@/hooks/use-cases";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { LeaveGuard } from "@/components/citizen/leave-guard";
import { deskScene } from "@/lib/art/desk-scene";

const STEPS = ["Describe", "Categorise", "Evidence", "Confirm"];

const IC = {
  back: <path d="M14.5 5.5 8 12l6.5 6.5" />,
  mic: <><rect x="9.3" y="3" width="5.4" height="10.4" rx="2.7" /><path d="M5.6 11a6.4 6.4 0 0 0 12.8 0M12 17.4V21" /></>,
  cam: <><path d="M3.5 8.5h3.2l1.4-2.4h7.8l1.4 2.4h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1Z" /><circle cx="12" cy="13.2" r="3.6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chk2: <path d="M5 12.5 10 17.5 19 6.5" />,
  pinmk: <><path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" /><circle cx="12" cy="10.5" r="2.4" /></>,
  clk: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  drop: <path d="M12 3.6c2.9 3.6 5.4 6.5 5.4 9.4a5.4 5.4 0 0 1-10.8 0c0-2.9 2.5-5.8 5.4-9.4Z" />,
  bolt: <path d="M13.4 3.2 6.2 13.4h5L10.6 20.8 17.8 10.6h-5l.6-7.4Z" />,
  road: <path d="M7.6 3.6 4.6 20.4M16.4 3.6l3 16.8M12 4.2v2.6M12 10.6v2.6M12 16.8v3" />,
  trash: <path d="M4.6 6.6h14.8M9.6 6.6V4.6h4.8v2M6.6 6.6l1 12a1.5 1.5 0 0 0 1.5 1.4h5.8a1.5 1.5 0 0 0 1.5-1.4l1-12" />,
  lamp: <><path d="M12 20.4V9.2M12 9.2a3.4 3.4 0 0 0 3.4-3.4H8.6A3.4 3.4 0 0 0 12 9.2Z" /><path d="M8.2 20.4h7.6" /></>,
  replay: <><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v5h-5" /></>,
} as const;

function Icon({ d, sw = 1.7 }: { d: keyof typeof IC; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {IC[d]}
    </svg>
  );
}

// Department → the mockup's glyph.
const DEPT_ICON: Record<string, keyof typeof IC> = {
  WATER: "drop",
  ROADS: "road",
  SANITATION: "trash",
  ELECTRICITY: "bolt",
  PUBLIC_WORKS: "lamp",
  HEALTH: "pinmk",
  EDUCATION: "pinmk",
  POLICE: "pinmk",
};

const LANGS = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "mr", label: "मराठी" },
];

export function IntakeWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const user = useSession();
  const s = useIntakeStore();
  const prefWard = usePrefsStore((p) => p.wardCode);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [lang, setLang] = useState("en");
  const [landmark, setLandmark] = useState("");
  const [aiText, setAiText] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigatingRef = useRef(false);

  // Default the ward to the citizen's chosen/home ward.
  useEffect(() => {
    if (mounted && !s.wardCode) {
      const w = prefWard || user?.wardCode;
      if (w) s.setField("wardCode", w);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

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

  // ---- AI: rephrase for the department ----
  const draft = useDraft();
  function polish() {
    draft.mutate(s.body, {
      onSuccess: (d) => {
        if (d.fallback) {
          toast.info("AI is paused — your text was kept as-is.");
          return;
        }
        setAiText(d.body);
        if (!s.title.trim()) s.setField("title", d.title);
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
  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 5 - s.evidence.length);
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

  // ---- hero, repainted per step + theme ----
  const dept = DEPARTMENTS.find((d) => d.code === s.departmentCode);
  const paintHero = useCallback(() => {
    const host = heroRef.current;
    if (!host) return;
    host.querySelector("svg")?.remove();
    host.insertAdjacentHTML(
      "afterbegin",
      deskScene(s.step, {
        dept: (dept?.code ?? "DEPT").slice(0, 8),
        confidence: s.confidence ? Math.round(s.confidence * 100) : 0,
        number: "READY TO FILE",
      }),
    );
  }, [s.step, dept?.code, s.confidence]);

  useEffect(() => {
    paintHero();
    const mo = new MutationObserver(paintHero);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, [paintHero]);

  // ---- submit ----
  const createCase = useCreateCase();
  function submit() {
    const body = landmark.trim()
      ? `${s.body}\n\nLandmark: ${landmark.trim()}`
      : s.body;
    createCase.mutate(
      {
        title: s.title || s.body.slice(0, 80),
        body,
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
  const category = CATEGORIES.find((c) => c.id === s.categoryId);
  const wardName = WARDS.find((w) => w.code === s.wardCode)?.name ?? s.wardCode;

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
    if (s.step === 4) {
      submit();
      return;
    }
    s.setStep(s.step + 1);
    window.scrollTo({ top: 0 });
  }
  function prev() {
    if (s.step === 1) {
      router.push("/");
      return;
    }
    s.setStep(s.step - 1);
    window.scrollTo({ top: 0 });
  }

  // Pick a department: choose it and its first category.
  function pickDept(code: string) {
    s.setField("departmentCode", code);
    const first = CATEGORIES.find((c) => c.departmentCode === code);
    s.setField("categoryId", first?.id ?? "");
  }

  if (!mounted) return null;

  return (
    <div className="chome wizpage">
      <LeaveGuard
        active={
          !navigatingRef.current &&
          (s.body.trim().length > 0 || s.evidence.length > 0) &&
          s.step > 1
        }
        onSaveDraft={() => toast.success("Draft kept — pick it up any time.")}
        onDiscard={() => s.reset()}
      />
      <div className="shell">
        <header className="top">
          <div className="row">
            <button className="backbtn" onClick={prev} aria-label="Back">
              <Icon d="back" sw={1.9} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="greet" style={{ fontSize: "17px" }}>File a complaint</div>
              <div className="ward">Step {s.step} of 4 · {STEPS[s.step - 1]}</div>
            </div>
          </div>
          <div className="steps">
            {STEPS.map((_, i) => (
              <div key={i} className={`sg ${i + 1 < s.step ? "done" : ""} ${i + 1 <= s.step ? "on" : ""}`}>
                <i />
              </div>
            ))}
          </div>
          <div className="steplbl">
            <b>{STEPS[s.step - 1]}</b>
            <span>{s.step < 4 ? `Next: ${STEPS[s.step]}` : "Last step"}</span>
          </div>
        </header>

        <div className="hero" ref={heroRef}>
          <button className="replay" onClick={paintHero} aria-label="Replay animation">
            <Icon d="replay" sw={1.9} />
          </button>
          <div className="fade" />
        </div>

        <div className="wrap">
          {/* ============ 1 · DESCRIBE ============ */}
          <div className={`stepbody ${s.step === 1 ? "on" : ""}`}>
            <div className="eyebrow">Step 1 · Describe</div>
            <h1 className="dspl">Just say what&rsquo;s wrong</h1>
            <p className="lede">
              Speak in any of 18 languages. We transcribe it, route it, and{" "}
              <b>keep your own words on the record</b> — the officer sees both.
            </p>

            {voice.supported && (
              <>
                <div className="miccta">
                  <button
                    className="micbtn"
                    onClick={voice.toggle}
                    aria-label={voice.listening ? "Stop recording" : "Hold to speak"}
                  >
                    <Icon d="mic" sw={1.8} />
                  </button>
                  <div>
                    <div className="mt">{voice.listening ? "Listening…" : "Tap to speak"}</div>
                    <div className="ms">
                      Tap again when you&rsquo;re done. You can edit afterwards.
                    </div>
                  </div>
                </div>
                <div className="langs">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      className="lang"
                      aria-pressed={lang === l.code}
                      onClick={() => setLang(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                  <button className="lang" aria-pressed={false}>+14</button>
                </div>
              </>
            )}

            <div className="sh" style={{ marginTop: 26 }}>
              <b>What you said</b>
              <span>{s.body.length}/2000 · min 30</span>
            </div>
            <textarea
              className="field"
              rows={5}
              maxLength={2000}
              value={s.body}
              onChange={(e) => s.setField("body", e.target.value)}
              placeholder="Sewage water overflowing outside 27th Road since Tuesday, the whole lane smells…"
            />

            {aiText && (
              <div className="aibox">
                <div className="lbl2">Rephrased for the department</div>
                <p>{aiText}</p>
                <div className="sub2">
                  Your original wording is kept on the case file and is what an RTI
                  request would return.
                </div>
              </div>
            )}

            <button
              className="btn s w"
              style={{ marginTop: 12 }}
              onClick={polish}
              disabled={draft.isPending || s.body.trim().length < 30}
            >
              {draft.isPending ? "Rephrasing…" : "Rephrase for the department"}
            </button>
          </div>

          {/* ============ 2 · CATEGORISE ============ */}
          <div className={`stepbody ${s.step === 2 ? "on" : ""}`}>
            <div className="eyebrow">Step 2 · Categorise</div>
            <h1 className="dspl">
              {dept ? `Sending it to ${humanizeCode(dept.code)}` : "Where should this go?"}
            </h1>
            <p className="lede">
              We picked the department from what you said.{" "}
              <b>Change it if we got it wrong</b> — a misrouted case loses days
              before anyone notices.
            </p>

            {s.confidence !== null && dept && (
              <div className="aibox" style={{ background: "var(--ok-bg)", borderColor: "var(--ok-line)" }}>
                <div className="lbl2" style={{ color: "var(--ok)" }}>
                  Suggested · {Math.round((s.confidence ?? 0) * 100)}% confident
                </div>
                <p>
                  <b>{dept.name}</b>
                  {category ? ` — ${category.name}.` : "."}
                  {category ? ` Charter limit ${category.slaDays} days.` : ""}
                </p>
              </div>
            )}
            {classify.isPending && (
              <div className="aibox">
                <div className="lbl2">Classifying</div>
                <p>Reading what you wrote to pick a department…</p>
              </div>
            )}

            <div className="sh" style={{ marginTop: 24 }}>
              <b>Or choose another</b>
              <span>{DEPARTMENTS.length} departments</span>
            </div>
            <div className="catgrid">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d.code}
                  className="catbtn"
                  aria-pressed={s.departmentCode === d.code}
                  onClick={() => pickDept(d.code)}
                >
                  <Icon d={DEPT_ICON[d.code] ?? "pinmk"} />
                  {d.name}
                </button>
              ))}
            </div>

            {cats.length > 0 && (
              <>
                <div className="sh" style={{ marginTop: 24 }}>
                  <b>Category</b>
                  <span>{cats.length} in this department</span>
                </div>
                <div className="langs" style={{ marginTop: 12 }}>
                  {cats.map((c) => (
                    <button
                      key={c.id}
                      className="lang"
                      aria-pressed={s.categoryId === c.id}
                      onClick={() => s.setField("categoryId", c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {dupes.length > 0 && (
              <div className="dupe">
                <div className="t4">
                  {dupes.length} neighbour{dupes.length === 1 ? "" : "s"} already
                  reported this
                </div>
                <div className="s5">
                  {dupes[0].title} is open with the same department nearby. Adding
                  your name to a live case is usually faster than starting a second
                  one.
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
                  <button
                    className="btn p"
                    style={{ flex: 1, padding: 12, fontSize: 13 }}
                    onClick={() => router.push(`/cases/${dupes[0].caseId}`)}
                  >
                    Co-sign that case
                  </button>
                  <button
                    className="btn s"
                    style={{ flex: 1, padding: 12, fontSize: 13 }}
                    onClick={() => setDupes([])}
                  >
                    File separately
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============ 3 · EVIDENCE ============ */}
          <div className={`stepbody ${s.step === 3 ? "on" : ""}`}>
            <div className="eyebrow">Step 3 · Evidence</div>
            <h1 className="dspl">Where, and what it looks like</h1>
            <p className="lede">
              A ward and a couple of photos are enough. Cases with a photo are{" "}
              <b>resolved faster</b> — the crew knows what to bring.
            </p>

            <div className="sh" style={{ marginTop: 22 }}>
              <b>Location</b>
              <span>Your ward</span>
            </div>
            <div className="maprow">
              <svg className="mp" viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="360" height="130" fill="var(--surface-2)" />
                <g stroke="var(--line-2)" strokeWidth="1.2">
                  <path d="M0 44h360M0 92h360M74 0v130M196 0v130M292 0v130" />
                </g>
                <rect x="0" y="60" width="360" height="16" fill="var(--track)" />
                <rect x="176" y="0" width="16" height="130" fill="var(--track)" />
                <g fill="var(--track)" stroke="var(--line-2)" strokeWidth="1">
                  <rect x="18" y="12" width="42" height="24" rx="2" />
                  <rect x="98" y="10" width="60" height="26" rx="2" />
                  <rect x="214" y="14" width="56" height="22" rx="2" />
                  <rect x="26" y="100" width="34" height="20" rx="2" />
                  <rect x="212" y="98" width="60" height="24" rx="2" />
                  <rect x="306" y="16" width="38" height="24" rx="2" />
                </g>
                <g transform="translate(184 68)">
                  <ellipse rx="15" ry="8" fill="var(--danger)" opacity=".18" />
                  <path d="M0 0 L0 -20" stroke="var(--danger)" strokeWidth="2" />
                  <circle cy="-26" r="8.5" fill="var(--danger)" />
                  <circle cy="-26" r="3.2" fill="var(--surface)" />
                </g>
                <text x="196" y="112" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="var(--muted)">
                  {String(wardName).toUpperCase()}
                </text>
              </svg>
              <div className="addr">
                <span style={{ color: "var(--danger)", flex: "0 0 auto", width: 20, height: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                    <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
                    <circle cx="12" cy="10.5" r="2.4" />
                  </svg>
                </span>
                <div>
                  <div className="a1">{wardName}</div>
                  <div className="a2">Ward {s.wardCode || "—"}</div>
                </div>
                <select
                  className="adj"
                  value={s.wardCode}
                  onChange={(e) => s.setField("wardCode", e.target.value)}
                  aria-label="Change ward"
                >
                  {WARDS.map((w) => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sh" style={{ marginTop: 24 }}>
              <b>Photos</b>
              <span>{s.evidence.length} added</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4"
              multiple
              hidden
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="shots">
              {s.evidence.map((ev) => (
                <div key={ev.url} className="shot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ev.url} alt={ev.filename} />
                  <span className="ok"><Icon d="chk2" sw={2.4} /></span>
                </div>
              ))}
              {s.evidence.length < 5 && (
                <button
                  className="shot add"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  aria-label="Add a photo"
                >
                  <Icon d={uploading ? "cam" : "plus"} sw={2.2} />
                </button>
              )}
            </div>

            <div className="sh" style={{ marginTop: 24 }}>
              <b>Landmark</b>
              <span>Optional</span>
            </div>
            <input
              className="field"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Opposite the park gate, next to the bus stop…"
            />
            <div className="aibox" style={{ background: "var(--surface-2)", borderColor: "var(--line)" }}>
              <div className="sub2" style={{ marginTop: 0 }}>
                A landmark helps when the ward alone is not enough. Crews find the
                site faster.
              </div>
            </div>
          </div>

          {/* ============ 4 · CONFIRM ============ */}
          <div className={`stepbody ${s.step === 4 ? "on" : ""}`}>
            <div className="eyebrow">Step 4 · Confirm</div>
            <h1 className="dspl">Ready to file</h1>
            <p className="lede">
              Once submitted you get an acknowledgement number, a named officer,
              and a clock that <b>escalates on its own</b> if it runs out.
            </p>

            <div className="sh" style={{ marginTop: 22 }}>
              <b>Summary</b>
              <span>Check before filing</span>
            </div>
            <div className="sumrow">
              <div className="k2">Problem</div>
              <div className="v4">{aiText || s.body}</div>
            </div>
            <div className="sumrow">
              <div className="k2">Where</div>
              <div className="v4">
                <b>{wardName}</b>
                <br />
                Ward {s.wardCode}
                {landmark ? ` · ${landmark}` : ""}
              </div>
            </div>
            <div className="sumrow">
              <div className="k2">Department</div>
              <div className="v4">
                <b>{dept?.name ?? "—"}</b>
                <br />
                {category ? `${category.name} · charter limit ${category.slaDays} days` : "—"}
              </div>
            </div>
            <div className="sumrow">
              <div className="k2">Evidence</div>
              <div className="v4">
                {s.evidence.length} photo{s.evidence.length === 1 ? "" : "s"}
              </div>
            </div>
            {aiText && (
              <div className="sumrow">
                <div className="k2">In your words</div>
                <div className="v4" style={{ color: "var(--muted)" }}>{s.body}</div>
              </div>
            )}

            <div className="promise">
              <div className="t5">What happens next</div>
              <div className="s6">
                {dept?.name ?? "The department"} has{" "}
                <b>{category?.slaDays ?? 7} days</b>. You&rsquo;ll see a named
                officer on the case as soon as it is assigned. If the charter
                limit lapses, it escalates to the ward lead automatically — you
                don&rsquo;t have to ask.
              </div>
            </div>

            <div className="toggle">
              <div style={{ flex: 1 }}>
                <div className="tt">Make this public</div>
                <div className="ts">
                  Neighbours can co-sign it. Your complaint is shown anonymised;
                  your phone number never is.
                </div>
              </div>
              <button
                className="tg"
                role="switch"
                aria-checked={s.isPublic}
                aria-label="Make this public"
                onClick={() => s.setField("isPublic", !s.isPublic)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="wizbar">
        <button
          className="btn s"
          style={{ flex: 1, visibility: s.step === 1 ? "hidden" : "visible" }}
          onClick={prev}
        >
          Back
        </button>
        <button
          className="btn p"
          style={{ flex: 2 }}
          onClick={next}
          disabled={(s.step < 4 && !canNext) || createCase.isPending}
        >
          {createCase.isPending
            ? "Filing…"
            : s.step === 4
              ? "File this complaint"
              : "Continue"}
        </button>
      </div>
    </div>
  );
}
