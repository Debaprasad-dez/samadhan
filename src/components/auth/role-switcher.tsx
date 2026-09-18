"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Wrench, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FullscreenLoader } from "@/components/shared/fullscreen-loader";

type PersonaKey =
  | "citizen"
  | "officer"
  | "admin"
  | "rohan"
  | "tania"
  | "sanjib";

interface Persona {
  key: PersonaKey;
  name: string;
  role: string;
  blurb: string;
  /** Where this persona lands after switching (preview of their landing state). */
  landing: string;
  icon: LucideIcon;
}

const CITIZEN_LANDING = "Lands on the civic home + your cases";
const OFFICER_LANDING = "Lands on the ranked inbox";
const ADMIN_LANDING = "Lands on the accountability overview";

const PERSONAS: Persona[] = [
  {
    key: "citizen",
    name: "Ankita Saha",
    role: "Citizen",
    blurb: "File and track complaints in Ramnagar.",
    landing: CITIZEN_LANDING,
    icon: User,
  },
  {
    key: "officer",
    name: "Bikash Debbarma",
    role: "Sanitation Officer",
    blurb: "Work a prioritised queue in Durga Chowmuhani.",
    landing: OFFICER_LANDING,
    icon: Wrench,
  },
  {
    key: "admin",
    name: "Sharmila Chakraborty",
    role: "District Magistrate",
    blurb: "See systemic issues and accountability.",
    landing: ADMIN_LANDING,
    icon: ShieldCheck,
  },
];

// Fresh, interlinked accounts (all ward W25, Durga Chowmuhani) for demoing a live multi-user flow:
// the two citizens file/co-sign, the officer resolves — updates ripple across
// everyone's screens on refetch.
const DEMO_PERSONAS: Persona[] = [
  {
    key: "rohan",
    name: "Rohan Deb",
    role: "Citizen · Durga Chowmuhani",
    blurb: "Fresh account. File a complaint to kick off the flow.",
    landing: CITIZEN_LANDING,
    icon: User,
  },
  {
    key: "tania",
    name: "Tania Reang",
    role: "Citizen · Durga Chowmuhani",
    blurb: "Same ward — co-sign and upvote Rohan's complaint live.",
    landing: CITIZEN_LANDING,
    icon: User,
  },
  {
    key: "sanjib",
    name: "Sanjib Sinha",
    role: "Sanitation Officer · Durga Chowmuhani",
    blurb: "Picks up their complaints and resolves them in real time.",
    landing: OFFICER_LANDING,
    icon: Wrench,
  },
];

export function RoleSwitcher() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  // The persona whose loader is on screen — set the instant a card is clicked
  // and held through the fetch + route transition (cleared only on failure).
  const [active, setActive] = useState<Persona | null>(null);

  async function choose(persona: Persona) {
    setActive(persona);
    setPending(persona.key);
    try {
      const res = await fetch("/api/auth/role-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: persona.key }),
      });
      const data = (await res.json()) as {
        redirectTo?: string;
        error?: { message: string };
      };
      if (!res.ok) {
        toast.error(data.error?.message ?? "Couldn't switch persona.");
        setActive(null);
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setActive(null);
    } finally {
      setPending(null);
    }
  }

  const renderCard = (p: Persona) => {
    const Icon = p.icon;
    return (
      <Card
        key={p.key}
        role="button"
        tabIndex={0}
        aria-label={`Continue as ${p.name}, ${p.role}`}
        onClick={() => choose(p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") choose(p);
        }}
        className="hover:border-border-strong cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-elev-2"
      >
        <CardContent className="flex flex-col items-start gap-3 p-5">
          <span className="bg-brand-soft text-brand flex h-10 w-10 items-center justify-center rounded-full">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">{p.name}</p>
            <p className="text-brand text-sm">{p.role}</p>
          </div>
          <p className="text-muted-foreground text-sm">{p.blurb}</p>
          {/* Landing-state preview (spec §3): where this persona arrives. */}
          <span className="bg-surface-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium">
            {p.landing}
          </span>
          <span className="text-muted-foreground mt-1 text-xs">
            {pending === p.key ? "Switching…" : "Continue →"}
          </span>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-3xl space-y-6">
      {active && (
        <FullscreenLoader
          label="Signing you in…"
          detail={{ name: active.name, role: active.role }}
        />
      )}
      <div className="grid gap-4 sm:grid-cols-3">{PERSONAS.map(renderCard)}</div>

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          Live multi-user demo · ward KE
        </span>
        <div className="bg-border h-px flex-1" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {DEMO_PERSONAS.map(renderCard)}
      </div>
    </div>
  );
}
