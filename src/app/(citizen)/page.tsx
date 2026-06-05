import Link from "next/link";
import { PlusCircle, Mic } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { tierForScore } from "@/lib/reputation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemedHero } from "@/components/art/themed-hero";
import { BorderBand } from "@/components/art/border-band";

export default async function CitizenHome() {
  const user = await requireRole(["CITIZEN"]);

  const [caseCount, recent] = await Promise.all([
    db.case.count({ where: { filedById: user.id } }),
    db.case.findMany({
      where: { filedById: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, number: true, title: true, status: true },
    }),
  ]);

  const tier = tierForScore(user.reputation);

  return (
    <div className="space-y-8">
      <div className="shadow-elev-1 overflow-hidden rounded-lg border">
        <ThemedHero />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">
            Namaste, {user.name.split(" ")[0]}.
          </h1>
          <p className="text-muted-foreground mt-1">
            Your civic journey, tracked end to end.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {tier} · {user.reputation} pts
        </Badge>
      </div>

      <Card className="bg-brand-soft border-brand/20">
        <CardHeader>
          <CardTitle className="font-display text-xl">
            File a new complaint
          </CardTitle>
          <CardDescription>
            Describe the issue in your own words — we&rsquo;ll help draft, route,
            and track it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button asChild>
            <Link href="/file">
              <PlusCircle />
              Start a complaint
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/file">
              <Mic />
              Use voice
            </Link>
          </Button>
        </CardContent>
      </Card>

      <BorderBand className="opacity-70" />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            My recent cases
          </h2>
          <Link
            href="/cases"
            className="text-brand text-sm hover:underline"
          >
            View all ({caseCount})
          </Link>
        </div>

        {recent.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground p-8 text-center">
              You haven&rsquo;t filed any complaints yet. Your civic journey
              starts here.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((c) => (
              <Card key={c.id} className="transition-colors hover:shadow-elev-2">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="text-muted-foreground font-mono text-xs">
                      {c.number}
                    </p>
                    <p className="truncate font-medium">{c.title}</p>
                  </div>
                  <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
