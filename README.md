# Samadhan — Civic Resolution Network

A civic-grievance platform that turns every government complaint into a visible,
trackable service journey with public accountability and AI-powered drafting,
routing, and escalation. See [`SAMADHAN_PRD.md`](./SAMADHAN_PRD.md) for the full
build contract.

> **Status:** Phases 0–5 complete.
> - **0 Foundation** — scaffold, auth, DB + seed, shells.
> - **1 Citizen intake** — 4-step wizard, AI draft/classify/duplicates, cases list + detail.
> - **2 Officer workbench** — ranked inbox (keyboard), case actions, AI close-quality + brief, SLA escalation, metrics.
> - **3 Public + engagement** — feed (hot/filters/infinite), ward heatmap, leaderboards, upvote/cosign, streaks, badges, profile.
> - **4 Admin console** — overview (recharts), officer accountability, AI trends + policy digest, reassignment.
> - **5 Polish** — empty states, error boundaries, PWA, i18n (en/hi), Vitest units, Playwright E2E.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript 5.6 (strict) · Tailwind CSS 3.4 ·
shadcn/ui (Radix) · Prisma 5 + SQLite · iron-session · TanStack Query · Zustand ·
React Hook Form + Zod · OpenAI SDK (OpenRouter). Full version table in PRD §2.

## Prerequisites

- Node.js 20+ (tested on 22 LTS)
- pnpm 9 (`npm install -g pnpm@9` or `corepack enable`)

## Setup

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env.local
# Fill OPENROUTER_API_KEY (for Phase 1+ AI) and SESSION_PASSWORD (32+ chars).
# DATABASE_URL=file:./dev.db is the default.
# Note: the Prisma CLI reads `.env` (not `.env.local`); a `.env` with
# DATABASE_URL is already provided.

# 3. Database (migrate + generate + seed)
pnpm prisma migrate dev      # applies migrations and runs the seed
# (or, on an existing db) pnpm db:seed

# 4. Run
pnpm dev                     # → http://localhost:3000
```

## Demo personas

Use `/login`, or the one-click switcher at `/role-switch`
(gated by `NEXT_PUBLIC_DEMO_MODE=true`).

| Persona | Role    | Credentials                                        |
| ------- | ------- | -------------------------------------------------- |
| Priya   | Citizen | phone `+919999900001`, OTP `123456`                |
| Rajesh  | Officer | `rajesh@mcgm.gov.in` / `Officer@123!demo`          |
| Anita   | Admin   | `anita@mcgm.gov.in` / `Admin@123!demo`             |

Citizen login uses a **mock OTP** — any registered phone with code `123456`.
A new phone number registers a fresh citizen on first login.

## Scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Dev server                               |
| `pnpm build`       | `prisma generate` + production build     |
| `pnpm start`       | Run the production build                 |
| `pnpm typecheck`   | `tsc --noEmit`                           |
| `pnpm lint`        | ESLint (`next lint`)                     |
| `pnpm format`      | Prettier write                           |
| `pnpm db:migrate`  | `prisma migrate dev`                     |
| `pnpm db:seed`     | Re-run the seed                          |
| `pnpm db:reset`    | Reset + re-migrate + re-seed             |
| `pnpm db:studio`   | Prisma Studio                            |
| `pnpm test`        | Vitest (unit)                            |
| `pnpm test:e2e`    | Playwright (E2E)                         |

## Seed data

24 Mumbai wards · 8 departments · 40 categories (with SLA days) · 9 badges ·
10 officers · 21 citizens (incl. demo personas) · 200 complaints with full event
timelines, upvotes, co-signs, and quality scores.

## Notes / intentional deviations from the PRD

These are documented because the PRD says to treat it as a contract; each was
required to ship a working build.

- **Enums → String columns.** SQLite (Prisma) does not support native `enum`
  types, so the §8.1 enums are stored as `String`. Allowed values are enforced
  via TS unions in `src/types` and Zod enums in `src/schemas`.
- **Ward codes** use the strict §8.2 format `^[A-Z]{1,3}\d{0,2}$` (e.g. `KE`),
  rather than the illustrative `K-EAST` from the §8.4 example.
- **ESLint flat config** (`eslint.config.mjs`) is used instead of `.eslintrc.json`,
  as required by ESLint 9 + Next 15.
- **PostCSS config** is `postcss.config.mjs` (ESM) because `package.json` sets
  `"type": "module"`.
- **PWA** is implemented with a hand-written `public/sw.js` + `manifest.webmanifest`
  (not `next-pwa@5.6`, which predates Next 15 App Router).
- **i18n** ships `messages/en.json` + `messages/hi.json` with a lightweight
  dictionary helper (`src/lib/i18n.ts`) + `LocaleProvider`/`useT`, instead of
  `next-intl` (the PRD's `next-intl@15.x` pin does not exist). URL-prefix routing
  is deferred; locale follows the user's saved language.
- **AI transport.** Calls run **server-side only** (in `/api/ai/*` route handlers)
  through a serverless proxy (`OPENROUTER_CHAT_URL`) that injects the key — the key
  is never shipped to the client. A model fallback chain handles free-tier 429s,
  and every feature has a deterministic fallback when AI is unavailable.
- The root path `/` is the citizen home (guarded); unauthenticated `/` redirects
  to `/login`.

## Testing

```bash
pnpm test            # Vitest unit tests (reputation, SLA, AI prompt builders)
pnpm test:e2e        # Playwright E2E (needs: pnpm exec playwright install chromium)
pnpm typecheck       # tsc --noEmit
pnpm lint            # next lint
pnpm build           # production build (gate)
```

E2E specs (`tests/e2e/`) cover the file-complaint and officer-close happy paths;
run them against a dev server (`pnpm dev`).

## Deploy (Vercel + PostgreSQL)

GitHub Pages cannot host this app — it is a Next.js **server** app (API routes,
SSR with sessions, Prisma, server-side AI). Deploy to **Vercel**. Serverless
filesystems are read-only/ephemeral, so SQLite is swapped for **PostgreSQL**
(`provider = "postgresql"`).

1. **Create a Postgres DB** (Neon free tier or Vercel Postgres) and copy the
   connection string (`postgresql://…?sslmode=require`).
2. **Sync schema + seed** (run once from your machine):
   ```bash
   # put the Postgres URL in .env and .env.local
   pnpm prisma db push        # create tables
   pnpm prisma db seed        # seed wards/depts/cases/demo users
   ```
3. **Vercel env vars** (Project → Settings → Environment Variables):
   `DATABASE_URL`, `SESSION_PASSWORD` (32+ chars), `OPENROUTER_CHAT_URL`,
   `OPENROUTER_MODEL`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_DEMO_MODE=true`.
4. **Deploy:** `vercel --prod` (or connect the GitHub repo in the Vercel
   dashboard). Build runs `vercel-build` = `prisma generate && prisma db push &&
   next build`.

**Known limitation:** evidence uploads (`/api/upload`) write to the local
filesystem, which is read-only on serverless — image upload won't persist in
production until swapped for object storage (Vercel Blob / S3). Filing a
complaint without evidence works fully.

