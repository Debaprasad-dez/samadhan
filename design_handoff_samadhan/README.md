# Handoff: Samadhan — Heritage-Themed Civic Grievance App UI

## Overview
Samadhan is a mobile-first (390px) civic grievance-redressal app for Indian citizens. The
design fuses restrained, professional product structure (Stripe/Linear/Carbon) with rich,
culturally-rooted Indian illustration. The visual system is **multi-theme**: one set of
screens that reskins into three art traditions — **Bharat Dawn** (Banaras ghats sunrise),
**Mithila Bloom** (Madhubani painting), and **Mughal Indigo** (Mughal miniature).

This bundle covers: Home (×3 themes), File Complaint wizard (step 1), Case Detail, Empty
State, Theme Picker, and four standalone illustration compositions.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing
intended look and behavior, **not production code to copy directly**. Your task is to
**recreate these designs in your existing application's environment** (React, Vue, SwiftUI,
Flutter, native Android, etc.) using its established component patterns, routing, and state
libraries. If the project has no UI environment yet, pick the most appropriate framework and
implement there.

Two parts deserve special attention when porting:
1. **The CSS token + theme system** (`lib/app.css`) — port this almost verbatim. It is a
   clean CSS-variable design system with three `[data-theme]` blocks. It maps directly to
   any theming approach (CSS vars, Tailwind theme, styled-components ThemeProvider, native
   color assets).
2. **The illustrations** (`lib/art-*.js`) — these are **procedurally-generated SVG scenes**,
   not bitmaps. See "Illustrations" below for porting options (the simplest is to render each
   scene once and export static SVG/PNG).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, shadows, and interaction
states are all specified. Recreate the UI pixel-perfectly using your codebase's libraries.
Exact values are in `lib/app.css`, `lib/screens.css`, and the Design Tokens section below.

---

## Architecture of the reference

```
lib/app.css         Theme tokens + app chrome (status bar, hero shell, CTA card,
                    cards, bottom nav, ambient-motion keyframes)
lib/screens.css     Utility-screen components (forms, timeline, SLA ring, galleries)
lib/art-core.js     Shared SVG helpers, motif builders, parallax/ambient motion engine,
                    SAMADHAN.* public API
lib/art-bharat.js   "bharat" scene (ghats) + "empty" scene (citizen at dawn)
lib/art-mithila.js  "mithila" scene (Madhubani peacock/Surya/lotus pond)
lib/art-mughal.js   "mughal" scene (cusped arch / jali / crescent)

screens/*.html      One file per screen. Each just loads the CSS + art libs and calls
                    SAMADHAN.initHome('<theme>') or a scene builder.
illustrations/*.html Standalone single-illustration files.
```

Theme switching is a single attribute: `<html data-theme="bharat|mithila|mughal">`. Every
color flows from CSS variables, so changing that attribute reskins the whole screen.

---

## Screens / Views

### 1. Home  (`screens/home-bharat-dawn.html`, `…-mithila-bloom.html`, `…-mughal-indigo.html`)
**Purpose:** Landing screen. Greet the citizen, drive "File a complaint", show their recent
cases and trending ward issues.

**Layout (top → bottom), 390px wide, scrolling column:**
- **Status bar** — fixed, 52px tall, gradient fade from `--bg`. Time + signal/wifi/battery icons.
- **Hero** — 478px tall, full-bleed illustration (see Illustrations). Overlaid content,
  absolutely positioned, starts at top:58px, left/right:24px:
  - Brand row: 30px gradient logo tile, "समाधान / Samadhan" (display serif + 9.5px caps
    label), and a right-aligned frosted location pill ("Ward 12 · Kashi").
  - Greeting block: italic serif salaam line (`--primary-deep`), 33px serif H1
    ("Good morning, Aarav" — "Aarav" in `--primary-deep`), 12.5px body line. Sits on a
    feathered radial frosted veil (`.greet::before`) for WCAG-AA contrast over art.
- **CTA card** — pulled up `margin-top:-46px` to overlap the hero. Frosted white
  (`--card`), radius 24px, big shadow. Contains:
  - 10.5px caps label "Raise your voice", 23px serif "File a complaint", 12px sub.
  - Action row: primary `.btn-file` (gradient `--btn-grad`, icon tile + 2-line label) +
    54px `.btn-mic` (gold gradient, animated pulse ring).
  - Horizontal scroll chips: Water / Roads / Garbage / Power / Streetlight.
- **"Your recent cases"** section — header (serif H3 with a small themed sun/lotus/star
  glyph + a right "All 7 ›" link). Two `.case` rows: 46px rounded category thumb, ID +
  title + status pill + SLA "Nd left", and a 34px SVG **SLA donut ring** on the right.
- **"Hot in your ward"** — header + horizontal scroll of 208px `.hot` cards (illustration
  header with "Trending" tag, title, co-signer avatar stack + upvote button).
- **Bottom nav** — floating frosted bar, 5 items (Home/Cases/**File** raised center
  button/Ward/You), home indicator below.

**Exact colors/type:** all from tokens. The status-bar/greeting/labels use `--ink`,
`--ink-soft`, `--ink-faint`; accents use `--primary`, `--primary-deep`, `--gold`.

### 2. File a complaint — wizard step 1  (`screens/file-complaint.html`)
**Purpose:** Fast, calm utility form. Restrained — minimal illustration (one faint corner
sunray watermark only).

**Layout:**
- Sticky top bar: back button, "New case / File a complaint" title, close button.
- 4-segment step progress bar (segment 1 active).
- Form sections (label = 13px bold + optional 11px gray "· optional"):
  1. **Category** — wrapped `.selchip` grid (Water/Roads/Garbage/Streetlight[selected]/
     Power/Other). Selected chip uses `--btn-grad` fill.
  2. **Description** — `.textwrap` textarea with bottom toolbar: mini mic button, an
     **"Polish with AI"** pill (animated sparkle icon, `--primary`), and "186 / 600" count.
     Below it an **AI routing note** (`.ai-note`, accent-tinted) explaining the AI will route
     to "Electricity Dept · Ward 12" and translate it.
  3. **Location** — `.locfield` (pin tile + address + "Change") and an 80px stylized minimap SVG.
  4. **Evidence (optional)** — one photo thumb + "Photo"/"Camera" dashed add tiles.
- Sticky footer: full-width primary button "Continue · Review →".

### 3. Case Detail  (`screens/case-detail.html`)
**Purpose:** Track one case end-to-end.
**Layout:**
- Hero block (faint corner sunray deco): back/share/more icon row, ID label, 24px serif
  title, location + "Filed 4 days ago" subline.
- **SLA hero card** (`.sla-wrap`) — the crafted centerpiece: a **96px progress ring**
  (rotated -90°, `stroke-dasharray` 251.3, `stroke-dashoffset` encodes % — 88 ≈ 65%) with
  centered "65% / SLA used", beside an "On track" status block with a "2 days left" due pill.
- **Progress timeline** (`.timeline`) — vertical connector line with circular **node
  markers**: `.done` (filled `--primary`), `.active` (ring + 4px glow halo), future (gray).
  Steps: Filed → AI routed → Officer assigned (active) → Work in progress → Resolved.
  Some nodes have a detail card (`.tx`).
- **Evidence** — horizontal scroll of 104×80 thumbs with caption gradient.
- **Co-signers** — overlapping avatar stack + "+120" + "124 neighbours backed this".
- Sticky footer: "Follow" ghost + "Co-sign · 124" primary.

### 4. Empty State  (`screens/empty-state.html`)
**Purpose:** Encourage first complaint when the case list is empty.
**Layout:** Centered column — a **300px dimensional illustration** (a citizen seen from
behind looking across water toward a dawn cityscape; grain + ambient sun rays), 25px serif
headline "A new day, no issues yet", 13px body, primary "File your first complaint" button.
Entrance animation is **enhancement only** — base state is visible (important: do not gate
visibility on the animation).

### 5. Theme Picker  (`screens/theme-picker.html`)
**Purpose:** Choose the cultural theme; presented like a small museum.
**Layout:** Header "Choose your heritage" + intro. Vertical list of `.tcard`s (active card
gets a `--primary` ring). Each card: a **150px live mini-preview** of that theme's scene, a
"Trending/Colourful/Luxury" badge, name (serif) + tradition label (caps `--primary`),
description, and a **5-swatch palette** row. Tapping a card navigates to that theme's home.

---

## Interactions & Behavior
- **Navigation:** plain links between screens. Bottom-nav "File" → file-complaint; "You" →
  theme-picker; case rows / hero CTA → case-detail. Theme cards → corresponding home.
- **Theme switch:** set `data-theme` on the root. No reload needed if you re-render; the
  reference uses per-page navigation.
- **Ambient motion (all reduced-motion-gated):** sun-ray slow rotation; diya flame flicker;
  marigold/garland sway; drifting dust particles; star twinkle (Mughal); birds. Mic button
  has a pulsing ring. "Polish with AI" sparkle pulses.
- **Hero parallax:** pointer move + scroll translate each depth-sorted SVG layer by
  `depth × {16px pointer, 10px tilt, 0.5 scroll}`. Eased at 0.06/frame. Disabled under
  `prefers-reduced-motion`.
- **Button press:** `.btn-file`/`.btn-primary` translateY(2px) on `:active`.
- **Selected states:** `.selchip.sel` and `.tcard.on` as described.

## State Management
Minimal — these are presentational screens. For a real implementation you'll need:
- `theme: 'bharat' | 'mithila' | 'mughal'` (global; persist to storage).
- File form: `{ category, description, location, photos[] }` + char count + an async
  "polish with AI" call that replaces description text.
- Case detail: case object with `slaPercent`, `status`, `timeline[]`, `evidence[]`,
  `cosigners`. SLA ring offset = `circumference × (1 − percent)` (circumference = 2π×40 ≈ 251.3).
- Case list emptiness drives Home recent-cases vs the Empty State screen.

---

## Design Tokens
Defined as CSS variables in `lib/app.css` under `:root` (Bharat Dawn) and overridden in
`[data-theme="mithila"]` / `[data-theme="mughal"]`.

### Bharat Dawn (default)
| Token | Value | Role |
|---|---|---|
| `--bg` | `#FBFAF6` | app background (ivory paper) |
| `--paper` | `#F7F2E7` | secondary surface / chips |
| `--ink` | `#2C1B10` | primary text (warm sepia) |
| `--ink-soft` | `#6E5746` | secondary text |
| `--ink-faint` | `#9C8472` | tertiary text |
| `--primary` | `#C8501E` | marigold-saffron primary |
| `--primary-deep` | `#A83C14` | pressed/strong primary |
| `--accent` | `#BE3455` | sindoor-rose accent |
| `--gold` | `#C9962E` | temple gold |
| `--gold-lt` | `#E9C56A` | gold highlight |
| `--glow` | `#F0A24A` | sun glow |
| `--line` | `#E7DCC8` | borders/hairlines |
| `--card` | `#FFFFFFEE` | card surface |
| `--ok` | `#3E7C54` | success/assigned |
| `--warn` | `#C9962E` | in-progress |

### Mithila Bloom
`--bg #F6EFDF` · `--ink #241A12` · `--primary #B5322F` (madder red) ·
`--accent #0E7C7B` (peacock teal) · `--gold #E0A211` (turmeric) · `--ok #0E7C7B`.

### Mughal Indigo (dark)
`--bg #10153A` · `--paper #1A2150` · `--ink #F3ECDA` (ivory text) ·
`--ink-soft #C5C2D8` · `--primary #C9A227` (gold) · `--accent #1F9E72` (emerald) ·
`--gold #D4AF37` · `--line #2C3470` · `--card #1C2358F2`. Note: on this theme several
elements flip text to dark `#1A1330` on gold buttons — see the `[data-theme="mughal"]`
overrides in `app.css`.

### Type
- Display: **Tiro Devanagari Sanskrit** (serif, Devanagari-capable) — headings, brand,
  section titles, big numbers.
- Body/UI: **Mukta** (300–700) — everything else.
- Google Fonts import string is at the top of every screen file.
- Scale highlights: H1 33px / screen titles 24–27px / section H3 18–19px / body 12.5–14px /
  labels 10.5–11px caps. (Slabs of exact sizes live in the CSS.)

### Spacing / radius / shadow
- Screen gutters: 18–22px. Card padding: 13–18px. Section gap: ~24px.
- Radii: cards 18–24px, chips/pills 11–16px / 100px, device 46px, buttons 16px.
- Shadows: soft, warm, large-offset low-opacity (e.g.
  `0 24px 50px -26px color-mix(in srgb,var(--primary-deep) 60%,transparent)`).
- Motion keyframes (`micpulse`, `diyaPulse`, `flick`, `sway`, `drift`, `birdy`, `tw`) are in
  `app.css`; all are disabled under `prefers-reduced-motion`.

---

## Illustrations
The hero/empty/theme-card art is **procedural SVG** built at runtime by `lib/art-*.js`.
`SAMADHAN.scenes['bharat'|'mithila'|'mughal'|'empty'](svgElement)` injects depth-sorted
`<g class="layer" data-depth>` groups into a given `<svg>`; `SAMADHAN.motion(...)` wires
parallax + ambient loops. Motifs are deliberately accurate to each tradition (Madhubani
double-outline fish & eye-feathers, Mughal multifoil arch / jali / arabesque, Banaras nagara
spires + diyas + marigold toran).

**Porting options (pick per your stack):**
1. **Easiest — bake to assets:** open each `illustrations/*.html`, grab the rendered
   `<svg>` markup (or export PNG), and ship static images. You lose live parallax/ambient
   motion but keep the look. Recommended unless motion matters.
2. **Keep it live:** port `art-core.js` + the relevant `art-*.js` as a small module that
   takes an SVG ref. They are framework-agnostic (vanilla DOM/SVG); wrap in a component that
   calls the builder in `useEffect`/`onMounted`.
3. **Hybrid:** static SVG background + re-add only the cheap CSS ambient animations
   (flame/sway/twinkle) via the keyframes already in `app.css`.

Decorative UI motifs (sunray watermark behind CTA, lotus mandala on case cards, section
glyphs) are added by `SAMADHAN.decorate(theme)` — small inline SVGs you can hardcode.

## Assets
No external image assets — everything is inline SVG or CSS. Only external dependency is
**Google Fonts** (Tiro Devanagari Sanskrit + Mukta). Icons are inline SVG paths in the
screen markup. Avatar/photo placeholders are CSS gradients / simple SVG.

## Files (in this bundle)
- `lib/app.css`, `lib/screens.css` — the token system + components (port these first).
- `lib/art-core.js`, `lib/art-bharat.js`, `lib/art-mithila.js`, `lib/art-mughal.js` — art.
- `screens/home-bharat-dawn.html`, `screens/home-mithila-bloom.html`,
  `screens/home-mughal-indigo.html`, `screens/file-complaint.html`,
  `screens/case-detail.html`, `screens/empty-state.html`, `screens/theme-picker.html`.
- `illustrations/bharat-dawn-ghats.html`, `illustrations/mithila-bloom-peacock.html`,
  `illustrations/mughal-indigo-arch.html`, `illustrations/bharat-dawn-empty.html`.
- `Samadhan Gallery.html` — overview index linking everything (handy for orientation).

## Suggested implementation order
1. Port `app.css` tokens into your theming layer; wire a `data-theme` (or ThemeProvider).
2. Build the shared chrome: status bar, bottom nav, card, button, pill, SLA ring.
3. Build Home (Bharat) with a **static** baked hero image first; confirm layout.
4. Add File Complaint, Case Detail, Empty State, Theme Picker.
5. Add the Mithila + Mughal themes (just token swaps + their baked hero art).
6. (Optional) Re-introduce live procedural art / ambient motion if desired.
