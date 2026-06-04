"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Wrench, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Persona {
  key: "citizen" | "officer" | "admin";
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

export function RoleSwitcher() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function choose(persona: Persona["key"]) {
    setPending(persona);
    try {
      const res = await fetch("/api/auth/role-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      const data = (await res.json()) as {
        redirectTo?: string;
        error?: { message: string };
      };
      if (!res.ok) {
        toast.error(data.error?.message ?? "Couldn't switch persona.");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      {PERSONAS.map((p) => {
        const Icon = p.icon;
        return (
          <Card
            key={p.key}
            role="button"
            tabIndex={0}
            aria-label={`Continue as ${p.name}, ${p.role}`}
            onClick={() => choose(p.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") choose(p.key);
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
      })}
    </div>
  );
}
