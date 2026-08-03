import { Badge, LiveDot } from "@/components/ui/Badge";
import { StubNotice } from "@/components/ui/StubNotice";
import { MatchPicker } from "@/components/tips/MatchPicker";
import { knockoutRounds } from "@/lib/mock/data";
import type { Match } from "@/lib/mock/data";

const statusMeta = {
  open: { tone: "brand" as const, label: "Öppen för tips" },
  locked: { tone: "muted" as const, label: "Låst" },
  upcoming: { tone: "muted" as const, label: "Ej lottad" },
};

export function KnockoutRounds() {
  return (
    <div className="space-y-6">
      <StubNotice>
        Rundor öppnas/låses automatiskt när lottning och resultat finns. Den
        logiken kopplas in med API och deadlines i nästa session.
      </StubNotice>

      {knockoutRounds.map((round) => {
        const meta = statusMeta[round.status];
        return (
          <section key={round.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-ink">{round.name}</h3>
              <Badge tone={meta.tone}>
                {round.status === "open" && <LiveDot />}
                {meta.label}
              </Badge>
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
  );
}
