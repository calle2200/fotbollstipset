import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, LiveDot } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { MatchPicker } from "@/components/tips/MatchPicker";
import { SaveStatus } from "@/components/tips/SaveStatus";
import { knockoutRounds } from "@/lib/mock/data";
import type { Match } from "@/lib/mock/data";

const statusMeta = {
  open: { tone: "brand" as const, label: "Öppen för tips" },
  locked: { tone: "muted" as const, label: "Låst" },
  upcoming: { tone: "muted" as const, label: "Ej lottad" },
};

export default function SlutspelPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Slutspelstips"
        subtitle="Fas 2 — varje runda öppnas när matcherna blir kända och låses vid rundans start."
        action={<SaveStatus />}
      />

      <StubNotice>
        Rundor öppnas/låses automatiskt när lottning och resultat finns. Den
        logiken kopplas in med API och deadlines i nästa session.
      </StubNotice>

      <div className="space-y-6">
        {knockoutRounds.map((round) => {
          const meta = statusMeta[round.status];
          return (
            <section key={round.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-ink">{round.name}</h2>
                  <Badge tone={meta.tone}>
                    {round.status === "open" && <LiveDot />}
                    {meta.label}
                  </Badge>
                </div>
              </div>

              {round.matches.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {round.matches.map((km) => {
                    const match: Match = {
                      id: km.id,
                      stage: round.id as Match["stage"],
                      home: km.home,
                      away: km.away,
                      kickoff: km.kickoff,
                      status: "scheduled",
                    };
                    return <MatchPicker key={km.id} match={match} />;
                  })}
                </div>
              ) : (
                <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface/40 px-5 py-8 text-center text-sm text-faint">
                  Matcherna är inte kända ännu — öppnas efter föregående runda.
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
