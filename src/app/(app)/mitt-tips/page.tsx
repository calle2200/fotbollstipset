import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StubNotice } from "@/components/ui/StubNotice";
import { MatchCard } from "@/components/tips/MatchCard";
import { groupColor } from "@/lib/groupColors";
import { cn } from "@/lib/cn";
import { matches, teams, specialPicks } from "@/lib/mock/data";

export default function MittTipsPage() {
  const groupMatches = matches.filter((m) => m.stage === "group");
  const groups = [...new Set(teams.map((t) => t.group))];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mitt tips"
        subtitle="Fas 1 — gruppmatcher, gruppplaceringar och specialval. Låses vid turneringsstart."
        action={
          <Button disabled variant="primary">
            Spara tips
          </Button>
        }
      />

      <StubNotice>
        Tipsen sparas inte ännu. Inmatning, låsning vid deadline och validering
        byggs i nästa session (Supabase + poängmotor).
      </StubNotice>

      {/* Gruppmatcher */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Gruppmatcher</h2>
          <Badge tone="muted">{groupMatches.length} matcher</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {groupMatches.map((m) => (
            <MatchCard key={m.id} match={m} variant="pick" />
          ))}
        </div>
      </section>

      {/* Gruppplaceringar */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">Gruppplaceringar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => {
            const c = groupColor(g);
            return (
              <Card key={g}>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold", c.bg, c.text)}>
                      {g}
                    </span>
                    <div>
                      <h3 className="font-semibold tracking-tight text-ink">Grupp {g}</h3>
                      <p className="text-sm text-muted">Dra lagen i rätt ordning (1–4)</p>
                    </div>
                  </div>
                </div>
                <ol className="divide-y divide-border">
                  {teams
                    .filter((t) => t.group === g)
                    .map((t, i) => (
                      <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold", c.bg, c.text)}>
                          {i + 1}
                        </span>
                        <span className="text-xl">{t.flag}</span>
                        <span className="flex-1 font-medium text-ink">{t.name}</span>
                        <span className="cursor-grab text-faint" aria-hidden>
                          ⋮⋮
                        </span>
                      </li>
                    ))}
                </ol>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Specialval */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Specialval</h2>
          <Badge tone="gold">Max 620 p</Badge>
        </div>
        <Card>
          <ul className="divide-y divide-border">
            {specialPicks.map((sp, i) => {
              const tones = ["violet", "pink", "cyan", "mint", "orange", "blue", "brand"] as const;
              return (
                <li key={sp.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <p className="font-medium text-ink">{sp.label}</p>
                    <p className="text-sm text-muted">{sp.choice}</p>
                  </div>
                  <Badge tone={tones[i % tones.length]}>{sp.maxPoints} p</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
      </section>
    </div>
  );
}
