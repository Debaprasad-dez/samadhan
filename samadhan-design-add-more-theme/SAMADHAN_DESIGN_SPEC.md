# Samadhan — Design Implementation Spec

Target: existing Next.js 15 / React 19 / TypeScript / Tailwind / shadcn-Radix / framer-motion app.
This spec is additive. It changes the token layer and adds five primitives. It does not require rewriting existing components.

---

## 0. Non-negotiable invariants

These are the rules the whole system rests on. Violating any one of them breaks the design's logic, not just its looks.

1. **A duration is never rendered without its limit.** `SlaBar` takes `limitDays` as a *required* prop. There is no code path that displays "12d 11h" without "of 10d" beside it.
2. **Status is never colour alone.** `StatusPill` always renders icon + label + colour. No bare coloured dots.
3. **All figures are tabular.** `font-variant-numeric: tabular-nums` is set on `<body>` and never overridden.
4. **Queues sort by time remaining, never by date filed.** Applies to citizen `/cases`, officer `/inbox`, admin ward tables.
5. **All four themes ship to the end user.** This is not a dev-only gallery.
6. **Reputation accrues on confirmed outcomes only.** Never on volume of complaints filed.

---

## 1. Theme layer

Four themes, user-selectable. Each is one `[data-theme]` block. Keep your existing semantic token names; the additions below are `--radius-*`, `--shadow-*` and `--font-display`, which carry most of the character difference.

### 1.1 `globals.css`

```css
:root,
[data-theme="dawn"] {
  --bg: #FBF6EC;            --surface: #FFFFFF;      --surface-2: #F6EFE2;
  --ink: #2A211A;           --muted: #7A6A5C;        --faint: #A69684;
  --line: #EADFCC;          --line-strong: #DCCDB2;  --track: #EFE6D5;
  --brand: #B4541A;         --brand-soft: #FBEDE1;   --brand-line: #EFCFB4;
  --gold: #A9862F;
  --ok: #2C6A45;   --ok-bg: #EAF3ED;   --ok-line: #BBD9C6;
  --warn: #A8690A; --warn-bg: #FBF1DE; --warn-line: #E9CE9C;
  --danger: #A32E22; --danger-bg: #FBEDEB; --danger-line: #E8C0B8;
  --info: #2C5578; --info-bg: #EAF1F7; --info-line: #BDD3E4;
  --radius-sm: 9px; --radius: 14px; --radius-lg: 20px;
  --shadow: 0 1px 2px rgb(42 33 26 / .05), 0 6px 18px -8px rgb(42 33 26 / .13);
  --font-display: "Fraunces", Georgia, serif;
  --display-weight: 500; --display-tracking: -0.012em;
  color-scheme: light;
}

[data-theme="mughal"] {
  --bg: #0D1226;            --surface: #141B33;      --surface-2: #1B2340;
  --ink: #E7EAF5;           --muted: #98A2C0;        --faint: #6E799B;
  --line: #232C4B;          --line-strong: #313C63;  --track: #1E2542;
  --brand: #C9A24A;         --brand-soft: #241F17;   --brand-line: #463A22;
  --gold: #C9A24A;
  --ok: #4BC08D;   --ok-bg: #122B23;   --ok-line: #22503E;
  --warn: #E0AE4E; --warn-bg: #2A2115; --warn-line: #544022;
  --danger: #F0736A; --danger-bg: #2C1817; --danger-line: #55282A;
  --info: #6FA8E8; --info-bg: #14213A; --info-line: #274063;
  --radius-sm: 9px; --radius: 14px; --radius-lg: 20px;
  --shadow: 0 1px 2px rgb(0 0 0 / .4), 0 8px 26px -10px rgb(0 0 0 / .6);
  --font-display: "Fraunces", Georgia, serif;
  --display-weight: 400; --display-tracking: -0.008em;
  color-scheme: dark;
}

[data-theme="steel"] {
  --bg: #F5F6F8;            --surface: #FFFFFF;      --surface-2: #F9FAFB;
  --ink: #0D1117;           --muted: #5D6675;        --faint: #929BAA;
  --line: #E4E7EC;          --line-strong: #D2D7DF;  --track: #EDEFF3;
  --brand: #1F5FD0;         --brand-soft: #EDF3FE;   --brand-line: #C3D8F9;
  --gold: #8A6A1F;
  --ok: #046C4E;   --ok-bg: #ECFDF5;   --ok-line: #A6EACB;
  --warn: #B45309; --warn-bg: #FFFAEB; --warn-line: #FCDF9B;
  --danger: #B42318; --danger-bg: #FEF3F2; --danger-line: #FDCDC7;
  --info: #175CD3; --info-bg: #EFF6FF; --info-line: #BFDBFE;
  --radius-sm: 6px; --radius: 8px; --radius-lg: 11px;
  --shadow: 0 1px 2px rgb(13 17 23 / .06), 0 4px 12px -6px rgb(13 17 23 / .10);
  --font-display: "Inter", system-ui, sans-serif;
  --display-weight: 600; --display-tracking: -0.032em;
  color-scheme: light;
}

[data-theme="nilgiri"] {
  --bg: #EFF2F0;            --surface: #FBFCFC;      --surface-2: #E7EDEA;
  --ink: #16211E;           --muted: #5F706B;        --faint: #93A29D;
  --line: #DCE4E1;          --line-strong: #C6D2CE;  --track: #E3EAE7;
  --brand: #136F63;         --brand-soft: #E5F1EE;   --brand-line: #B3D6CE;
  --gold: #7C7233;
  --ok: #1A6B4A;   --ok-bg: #E8F3ED;   --ok-line: #B4D8C6;
  --warn: #93701A; --warn-bg: #F5F0DF; --warn-line: #DBCD98;
  --danger: #9B3A32; --danger-bg: #F6EAE8; --danger-line: #DDBAB5;
  --info: #2A5F80; --info-bg: #E8F0F5; --info-line: #B6CEDE;
  --radius-sm: 10px; --radius: 16px; --radius-lg: 24px;
  --shadow: 0 1px 2px rgb(22 33 30 / .05), 0 10px 26px -12px rgb(22 33 30 / .16);
  --font-display: "Fraunces", Georgia, serif;
  --display-weight: 400; --display-tracking: -0.01em;
  color-scheme: light;
}

/* motion tokens — theme-independent */
:root {
  --dur-instant: 80ms;
  --dur-fast: 160ms;
  --dur-base: 240ms;
  --dur-slow: 420ms;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: cubic-bezier(.65, 0, .35, 1);
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-instant: 0ms; --dur-fast: 120ms; --dur-base: 120ms; --dur-slow: 120ms; }
}

body { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }
```

> **Note on the existing dual token system.** You currently have semantic HSL tokens consumed as `hsl(var(--x))` plus raw-hex `--g-*` gallery tokens. Collapse to one. Raw hex above is fine for everything except where you need alpha compositing; if you keep HSL, convert these values and keep the *names* identical to what's here so the primitives below don't need changing.

### 1.2 Tailwind bridge

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: "var(--bg)", surface: "var(--surface)", "surface-2": "var(--surface-2)",
      ink: "var(--ink)", muted: "var(--muted)", faint: "var(--faint)",
      line: "var(--line)", "line-strong": "var(--line-strong)", track: "var(--track)",
      brand: { DEFAULT: "var(--brand)", soft: "var(--brand-soft)", line: "var(--brand-line)" },
      gold: "var(--gold)",
      ok: { DEFAULT: "var(--ok)", bg: "var(--ok-bg)", line: "var(--ok-line)" },
      warn: { DEFAULT: "var(--warn)", bg: "var(--warn-bg)", line: "var(--warn-line)" },
      danger: { DEFAULT: "var(--danger)", bg: "var(--danger-bg)", line: "var(--danger-line)" },
      info: { DEFAULT: "var(--info)", bg: "var(--info-bg)", line: "var(--info-line)" },
    },
    borderRadius: { sm: "var(--radius-sm)", DEFAULT: "var(--radius)", lg: "var(--radius-lg)" },
    boxShadow: { card: "var(--shadow)" },
    fontFamily: { display: ["var(--font-display)"] },
    transitionDuration: { instant: "80ms", fast: "160ms", base: "240ms", slow: "420ms" },
  }
}
```

### 1.3 Theme provider — all four user-selectable, no flash

```tsx
// lib/theme.ts
export const THEMES = [
  { id: "dawn",    name: "Bharat Dawn",   sub: "Ghat sunrise · warm",  swatch: ["#FBF6EC","#B4541A","#A9862F"] },
  { id: "mughal",  name: "Mughal Indigo", sub: "Jali night · brass",   swatch: ["#0D1226","#C9A24A","#6FA8E8"] },
  { id: "steel",   name: "Civic Steel",   sub: "Neutral · dense",      swatch: ["#F5F6F8","#1F5FD0","#0D1117"] },
  { id: "nilgiri", name: "Nilgiri Mist",  sub: "Cool · calm",          swatch: ["#EFF2F0","#136F63","#7C7233"] },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];
```

Persist to **both** `localStorage` and a cookie. The cookie is read in the root server layout so the correct `data-theme` is on `<html>` in the first RSC payload — otherwise every non-default theme flashes Dawn on load.

```tsx
// app/layout.tsx  (server)
import { cookies } from "next/headers";
export default async function RootLayout({ children }) {
  const theme = (await cookies()).get("samadhan-theme")?.value ?? "dawn";
  return <html lang="en" data-theme={theme} suppressHydrationWarning>{/* … */}</html>;
}
```

Theme switch uses the View Transitions API circular reveal you already have, growing from the toggle's bounding box. Fall back to an instant swap where unsupported, and skip the reveal entirely under `prefers-reduced-motion`.

**Placement:** theme picker lives in Profile → Appearance for citizens and in Settings → Appearance for staff, as a 2×2 grid of cards showing name, sub-label and a three-swatch strip. Not a cycling toggle — with four options a toggle forces up to three taps to reach a known state.

---

## 2. Primitives (build these before any page)

Every screen in the mockups is these five plus layout. Build them first.

### 2.1 `SlaBar`

```tsx
type SlaBarProps = {
  elapsedHours: number;
  limitDays: number;        // REQUIRED — this is the invariant
  size?: "sm" | "md";
  animateOnMount?: boolean; // default true; false inside tables
};
```

Renders a track with a fill and a **limit marker at 78% of track width**. The marker's fixed position is intentional: it leaves 22% of visual room for overrun, so a breached bar reads as *past the line* rather than merely full. `pct = min(100, (elapsed / limit) * 78)`; overrun clamps to 100 and switches to `--danger`.

State thresholds: `< 60%` → ok, `60–100%` → warn, `>= 100%` → danger.
Caption row below: elapsed on the left, remaining or overrun on the right, both bold.

### 2.2 `StatusPill`

`kind: "ok" | "warn" | "danger" | "info" | "neutral" | "brand"`. Always icon + label. Maps `CaseStatus` → kind:

| Status | kind | icon |
|---|---|---|
| `OPEN` | neutral | circle |
| `ACKNOWLEDGED` | info | check |
| `IN_PROGRESS` | warn | clock |
| `AWAITING_INFO` | warn | message |
| `RESOLVED` | ok | check |
| `CLOSED` | neutral | check |
| `ESCALATED` | danger | arrow-up |

### 2.3 `JourneyRail`

The signature component. Three variants behind one prop:

- `variant="timeline"` — default, used on `/cases/[id]`. Vertical rail, node dots, **stage durations** rendered as chips (`21 min`, `2d 5h`), officer card inline on the assigned node, dashed future escalation rung with its exact date, ghosted pending confirmation node.
- `variant="stepper"` — horizontal, 6 stages, for rows, tables and notification previews.
- `variant="map"` — only render when `crewPing` data exists. Never simulate an ETA.

Exactly one node may be `live` at a time.

### 2.4 `MetricCard` and 2.5 `DataTable`

`MetricCard`: uppercase tracked label, large tabular value with optional `<small>` unit, delta line with direction icon and colour. Percentages must accept an `n` prop and render it — a rate without a denominator is not shippable.

`DataTable`: numeric columns right-aligned, hairline row borders, **no zebra striping**, 11px vertical padding, sort indicator on the active column, footer stating the row count and the marker convention.

---

## 3. Route map

| Route | Role | Shell | Notes |
|---|---|---|---|
| `/` | citizen | mobile + desktop | Hero, CTA card, active cases, ward pulse |
| `/feed` | citizen | mobile | Sort defaults to **Near you**, not Hot |
| `/file` | citizen | mobile | 4-step wizard; duplicate detection before submit |
| `/file` voice dialog | citizen | sheet | Live transcript, interim text at 45% opacity |
| `/cases` | citizen | mobile | Sorted by time remaining |
| `/cases/[id]` | citizen | mobile | `JourneyRail` timeline variant |
| `/ward/[code]` | citizen | mobile | Heatmap, sequential single-hue scale |
| `/profile` | citizen | mobile | Reputation, badges, streak, **theme picker** |
| `/leaderboard` | citizen | mobile | Wards ranked, not citizens |
| `/notifications` | citizen | mobile | Two tiers: needs-you vs updates |
| `/onboarding` | citizen | mobile | 3 cards, skippable, re-openable |
| `/inbox` | officer | sidebar | Ranked triage, in-card status |
| `/case/[id]` | officer | sidebar | Close-quality before submit |
| `/clusters` | officer | sidebar | Confidence exposed |
| `/metrics` | officer | sidebar | No peer leaderboard |
| `/settings` | officer | sidebar | SLA lead times, language, delegation, **theme picker** |
| `/overview` | admin | sidebar | Leads with the bottleneck |
| `/officers` | admin | sidebar | Load beside performance |
| `/officers/[id]` | admin | sidebar | Load-vs-capacity first |
| `/trends` | admin | sidebar | Claim + evidence + action |
| `/policy` | admin | sidebar | Recommendation → evidence → impact → owner |
| `/login` | auth | mobile | Phone + OTP, language before login |
| `/role-switch` | auth | mobile | Personas preview their landing state |

Plus cross-cutting: empty ×4, loading ×3, error/offline ×3, RTL Urdu.

---

## 4. Motion

One `PageTransition` wrapper per shell, in `template.tsx`. Shell chrome sits **outside** it so headers, sidebars and tab bars never re-animate.

```tsx
// app/(citizen)/template.tsx
"use client";
import { motion } from "framer-motion";
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  );
}
```

Rules that matter more than the numbers:

- **Lists stagger 24 ms, capped at 8 children.** Beyond that it reads as slow loading. The officer inbox table has **no** entrance animation at all — 63 staggered rows is 1.5 s of waiting for a power user.
- **SLA bars animate width on mount once, then only when the value actually changes.** Movement must always mean news.
- **Skeletons never fade in.** They are present on the first frame and cross-fade to real content at 160 ms with identical geometry.
- **In-card status change re-sorts after a 600 ms grace**, so the row doesn't jump out from under the cursor.
- **Spring easing is reserved for direct manipulation only** — drag-to-escalate, sheet dismiss, pull-to-refresh. Everything else uses `--ease-out`.
- **Reduced motion collapses every entrance to a 120 ms opacity fade.** Never remove the transition entirely; an instant swap breaks the causal link between tap and result.
- **RTL negates x-axis motion only.** Vertical rail fills are unchanged. Numerals animate opacity, never position.
- **No confetti on badge unlock.** Scale `0 → 1.08 → 1` with one ring pulse, queued one at a time. The underlying subject is a civic failure someone reported.

---

## 5. RTL (Urdu)

- Mirror with **logical properties** — `inset-inline-start`, `padding-inline`, `margin-inline`. Physical `left`/`right` puts the journey rail on the wrong side, which is the current bug.
- Wrap case IDs, dates, durations and countdowns in `dir="ltr"` spans with `unicode-bidi: embed`. A bidi-reordered reference number can't be read aloud over the phone.
- Nastaliq needs `line-height: 2.1`. The Latin type scale can't be reused unmodified.
- Test the journey rail, the SLA caption row and the stepper specifically — those three break first.

---

## 6. Build order

1. Token layer + Tailwind bridge + theme provider with all four themes and the cookie/no-flash fix.
2. Theme picker UI in citizen Profile and staff Settings.
3. Primitives: `SlaBar`, `StatusPill`, `JourneyRail`, `MetricCard`, `DataTable`.
4. Shells: citizen mobile (bottom nav) + citizen desktop (top nav), staff sidebar.
5. `PageTransition` templates.
6. Signature screens: `/cases/[id]`, `/file` + voice dialog, `/inbox`.
7. Remaining routes.
8. Cross-cutting states: empty, loading, error, offline.
9. RTL pass with logical properties.
10. Accessibility pass: keyboard traversal, focus-visible rings on `--brand`, 4.5:1 contrast verified per theme, 48px minimum touch targets.
