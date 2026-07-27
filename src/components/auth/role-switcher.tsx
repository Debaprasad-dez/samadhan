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
  | "aarav"
  | "zara"
  | "vivek";

interface Persona {
  key: PersonaKey;
  name: string;
  role: string;
  blurb: string;
  icon: LucideIcon;
}

const PERSONAS: Persona[] = [
  {
    key: "citizen",
    name: "Priya Sharma",
    role: "Citizen",
    blurb: "File and track complaints in Bandra West.",
    icon: User,
  },
  {
    key: "officer",
    name: "Rajesh Kumar",
    role: "Sanitation Officer",
    blurb: "Work a prioritised queue in Andheri East.",
    icon: Wrench,
  },
  {
    key: "admin",
    name: "Anita Desai",
    role: "District Magistrate",
    blurb: "See systemic issues and accountability.",
    icon: ShieldCheck,
  },
];

// Fresh, interlinked accounts (all ward KE) for demoing a live multi-user flow:
// the two citizens file/co-sign, the officer resolves — updates ripple across
// everyone's screens on refetch.
const DEMO_PERSONAS: Persona[] = [
  {
    key: "aarav",
    name: "Aarav Sharma",
    role: "Citizen · Andheri East",
    blurb: "Fresh account. File a complaint to kick off the flow.",
    icon: User,
  },
  {
    key: "zara",
    name: "Zara Khan",
    role: "Citizen · Andheri East",
    blurb: "Same ward — co-sign and upvote Aarav's complaint live.",
    icon: User,
  },
  {
    key: "vivek",
    name: "Vivek Nair",
    role: "Sanitation Officer · Andheri East",
    blurb: "Picks up their complaints and resolves them in real time.",
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
