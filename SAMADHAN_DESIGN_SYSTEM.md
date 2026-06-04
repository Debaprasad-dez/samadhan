# Samadhan — Visual Design System & Theming Addendum
### v1.0 · Companion to SAMADHAN_PRD.md · Build-ready specification

> **What this document is.** This is a design-and-implementation addendum to the main Samadhan PRD. It governs the entire **visual identity, art direction, motion system, illustration system, and cultural theming** of the application. It does NOT change any feature, data model, route, or API from the main PRD. It changes how everything *looks, feels, moves, and delights*.
>
> **How to treat conflicts.** Where this document specifies colors, typography, motion, or theming, it **overrides** §7 (UI/UX Specifications) of the main PRD. Everything else in the main PRD stands. The token *names* from §7 are preserved so existing components keep working; only their *values* and the system around them are upgraded and made theme-driven.
>
> **The standard.** This application must look like it was designed by a world-class studio that specialises in both government-grade design systems and culturally-rooted art direction. Think: the rigor of IBM Carbon or Stripe, fused with the soul of Indian heritage art. It must feel **trustworthy and official** AND **alive, warm, and unmistakably Indian**. Both at once. Never one at the expense of the other.

---

## Table of Contents

1. [Design Philosophy & The Core Tension](#1-design-philosophy--the-core-tension)
2. [Theme Architecture (How Theming Works Technically)](#2-theme-architecture)
3. [The Six Cultural Themes](#3-the-six-cultural-themes)
4. [Typography System](#4-typography-system)
5. [The Illustration & SVG Art System](#5-the-illustration--svg-art-system)
6. [Motion & Micro-interaction System](#6-motion--micro-interaction-system)
7. [Component Art Direction (Per-Component Upgrades)](#7-component-art-direction)
8. [The Theme Picker Experience](#8-the-theme-picker-experience)
9. [Backgrounds, Textures & Atmosphere](#9-backgrounds-textures--atmosphere)
10. [Performance & Accessibility Guardrails](#10-performance--accessibility-guardrails)
11. [Implementation Plan for Claude Code](#11-implementation-plan-for-claude-code)
12. [Asset Manifest (Everything to Build)](#12-asset-manifest)

---

## 1. Design Philosophy & The Core Tension

### 1.1 The one sentence
**Samadhan should feel like walking into a beautifully restored heritage building that runs on flawless modern infrastructure** — the warmth, craft, and colour of Indian heritage, delivered with the precision, clarity, and restraint of a world-class product.

### 1.2 The core tension to hold (read this carefully)
The instinct when asked for "colorful like India" is to make everything loud: saturated rainbows, busy patterns, clip-art elephants. **Do not do this.** That produces a toy, not a tool citizens trust with civic problems.

The discipline is this:
- **Structure stays calm and professional.** Layout, spacing, typography hierarchy, data density, form design — these follow IBM Carbon / Stripe-level restraint. Generous whitespace. Clear hierarchy. Predictable interaction.
- **Soul lives in deliberate moments.** Colour, illustration, pattern, texture, and motion are deployed with *intent* at *specific moments*: empty states, hero zones, theme accents, celebratory transitions, loading states, section dividers, decorative borders, the theme picker. These are where India sings.

Think of it as a **calm canvas with vivid, masterful brushstrokes** — not a canvas painted edge-to-edge in every colour.

### 1.3 Three non-negotiable principles

1. **Cultural authenticity over decoration.** Every motif must be a real, researched Indian art form rendered accurately — not a generic "ethnic" pastiche. Madhubani fish mean fertility and good fortune. A Warli spiral represents the circle of life. Get the meaning right, not just the look.

2. **Earned motion.** Every animation communicates state or rewards an action. Loops are *subtle* and *slow* (8–20s cycles), never jittery or attention-stealing. Micro-interactions give tactile feedback. Nothing moves just to move.

3. **The art never blocks the work.** A citizen filing a complaint about an overflowing drain is often stressed. The beauty must reduce friction and build trust, never add cognitive load or delay. Art loads progressively, degrades gracefully, and respects `prefers-reduced-motion`.

### 1.4 Reference fusion (what we're blending)
- **Structure & systemization:** IBM Carbon, Stripe Dashboard, Linear
- **Government trust & clarity:** GOV.UK, e-Estonia
- **Cultural art direction:** Madhubani, Warli, Pattachitra, Phad, Gond, Kalamkari, Mughal miniature, Tanjore, Kerala mural traditions
- **Motion craft:** Linear's micro-interactions, Stripe's page choreography, the restraint of Apple's product pages

---

## 2. Theme Architecture

### 2.1 Technical foundation
Theming is implemented as a **two-axis system**:
- **Axis 1 — Cultural Theme** (6 options): determines palette, accent motifs, illustration treatment, texture, pattern, hero art. Default: `bharat-dawn`.
- **Axis 2 — Mode** (light / dark / system): each cultural theme ships a fully-designed light AND dark variant. Default: `system`.

This gives **12 fully-realised visual identities** (6 themes × 2 modes).

### 2.2 How it's wired (exact technical spec)

**CSS custom properties drive everything.** No hardcoded colours anywhere in components. Ever.

Create `src/styles/themes.css`. Each theme is a `[data-theme="..."]` selector, with nested `[data-mode]`:

```css
/* src/styles/themes.css */
:root {
  /* Structural tokens — SHARED across all themes (the "calm canvas") */
  --space-1: 4px;  --space-2: 8px;  /* ... full scale from PRD §7.2.3 */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 14px; --radius-xl: 20px;
  --font-display: 'Tiro Devanagari Sanskrit', serif; /* per theme override below */
  --font-body: 'Mukta', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  /* motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 150ms; --dur-mid: 280ms; --dur-slow: 480ms;
}

[data-theme="bharat-dawn"][data-mode="light"] {
  --bg: 36 45% 97%;
  --surface: 0 0% 100%;
  /* ... full token set per §3 ... */
}
[data-theme="bharat-dawn"][data-mode="dark"] {
  /* ... */
}
/* repeat for all 6 themes × 2 modes */
```

**The theme provider.** Extend the existing `next-themes` setup OR build a custom `ThemeProvider` in `src/components/providers/theme-provider.tsx` that manages BOTH axes:

```tsx
// Persists to localStorage keys: 'samadhan-theme' and 'samadhan-mode'
// Sets data-theme and data-mode on <html>
// Exposes useTheme() -> { theme, setTheme, mode, setMode, resolvedMode }
// SSR-safe: inject a blocking <script> in <head> to set attributes before paint (no flash)
```

**No-flash script** (critical) — inject in root layout `<head>` before any render:
```html
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    try {
      var t = localStorage.getItem('samadhan-theme') || 'bharat-dawn';
      var m = localStorage.getItem('samadhan-mode') || 'system';
      var rm = m === 'system'
        ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light')
        : m;
      document.documentElement.setAttribute('data-theme', t);
      document.documentElement.setAttribute('data-mode', rm);
    } catch(e){}
  })();
`}} />
```

### 2.3 Tailwind integration
In `tailwind.config.ts`, map every colour utility to the CSS variables via `hsl(var(--token) / <alpha-value>)`:

```ts
colors: {
  bg: 'hsl(var(--bg) / <alpha-value>)',
  surface: 'hsl(var(--surface) / <alpha-value>)',
  'surface-muted': 'hsl(var(--surface-muted) / <alpha-value>)',
  border: 'hsl(var(--border) / <alpha-value>)',
  'border-strong': 'hsl(var(--border-strong) / <alpha-value>)',
  text: 'hsl(var(--text) / <alpha-value>)',
  'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
  'text-subtle': 'hsl(var(--text-subtle) / <alpha-value>)',
  brand: 'hsl(var(--brand) / <alpha-value>)',
  'brand-hover': 'hsl(var(--brand-hover) / <alpha-value>)',
  'brand-soft': 'hsl(var(--brand-soft) / <alpha-value>)',
  accent: 'hsl(var(--accent) / <alpha-value>)',
  'accent-soft': 'hsl(var(--accent-soft) / <alpha-value>)',
  success: 'hsl(var(--success) / <alpha-value>)',
  warning: 'hsl(var(--warning) / <alpha-value>)',
  danger: 'hsl(var(--danger) / <alpha-value>)',
  info: 'hsl(var(--info) / <alpha-value>)',
  /* decorative motif colors, per theme */
  'motif-1': 'hsl(var(--motif-1) / <alpha-value>)',
  'motif-2': 'hsl(var(--motif-2) / <alpha-value>)',
  'motif-3': 'hsl(var(--motif-3) / <alpha-value>)',
  'motif-gold': 'hsl(var(--motif-gold) / <alpha-value>)',
}
```

### 2.4 Per-theme asset switching
Some art (hero illustrations, pattern SVGs, texture overlays) differs per theme. Pattern:
- Each themed asset is a React component that reads the current theme from `useTheme()` and renders the correct motif variant, OR
- Uses CSS variables for its colours so a single SVG recolours automatically (preferred for patterns/borders), OR
- For complex hero illustrations, a `<ThemedHero />` component switch-renders the correct named component.

**Rule:** Patterns, borders, dividers, icons → recolour via CSS variables (one SVG, all themes). Hero illustrations, empty-state art, theme-picker previews → distinct per-theme components.

---

## 3. The Six Cultural Themes

> Each theme below specifies: concept, the real art tradition it draws from, full light + dark token values, the motif vocabulary, the texture, and the hero treatment. **All colours given as HSL triplets** (matching the `hsl(var(--x))` setup). All palettes are checked for WCAG AA text contrast.

### 3.1 Theme 1 — `bharat-dawn` (DEFAULT)
**Concept:** Sunrise over the Ganga at Varanasi. Warmth, optimism, the daily renewal of civic hope. This is the safe, universally-loved default — warm but professional.
**Art tradition:** Banaras ghats, marigold (genda) garlands, the rising sun motif from Indian miniature painting.
**Personality:** Warm, hopeful, dignified.

**Light mode tokens:**
```
--bg:            36 45% 97%   /* warm ivory, like aged paper */
--surface:       40 50% 99%
--surface-muted: 36 38% 94%
--border:        34 25% 87%
--border-strong: 32 22% 76%
--text:          25 30% 14%   /* warm near-black, like sepia ink */
--text-muted:    28 15% 38%
--text-subtle:   30 12% 54%
--brand:         18 85% 48%   /* marigold-saffron */
--brand-hover:   16 88% 41%
--brand-soft:    24 90% 93%
--accent:        352 60% 45%  /* sindoor rose */
--accent-soft:   352 70% 94%
--success:       145 50% 36%
--warning:       38 92% 48%
--danger:        4 72% 48%
--info:          204 70% 42%
--motif-1:       18 85% 52%   /* saffron */
--motif-2:       352 55% 48%  /* rose */
--motif-3:       150 45% 38%  /* leaf green */
--motif-gold:    42 78% 52%   /* temple gold */
```

**Dark mode tokens:**
```
--bg:            24 28% 8%    /* deep warm brown-black, like a temple at night */
--surface:       22 22% 12%
--surface-muted: 22 18% 16%
--border:        24 16% 24%
--border-strong: 26 14% 36%
--text:          36 35% 92%   /* warm cream */
--text-muted:    32 18% 68%
--text-subtle:   30 14% 52%
--brand:         24 90% 60%   /* glowing saffron */
--brand-hover:   26 95% 67%
--brand-soft:    20 50% 18%
--accent:        352 65% 62%
--accent-soft:   352 40% 20%
--success:       145 50% 52%
--warning:       38 90% 60%
--danger:        4 75% 62%
--info:          204 70% 60%
--motif-1:       24 90% 62%
--motif-2:       352 60% 60%
--motif-3:       150 45% 50%
--motif-gold:    42 85% 60%
```

**Motif vocabulary:** rising-sun rays, marigold flower-heads, lotus, ghat steps, diya flames.
**Texture:** very subtle handmade-paper grain (2% opacity noise overlay).
**Hero treatment:** A layered sunrise scene over stylised ghat steps and temple silhouettes, sun with slowly-rotating rays (20s loop), birds arcing across (one-shot on load), faint rising incense smoke (CSS, 14s loop).

---

### 3.2 Theme 2 — `mithila-bloom`
**Concept:** The vivid, line-dense joy of Madhubani (Mithila) painting from Bihar. The most *colourful* theme — but controlled, applied to accents and art, never the chrome.
**Art tradition:** Madhubani/Mithila painting — double-line drawing, fish, peacocks, lotus ponds, the kohbar marriage motif, nature-fertility symbolism. Natural dye palette.
**Personality:** Joyful, intricate, feminine, celebratory.

**Light mode tokens:**
```
--bg:            48 40% 96%
--surface:       0 0% 100%
--surface-muted: 46 30% 93%
--border:        40 22% 85%
--border-strong: 38 20% 74%
--text:          340 25% 16%
--text-muted:    340 12% 40%
--text-subtle:   340 10% 56%
--brand:         340 75% 44%   /* madder red / alta */
--brand-hover:   340 80% 38%
--brand-soft:    340 70% 93%
--accent:        168 65% 32%   /* deep peacock teal */
--accent-soft:   168 50% 90%
--success:       142 55% 34%
--warning:       36 90% 46%
--danger:        2 74% 46%
--info:          200 72% 40%
--motif-1:       340 75% 48%   /* alta red */
--motif-2:       168 60% 36%   /* peacock teal */
--motif-3:       30 88% 50%    /* turmeric ochre */
--motif-gold:    44 80% 50%
```

**Dark mode tokens:**
```
--bg:            335 24% 8%
--surface:       335 20% 11%
--surface-muted: 335 16% 15%
--border:        336 14% 23%
--border-strong: 338 12% 34%
--text:          44 30% 92%
--text-muted:    40 16% 66%
--text-subtle:   38 12% 50%
--brand:         342 80% 62%
--brand-hover:   342 85% 68%
--brand-soft:    340 40% 18%
--accent:        168 60% 48%
--accent-soft:   168 35% 18%
--success:       142 52% 50%
--warning:       36 88% 58%
--danger:        2 76% 62%
--info:          200 70% 58%
--motif-1:       342 80% 64%
--motif-2:       168 60% 52%
--motif-3:       30 88% 60%
--motif-gold:    44 85% 60%
```

**Motif vocabulary:** double-outline fish, peacocks, lotus ponds, the sun-and-moon faces, bamboo groves, intertwined vines. All in characteristic Madhubani double-line style with fine cross-hatch fill.
**Texture:** cross-hatch fill patterns in borders and dividers; handmade-paper base.
**Hero treatment:** A Madhubani lotus pond — fish swimming in a slow loop (16s, following a bezier path), lotus flowers gently opening/closing (10s), a peacock whose tail feathers shimmer (subtle hue-shift, 12s). Dense double-line linework. This is the showcase theme — go maximal in the hero, calm everywhere else.

---

### 3.3 Theme 3 — `warli-earth`
**Concept:** The minimalist, monochromatic geometry of Warli tribal art from Maharashtra. The most *restrained* and *professional-feeling* theme — proof that "Indian" doesn't have to mean "loud." Earthy, grounded, calm.
**Art tradition:** Warli painting — white rice-paste figures on red-ochre mud walls. Circles, triangles, the tarpa dance spiral, stick figures, the tree of life. Pure geometry.
**Personality:** Calm, earthy, minimal, timeless, architectural.

**Light mode tokens:**
```
--bg:            22 30% 88%    /* warm mud-ochre wash */
--surface:       24 36% 92%
--surface-muted: 22 26% 84%
--border:        20 22% 74%
--border-strong: 18 20% 62%
--text:          18 25% 18%    /* dark earth */
--text-muted:    18 14% 36%
--text-subtle:   18 10% 50%
--brand:         14 55% 40%    /* terracotta */
--brand-hover:   14 60% 34%
--brand-soft:    16 40% 82%
--accent:        30 18% 30%    /* charcoal-brown */
--accent-soft:   28 16% 80%
--success:       120 30% 32%
--warning:       34 70% 44%
--danger:        6 65% 44%
--info:          200 35% 38%
--motif-1:       0 0% 98%      /* the iconic white rice-paste */
--motif-2:       14 50% 42%    /* ochre */
--motif-3:       20 20% 28%    /* brown */
--motif-gold:    36 50% 46%
```

**Dark mode tokens:**
```
--bg:            16 22% 9%
--surface:       16 18% 12%
--surface-muted: 16 16% 16%
--border:        16 14% 24%
--border-strong: 16 12% 35%
--text:          24 24% 90%
--text-muted:    22 14% 64%
--text-subtle:   20 10% 48%
--brand:         16 65% 56%
--brand-hover:   16 70% 62%
--brand-soft:    14 36% 18%
--accent:        28 20% 70%
--accent-soft:   28 16% 20%
--success:       120 32% 48%
--warning:       34 72% 56%
--danger:        6 68% 60%
--info:          200 40% 56%
--motif-1:       0 0% 96%
--motif-2:       16 55% 56%
--motif-3:       24 18% 72%
--motif-gold:    36 56% 58%
```

**Motif vocabulary:** Warli stick figures, the tarpa dance circle (concentric ring of dancers), triangular trees, geometric huts, the chauk square. Strictly two-tone (motif on ground).
**Texture:** subtle mud-wall texture (fine granular noise, 3%), faint hand-drawn wobble on motif lines.
**Hero treatment:** The tarpa dance — a concentric circle of Warli figures rotating slowly (24s, very slow, meditative), a central musician, triangular trees on the periphery. Monochrome white-on-ochre. Deeply calm. The figures' arms connect in the characteristic chain.

---

(Themes 4–6 continue in Part 2 of this addendum.)

### 3.4 Theme 4 — `mughal-indigo`
**Concept:** The refined opulence of Mughal miniature painting and Indo-Islamic architecture. Deep indigo night skies, jali screen geometry, gold leaf. The most *premium / luxury* theme — this is the one that screams "world-class product."
**Art tradition:** Mughal miniatures, pietra dura inlay (Taj Mahal), jali lattice screens, Persian floral arabesque, illuminated manuscript borders.
**Personality:** Regal, precise, opulent, sophisticated.

**Light mode tokens:**
```
--bg:            210 25% 96%   /* cool marble white */
--surface:       0 0% 100%
--surface-muted: 214 22% 93%
--border:        216 18% 85%
--border-strong: 218 16% 73%
--text:          222 35% 15%   /* indigo-ink */
--text-muted:    222 16% 38%
--text-subtle:   220 12% 54%
--brand:         224 64% 38%   /* royal indigo */
--brand-hover:   224 70% 31%
--brand-soft:    224 60% 93%
--accent:        168 58% 32%   /* emerald (pietra dura) */
--accent-soft:   168 45% 90%
--success:       158 52% 33%
--warning:       40 88% 46%
--danger:        352 68% 46%
--info:          224 64% 46%
--motif-1:       224 64% 44%   /* indigo */
--motif-2:       168 55% 36%   /* emerald */
--motif-3:       352 60% 48%   /* ruby */
--motif-gold:    43 74% 50%    /* gold leaf */
```

**Dark mode tokens:**
```
--bg:            226 38% 7%    /* deep midnight indigo */
--surface:       225 32% 11%
--surface-muted: 224 26% 15%
--border:        222 22% 24%
--border-strong: 222 18% 36%
--text:          210 30% 93%
--text-muted:    214 16% 68%
--text-subtle:   216 12% 52%
--brand:         226 78% 68%   /* luminous indigo */
--brand-hover:   226 82% 74%
--brand-soft:    224 44% 18%
--accent:        165 60% 48%
--accent-soft:   168 35% 16%
--success:       158 52% 50%
--warning:       40 86% 58%
--danger:        352 70% 62%
--info:          226 70% 66%
--motif-1:       226 78% 66%
--motif-2:       165 58% 50%
--motif-3:       352 64% 62%
--motif-gold:    43 82% 60%    /* bright gold */
```

**Motif vocabulary:** jali lattice (8-fold and 6-fold geometric stars), Persian floral arabesque, the cusped (multifoil) arch, paisley (boteh), illuminated corner-pieces.
**Texture:** fine jali lattice as a faint background pattern; gold-leaf flecking on premium surfaces (theme picker, badges).
**Hero treatment:** A jali screen through which a slow gradient of dawn/dusk light passes (the light moves across the lattice, 20s loop), a cusped arch framing it, gold arabesque corners that draw themselves on load (SVG stroke-dashoffset). Restrained, precise, expensive-looking. Gold accents catch a subtle shimmer sweep every 8s.

---

### 3.5 Theme 5 — `coromandel-pattachitra`
**Concept:** The bold narrative art of Odisha/Bengal Pattachitra and the temple-rich coast. Vivid natural pigments, intricate borders, mythological storytelling energy.
**Art tradition:** Pattachitra (Odisha) — palm-leaf etching, natural pigment, strong black outlines, ornate floral borders, the Jagannath motif, dancing figures.
**Personality:** Bold, narrative, vibrant, devotional, energetic.

**Light mode tokens:**
```
--bg:            44 48% 95%    /* palm-leaf cream */
--surface:       46 54% 98%
--surface-muted: 42 36% 92%
--border:        38 26% 84%
--border-strong: 36 22% 72%
--text:          20 35% 14%
--text-muted:    22 16% 38%
--text-subtle:   24 12% 54%
--brand:         8 78% 46%     /* hingula red (cinnabar) */
--brand-hover:   8 82% 40%
--brand-soft:    10 75% 93%
--accent:        150 55% 30%   /* deep leaf green */
--accent-soft:   150 45% 89%
--success:       150 52% 33%
--warning:       40 90% 47%
--danger:        4 76% 46%
--info:          198 68% 40%
--motif-1:       8 78% 50%      /* cinnabar */
--motif-2:       150 50% 34%    /* green */
--motif-3:       42 88% 50%     /* haritala yellow */
--motif-gold:    40 80% 50%
```

**Dark mode tokens:**
```
--bg:            18 28% 8%
--surface:       18 22% 11%
--surface-muted: 18 18% 15%
--border:        18 16% 24%
--border-strong: 18 13% 35%
--text:          44 32% 92%
--text-muted:    40 16% 66%
--text-subtle:   38 12% 50%
--brand:         10 82% 62%
--brand-hover:   10 86% 68%
--brand-soft:    8 44% 18%
--accent:        150 52% 48%
--accent-soft:   150 32% 16%
--success:       150 52% 50%
--warning:       40 88% 58%
--danger:        4 78% 62%
--info:          198 68% 58%
--motif-1:       10 82% 64%
--motif-2:       150 52% 52%
--motif-3:       42 90% 60%
--motif-gold:    40 84% 60%
```

**Motif vocabulary:** Pattachitra floral border bands, lotus medallions, dancing figures with almond eyes, the elephant and peacock, fish-scale fills, palm-leaf etch lines.
**Texture:** palm-leaf horizontal striation (very subtle), strong black motif outlines.
**Hero treatment:** An ornate Pattachitra border frame that draws itself on load, framing a central lotus medallion that slowly rotates (18s), with dancing figures along the lower band. Strong black outlines, vivid pigment fills. A border of repeating geese (hamsa) that subtly march (12s).

---

### 3.6 Theme 6 — `nilgiri-mist`
**Concept:** The cool, misty calm of the Western Ghats, Kerala backwaters, tea estates, and Kerala mural art. The *coolest* and most *serene* theme — a deliberate counterpoint to the warm themes. For users who want calm.
**Art tradition:** Kerala mural painting (Padmanabhapuram, Mattancherry), tea-estate landscapes, Theyyam colour, coconut-frond and backwater motifs.
**Personality:** Serene, cool, lush, contemplative, fresh.

**Light mode tokens:**
```
--bg:            155 28% 96%   /* misty pale green */
--surface:       150 30% 99%
--surface-muted: 152 22% 92%
--border:        150 18% 84%
--border-strong: 152 16% 71%
--text:          175 30% 13%   /* deep teal-black */
--text-muted:    172 14% 36%
--text-subtle:   168 11% 52%
--brand:         162 58% 30%   /* tea-leaf green */
--brand-hover:   162 64% 24%
--brand-soft:    160 45% 90%
--accent:        14 70% 48%    /* Theyyam vermillion (sharp warm accent) */
--accent-soft:   14 65% 92%
--success:       150 55% 32%
--warning:       38 88% 46%
--danger:        4 72% 46%
--info:          192 66% 38%
--motif-1:       162 55% 34%    /* green */
--motif-2:       14 68% 50%     /* vermillion */
--motif-3:       42 76% 48%     /* mural ochre */
--motif-gold:    40 70% 48%
```

**Dark mode tokens:**
```
--bg:            178 30% 7%     /* deep forest teal-black */
--surface:       176 24% 10%
--surface-muted: 174 20% 14%
--border:        170 16% 23%
--border-strong: 168 13% 34%
--text:          152 26% 92%
--text-muted:    156 14% 66%
--text-subtle:   158 11% 50%
--brand:         160 56% 50%
--brand-hover:   160 62% 56%
--brand-soft:    162 38% 16%
--accent:        14 76% 60%
--accent-soft:   14 44% 18%
--success:       150 52% 50%
--warning:       38 86% 58%
--danger:        4 74% 62%
--info:          192 66% 56%
--motif-1:       160 54% 52%
--motif-2:       14 74% 62%
--motif-3:       42 80% 58%
--motif-gold:    40 78% 58%
```

**Motif vocabulary:** coconut fronds, backwater ripples, tea-terrace contours, Kerala mural figures (almond eyes, ornate crowns), the snake-boat (vallam), mist layers.
**Texture:** soft layered mist gradients, faint botanical line-work.
**Hero treatment:** Layered Western Ghats hills receding into mist (parallax on scroll), a Kerala backwater foreground with a snake-boat gliding across very slowly (22s), coconut fronds swaying gently at the edges (CSS sway, 9s), drifting mist layers (14s). The most atmospheric, depth-rich hero.

---

## 4. Typography System

### 4.1 The principle
Typography is where "professional" is won or lost. We pair **one distinctive display face** with **one highly-readable, Indic-script-capable body face**, plus a mono. Devanagari and Latin must both render beautifully (the app is bilingual EN/HI per PRD §11).

### 4.2 Font choices (exact)

| Role | Font | Source | Why |
|---|---|---|---|
| **Display** | **Tiro Devanagari Sanskrit** (or **Yatra One** for headings with more character) | Google Fonts | Designed for Devanagari + Latin, elegant, official-feeling, not generic. Tiro is calm/serious; Yatra is warmer. Use Tiro for data-heavy admin, allow theme to swap to a warmer display where fitting. |
| **Body** | **Mukta** | Google Fonts | Excellent Devanagari + Latin support, highly legible at small sizes, neutral and professional, designed for Indian UIs. |
| **Mono** | **JetBrains Mono** | Google Fonts | Case numbers, timestamps, technical values. |
| **Accent/numerals (optional)** | **Baloo 2** | Google Fonts | Rounded, friendly — used ONLY in celebratory/gamified moments (badge counts, streak numbers, reputation tier). Never in chrome. |

> **Do NOT use Inter, Roboto, Arial, or system fonts anywhere.** They are explicitly banned — they read as "generic AI app" and undercut the entire premise.

### 4.3 Per-theme display font mapping
Each cultural theme MAY override `--font-display` to reinforce its personality:
- `bharat-dawn` → Tiro Devanagari Sanskrit (dignified)
- `mithila-bloom` → Yatra One (warm, characterful)
- `warli-earth` → Tiro Devanagari Sanskrit (minimal, architectural)
- `mughal-indigo` → Tiro Devanagari Sanskrit (refined) with tighter tracking
- `coromandel-pattachitra` → Yatra One (bold, narrative)
- `nilgiri-mist` → Tiro Devanagari Sanskrit (serene)

Body stays **Mukta** across all themes for consistency and legibility.

### 4.4 Type scale (refined from PRD §7.2.2)
Keep the PRD's scale but apply these refinements:
- Display sizes use `--font-display`, weight 600–700, `letter-spacing: -0.02em`, `line-height: 1.1–1.2`
- Headings use `--font-display` at 600
- Body uses Mukta 400/500/600
- All Devanagari text gets `line-height` +0.1 vs Latin (Devanagari needs more vertical room for matras)
- Load via `next/font/google` with `display: 'swap'`, subset both `latin` and `devanagari`

### 4.5 Loading
```ts
// src/app/fonts.ts
import { Tiro_Devanagari_Sanskrit, Mukta, JetBrains_Mono, Yatra_One, Baloo_2 } from 'next/font/google'
// configure each with appropriate subsets, weights, variable CSS var names:
// --font-tiro, --font-mukta, --font-jetbrains, --font-yatra, --font-baloo
```

---

## 5. The Illustration & SVG Art System

### 5.1 Quality bar
Every illustration must be **hand-crafted vector art** — clean paths, deliberate colour, cultural accuracy. NOT auto-traced clipart, NOT emoji, NOT generic flat-illustration-library stuff. The reference quality is editorial/museum-grade vector illustration.

**Technique standard for "ultra-realistic accurate SVGs":**
- Build depth with layered paths and gradient fills (`linearGradient`, `radialGradient`)
- Use subtle inner shadows and highlights (overlaid semi-transparent paths) to create dimension
- Fine linework detail (Madhubani cross-hatch, Pattachitra outlines, jali geometry) drawn accurately
- Colour exclusively from the theme's `--motif-*` CSS variables so art recolours per theme
- Each illustration is a React component in `src/components/art/` accepting `className` and respecting `currentColor` / CSS vars
- viewBox-based, fully responsive, no fixed pixel dimensions
- Optimised: no redundant points, grouped logically, commented by section

### 5.2 Illustration inventory (build all of these)

**Hero illustrations (per-theme, 6 total):** the hero treatments described in §3 — the showcase pieces. Each is its own component (`<HeroBharatDawn/>`, `<HeroMithilaBloom/>`, etc.) with the specified looping animations.

**Empty-state illustrations (shared, recolour per theme — 8 total):**
1. `EmptyCases` — a citizen looking hopefully at a horizon with a stylised cityscape (used at My Cases empty)
2. `EmptyFeed` — a calm courtyard/chaupal (village meeting space) scene
3. `EmptyInbox` — "inbox zero" — a tidy desk with a clay lamp, a small celebratory motif
4. `EmptyNotifications` — a temple bell at rest
5. `EmptyClusters` — scattered dots resolving into a rangoli pattern
6. `EmptySearch` — a magnifying glass over a stylised map of India
7. `Error500` — a kite with a cut string (gently, not alarming) — "something slipped"
8. `Error404` — a wandering figure at a crossroads with milestone stones

**Spot illustrations / decorative (shared — at least 10):**
- Section dividers: themed border-bands (Madhubani fish row, Warli figure chain, jali band, Pattachitra floral band, etc.)
- Onboarding step art (3 small scenes for first-run)
- Profile header banner art (themed)
- Badge artwork — 9 badges, each a small medallion illustration in the active theme's style (see PRD §5.3.2 for the 9 badges)
- Civic reputation tier emblems — 5 tier emblems (Watcher → Civic Patron), escalating ornateness

**Iconography:** Keep lucide-react for functional UI icons (per PRD) BUT create a set of ~12 **custom themed category icons** for the 8 departments + key actions, drawn in a consistent line-weight that harmonises with lucide but carries Indian character (e.g., the Water dept icon as a stylised stepwell, Sanitation as a clean-sweep broom motif, Roads as a milestone stone).

### 5.3 The "living" detail layer
To make the app feel alive (the "brings users back" quality), add these ambient touches:
- **Animated diya/lamp** in the header that flickers very subtly (the flame, 3% movement, 4s irregular loop) — themed
- **Seasonal/time-of-day awareness:** the hero subtly shifts warmth based on the user's local time (dawn/day/dusk/night gradient overlay) — computed client-side, cheap
- **Festival mode (optional, high delight):** on major Indian festivals (Diwali, Holi, Pongal, Eid, etc., from a static date table), a tasteful one-time accent appears — e.g., Diwali adds floating diyas to the hero, Holi adds a colour-powder burst on the theme picker. Dismissible. Never intrusive.

---

(Continues in Part 3: Motion system, component art direction, theme picker, backgrounds, performance, and the implementation plan.)

## 6. Motion & Micro-interaction System

### 6.1 Motion philosophy
Motion is **earned, purposeful, and calm**. Loops are slow (8–24s) and low-amplitude so they never distract. Interactions give immediate tactile feedback (≤150ms). One orchestrated page-load sequence per route beats scattered fidgets. Everything respects `prefers-reduced-motion`.

### 6.2 The motion library
Use **Motion** (formerly Framer Motion, `motion` package) — already in the stack per PRD §2.9. For CSS-only ambient loops (texture drift, flame flicker, mist), use pure CSS keyframes to keep them off the JS thread.

### 6.3 Page-load choreography (per route)
On every primary route, orchestrate a staggered reveal:
```
1. Background/hero fades + subtle scale (0 → 1, 480ms, ease-out)
2. Header elements stagger in (each +40ms delay, slide-up 8px + fade)
3. Primary content cards stagger (each +60ms, slide-up 12px + fade)
4. Decorative motifs draw-in last (SVG stroke-dashoffset for line art, 600ms)
```
Total sequence ≤ 900ms. Never block interaction during it — content is interactive immediately, animation is decorative.

### 6.4 Micro-interaction catalogue (build all)

| Element | Interaction |
|---|---|
| **Primary button** | Hover: subtle lift (-1px) + brand-glow shadow grows; Press: scale 0.97 + a tiny themed ripple from click point; Loading: the themed lamp/chakra spins |
| **Card (interactive)** | Hover: lift -2px, border warms to brand, a faint motif watermark fades in at 4% in the corner |
| **Status badge "In Progress"** | The dot pulses (themed colour, 2s) |
| **SLA ring** | Animated stroke draw on mount; colour transitions green→amber→red smoothly as time passes |
| **Upvote** | Tap: the count rolls up (number transition) + a themed particle burst (marigold petals / lotus / etc. per theme), 480ms one-shot |
| **Co-sign** | A small "joining" animation — avatar slides into the stack |
| **Filing a complaint (success)** | Full-screen themed celebration: per-theme particle system (Bharat-dawn = marigold petals + rising sun; Mithila = fish + lotus; Mughal = gold sparkle + arabesque draw; etc.), 600ms, then settles to the case page. This is THE delight moment. |
| **Badge unlock** | The badge medallion draws itself (stroke), then a gold-ring sweep + gentle scale-bounce, themed particle accent |
| **Streak increment** | The streak number flips up; at milestones (7/30) a themed flourish |
| **Reputation tier-up** | The tier emblem morphs to the next, brief radial glow |
| **Theme switch** | A themed "wipe" transition — e.g., a rangoli-radial reveal, or a curtain of the new theme's motif sweeping across — 600ms. This must feel magical (see §8). |
| **Tab/route change** | Quick cross-fade + 8px slide in scroll direction |
| **Toast** | Slide-in from top-right with a themed left-accent bar; success toasts get a tiny themed checkmark draw |
| **Input focus** | Border animates to brand, a soft brand ring expands (200ms) |
| **Skeleton loaders** | Themed shimmer — the shimmer gradient uses the theme's brand-soft colour, not generic grey |
| **Pull-to-refresh (mobile)** | A themed motif spins/draws while refreshing (e.g., a small chakra or rangoli forming) |

### 6.5 Ambient loops (CSS-only, always subtle)
- Hero motifs as specified per theme (§3)
- Header lamp flame flicker
- Texture/grain very slow drift (optional, 60s)
- Mist layers (nilgiri-mist only)
- Gold shimmer sweep on premium surfaces (mughal-indigo)

### 6.6 Reduced motion
When `prefers-reduced-motion: reduce`:
- Disable ALL ambient loops (heroes become a beautiful static frame)
- Disable particle bursts (replace with a simple fade)
- Keep only essential state-change transitions, shortened to ≤120ms
- The app must remain fully beautiful as a static composition — the static state is designed, not just "animation off"

---

## 7. Component Art Direction

> Per-component upgrades to the shadcn/ui primitives from PRD §7.3. Apply these on top of the existing components — restyle, don't rebuild the logic.

### 7.1 Buttons
- Primary: brand fill with a very subtle top-edge highlight gradient (1px lighter) for dimension; themed press ripple
- The corner radius and a 1px inner border give a "crafted" feel
- Loading spinner is a themed micro-motif (small chakra/lamp/lotus), not a generic spinner

### 7.2 Cards
- Surface colour + 1px border + `elev-1`
- On interactive cards, a **corner motif watermark** (theme motif at 3–5% opacity) in the bottom-right, revealed on hover
- Optional themed top-accent bar (2px) for status/category colour-coding
- Section cards can use a themed **border-band** header (a thin strip of the theme's pattern)

### 7.3 Status badges
- Soft-fill pill + saturated text (keep PRD semantics)
- Each status gets a tiny themed leading glyph
- "In Progress" pulse dot themed

### 7.4 The SLA ring (signature component)
- A circular progress ring, but rendered with craft: a subtle gradient stroke, rounded caps, a faint track
- At its centre, the days-remaining number in Baloo 2
- Colour shifts smoothly across its lifetime
- On the case detail, make it a hero element — larger, with a themed micro-motif at its centre when resolved (a small bloom/checkmark draw)

### 7.5 Timeline (case events)
- Vertical timeline with themed node markers (small motif dots)
- The connecting line is a subtle themed gradient
- Each event card slides in on scroll (stagger)
- The CREATED event gets a special themed origin marker

### 7.6 Avatars
- Initial-fallback backgrounds use a themed palette (deterministic from name hash, picking from `--motif-*`)
- Officer/admin ring uses brand colour
- High-reputation citizens get a subtle themed ring matching their tier emblem

### 7.7 Empty states
- Use the §5.2 illustrations, full art treatment
- Generous spacing, centred, with the themed illustration as the hero
- Warm, encouraging copy (per PRD voice)

### 7.8 Navigation (shells)
- **Citizen bottom nav (mobile):** the centre "File" action is a raised, brand-filled circular button with a themed glyph; active tab gets a themed underline/indicator that slides between tabs (layoutId animation)
- **Officer/admin sidebar:** active item gets a themed left-accent bar + soft brand-soft fill; the sidebar header carries a small themed crest/logo lockup
- **Header:** logo lockup (Samadhan wordmark in display font + a small themed mark), the ambient lamp, theme/notification/avatar controls

### 7.9 The Samadhan logo/wordmark
Design a simple, professional wordmark: "समाधान / Samadhan" in the display font, paired with a **mark** that works across themes — suggested: an abstract resolution motif (e.g., a chakra-inspired ring with a checkmark/lotus negative space, or interlocking elements suggesting citizen+state coming together). Render as SVG, recolours per theme. Provide horizontal lockup + mark-only (for mobile/favicon).

---

## 8. The Theme Picker Experience

> This is a flagship moment. The theme picker itself must be a delightful, memorable experience — a mini cultural gallery, not a dropdown.

### 8.1 Location
- In Settings (`/profile` settings section per PRD §6.2.8) as "Appearance"
- ALSO accessible via a quick-switcher: a themed icon in the header that opens a polished popover/sheet

### 8.2 The full picker (in Settings)
A gallery of **6 large theme cards**, each showing:
- A live mini-preview of the theme (a small rendered hero motif + palette swatches + a sample card)
- The theme name + the cultural tradition it honours (e.g., "Mithila Bloom — inspired by the Madhubani painting of Bihar")
- A one-line description of the art form (educational + builds appreciation)
- Selected state: a themed gold frame + checkmark

Below the theme cards: the **Mode** control (Light / Dark / System) as a refined segmented control with a sliding indicator and sun/moon/auto glyphs.

### 8.3 The quick-switcher (header popover)
- Compact grid of 6 theme swatches (each a 3-colour mini gradient + name on hover)
- Mode toggle
- "More in Settings →" link

### 8.4 The switch animation
When a theme is selected, the whole app transitions with a **themed reveal** (per §6.4): a radial rangoli-style wipe, or a motif curtain sweep, in the NEW theme's signature motif and colour, 600ms. The preview cards animate their motifs. Make switching themes feel like an event worth doing.

### 8.5 Educational micro-content
Each theme card includes a tiny "ⓘ" that reveals 2–3 sentences about the art tradition — its origin region, meaning, and significance. This turns the picker into a small celebration of Indian heritage and deepens user attachment. Keep copy accurate and respectful.

---

## 9. Backgrounds, Textures & Atmosphere

### 9.1 No flat backgrounds
Never a plain solid `--bg`. Always add atmosphere:
- A very subtle gradient mesh in the theme's palette (2–4% intensity) so backgrounds have life
- A fine grain/noise overlay (2–3% opacity) for a tactile, paper/wall feel matching each theme's texture spec
- Optional faint motif watermark in large empty zones (1–2% opacity)

### 9.2 Layered depth
- Heroes use layered SVG with parallax where appropriate (nilgiri-mist hills, bharat-dawn ghats)
- Cards float above textured backgrounds with crafted shadows
- Modals/sheets get a themed scrim (the overlay tinted slightly with the theme's deep colour, not pure black)

### 9.3 Section dividers
Replace plain `<Separator>` in major sections with **themed border-bands** — thin strips of the theme's pattern (Madhubani fish row, Warli chain, jali band). Use sparingly at major section breaks, not between every element.

### 9.4 Decorative framing
- Profile header, theme picker cards, badge displays, and celebratory moments get **themed corner ornaments** (drawn SVG corners — arabesque for Mughal, floral for Pattachitra, etc.)
- These draw themselves in on load (stroke animation)

---

## 10. Performance & Accessibility Guardrails

> Beauty must not break the product. These are hard limits.

### 10.1 Performance
- **All SVGs inline as React components** (no network requests), tree-shakeable, only the active theme's hero loads
- Hero illustrations: lazy-load below-fold; the active hero is critical, others are not bundled until theme-switched (dynamic import per-theme hero)
- Ambient CSS loops use only `transform` and `opacity` (GPU-composited); never animate layout properties
- Particle bursts: cap particle count (≤24), use CSS transforms, clean up after animation, never leave runaway timers
- Total added JS for the art/motion system: budget ≤ 60KB gzip beyond the base app
- Lighthouse targets from PRD §12.1 STILL APPLY: Performance ≥ 90 mobile. If an effect threatens this, make it progressive/optional.
- Texture noise: use a single small tiling PNG/SVG or CSS, not per-pixel canvas
- Respect `content-visibility: auto` on off-screen heavy sections

### 10.2 Accessibility (WCAG 2.1 AA — non-negotiable, per PRD §11)
- **Every theme × mode combination must pass AA text contrast** (4.5:1 body, 3:1 large). The palettes above are designed for this — verify each with a contrast checker during build and adjust `--text` / `--text-muted` if any pairing fails.
- Decorative SVGs: `aria-hidden="true"`, `role="presentation"`
- Meaningful illustrations (empty states): provide an `aria-label` or adjacent text
- Motion: full `prefers-reduced-motion` support per §6.6
- Never convey status by colour alone (keep text/glyph per PRD)
- Theme picker: fully keyboard navigable, focus-visible rings, screen-reader labels naming each theme
- Focus rings must be visible on every theme (use brand colour with sufficient contrast against surface)

### 10.3 Graceful degradation
- If a hero fails to load → a designed static gradient fallback in theme colours
- If fonts fail → the fallback stack still renders Devanagari (system Indic fonts)
- The app is fully usable and still attractive with zero animations

---

## 11. Implementation Plan for Claude Code

> Execute in this order. This is an ADDITIVE design pass over the existing Samadhan codebase. Do not break existing features, routes, data models, or APIs. Re-skin and enhance only.

### Phase D0 — Theming foundation (do first, everything depends on it)
1. Create `src/styles/themes.css` with all 6 themes × 2 modes, full token sets from §3.
2. Create `src/styles/tokens.css` for shared structural tokens (spacing, radius, motion, z-index) if not already split out.
3. Update `tailwind.config.ts` to map all colours to `hsl(var(--token) / <alpha-value>)` per §2.3, add motif colours, themed shadows, and the font CSS variables.
4. Build the two-axis `ThemeProvider` (§2.2) replacing/extending the existing next-themes setup. Persist both axes. Expose `useTheme()`.
5. Add the no-flash blocking script to root layout `<head>` (§2.2).
6. Set up fonts in `src/app/fonts.ts` (§4.5); wire CSS variables; remove any Inter/system font usage.
7. **Checkpoint:** the existing app renders in `bharat-dawn` light, and switching `data-theme`/`data-mode` manually in devtools recolours everything. No hardcoded colours remain (grep for hex codes and `gray-`, `slate-`, etc. Tailwind defaults — replace all).

### Phase D1 — Core re-skin (the calm canvas)
1. Restyle all shadcn primitives (§7) to use the new tokens: buttons, cards, inputs, badges, tabs, dialog, sheet, table, etc.
2. Apply backgrounds/textures/atmosphere (§9) to shells and pages.
3. Implement typography refinements (§4.4) — display font on headings, Mukta body, Devanagari line-height.
4. Re-skin the navigation shells (§7.8) — citizen bottom nav, officer/admin sidebar, header with ambient lamp.
5. Design + implement the Samadhan logo/wordmark (§7.9).
6. **Checkpoint:** the whole app looks professional, cohesive, themed, and clearly "Indian but restrained" in all 12 theme×mode combos — even before the big illustrations.

### Phase D2 — Illustration system
1. Build the SVG art component infrastructure in `src/components/art/` (§5.1) — themed, CSS-var-driven, responsive.
2. Build all 6 per-theme hero illustrations with their specified loops (§3, §5).
3. Build the 8 empty-state illustrations (§5.2), recolouring per theme.
4. Build the 10+ spot/decorative illustrations, section border-bands, badge artwork (9), tier emblems (5), custom category icons (~12).
5. Wire heroes into home/landing zones; wire empty states into all list/empty views (per PRD §10.1); wire decorative elements per §9.
6. **Checkpoint:** every empty state, hero, and major surface carries crafted, theme-accurate art.

### Phase D3 — Motion & micro-interactions
1. Implement the page-load choreography (§6.3) on each primary route.
2. Build the full micro-interaction catalogue (§6.4) — especially the complaint-filed celebration, badge unlock, upvote burst, theme-switch transition.
3. Implement ambient CSS loops (§6.5).
4. Implement `prefers-reduced-motion` handling everywhere (§6.6) — verify static states are beautiful.
5. **Checkpoint:** the app feels alive and tactile; nothing janky; reduced-motion fully respected.

### Phase D4 — Theme picker experience
1. Build the full Settings "Appearance" gallery (§8.2) with live mini-previews + educational content.
2. Build the header quick-switcher popover (§8.3).
3. Implement the themed switch animation (§8.4).
4. **Checkpoint:** switching themes is a delightful, memorable, educational moment.

### Phase D5 — Polish, perf & a11y hardening
1. Add the living-detail layer (§5.3): time-of-day hero warmth, optional festival mode.
2. Run the full performance pass (§10.1) — verify Lighthouse ≥ 90 mobile, JS budget, lazy-loading of non-active heroes.
3. Run the full accessibility pass (§10.2) — verify AA contrast on ALL 12 combos, keyboard, screen-reader, reduced-motion.
4. Cross-device visual QA: 320px → desktop, all 6 themes, both modes.
5. **Checkpoint / Definition of Done:** all 12 theme×mode combos are beautiful, cohesive, accessible (AA), and performant (LH ≥ 90); every delight moment works; reduced-motion degrades gracefully; no hardcoded colours; the app feels world-class and unmistakably, tastefully Indian.

### 11.1 Build rules
- Keep the app runnable after every phase (`pnpm dev`, `pnpm build` clean)
- Never hardcode a colour — always a token
- Never break a feature/route/API from the main PRD
- Match implementation effort to the vision: this is a maximalist art brief on a minimalist structural frame — go deep on the art, stay disciplined on the chrome
- Commit at each checkpoint

### 11.2 Known exceptions (documented hardcoded colours)
These are the *only* sanctioned literal colours; everything else must be a token. They exist where the runtime token pipeline (CSS variables / Tailwind) is provably unavailable or where a static literal is required by the platform:
- `src/app/global-error.tsx` — the root global error boundary renders its own `<html>`/`<body>` when the root layout (and thus `globals.css`/`themes.css`) has failed; it uses a minimal inline fallback palette.
- `src/app/layout.tsx` `viewport.themeColor` and `public/manifest.webmanifest` — PWA/browser chrome metadata cannot read CSS variables; literal values approximate the `bharat-dawn` default.
- `public/icons/icon.svg` — the static app icon/favicon asset (brand mark), not in-app UI chrome.
- `ward-grid.tsx` heatmap tile labels use `text-white` — a data-viz label on a computed, fixed-saturation tile colour (mode-independent), where white is the correct legibility choice (as with chart labels).

---

## 12. Asset Manifest

Everything to be created, as a checklist:

**Themes:** 6 cultural themes × 2 modes = 12 token sets ✓
**Fonts:** Tiro Devanagari Sanskrit, Mukta, JetBrains Mono, Yatra One, Baloo 2
**Hero illustrations (animated, per-theme):** 6
**Empty-state illustrations:** 8 (EmptyCases, EmptyFeed, EmptyInbox, EmptyNotifications, EmptyClusters, EmptySearch, Error500, Error404)
**Badge artwork:** 9 (per PRD §5.3.2)
**Reputation tier emblems:** 5 (Watcher, Reporter, Advocate, Champion, Civic Patron)
**Custom category/action icons:** ~12 (8 departments + key actions)
**Section border-bands:** 6 (one signature pattern per theme)
**Themed corner ornaments:** 6 (one per theme)
**Onboarding spot art:** 3
**Logo/wordmark:** horizontal lockup + mark-only + favicon
**Micro-interactions:** full catalogue per §6.4
**Theme picker:** full gallery + quick-switcher + switch animation
**Ambient effects:** header lamp, hero loops (6), mist (1), gold shimmer (1), texture grain

---

## End of Design Addendum

This document, together with SAMADHAN_PRD.md, fully specifies a world-class, culturally-rooted, professionally-disciplined visual identity for Samadhan. Execute Phases D0→D5 in order as an additive pass over the existing codebase.
