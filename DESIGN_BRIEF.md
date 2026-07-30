# Samadhan — Product & UI/UX Design Brief

> Purpose: a self-contained brief to hand to an AI/design collaborator for
> generating fresh UI/UX design directions. No codebase access required.

## 1. What it is

**Samadhan** ("resolution" in Hindi) is a civic-grievance platform for Indian
municipal governance. It turns every government complaint into a **visible,
trackable service journey** — "track your complaint like an Uber ride" — with
public accountability, AI-assisted drafting/routing, and SLA-based escalation.
Setting: Indian city wards (seeded with Mumbai / MCGM). Tone: **civic trust meets
Indian heritage** — official and dependable, but warm and culturally rooted, not
sterile e-government.

## 2. Users & roles

- **Citizen** — files and tracks complaints, engages publicly (upvote / co-sign),
  earns reputation / badges / streaks. Logs in by phone + OTP.
- **Officer** (department staff, e.g. Sanitation / Water / Roads) — works a
  prioritized inbox, acts on cases, closes with quality notes. Email/password.
- **Admin** (district-magistrate level) — oversight: systemic metrics, officer
  accountability, reassignment, policy digests.
- Demo personas exist per role (Priya / citizen, Rajesh / officer, Anita / admin,
  plus a ward-KE trio for multi-user live demos).

## 3. Domain concepts (drive the UI)

- **Case lifecycle / status:** OPEN → ACKNOWLEDGED → IN_PROGRESS → AWAITING_INFO →
  RESOLVED → CLOSED, plus ESCALATED. Every case has a **timeline of events**
  (filed, acknowledged, status change, info requested, resolved, closed,
  escalated).
- **SLA:** each category has SLA days; breaches **auto-escalate** to ward leads.
- **Reputation system:** citizens accrue points → tiers; **badges** (first-voice,
  verified-resolver, neighbour, streak-starter…) and **daily streaks**.
- **Public engagement:** cases can be public; other citizens **upvote** and
  **co-sign** (with a reason). Feeds, ward heatmaps, leaderboards.
- **Quality scoring:** officer closures get an AI **close-quality score** +
  boilerplate detection.
- Reference data: 24 wards, 8 departments, 40 categories.

## 4. Feature set by area

**Citizen intake**
- 4-step **file-a-complaint wizard**; AI **draft/rephrase** (speak in Hindi or
  English, AI phrases it for the right department), **auto-classify**
  category/department, **duplicate detection**.
- **Voice capture**: mic dialog with live speech-to-text in **18 Indian
  languages**, waveform/orb animation.
- Cases list + **case detail with the "service-journey" tracker**
  (Uber-ride-style progress).

**Officer workbench**
- **Ranked inbox** (priority-sorted cards, in-card status select), case actions,
  AI **close-quality + brief**, SLA escalation surfacing, **metrics** page,
  **clusters** (grouped similar cases), settings.

**Public + engagement**
- **Feed** (hot / filters / infinite scroll), **ward heatmap**, **leaderboards**,
  upvote/co-sign, streaks, badges, **public profile**.

**Admin console**
- **Overview** dashboard (Recharts), **officer accountability**, AI **trends +
  policy digest**, case **reassignment**.

**Cross-cutting:** i18n (18 languages incl. RTL Urdu), server-side **TTS**,
translation API, PWA (installable, offline shell), empty/error states,
notifications.

## 5. Information architecture

**Citizen** — bottom tab bar (mobile) + top nav (desktop): **Home** `/`, **Feed**
`/feed`, **File (＋, primary)** `/file`, **Cases** `/cases` (+ `/cases/[id]`),
**Profile** `/profile`. Plus `/leaderboard`, `/notifications`, `/ward/[code]`.

**Officer** — left sidebar: **Inbox** `/inbox` (+ `/case/[id]`), **Clusters**
`/clusters`, **Metrics** `/metrics`, **Settings** `/settings`.

**Admin** — left sidebar: **Overview** `/overview`, **Officers** `/officers`
(+ `/officers/[id]`), **Trends** `/trends`, **Policy** `/policy`.

**Auth** — `/login`, `/role-switch` (one-click demo persona picker).

Layout shells: **citizen** = sticky top header + mobile bottom nav (app-like);
**staff** = persistent left sidebar. Content area animates on navigation; the
shell stays put.

## 6. Current design system

**Theme model — two modes, user-toggleable:**
- **Light = "Bharat Dawn"** — warm cream/paper background, marigold-orange +
  temple-gold accents, deep-brown ink. Sunrise over the Ganga ghats.
- **Dark = "Mughal Indigo"** — deep indigo/navy surfaces, restrained
  **antique-brass gold** accent, a refined corporate blue as secondary.
  Indo-Islamic night aesthetic.
- Staff dashboards use a separate professional **"samadhan-pro"** (civic-blue)
  palette in both light/dark.
- (Four more heritage palettes — Mithila, Warli, Coromandel/Pattachitra, Nilgiri
  — exist in code but are currently dormant; the app was recently simplified from
  a 6-theme gallery to this light/dark toggle.)

**Color token architecture:** two parallel systems — (a) semantic HSL tokens
(`--bg, --surface, --border, --text, --brand, --accent, --success/warning/danger/
info`, plus shadcn aliases) consumed as `hsl(var(--x))`; (b) "gallery" raw-hex
tokens (`--g-bg, --g-paper, --g-ink, --g-primary, --g-gold, --g-accent, --g-line,
--g-card, --g-stage1/2/3`, gradients) for the richer illustrative surfaces.
Applied via `data-theme` + `data-mode` on `<html>`.

**Typography:** display serif **Fraunces**; UI sans **Inter**; Devanagari /
multilingual via **Tiro Devanagari Sanskrit**, **Baloo 2**, **Mukta**, decorative
**Yatra One**; mono **JetBrains Mono**. Display headings are large, editorial,
warm.

**Signature UI patterns:**
- **Heritage hero** on citizen home: full-bleed illustrated scene (warm dawn
  cityscape in light; deep-indigo Mughal night render in dark) with **scroll
  parallax** and a soft top/bottom feather blending into the page.
- **"Raise your voice / File a complaint" CTA card** — frosted glass, gold
  gradient primary button + mic button, quick category chips
  (Water/Roads/Garbage/Power), subtle sun-ray watermark.
- **Case service-journey tracker** — the hallmark: a status timeline styled like
  a ride/delivery tracker.
- **Officer inbox cards** — compact, priority-ranked, in-card status selector,
  SLA/escalation cues, sticky filter tabs.
- **Reputation surfaces** — tier chips/emblems, badge grid, streak flames,
  leaderboards.
- **Ward heatmap**, **Recharts** dashboards (admin overview / trends).
- **Voice-capture dialog** — recording orb, animated waveform bars, language
  selector, live transcript.
- Cards use soft rounded corners (rounded-2xl / 3xl), layered elevation,
  restrained neutral shadows (recently de-goldened for a professional feel).

**Motion:**
- **Native page transitions** — short fade + 8px rise on every navigation
  (content only; shell stays).
- **Theme switch** — View Transitions API **circular reveal** growing from the
  toggle button.
- Hero parallax, indeterminate/branded loaders, full-screen sign-in loader with
  pulsing brand orb, login backdrop infinite pan.
- Respects `prefers-reduced-motion` throughout.

**Iconography:** lucide-react line icons. **Imagery:** AI-rendered heritage
scenes. Decorative SVG motifs (sun-rays, jali/lattice hints).

## 7. Tech constraints (for feasible design output)

Next.js 15 (App Router, RSC) · React 19 · TypeScript · **Tailwind CSS** ·
**shadcn/ui (Radix)** · framer-motion · Recharts · Prisma/PostgreSQL · TanStack
Query · Zustand · PWA. Mobile-first, responsive; must stay accessible (WCAG
basics, keyboard, reduced-motion). Design should express as Tailwind utility
classes + CSS custom properties (the token system above), leaning on Radix
primitives.

## 8. Brand ethos

Trustworthy public infrastructure + Indian cultural warmth. Avoid generic SaaS /
dashboard templating and avoid kitsch. Heritage should read as **refined and
intentional** (Mughal-miniature restraint, ghat-sunrise warmth), never touristy.
Accessibility and multilingual legibility (Latin + Devanagari + Urdu RTL) are
first-class.

## 9. Design opportunities to explore

Use these as prompts for fresh UI/UX generation:
- Reimagine the **case service-journey tracker** (the signature moment) — map
  view, stepper, live timeline variants.
- **Officer inbox** triage patterns — density, prioritization, bulk action, SLA
  urgency visualization.
- **Admin dashboards** — accountability + systemic-trend storytelling.
- **File-a-complaint wizard** — reduce friction, voice-first flows, AI-assist
  affordances.
- **Public feed & ward heatmap** — civic engagement, social proof (co-signs),
  map/geo UI.
- **Reputation / gamification** without undermining civic seriousness.
- **Empty / loading / error states**, notification center, onboarding.
- New **heritage theme directions** or refinement of Bharat Dawn / Mughal Indigo.
- **Multilingual + RTL** layout robustness.
