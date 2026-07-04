import type { Match } from "@/lib/mock/data";
import { Badge, LiveDot } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

function kickoffLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamRow({
  flag,
  name,
  code,
  score,
  align = "left",
}: {
  flag: string;
  name: string;
  code: string;
  score?: number;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <span className="text-2xl leading-none">{flag}</span>
      <div className={cn("min-w-0", align === "right" && "items-end")}>
        <p className="truncate font-semibold text-ink">{name}</p>
        <p className="text-xs text-faint">{code}</p>
      </div>
    </div>
  );
}

/**
 * variant "result" — visar resultat/status (Matcher-sidan)
 * variant "pick"   — visar en (icke-funktionell) resultat-picker (Mitt tips)
 */
export function MatchCard({
  match,
  variant = "result",
}: {
  match: Match;
  variant?: "result" | "pick";
}) {
  const { home, away, status, homeScore, awayScore, pick } = match;
  const showScore = status !== "scheduled";

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface/80 p-4 backdrop-blur-sm">
      {/* Meta */}
      <div className="mb-3 flex items-center justify-between text-xs text-faint">
        <span>{kickoffLabel(match.kickoff)}</span>
        {status === "live" ? (
          <Badge tone="live">
            <LiveDot /> Live
          </Badge>
        ) : status === "finished" ? (
          <Badge tone="muted">Slutresultat</Badge>
        ) : match.group ? (
          <span>Grupp {match.group}</span>
        ) : null}
      </div>

      {/* Lag + resultat */}
      <div className="flex items-center gap-3">
        <TeamRow flag={home.flag} name={home.name} code={home.code} />

        <div className="flex shrink-0 items-center gap-2 px-1">
          {showScore ? (
            <div className="flex items-center gap-1.5 text-2xl font-bold tabular-nums text-ink">
              <span>{homeScore}</span>
              <span className="text-faint">–</span>
              <span>{awayScore}</span>
            </div>
          ) : (
            <span className="text-sm font-medium text-faint">vs</span>
          )}
        </div>

        <TeamRow flag={away.flag} name={away.name} code={away.code} align="right" />
      </div>

      {/* Tips-picker (icke-funktionell platshållare) */}
      {variant === "pick" && (
        <div className="mt-4 flex items-center justify-center gap-3 border-t border-border pt-3">
          <span className="text-xs font-medium text-muted">Ditt tips</span>
          <ScoreStepper value={pick?.home ?? 0} />
          <span className="text-faint">–</span>
          <ScoreStepper value={pick?.away ?? 0} />
        </div>
      )}

      {/* Tips + utfall (resultat-variant) */}
      {variant === "result" && pick && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
          <span className="text-faint">
            Ditt tips:{" "}
            <span className="font-medium text-muted">
              {pick.home}–{pick.away}
            </span>
          </span>
          {status === "finished" && <PointsPill match={match} />}
        </div>
      )}
    </div>
  );
}

/** Icke-funktionell resultat-stepper (visuell platshållare). */
function ScoreStepper({ value }: { value: number }) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-border bg-surface-2">
      <button
        disabled
        className="flex h-9 w-8 items-center justify-center text-muted disabled:opacity-40"
        aria-label="Minska"
      >
        –
      </button>
      <span className="flex h-9 w-9 items-center justify-center text-lg font-bold tabular-nums text-ink">
        {value}
      </span>
      <button
        disabled
        className="flex h-9 w-8 items-center justify-center text-muted disabled:opacity-40"
        aria-label="Öka"
      >
        +
      </button>
    </div>
  );
}

/** Mockad poängvisning — riktig poänglogik byggs i nästa session. */
function PointsPill({ match }: { match: Match }) {
  const { pick, homeScore, awayScore } = match;
  if (!pick || homeScore == null || awayScore == null) return null;

  const exact = pick.home === homeScore && pick.away === awayScore;
  const sign = (a: number, b: number) => Math.sign(a - b);
  const rightOutcome = sign(pick.home, pick.away) === sign(homeScore, awayScore);

  if (exact) return <Badge tone="brand">Exakt · 20 p</Badge>;
  if (rightOutcome) return <Badge tone="mint">Rätt tecken · 10 p</Badge>;
  return <Badge tone="muted">0 p</Badge>;
}
