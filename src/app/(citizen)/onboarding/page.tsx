"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Route, ShieldCheck, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// /onboarding (spec §3): 3 cards, skippable, re-openable. Reachable any time at
// /onboarding; "Get started" marks it seen (localStorage) and returns home.
const CARDS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Mic,
    title: "File in seconds",
    body: "Speak in your language or type a line — AI phrases it and routes it to the right department.",
  },
  {
    icon: Route,
    title: "Track like a delivery",
    body: "Watch your complaint move stage by stage, with a live SLA countdown and auto-escalation.",
  },
  {
    icon: ShieldCheck,
    title: "Hold the city accountable",
    body: "Upvote and co-sign neighbours' issues, and see resolution scores ward by ward.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const last = i === CARDS.length - 1;

  function finish() {
    try {
      localStorage.setItem("samadhan-onboarded", "1");
    } catch {
      /* noop */
    }
    router.push("/");
  }

  const Icon = CARDS[i].icon;
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center gap-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="bg-brand-soft text-brand grid h-16 w-16 place-items-center rounded-2xl">
            <Icon className="h-8 w-8" />
          </span>
          <h1 className="font-display text-2xl font-semibold">{CARDS[i].title}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {CARDS[i].body}
          </p>

          {/* progress dots */}
          <div className="mt-1 flex gap-1.5" aria-hidden>
            {CARDS.map((_, n) => (
              <span
                key={n}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  n === i ? "bg-brand w-5" : "bg-border w-1.5",
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={finish}>
          Skip
        </Button>
        <div className="flex gap-2">
          {i > 0 && (
            <Button variant="outline" onClick={() => setI((n) => n - 1)}>
              Back
            </Button>
          )}
          {last ? (
            <Button onClick={finish}>Get started</Button>
          ) : (
            <Button onClick={() => setI((n) => n + 1)}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
}
